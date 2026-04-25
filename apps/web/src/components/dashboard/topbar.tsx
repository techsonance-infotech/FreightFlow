'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Settings, User as UserIcon, LogOut, 
  Menu, Sun, Moon, Search, ChevronDown, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanySwitcher } from './company-switcher';
import { SearchCommand } from './search-command';
import { format } from 'date-fns';
import { logout } from '@/app/actions/auth';

interface TopbarProps {
  title?: string;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    companyId: string;
  };
}

export function Topbar({ title = 'Dashboard', user }: TopbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/70 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden xl:flex flex-col shrink-0 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none mb-1.5">
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </p>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em] leading-none mb-1">
              {getGreeting()}
            </span>
            <h2 className="text-sm font-black text-slate-900 truncate max-w-[180px] leading-none" title={user.name}>
              {user.name}
            </h2>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-slate-100 hidden xl:block mx-1 shrink-0" />
        
        <CompanySwitcher currentCompanyId={user.companyId} />
      </div>

      <div className="flex items-center gap-3 lg:gap-6 flex-1 justify-end ml-4">
        {/* Global Search Component */}
        <SearchCommand />

        <div className="flex items-center gap-3">
          {/* Notifications Trigger */}
          <button 
            className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600 shadow-sm active:scale-95"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-rose-500 ring-4 ring-white" />
          </button>
          
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all hover:bg-slate-50 hover:text-blue-600 shadow-sm active:scale-95">
            <Moon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-slate-100 mx-2" />

        {/* User Account Section */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 p-1.5 pr-3 rounded-2xl transition-all hover:bg-slate-50 group border border-transparent hover:border-slate-100 active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500/20 flex items-center justify-center shadow-md text-white font-black text-sm transition-transform group-hover:scale-105">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-2.5 w-2.5 text-blue-500" />
                <p className="text-[9px] font-black uppercase tracking-wider text-slate-400">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform duration-200", isProfileOpen && "rotate-180")} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-64 z-50 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Managed By</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{user.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 truncate">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <Link href="/dashboard/settings/profile" onClick={() => setIsProfileOpen(false)}>
                    <DropdownItem icon={<UserIcon className="h-4 w-4" />} label="My Profile" desc="Personal information" />
                  </Link>
                  <Link href="/dashboard/settings/organization" onClick={() => setIsProfileOpen(false)}>
                    <DropdownItem icon={<Settings className="h-4 w-4" />} label="Org Settings" desc="Company & Billing" />
                  </Link>
                </div>
                
                <div className="mt-2 pt-2 border-t border-slate-50">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-all shadow-sm">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black">Sign Out</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">End active session</p>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function DropdownItem({ icon, label, desc }: { icon: React.ReactNode, label: string, desc: string }) {
  return (
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-slate-700 transition-all group">
      <div className="h-8 w-8 rounded-lg bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-white group-hover:text-blue-600 group-hover:shadow-sm transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs font-black group-hover:text-slate-900 transition-colors">{label}</p>
        <p className="text-[9px] font-medium text-slate-400">{desc}</p>
      </div>
    </button>
  );
}
