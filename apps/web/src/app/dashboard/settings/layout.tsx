'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, Building2, ShieldCheck, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { id: 'profile', label: 'My Profile', href: '/dashboard/settings/profile', icon: <User className="h-4 w-4" /> },
    { id: 'organizations', label: 'Organizations', href: '/dashboard/settings/organizations', icon: <Building2 className="h-4 w-4" /> },
    { id: 'security', label: 'Security', href: '/dashboard/settings/security', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', href: '/dashboard/settings/billing', icon: <CreditCard className="h-4 w-4" /> },
  ];

  return (
    <div className="p-4 lg:p-8 w-full">
      <div className="mb-8 ml-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your account preferences and organization details.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <aside className="w-full lg:w-64 shrink-0">
          <nav className="flex flex-row lg:flex-col gap-1 p-1 bg-slate-100 rounded-2xl lg:bg-transparent">
            {tabs.map((tab) => {
              const isActive = pathname === tab.href;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={cn(
                    "flex-1 lg:flex-none flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                    isActive 
                      ? "bg-white text-blue-600 shadow-sm lg:bg-blue-600 lg:text-white lg:shadow-md" 
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50 lg:hover:bg-slate-100"
                  )}
                >
                  {tab.icon}
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
