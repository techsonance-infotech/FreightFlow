'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);

      const handleOnline = () => {
        setIsOffline(false);
        setDismissed(false);
      };
      
      const handleOffline = () => {
        setIsOffline(true);
        setDismissed(false);
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  if (!isOffline || dismissed) return null;

  return (
    <div className={cn(
      "fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300",
      "w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4"
    )}>
      <div className="flex items-start gap-3 relative">
        <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center shrink-0">
          <WifiOff className="h-5 w-5 text-rose-500" />
        </div>
        <div className="pr-6">
          <h4 className="text-sm font-black text-white">You're Offline</h4>
          <p className="text-xs font-medium text-slate-400 mt-0.5 leading-relaxed">
            FreightFlow is running in offline mode. Changes will sync automatically when your connection is restored.
          </p>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="absolute top-0 right-0 h-6 w-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
