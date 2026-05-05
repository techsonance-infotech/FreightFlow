'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface SystemPulseProps {
  status?: 'online' | 'warning' | 'offline';
  className?: string;
}

export function SystemPulse({ status = 'online', className }: SystemPulseProps) {
  const statusConfig = {
    online: {
      color: 'bg-emerald-500',
      shadow: 'shadow-[0_0_12px_rgba(16,185,129,0.4)]',
      text: 'System Ready',
      pulse: 'bg-emerald-400',
    },
    warning: {
      color: 'bg-amber-500',
      shadow: 'shadow-[0_0_12px_rgba(245,158,11,0.4)]',
      text: 'Degraded',
      pulse: 'bg-amber-400',
    },
    offline: {
      color: 'bg-rose-500',
      shadow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]',
      text: 'Offline',
      pulse: 'bg-rose-400',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md", className)}>
      <div className="relative flex h-2 w-2">
        <span className={cn(
          "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
          config.pulse
        )}></span>
        <span className={cn(
          "relative inline-flex rounded-full h-2 w-2",
          config.color,
          config.shadow
        )}></span>
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
        {config.text}
      </span>
    </div>
  );
}
