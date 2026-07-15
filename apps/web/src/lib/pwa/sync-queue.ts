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
    };
    indexes: { 'by-date': number };
  };
}

let dbPromise: Promise<IDBPDatabase<SyncDB>> | null = null;

function getDB() {
  if (typeof window === 'undefined') return null;
  
  if (!dbPromise) {
    dbPromise = openDB<SyncDB>('freightflow-sync-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('syncQueue', { keyPath: 'id' });
        store.createIndex('by-date', 'timestamp');
      },
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
  });

  // Try to register background sync if available
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // @ts-ignore
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
      const response = await fetch(item.url, {
        method: item.method,
        headers: {
          ...item.headers,
          'Content-Type': 'application/json',
        },
        body: item.body,
      });

      if (response.ok) {
        await db.delete('syncQueue', item.id);
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to sync item ${item.id}:`, err);
      // Keep it in the queue for the next attempt
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
