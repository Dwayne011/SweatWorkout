// Author: Google AI Studio Coding Agent
// OS support: All (Web, Android, iOS)
// Description: Service Worker for local offline asset caching and background lockscreen timer management.
const CACHE_NAME = 'sw3at-cache-v2';
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


// Timer Service and Lockscreeen Background Management Engine
const DB_NAME = 'WorkoutTimerDB';
const STORE_NAME = 'workoutState';

// Helper to open the database securely across worker threads, avoiding any transaction blockages
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Transaction-safe key-value setters to prevent data corruption isomorphically
function getStoredValue(key) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result ? request.result.value : null);
      request.onerror = () => reject(request.error);
    });
  });
}

function setStoredValue(key, value) {
  return openDB().then((db) => {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ key: key, value: value });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  });
}

// Get and set active general tracking settings 
function getStoredState() {
  return getStoredValue('active-workout-settings');
}

function setStoredState(value) {
  return setStoredValue('active-workout-settings', value);
}

// Global Timer PWA Background State
let timerId = null;
let iosTimerId = null;
let currentEndTime = null;
let currentExerciseName = null;
let currentNextExText = null;

// Wrapper for iOS / Safari platform check
const isIOSUserAgent = () => {
  return /iPad|iPhone|iPod/.test(self.navigator.userAgent) || 
         (self.navigator.platform === 'MacIntel' && self.navigator.maxTouchPoints > 1);
};

// Display lockscreen notifications with strict platform-dependent layout parameters
const showLockscreeenNotification = async (options) => {
  const { 
    state, // 'active' (Rest Active) or 'inactive' (Rest Inactive)
    platform, // 'android' or 'ios'
    endTime, // absolute millisecond epoch when the rest ends
    exerciseName, // e.g. "Dumbbell Press"
    nextExText, // e.g. "Set 2 of 4"
    remainingSecs // if ticking/Android
  } = options;

  const tag = 'workout-timer';
  const isIOS = platform === 'ios' || isIOSUserAgent();

  // CASE iOS: Completely ban per-second interval notification pushes.
  // Trigger exactly ONE static notification populating standard 'timestamp' to display a native, system-level countdown clock inside the notification block
  if (isIOS) {
    if (state === 'active') {
      const timestampEpoch = Number(endTime);
      await self.registration.showNotification(`⏳ Rest Period Active`, {
        body: `Up next: ${exerciseName || "Next Exercise"}${nextExText ? ' — ' + nextExText : ''}`,
        tag: tag,
        renotify: false,
        silent: true,
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        timestamp: timestampEpoch, // commands native countdown layout safely
        actions: [] // strictly avoiding secondary action button-clicks on iOS to prevent per-second push updates
      });
    } else {
      // Rest Inactive (Work mode or Ready to Complete Set)
      await self.registration.showNotification(`🏋️ Active: ${exerciseName || "Exercise"}`, {
        body: `Ready in place • ${nextExText || "Complete your set!"}`,
        tag: tag,
        renotify: false,
        silent: true,
        badge: '/icon-192.png',
        icon: '/icon-192.png',
        actions: []
      });
    }
    return;
  }

  // CASE ANDROID: Send periodic progress pushes, ensuring payload strictly contains tag 'workout-timer' and renotify: false
  if (state === 'active') {
    const mins = Math.floor(Number(remainingSecs) / 60);
    const secs = Number(remainingSecs) % 60;
    const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    await self.registration.showNotification(`⏳ Rest Timer: ${formattedTime}`, {
      body: `Up next: ${exerciseName || "Exercise"}${nextExText ? ' — ' + nextExText : ''}`,
      tag: tag,
      renotify: false, // silent in-place overwrite
      silent: true,
      badge: '/icon-192.png',
      icon: '/icon-192.png',
      actions: [
        { action: 'add_30', title: '+30s' },
        { action: 'skip_rest', title: 'Skip' },
        { action: 'sub_30', title: '-30s' }
      ]
    });
  } else {
    // State 2 (Rest Inactive Buttons): Render exactly one full-width button
    await self.registration.showNotification(`🏋️ Working Set: ${exerciseName || "Exercise"}`, {
      body: nextExText || "Perform your set, then complete!",
      tag: tag,
      renotify: false,
      silent: true,
      badge: '/icon-192.png',
      icon: '/icon-192.png',
      actions: [
        { action: 'complete_set', title: 'Complete set' }
      ]
    });
  }
};

// Conditional Index Progression Machine to update state and trigger next notifications
async function runIndexProgression() {
  const bc = new BroadcastChannel('workout-lockscreeen-sync');
  try {
    // 1. Read current active workout routine array and indices from localized browser storage (IndexedDB)
    const activeWorkout = await getStoredValue('activeWorkout');
    let currentExerciseIndexRaw = await getStoredValue('currentExerciseIndex');
    let currentSetIndexRaw = await getStoredValue('currentSetIndex');

    // STRICT TYPE CASTING & BOUNDARY GAURDS
    if (!activeWorkout || !activeWorkout.exercises) {
      bc.postMessage({ type: 'ERROR', message: 'Active workout is missing or invalid in IndexedDB.' });
      return;
    }

    if (currentExerciseIndexRaw === null || currentExerciseIndexRaw === undefined) {
      currentExerciseIndexRaw = 0;
    }
    if (currentSetIndexRaw === null || currentSetIndexRaw === undefined) {
      currentSetIndexRaw = 0;
    }

    const currentExerciseIndex = Number(currentExerciseIndexRaw);
    const currentSetIndex = Number(currentSetIndexRaw);

    if (isNaN(currentExerciseIndex) || isNaN(currentSetIndex)) {
      bc.postMessage({ type: 'ERROR', message: 'Progression indices parsed as NaN.' });
      return;
    }

    const activeExercise = activeWorkout.exercises[currentExerciseIndex];
    if (!activeExercise || !activeExercise.sets) {
      bc.postMessage({ type: 'ERROR', message: 'Current active exercise is undefined.' });
      return;
    }

    // Mark the targeted set as completed in the database
    const set = activeExercise.sets[currentSetIndex];
    if (!set) {
      bc.postMessage({ type: 'ERROR', message: 'Current targeted set is undefined at index.' });
      return;
    }
    set.isCompleted = true;

    // Persist immediately to prevent loss or data corruption
    await setStoredValue('activeWorkout', activeWorkout);

    // Ingest the target client platform type
    let platform = 'android';
    const idbState = await getStoredState();
    if (idbState && idbState.platform) {
      platform = idbState.platform;
    }
    if (/iPad|iPhone|iPod/.test(self.navigator.userAgent) || isIOSUserAgent()) {
      platform = 'ios';
    }

    // Android/iOS absolute lockscreeen countdown math
    const nextSet = Number(currentSetIndex) + 1;
    const totalSets = Number(activeExercise.sets.length);

    if (isNaN(nextSet) || isNaN(totalSets)) {
      bc.postMessage({ type: 'ERROR', message: 'Boundary checks resulted in unexpected NaN bounds.' });
      return;
    }

    if (nextSet < totalSets) {
      // --- SUB-CASE A: Current exercise has more sets remaining, increment set index by 1 ---
      const newSetIdx = nextSet;
      await setStoredValue('currentSetIndex', newSetIdx);

      // Fetch customizable rest time or default to 90 seconds
      const restSeconds = activeExercise.restTime !== undefined ? Number(activeExercise.restTime) : 90;
      if (isNaN(restSeconds)) {
        bc.postMessage({ type: 'ERROR', message: 'Rest duration is unexpectedly NaN.' });
        return;
      }
      
      const nextEndTime = Date.now() + restSeconds * 1000;
      currentEndTime = nextEndTime;
      
      // Resolve name of active exercise via exercisesList if available
      const exercisesList = await getStoredValue('exercisesList') || [];
      const exerciseDetails = exercisesList.find((e) => e.id === activeExercise.exerciseId);
      currentExerciseName = exerciseDetails ? exerciseDetails.name : (activeExercise.name || "Next Exercise");
      currentNextExText = `Set ${newSetIdx + 1} of ${totalSets}`;

      const isIOS = platform === 'ios' || isIOSUserAgent();

      if (isIOS) {
        // iOS Loop Terminator - explicitly block, clear, destroy any intervals & push timers
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }

        // Trigger EXACTLY ONE static iOS notification with future completion target
        await showLockscreeenNotification({
          state: 'active',
          platform: 'ios',
          endTime: currentEndTime,
          exerciseName: currentExerciseName,
          nextExText: currentNextExText
        });

        // Setup a single isolated setTimeout tracker to fire the timer expiration alert
        const delayMs = Math.max(0, currentEndTime - Date.now());
        iosTimerId = setTimeout(async () => {
          iosTimerId = null;
          await self.registration.showNotification(`Rest Period Finished! ⚡`, {
            body: `Time to hit the next set of ${currentExerciseName || "your exercise"}!`,
            tag: 'workout-timer',
            renotify: true,
            silent: false,
            requireInteraction: true,
            vibrate: [500, 110, 500, 110, 500],
            badge: '/icon-192.png',
            icon: '/icon-192.png'
          });

          bc.postMessage({ type: 'REST_TIMER_FINISHED' });
          await runIndexProgression();
        }, delayMs);

      } else {
        // Standard Android interval updater
        if (timerId) {
          clearInterval(timerId);
        }
        
        if (idbState) {
          idbState.endTime = currentEndTime;
          idbState.total = restSeconds;
          idbState.exerciseName = currentExerciseName;
          idbState.nextExText = currentNextExText;
          idbState.platform = platform;
          await setStoredState(idbState);
        }

        const tick = async () => {
          const remainingSecs = Math.max(0, Math.ceil((currentEndTime - Date.now()) / 1000));
          if (remainingSecs <= 0) {
            clearInterval(timerId);
            timerId = null;
            currentEndTime = null;

            bc.postMessage({ type: 'REST_TIMER_FINISHED' });

            // Timer naturally ran out: invoke progression recursion
            await runIndexProgression();
          } else {
            await showLockscreeenNotification({
              state: 'active',
              platform: 'android',
              endTime: currentEndTime,
              exerciseName: currentExerciseName,
              nextExText: currentNextExText,
              remainingSecs: remainingSecs
            });

            // Feed live live ticker updates through broadcast channels
            bc.postMessage({
              type: 'REST_TIMER_TICK',
              remainingSecs,
              endTime: currentEndTime,
              total: restSeconds,
              exerciseName: currentExerciseName
            });
          }
        };

        await tick();
        timerId = setInterval(tick, 1000);
      }

      // Broadcast the adjusted indexes and active timer target instantly to the main thread
      bc.postMessage({
        type: 'LOCKSCREEN_STATE_MUTATED',
        activeWorkout: activeWorkout,
        currentExerciseIndex: currentExerciseIndex,
        currentSetIndex: newSetIdx,
        restTimerTarget: {
          endTime: currentEndTime,
          total: restSeconds,
          exerciseName: currentExerciseName
        }
      });

    } else {
      // The final set of this specific exercise is finished. Check for next exercise bounds
      const totalExercises = Number(activeWorkout.exercises.length);
      const nextExerciseIndex = Number(currentExerciseIndex) + 1;

      if (isNaN(totalExercises) || isNaN(nextExerciseIndex)) {
        bc.postMessage({ type: 'ERROR', message: 'Exercises totals evaluated to NaN.' });
        return;
      }

      if (nextExerciseIndex < totalExercises) {
        // --- SUB-CASE B: Another exercise available, reset set index, increment exercise index ---
        const newExIdx = nextExerciseIndex;
        const newSetIdx = 0;

        await setStoredValue('currentExerciseIndex', newExIdx);
        await setStoredValue('currentSetIndex', newSetIdx);

        // Cancel running timer since work mode activates
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }
        currentEndTime = null;

        // Trigger a fresh 'Rest Timer Inactive' layout with a prominent 'Complete set' action button
        const nextEx = activeWorkout.exercises[newExIdx];
        if (!nextEx || !nextEx.sets) {
          bc.postMessage({ type: 'ERROR', message: 'Next exercise boundaries evaluate to undefined' });
          return;
        }

        const exercisesList = await getStoredValue('exercisesList') || [];
        const nextExDetails = exercisesList.find((e) => e.id === nextEx.exerciseId);
        const nextExName = nextExDetails ? nextExDetails.name : (nextEx.name || "Next Exercise");
        const nextExText = `Set 1 of ${Number(nextEx.sets.length)}`;

        await showLockscreeenNotification({
          state: 'inactive',
          platform: platform,
          endTime: 0,
          exerciseName: nextExName,
          nextExText: nextExText
        });

        // Broadcast index progression to keep foreground thread perfectly synchronized
        bc.postMessage({
          type: 'LOCKSCREEN_STATE_MUTATED',
          activeWorkout: activeWorkout,
          currentExerciseIndex: newExIdx,
          currentSetIndex: newSetIdx,
          restTimerTarget: null
        });

      } else {
        // --- SUB-CASE C: All sets and exercises completed. Mark routine fully complete ---
        activeWorkout.endTime = new Date().toISOString();
        
        await setStoredValue('activeWorkout', activeWorkout);
        await setStoredValue('currentExerciseIndex', null);
        await setStoredValue('currentSetIndex', null);

        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }
        currentEndTime = null;

        // Clear the active workout-timer notification tag cleanly
        await self.registration.getNotifications({ tag: 'workout-timer' }).then((notifications) => {
          for (const notif of notifications) {
            notif.close();
          }
        });

        // Trigger a complete congratulatory push
        await self.registration.showNotification(`🎉 Workout Routine Completed!`, {
          body: `Superb effort utilised today. Fitness session is safely saved to your history dashboard!`,
          tag: 'workout-timer-complete',
          renotify: true,
          silent: false,
          badge: '/icon-192.png',
          icon: '/icon-192.png'
        });

        // Broadcast details to main application thread
        bc.postMessage({
          type: 'LOCKSCREEN_STATE_MUTATED',
          activeWorkout: null,
          currentExerciseIndex: null,
          currentSetIndex: null,
          restTimerTarget: null,
          completedWorkout: activeWorkout
        });
      }
    }
  } catch (error) {
    console.error("💥 [Progression Machine] Severe error while updating lockscreen state:", error);
    bc.postMessage({ type: 'ERROR', message: `Progression system failure details: ${error.message || error}` });
  }
}

// Service Worker postMessage Event Handling
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'START_TIMER') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    if (iosTimerId) {
      clearTimeout(iosTimerId);
      iosTimerId = null;
    }

    currentEndTime = Number(data.endTime);
    currentExerciseName = data.exerciseName;
    currentNextExText = data.nextExText;

    let platform = data.platform || 'android';
    if (/iPad|iPhone|iPod/.test(self.navigator.userAgent) || isIOSUserAgent()) {
      platform = 'ios';
    }

    const startTimerAsync = async () => {
      let currentSettings = await getStoredState() || {};
      currentSettings.endTime = currentEndTime;
      currentSettings.platform = platform;
      currentSettings.total = Number(data.total) || 90;
      currentSettings.exerciseName = currentExerciseName;
      currentSettings.nextExText = currentNextExText;
      await setStoredState(currentSettings);

      const isIOS = platform === 'ios' || isIOSUserAgent();

      if (!isIOS) {
        const tick = async () => {
          if (!currentEndTime) {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            return;
          }
          const remainingSecs = Math.max(0, Math.ceil((currentEndTime - Date.now()) / 1000));
          if (remainingSecs <= 0) {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            currentEndTime = null;

            const bc = new BroadcastChannel('workout-lockscreeen-sync');
            bc.postMessage({ type: 'REST_TIMER_FINISHED' });

            await runIndexProgression();
          } else {
            await showLockscreeenNotification({
              state: 'active',
              platform: 'android',
              endTime: currentEndTime,
              exerciseName: currentExerciseName,
              nextExText: currentNextExText,
              remainingSecs: remainingSecs
            });

            const bc = new BroadcastChannel('workout-lockscreeen-sync');
            bc.postMessage({
              type: 'REST_TIMER_TICK',
              remainingSecs,
              endTime: currentEndTime,
              total: currentSettings.total,
              exerciseName: currentExerciseName
            });
          }
        };

        if (timerId) {
          clearInterval(timerId);
        }
        timerId = setInterval(tick, 1000);
        await tick();
      } else {
        // CASE iOS countdown mechanics (explicit static rendering)
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }

        await showLockscreeenNotification({
          state: 'active',
          platform: 'ios',
          endTime: currentEndTime,
          exerciseName: currentExerciseName,
          nextExText: currentNextExText
        });

        const bc = new BroadcastChannel('workout-lockscreeen-sync');
        bc.postMessage({
          type: 'LOCKSCREEN_STATE_MUTATED',
          restTimerTarget: {
            endTime: currentEndTime,
            total: currentSettings.total || 90,
            exerciseName: currentExerciseName
          }
        });

        // Trigger the final timer expiration alert on iOS
        const delayMs = Math.max(0, currentEndTime - Date.now());
        iosTimerId = setTimeout(async () => {
          iosTimerId = null;
          await self.registration.showNotification(`Rest Period Finished! ⚡`, {
            body: `Time to hit the next set of ${currentExerciseName || "your exercise"}!`,
            tag: 'workout-timer',
            renotify: true,
            silent: false,
            requireInteraction: true,
            vibrate: [500, 110, 500, 110, 500],
            badge: '/icon-192.png',
            icon: '/icon-192.png'
          });

          const bc2 = new BroadcastChannel('workout-lockscreeen-sync');
          bc2.postMessage({ type: 'REST_TIMER_FINISHED' });

          await runIndexProgression();
        }, delayMs);
      }
    };

    event.waitUntil(startTimerAsync());
  }

  if (data.type === 'CANCEL_TIMER') {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
    if (iosTimerId) {
      clearTimeout(iosTimerId);
      iosTimerId = null;
    }
    currentEndTime = null;

    const cancelTimerAsync = async () => {
      await self.registration.getNotifications({ tag: 'workout-timer' }).then((notifications) => {
        for (const notif of notifications) {
          notif.close();
        }
      });

      const bc = new BroadcastChannel('workout-lockscreeen-sync');
      bc.postMessage({ type: 'REST_TIMER_CANCELLED' });
    };

    event.waitUntil(cancelTimerAsync());
  }

  if (data.type === 'UPDATE_STATUS_NOTIFICATION') {
    if (timerId !== null || iosTimerId !== null || currentEndTime !== null) return;

    const { elapsedTime, exerciseName, setDetails } = data;
    
    let title = exerciseName || "Working Set";
    let body = setDetails || `Duration: ${elapsedTime || "00:00"}`;

    const showStatusAsync = async () => {
      let platform = 'android';
      const idbState = await getStoredState();
      if (idbState && idbState.platform) {
        platform = idbState.platform;
      }
      if (/iPad|iPhone|iPod/.test(self.navigator.userAgent) || isIOSUserAgent()) {
        platform = 'ios';
      }

      await showLockscreeenNotification({
        state: 'inactive',
        platform: platform,
        endTime: 0,
        exerciseName: title,
        nextExText: body
      });
    };

    event.waitUntil(showStatusAsync());
  }
});

// Service Worker Lockscreeen Event Hook Action Router
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  
  event.notification.close();

  event.waitUntil(
    (async () => {
      let platform = 'android';
      const idbState = await getStoredState();
      if (idbState && idbState.platform) {
        platform = idbState.platform;
      }
      if (/iPad|iPhone|iPod/.test(self.navigator.userAgent) || isIOSUserAgent()) {
        platform = 'ios';
      }

      // Restore active timer state on SW wake-up if in-memory variable was recycled/garbage collected
      if (idbState) {
        if (currentEndTime === null || currentEndTime === undefined) {
          if (idbState.endTime) {
            currentEndTime = Number(idbState.endTime);
          }
        }
        if (currentExerciseName === null || currentExerciseName === undefined) {
          currentExerciseName = idbState.exerciseName || null;
        }
        if (currentNextExText === null || currentNextExText === undefined) {
          currentNextExText = idbState.nextExText || null;
        }
      }

      const bc = new BroadcastChannel('workout-lockscreeen-sync');

      const startTickingIfStopped = async () => {
        if (!timerId && currentEndTime && currentEndTime > Date.now()) {
          const tick = async () => {
            if (!currentEndTime) {
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
              return;
            }
            const remainingSecs = Math.max(0, Math.ceil((currentEndTime - Date.now()) / 1000));
            if (remainingSecs <= 0) {
              if (timerId) {
                clearInterval(timerId);
                timerId = null;
              }
              currentEndTime = null;

              bc.postMessage({ type: 'REST_TIMER_FINISHED' });
              await runIndexProgression();
            } else {
              await showLockscreeenNotification({
                state: 'active',
                platform: 'android',
                endTime: currentEndTime,
                exerciseName: currentExerciseName,
                nextExText: currentNextExText,
                remainingSecs: remainingSecs
              });

              bc.postMessage({
                type: 'REST_TIMER_TICK',
                remainingSecs,
                endTime: currentEndTime,
                total: idbState ? idbState.total : 90,
                exerciseName: currentExerciseName
              });
            }
          };
          timerId = setInterval(tick, 1000);
          await tick();
        }
      };

      if (action === 'add_30') {
        const isIOS = platform === 'ios' || isIOSUserAgent();
        if (!isIOS && currentEndTime) {
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
          }
          currentEndTime += 30000;
          if (idbState) {
            idbState.endTime = currentEndTime;
            idbState.total = (idbState.total || 90) + 30;
            await setStoredState(idbState);
          }
          const remainingSecs = Math.max(0, Math.ceil((currentEndTime - Date.now()) / 1000));
          await showLockscreeenNotification({
            state: 'active',
            platform: 'android',
            endTime: currentEndTime,
            exerciseName: currentExerciseName,
            nextExText: currentNextExText,
            remainingSecs: remainingSecs
          });

          bc.postMessage({
            type: 'LOCKSCREEN_STATE_MUTATED',
            restTimerTarget: {
              endTime: currentEndTime,
              total: idbState ? idbState.total : 90,
              exerciseName: currentExerciseName
            }
          });

          await startTickingIfStopped();
        }
      } else if (action === 'sub_30') {
        const isIOS = platform === 'ios' || isIOSUserAgent();
        if (!isIOS && currentEndTime) {
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
          }
          currentEndTime -= 30000;
          const remainingSecs = Math.max(0, Math.ceil((currentEndTime - Date.now()) / 1000));
          
          if (remainingSecs <= 0) {
            if (timerId) {
              clearInterval(timerId);
              timerId = null;
            }
            if (iosTimerId) {
              clearTimeout(iosTimerId);
              iosTimerId = null;
            }
            currentEndTime = null;
            if (idbState) {
              idbState.endTime = null;
              await setStoredState(idbState);
            }
            await runIndexProgression();
          } else {
            if (idbState) {
              idbState.endTime = currentEndTime;
              await setStoredState(idbState);
            }
            await showLockscreeenNotification({
              state: 'active',
              platform: 'android',
              endTime: currentEndTime,
              exerciseName: currentExerciseName,
              nextExText: currentNextExText,
              remainingSecs: remainingSecs
            });

            bc.postMessage({
              type: 'LOCKSCREEN_STATE_MUTATED',
              restTimerTarget: {
                endTime: currentEndTime,
                total: idbState ? idbState.total : 90,
                exerciseName: currentExerciseName
              }
            });

            await startTickingIfStopped();
          }
        }
      } else if (action === 'skip_rest') {
        // Explicitly cancel the Rest Timer WITHOUT completing/advancing any active set index!
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }
        currentEndTime = null;

        if (idbState) {
          idbState.endTime = null;
          await setStoredState(idbState);
        }

        // Show the Working Set inactive notification to let user complete the set later
        await showLockscreeenNotification({
          state: 'inactive',
          platform: platform,
          endTime: 0,
          exerciseName: currentExerciseName,
          nextExText: currentNextExText
        });

        // Broadcast rest timer target removal to the React frontend
        bc.postMessage({
          type: 'LOCKSCREEN_STATE_MUTATED',
          restTimerTarget: null
        });
      } else if (action === 'complete_set') {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
        if (iosTimerId) {
          clearTimeout(iosTimerId);
          iosTimerId = null;
        }
        currentEndTime = null;
        await runIndexProgression();
      } else {
        // Handle general tap clicks: focus window client
        const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
        for (const client of clientList) {
          if ('focus' in client) {
            await client.focus();
            break;
          }
        }
      }
    })()
  );
});

// --- End of sw.js ---
