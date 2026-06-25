/**
 * Network Utilities and Robust Request Resilience Engine
 * 
 * This module is designed to provide high-reliability communication layers
 * utilising advanced rate limit interception, exponential backoff cooldowns, 
 * and persistent offline caching integration via Browser IndexedDB.
 * 
 * Characterised by strict adherence to UK English spelling standards, this is
 * designed to be lightweight, modular, and completely self-contained.
 */

const CACHE_DB_NAME = "OfflineNetworkCacheDB";
const STORE_NAME = "networkCache";
const DB_VERSION = 1;

/**
 * Initialises the IndexedDB structure for storing cached network payloads.
 * This guarantees offline resilience and synchronised storage for caching logic.
 */
function getIDBDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not supported in this client environment"));
      return;
    }

    const request = indexedDB.open(CACHE_DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "urlKey" });
      }
    };

    request.onsuccess = (event: any) => {
      resolve(event.target.result);
    };

    request.onerror = (event: any) => {
      reject(event.target.error || new Error("Failed to open IndexedDB"));
    };
  });
}

/**
 * Persists an item in the IndexedDB offline database, optimising subsequent offline queries.
 */
export async function saveToOfflineCache(urlKey: string, payload: any): Promise<void> {
  try {
    const db = await getIDBDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({ urlKey, payload, timestamp: Date.now() });

      request.onsuccess = () => resolve();
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.error("Failure whilst writing payload to offline IndexedDB cache:", error);
  }
}

/**
 * Retrieves a cached item from the IndexedDB offline database.
 */
export async function getFromOfflineCache(urlKey: string): Promise<any | null> {
  try {
    const db = await getIDBDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(urlKey);

      request.onsuccess = (event: any) => {
        if (event.target.result) {
          resolve(event.target.result.payload);
        } else {
          resolve(null);
        }
      };
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.error("Failure whilst reading payload from offline IndexedDB cache:", error);
    return null;
  }
}

/**
 * Pauses execution for a designated duration in milliseconds, providing a cooldown gap.
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Robust fetch client with built-in 429 interceptors, exponential backoff cooldowns,
 * and seamless fallback to IndexedDB caching pipelines when network dropouts occur.
 */
export async function robustFetch(
  input: string,
  init?: RequestInit,
  options?: {
    useCache?: boolean;
    cacheKey?: string;
    maxAttempts?: number;
  }
): Promise<Response> {
  const maxAttempts = options?.maxAttempts ?? 3;
  const cacheKey = options?.cacheKey ?? input;
  const useCache = options?.useCache ?? false;

  // Let's immediately intercept offline state to avoid redundant connection attempts.
  const isOffline = typeof navigator !== "undefined" && !navigator.onLine;

  if (isOffline) {
    console.warn(`Browser status identified as offline. Initialising database cache extraction for: ${input}`);
    if (useCache) {
      const cachedData = await getFromOfflineCache(cacheKey);
      if (cachedData !== null) {
        // Construct a mock response using cached content payload.
        return new Response(JSON.stringify(cachedData), {
          status: 200,
          headers: { "Content-Type": "application/json", "x-cached-response": "true" },
        });
      }
    }
    throw new Error("Unable to execute transaction: browser is offline and no cached payload is available.");
  }

  let attempt = 0;
  let lastError: any = null;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const response = await fetch(input, init);

      // Evaluate whether rate limit restrictions are present.
      if (response.status === 429) {
        console.warn(`Rate limit restriction encountered (Status: 429) on attempt #${attempt}.`);
        
        // Attempt to isolate recovery metrics (such as retryDelay in JSON body or Retry-After header)
        let cooldownMs = 32000; // Default safety threshold (32 seconds as specified in requirements)
        
        // Try parsing headers first
        const retryAfterHeader = response.headers.get("Retry-After");
        if (retryAfterHeader) {
          const parsedHeader = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedHeader)) {
            cooldownMs = parsedHeader * 1000;
          }
        } else {
          // Clone the response so we can read body without corrupting subsequent actions
          try {
            const bodyClone = response.clone();
            const bodyJson = await bodyClone.json();
            
            // Search for typical recovery metrics: retryDelay or RetryInfo metadata or delay values
            const delayValue = bodyJson.retryDelay || bodyJson.delay || (bodyJson.error && bodyJson.error.retryDelay);
            if (delayValue) {
              const parsedDelay = parseInt(delayValue, 10);
              if (!isNaN(parsedDelay)) {
                cooldownMs = parsedDelay;
              }
            } else if (bodyJson.RetryInfo) {
              // Extract from structured Google API objects
              const innerDelay = bodyJson.RetryInfo.retryDelay || bodyJson.RetryInfo.delay;
              const parsedInner = parseInt(innerDelay, 10);
              if (!isNaN(parsedInner)) {
                cooldownMs = parsedInner;
              }
            }
          } catch (_) {
            // Let's fallback silently to default cooldownMs if JSON parse fails
          }
        }

        // Apply a minor safety margin of 500 milliseconds to guarantee the restriction window clears
        const finalCooldown = cooldownMs + 500;
        console.info(`Rate limit recovery in progress. Stalling execution thread for: ${finalCooldown}ms. (Attempt #${attempt}/${maxAttempts})`);

        // Triggering asynchronous delay timeout to stall cleanly before retrying
        await delay(finalCooldown);
        continue; // Retry the request again
      }

      // If the request succeeds or has another non-429 status, let's treat it as complete.
      if (response.ok && useCache) {
        // Asynchronously save the payload to offline IndexedDB directory for future offline access.
        try {
          const cloneForCache = response.clone();
          const jsonPayload = await cloneForCache.json();
          await saveToOfflineCache(cacheKey, jsonPayload);
        } catch (_) {
          // If response is not JSON or cloning fails, skip caching
        }
      }

      return response;
    } catch (err: any) {
      lastError = err;
      console.error(`Network dropout or exception encountered on attempt #${attempt}:`, err);

      // Handle offline or browser network dropouts on execution failure
      if (useCache) {
        console.info(`Network exception caught. Attempting fallback retrieval from IndexedDB offline storage.`);
        const cachedData = await getFromOfflineCache(cacheKey);
        if (cachedData !== null) {
          return new Response(JSON.stringify(cachedData), {
            status: 200,
            headers: { "Content-Type": "application/json", "x-cached-fallback": "true" },
          });
        }
      }

      // Exponential backoff for typical unexpected network exceptions
      if (attempt < maxAttempts) {
        const backoffDelay = Math.pow(2, attempt) * 1000 + Math.random() * 200;
        console.info(`Retrying after dynamic exponential backoff: ${backoffDelay.toFixed(0)}ms.`);
        await delay(backoffDelay);
      }
    }
  }

  // If maximum ceiling of attempts is exhausted, bubble up the final exception state
  throw lastError || new Error(`Maximum transaction retry attempts (${maxAttempts}) exhausted without success.`);
}
