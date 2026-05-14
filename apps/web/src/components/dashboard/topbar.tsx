'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Bell, Settings, User as UserIcon, LogOut, 
  Menu, Sun, Moon, Search, ChevronDown, ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { CompanySwitcher } from './company-switcher';
import { logout } from '@/app/actions/auth';
import dynamic from 'next/dynamic';

const SearchCommand = dynamic(() => import('./search-command').then(mod => mod.SearchCommand), { ssr: false });

import { NotificationCenter } from './notification-center';

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <header className="no-print sticky top-0 z-30 flex h-20 items-center justify-between border-b border-neutral-200 bg-white/70 px-8 backdrop-blur-xl">
      <div className="flex items-center gap-4 min-w-0">
        <div className="hidden xl:flex flex-col shrink-0 min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-400 leading-none mb-1.5">
            {new Intl.DateTimeFormat('en-US', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}
          </p>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-accent-600 uppercase tracking-[0.1em] leading-none mb-1">
              {getGreeting()}
            </span>
            <h2 className="text-sm font-bold text-neutral-900 truncate max-w-[180px] leading-none" title={user.name}>
              {user.name}
            </h2>
          </div>
        </div>
        
        <div className="h-10 w-[1px] bg-neutral-100 hidden xl:block mx-1 shrink-0" />
        
        <CompanySwitcher currentCompanyId={user.companyId} />
      </div>

      <div className="flex items-center gap-3 lg:gap-6 flex-1 justify-end ml-4">
        {/* Global Search Component */}
        <SearchCommand />

        <div className="flex items-center gap-3">
          {/* Notifications Center */}
          <NotificationCenter />
          
          <button className="flex h-11 w-11 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-all hover:bg-neutral-50 hover:text-accent-600 shadow-sm active:scale-95">
            <Moon className="h-5 w-5" />
          </button>
        </div>

        <div className="h-10 w-[1px] bg-neutral-100 mx-2" />

        {/* User Account Section */}
        <div className="relative">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-4 p-1.5 pr-3 rounded-2xl transition-all hover:bg-neutral-50 group border border-transparent hover:border-neutral-100 active:scale-[0.98]"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-accent-600 to-brand-900 border border-accent-500/20 flex items-center justify-center shadow-md text-white font-bold text-sm transition-transform group-hover:scale-105">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-neutral-900 leading-tight group-hover:text-accent-600 transition-colors">{user.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="h-2.5 w-2.5 text-accent-500" />
                <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
            <ChevronDown className={cn("h-4 w-4 text-neutral-300 transition-transform duration-200", isProfileOpen && "rotate-180")} />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div className="absolute top-full right-0 mt-2 w-64 z-50 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-neutral-100 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-3 border-b border-neutral-50 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Account Managed By</p>
                  <p className="text-sm font-bold text-neutral-900 mt-1">{user.name}</p>
                  <p className="text-[10px] font-medium text-neutral-500 truncate">{user.email}</p>
                </div>
                
                <div className="space-y-1">
                  <Link href="/dashboard/settings/profile" onClick={() => setIsProfileOpen(false)}>
                    <DropdownItem icon={<UserIcon className="h-4 w-4" />} label="My Profile" desc="Personal information" />
                  </Link>
                  <Link href="/dashboard/settings/organization" onClick={() => setIsProfileOpen(false)}>
                    <DropdownItem icon={<Settings className="h-4 w-4" />} label="Org Settings" desc="Company & Billing" />
                  </Link>
                  <Link href="/dashboard/support" onClick={() => setIsProfileOpen(false)}>
                    <DropdownItem icon={<MessageSquare className="h-4 w-4 text-blue-500" />} label="Help & Support" desc="Chat with our team" />
                  </Link>
                </div>
                
                <div className="mt-2 pt-2 border-t border-neutral-50">
                  <button 
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-error-50 text-neutral-700 hover:text-error-600 transition-all group"
                  >
                    <div className="h-8 w-8 rounded-lg bg-error-50 text-error-500 flex items-center justify-center group-hover:bg-error-600 group-hover:text-white transition-all shadow-sm">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold">Sign Out</p>
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
    <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 text-neutral-700 transition-all group">
      <div className="h-8 w-8 rounded-lg bg-neutral-50 text-neutral-400 flex items-center justify-center group-hover:bg-white group-hover:text-accent-600 group-hover:shadow-sm transition-all">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs font-bold group-hover:text-neutral-900 transition-colors">{label}</p>
        <p className="text-[9px] font-medium text-neutral-400">{desc}</p>
      </div>
    </button>
  );
}
