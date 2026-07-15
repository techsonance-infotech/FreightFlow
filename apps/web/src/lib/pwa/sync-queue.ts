import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface SyncDB extends DBSchema {
  syncQueue: {
    key: string;
    value: {
      id: string;
      url: string;
      method: string;
      headers: any;
      body: string;
      timestamp: number;
      retryCount?: number;
    };
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SyncDB>> | null = null;

export function getDB() {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB<SyncDB>('freightflow-sync-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('by-date', 'timestamp');
      },
    }).catch((err) => {
      dbPromise = null;
      throw err;
    });
  }
  return dbPromise;
}

export async function addToSyncQueue(request: { url: string; method: string; headers?: any; body?: any }) {
  const db = await getDB();
  if (!db) return;

  const id = crypto.randomUUID();
  await db.add('syncQueue', {
    id,
    url: request.url,
    method: request.method,
    headers: request.headers || {},
    body: typeof request.body === 'string' ? request.body : JSON.stringify(request.body || {}),
    timestamp: Date.now(),
    retryCount: 0,
  });

  // Try to register background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('freightflow-offline-sync');
    } catch (err) {
      console.error('Failed to register background sync:', err);
    }
  }
}

export async function processSyncQueue() {
  if (typeof window === 'undefined' || !navigator.onLine) return;

  const db = await getDB();
  if (!db) return;

  // We have to get the items first, then process them one by one.
  // Using a separate transaction for the actual deletion allows fetching sequentially.
  const allItems = await db.getAll('syncQueue');

  if (allItems.length === 0) return;

  let successCount = 0;

  for (const item of allItems) {
    try {
      const fetchHeaders = { ...item.headers };
      if (item.method === 'POST' || item.method === 'PUT') {
        fetchHeaders['Idempotency-Key'] = item.id;
      }

      const response = await fetch(item.url, {
        method: item.method,
        headers: fetchHeaders,
        body: item.body,
      });

      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 408 && response.status !== 429)) {
        await db.delete('syncQueue', item.id);
        if (response.ok) successCount++;
      } else {
        // Transient error (5xx, 429, 408, or network failure)
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount >= 5) {
          await db.delete('syncQueue', item.id);
        } else {
          await db.put('syncQueue', item);
        }
      }
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
      item.retryCount = (item.retryCount || 0) + 1;
      if (item.retryCount >= 5) {
        await db.delete('syncQueue', item.id);
      } else {
        await db.put('syncQueue', item);
      }
    }
  }
  
  if (successCount > 0) {
    console.log(`Successfully synced ${successCount} offline mutations.`);
  }
}

// Automatically listen for service worker messages to process the queue
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SYNC_OFFLINE_MUTATIONS') {
      processSyncQueue();
    }
  });

  // Also try to process queue when coming back online natively as fallback
  window.addEventListener('online', () => {
    processSyncQueue();
  });
}
