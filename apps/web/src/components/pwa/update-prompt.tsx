'use client';

import React, { useEffect, useState } from 'react';
import { DownloadCloud, RefreshCw, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function UpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [worker, setWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWorker(newWorker);
                setShowPrompt(true);
              }
            });
          }
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (worker) {
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowPrompt(false);
    window.location.reload();
  };

  if (!showPrompt) return null;

  return (
    <div className={cn(
      "fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top-5 fade-in duration-300",
      "w-full max-w-sm bg-blue-600 rounded-2xl shadow-xl shadow-blue-600/20 p-4"
    )}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
          <DownloadCloud className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-white">Update Available</h4>
          <p className="text-xs font-medium text-blue-100 mt-0.5">A new version of FreightFlow is ready.</p>
        </div>
        <button 
          onClick={handleUpdate}
          className="h-8 px-3 bg-white text-blue-600 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-colors"
        >
          Update
        </button>
        <button 
          onClick={() => setShowPrompt(false)}
          className="h-6 w-6 rounded-full flex items-center justify-center text-blue-200 hover:text-white transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
