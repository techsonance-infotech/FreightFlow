'use client';

import React, { useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { processSyncQueue } from '@/lib/pwa/sync-queue';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function SyncStatus() {
  const [pendingItems, setPendingItems] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const checkQueue = async () => {
    if (typeof window !== 'undefined') {
      const { openDB } = await import('idb');
      try {
        const db = await openDB('freightflow-sync-db', 1);
        const tx = db.transaction('syncQueue', 'readonly');
        const store = tx.objectStore('syncQueue');
        const count = await store.count();
        setPendingItems(count);
      } catch (err) {
        // DB might not be initialized yet
      }
    }
  };

  useEffect(() => {
    checkQueue();
    const interval = setInterval(checkQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!navigator.onLine) {
      toast.error('You are still offline');
      return;
    }
    setSyncing(true);
    try {
      await processSyncQueue();
      await checkQueue();
      toast.success('Offline changes synced successfully');
    } catch (err) {
      toast.error('Failed to sync changes');
    } finally {
      setSyncing(false);
    }
  };

  if (pendingItems === 0) return null;

  return (
    <div className={cn(
      "fixed bottom-4 left-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300",
      "bg-amber-100 border border-amber-200 rounded-full shadow-lg px-4 py-2 flex items-center gap-3 cursor-pointer hover:bg-amber-200 transition-colors"
    )} onClick={handleSync}>
      <CloudOff className="h-4 w-4 text-amber-700" />
      <span className="text-xs font-black text-amber-900 uppercase tracking-widest">
        {pendingItems} {pendingItems === 1 ? 'change' : 'changes'} pending
      </span>
      <RefreshCw className={cn("h-3 w-3 text-amber-700", syncing && "animate-spin")} />
    </div>
  );
}
