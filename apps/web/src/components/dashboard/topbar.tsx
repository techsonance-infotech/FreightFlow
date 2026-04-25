'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TopbarProps {
  title?: string;
  user: {
    name: string;
    role: string;
  };
}

export function Topbar({ title = 'Dashboard', user }: TopbarProps) {
  return (
    <header className="no-print sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="text-xl font-black tracking-tight text-slate-900">{title}</h2>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar - Decorative placeholder */}
        <div className="hidden lg:flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-slate-400 transition-all hover:border-blue-300 hover:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-500">
          <span className="text-lg">🔍</span>
          <input 
            type="text" 
            placeholder="Search LR, Vehicle, Driver..." 
            className="w-64 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] font-medium text-slate-400">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>

        <div className="flex items-center gap-3">
          <button className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600 shadow-sm active:scale-95">
            <span className="text-lg">🔔</span>
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500 ring-4 ring-white" />
          </button>
          
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-all hover:bg-slate-50 hover:text-blue-600 shadow-sm active:scale-95">
            <span className="text-lg">⚙️</span>
          </button>
        </div>

        <div className="h-10 w-[1px] bg-slate-200 mx-2" />

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user.name}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {user.role.replace('_', ' ')}
            </p>
          </div>
          <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <span className="text-xl">👤</span>
          </div>
        </div>
      </div>
    </header>
  );
}
