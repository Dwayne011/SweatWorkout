// Author: SW3AT Workouts
// OS support: All (Web, Android, iOS)
// Description: Service Worker for offline asset caching and the lock-screen
//   workout notification. The notification engine is a *renderer*: it shows a
//   single "tracking" or "resting" notification and runs the rest countdown.
//   It NEVER advances the workout or completes sets — rest expiry only fires one
//   alert and returns to tracking. All set/workout progression lives in the app.
const CACHE_NAME = 'sw3at-cache-v3';
const PRE_CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/logo.svg',
];

// Install: Pre-cache core shell assets & skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('⚡ SW caching dynamic initial assets');
      return cache.addAll(PRE_CACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('⚡ SW cleaning up obsolete PWA cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: serving requests offline with a smart cache-falling-back-to-network-or-vice-versa policy
self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Skip non-GET requests (e.g. POST, PUT, DELETE or other scopes like Firebase API endpoints)
  if (req.method !== 'GET') {
    return;
  }

  // Handle local application assets offline
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        if (cachedResponse) {
          // Serve from cache, but fetch fresh in background to update cache (Stale-While-Revalidate)
          fetch(req).then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, networkResponse);
              });
            }
          }).catch(() => {/* Ignore network down */});
          return cachedResponse;
        }

        return fetch(req).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(req, responseToCache);
          });
          return networkResponse;
        }).catch(() => {
          // SPA offline fallback: serve index.html if we are navigating the application
          if (req.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
    );
  }
});

// Background Sync support: resilient offline logging, syncing when back online
self.addEventListener('sync', (event) => {
  console.log('⚡ SW Background Sync Triggered:', event.tag);
  if (event.tag === 'sync-workout-metrics' || event.tag === 'sync-completed-sets') {
    event.waitUntil(
      // Inform client screens to trigger sync
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'SW_TRIGGER_METRICS_SYNC', tag: event.tag });
        }
      })
    );
  }
});

// Periodic Background Sync support: download fresh recommendations / updates in system idle state
self.addEventListener('periodicsync', (event) => {
  console.log('⚡ SW Periodic Background Sync Triggered:', event.tag);
  if (event.tag === 'update-workout-templates' || event.tag === 'hourly-routine-refresh') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'SW_TRIGGER_PERIODIC_UPDATE', tag: event.tag });
        }
      })
    );
  }
});

// Push Notifications support: handle remote incoming push server notification payloads
self.addEventListener('push', (event) => {
  console.log('⚡ SW remote push payload received:', event);
  let payload = {
    title: 'SW3AT Coach Peak Performance Alert',
    body: 'Gemini synthesized custom suggestions based on your metric progression. Let\'s check it out!',
    icon: '/icon-192.png',
    badge: '/icon-192.png'
  };

  try {
    if (event.data) {
      payload = { ...payload, ...event.data.json() };
    }
  } catch (err) {
    if (event.data) {
      payload.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag || 'sw3at-push-general',
      vibrate: [200, 100, 200],
      actions: payload.actions || []
    })
  );
});

// Push Subscription Change support: handle subscriber key resets seamlessly
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('⚡ SW push subscription key changed.');
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true })
      .then((newSubscription) => {
        // Send new subscription keys to the server / app state
        return self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
          for (const client of clients) {
            client.postMessage({ type: 'SW_PUSH_SUBSCRIPTION_CHANGED', subscription: newSubscription });
          }
        });
      })
  );
});


// =============================================================================
// Workout Notification Engine
//
// A single notification (tag NOTIF_TAG) is shown for the whole session and
// flips between two modes:
//   - 'tracking': persistent notification with the workout duration + current
//     set. No timer, no alert.
//   - 'resting' : a live countdown. On Android it updates in place every second
//     and carries Skip / +30s / -30s buttons; on iOS it is shown once (iOS PWAs
//     cannot live-update or render buttons).
//
// When rest reaches zero we fire EXACTLY ONE alert and return to 'tracking'.
// We never advance sets — that is the app's job. This is what eliminates the
// old cascade where every expiry auto-completed the next set and spammed
// notifications.
// =============================================================================

const NOTIF_TAG = 'workout-timer';        // the single tracking/resting notification
const ALERT_TAG = 'workout-timer-alert';  // the one-shot "rest over" alert
const SYNC_CHANNEL = 'sw3at-timer-sync';  // matches webNotificationService.ts

const DB_NAME = 'WorkoutTimerDB';
const STORE_NAME = 'workoutState';
const STATE_KEY = 'notif-engine-state';

// In-memory engine state. Mirrored to IndexedDB so it survives the SW being
// killed and later woken by a notification button tap.
let intervalId = null;   // single timer for either the tracking or rest loop
let iosFinishId = null;  // iOS-only setTimeout used to fire the rest-over alert
let state = {
  mode: 'idle',          // 'idle' | 'tracking' | 'resting'
  platform: 'android',
  appVisible: true,      // when true, the app is foreground; skip per-second notification churn
  workoutStartTime: null,
  exerciseName: '',
  setLabel: '',
  restEndTime: null,
  restTotalSeconds: null,
};

function isIOS() {
  if (state.platform === 'ios') return true;
  const ua = (self.navigator && self.navigator.userAgent) || '';
  return /iPad|iPhone|iPod/.test(ua) ||
    (self.navigator && self.navigator.platform === 'MacIntel' && self.navigator.maxTouchPoints > 1);
}

// --- IndexedDB persistence (so button taps work after the SW is recycled) -----
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

function idbGet(key) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result ? req.result.value : null);
    req.onerror = () => reject(req.error);
  }));
}

function idbSet(key, value) {
  return openDB().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const req = tx.objectStore(STORE_NAME).put({ key, value });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

async function persistState() {
  try { await idbSet(STATE_KEY, state); } catch (e) { /* best-effort */ }
}

async function restoreState() {
  try {
    const saved = await idbGet(STATE_KEY);
    if (saved) state = { ...state, ...saved };
  } catch (e) { /* best-effort */ }
}

function broadcast(message) {
  try {
    const bc = new BroadcastChannel(SYNC_CHANNEL);
    bc.postMessage(message);
    bc.close();
  } catch (e) { /* channel may be unavailable */ }
}

function clearLoops() {
  if (intervalId) { clearInterval(intervalId); intervalId = null; }
  if (iosFinishId) { clearTimeout(iosFinishId); iosFinishId = null; }
}

function formatMMSS(totalSecs) {
  const s = Math.max(0, Math.floor(totalSecs));
  const mins = Math.floor(s / 60);
  const secs = s % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatElapsed(totalSecs) {
  const s = Math.max(0, Math.floor(totalSecs));
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// --- Rendering ---------------------------------------------------------------
async function renderTracking() {
  const name = state.exerciseName || 'Workout';
  let body;
  if (isIOS()) {
    // iOS cannot live-update; show a static snapshot without a ticking clock.
    body = state.setLabel ? `${state.setLabel} • In progress` : 'Workout in progress';
  } else {
    const elapsed = state.workoutStartTime
      ? formatElapsed((Date.now() - state.workoutStartTime) / 1000)
      : '0:00';
    body = `${state.setLabel ? state.setLabel + ' • ' : ''}Duration ${elapsed}`;
  }

  await self.registration.showNotification(`🏋️ ${name}`, {
    tag: NOTIF_TAG,
    body,
    renotify: false,
    silent: true,
    badge: '/icon-192.png',
    icon: '/icon-192.png',
    // A non-resting notification has no actions on either platform.
    actions: [],
  });
}

async function renderRest(remainingSecs) {
  const name = state.exerciseName || 'Exercise';
  const upNext = `Up next: ${name}${state.setLabel ? ' — ' + state.setLabel : ''}`;

  if (isIOS()) {
    // One static notification; iOS PWAs support neither live countdowns nor
    // action buttons. The live countdown + buttons live in the in-app overlay.
    await self.registration.showNotification('⏳ Rest period', {
      tag: NOTIF_TAG,
      body: upNext,
      renotify: false,
      silent: true,
      badge: '/icon-192.png',
      icon: '/icon-192.png',
      actions: [],
    });
    return;
  }

  await self.registration.showNotification(`⏳ Rest ${formatMMSS(remainingSecs)}`, {
    tag: NOTIF_TAG,
    body: upNext,
    renotify: false,   // update the SAME notification in place — no re-alert
    silent: true,      // never make noise on a per-second update
    badge: '/icon-192.png',
    icon: '/icon-192.png',
    actions: [
      { action: 'add_30', title: '+30s' },
      { action: 'skip_rest', title: 'Skip' },
      { action: 'sub_30', title: '-30s' },
    ],
  });
}

// --- Loops -------------------------------------------------------------------
function startTrackingLoop() {
  clearLoops();
  state.mode = 'tracking';
  renderTracking();
  // Tick the duration only when the app is hidden (the in-app UI shows it while
  // foreground). iOS can't live-update at all, so it stays static.
  if (!isIOS() && !state.appVisible) {
    intervalId = setInterval(() => { renderTracking(); }, 1000);
  }
}

// React to a foreground/background change without disrupting the rest expiry
// clock. Tracking re-evaluates whether it needs a ticking interval; resting
// keeps its expiry interval but refreshes the notification immediately if we
// have just gone to the background.
function reconcileLoopsForVisibility() {
  if (state.mode === 'tracking') {
    startTrackingLoop();
  } else if (state.mode === 'resting' && !isIOS() && !state.appVisible && state.restEndTime) {
    const remaining = Math.max(0, Math.ceil((state.restEndTime - Date.now()) / 1000));
    if (remaining > 0) renderRest(remaining);
  }
}

async function finishRest() {
  clearLoops();
  // Switch the persistent notification back to tracking for the SAME set the
  // user is now about to perform. No set is completed or advanced here.
  state.mode = 'tracking';
  state.restEndTime = null;
  state.restTotalSeconds = null;
  await persistState();

  // Only alert on the lock screen if the app is not already in the foreground
  // (the in-app overlay plays its own sound/haptics when visible).
  let appFocused = false;
  try {
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    appFocused = clients.some((c) => c.focused || c.visibilityState === 'visible');
  } catch (e) { /* ignore */ }

  if (!appFocused) {
    await self.registration.showNotification('💪 Rest over!', {
      tag: ALERT_TAG,
      body: `Time for ${state.setLabel || 'your next set'}${state.exerciseName ? ' — ' + state.exerciseName : ''}`,
      renotify: true,
      silent: false,
      requireInteraction: true,
      vibrate: [400, 120, 400, 120, 400],
      badge: '/icon-192.png',
      icon: '/icon-192.png',
    });
  }

  broadcast({ type: 'rest_finished' });
  startTrackingLoop();
}

function startRestLoop() {
  clearLoops();
  state.mode = 'resting';

  if (isIOS()) {
    // Static render now + a single timeout to fire the finish alert. (Background
    // timers are unreliable on iOS, so this is best-effort until a push backend
    // is added in a later step.)
    renderRest(Math.max(0, Math.ceil((state.restEndTime - Date.now()) / 1000)));
    const delay = Math.max(0, state.restEndTime - Date.now());
    iosFinishId = setTimeout(() => { iosFinishId = null; finishRest(); }, delay);
    return;
  }

  // Render once now so the notification exists even while foreground.
  renderRest(Math.max(0, Math.ceil((state.restEndTime - Date.now()) / 1000)));

  const tick = () => {
    const remaining = Math.max(0, Math.ceil((state.restEndTime - Date.now()) / 1000));
    if (remaining <= 0) {
      finishRest();
      return;
    }
    // Only repaint the notification per-second while hidden; the in-app overlay
    // covers the live countdown when the app is foreground.
    if (!state.appVisible) renderRest(remaining);
  };
  intervalId = setInterval(tick, 1000);
}

async function clearAll() {
  clearLoops();
  state = {
    mode: 'idle',
    platform: state.platform,
    appVisible: state.appVisible,
    workoutStartTime: null,
    exerciseName: '',
    setLabel: '',
    restEndTime: null,
    restTotalSeconds: null,
  };
  await persistState();
  try {
    const notifs = await self.registration.getNotifications();
    notifs.forEach((n) => {
      if (n.tag === NOTIF_TAG || n.tag === ALERT_TAG) n.close();
    });
  } catch (e) { /* ignore */ }
}

// --- Command handling (app -> SW) --------------------------------------------
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || !data.type) return;

  if (data.platform) state.platform = data.platform;

  if (data.type === 'SHOW_TRACKING') {
    event.waitUntil((async () => {
      state.workoutStartTime = Number(data.workoutStartTime) || state.workoutStartTime || Date.now();
      state.exerciseName = data.exerciseName || '';
      state.setLabel = data.setLabel || '';
      // The app only sends this when it is NOT resting, so it authoritatively
      // means "switch to tracking" — this is also how an in-app "Skip Rest"
      // stops a running lock-screen countdown.
      startTrackingLoop();
      await persistState();
    })());
  } else if (data.type === 'START_REST') {
    event.waitUntil((async () => {
      state.restEndTime = Number(data.endTime);
      state.restTotalSeconds = Number(data.totalSeconds) || 90;
      state.exerciseName = data.exerciseName || state.exerciseName || '';
      state.setLabel = data.setLabel || state.setLabel || '';
      await persistState();
      startRestLoop();
    })());
  } else if (data.type === 'APP_VISIBILITY') {
    event.waitUntil((async () => {
      state.appVisible = !!data.visible;
      await persistState();
      reconcileLoopsForVisibility();
    })());
  } else if (data.type === 'END_SESSION') {
    event.waitUntil(clearAll());
  }
});

// --- Notification button + tap handling (SW -> app) --------------------------
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  event.notification.close();

  event.waitUntil((async () => {
    // The SW may have been recycled since the timer started; rebuild state so
    // the +/- buttons always have a valid end-time to work from.
    if (state.mode === 'idle' || !state.restEndTime) await restoreState();

    if (action === 'add_30' && state.restEndTime) {
      state.restEndTime += 30000;
      state.restTotalSeconds = (state.restTotalSeconds || 90) + 30;
      await persistState();
      startRestLoop();
      broadcast({ type: 'rest_adjusted', endTime: state.restEndTime, totalSeconds: state.restTotalSeconds });
      return;
    }

    if (action === 'sub_30' && state.restEndTime) {
      state.restEndTime -= 30000;
      state.restTotalSeconds = Math.max(1, (state.restTotalSeconds || 90) - 30);
      const remaining = Math.ceil((state.restEndTime - Date.now()) / 1000);
      await persistState();
      if (remaining <= 0) {
        await finishRest();
      } else {
        startRestLoop();
        broadcast({ type: 'rest_adjusted', endTime: state.restEndTime, totalSeconds: state.restTotalSeconds });
      }
      return;
    }

    if (action === 'skip_rest') {
      clearLoops();
      state.restEndTime = null;
      state.restTotalSeconds = null;
      await persistState();
      broadcast({ type: 'rest_skipped' });
      startTrackingLoop();
      return;
    }

    // Plain tap (no action button): focus or open the app.
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) {
      if ('focus' in client) { await client.focus(); return; }
    }
    if (self.clients.openWindow) {
      await self.clients.openWindow('/');
    }
  })());
});

// --- End of sw.js ---
