'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { 
  Shield, LayoutDashboard, Building2, 
  Key, MessageSquare, History, 
  Settings, LogOut, Globe, 
  Activity, Truck, Users, Zap,
  Menu, X
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLogoutButton } from '@/components/admin/logout-button';
import { cn } from '@/lib/utils';

interface NavigationWrapperProps {
  children: React.ReactNode;
  session: {
    id: string;
    email: string;
  } | null;
}

export function NavigationWrapper({ children, session }: NavigationWrapperProps) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close sidebar drawer automatically on navigation change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileOpen]);

  const navGroups = [
    {
      title: "Command & Governance",
      links: [
        { href: "/admin/dashboard", icon: <LayoutDashboard className="h-4 w-4" />, label: "Command Center" },
        { href: "/admin/tenants", icon: <Building2 className="h-4 w-4" />, label: "Workspaces" },
        { href: "/admin/licenses", icon: <Key className="h-4 w-4" />, label: "License Hub" },
      ]
    },
    {
      title: "Operations & Health",
      links: [
        { href: "/admin/fleet", icon: <Truck className="h-4 w-4" />, label: "Fleet Pulse" },
        { href: "/admin/performance", icon: <Activity className="h-4 w-4" />, label: "System Vitality" },
        { href: "/admin/compliance", icon: <Shield className="h-4 w-4" />, label: "Compliance" },
      ]
    },
    {
      title: "Sovereignty & Audit",
      links: [
        { href: "/admin/workforce", icon: <Users className="h-4 w-4" />, label: "Workforce" },
        { href: "/admin/features", icon: <Zap className="h-4 w-4" />, label: "Feature Engine" },
        { href: "/admin/support", icon: <MessageSquare className="h-4 w-4" />, label: "Assistance Deck" },
        { href: "/admin/audit-logs", icon: <History className="h-4 w-4" />, label: "Audit Trail" },
      ]
    },
    {
      title: "System Settings",
      links: [
        { href: "/admin/settings", icon: <Settings className="h-4 w-4" />, label: "Platform Config" },
      ]
    }
  ];

  const renderSidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="p-10 flex items-center gap-4 border-b border-slate-100/50 flex-shrink-0">
        <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden relative">
          <Image 
            src="/logo.png" 
            alt="FreightFlow" 
            fill
            sizes="48px"
            className="object-contain p-1.5"
          />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter">FreightFlow</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Super Admin</p>
        </div>
      </div>

      {/* Navigation Group Stream */}
      <nav className="flex-1 px-6 py-6 space-y-8 overflow-y-auto custom-scrollbar">
        {navGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 ml-5 mb-4">{group.title}</p>
            {group.links.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
              return (
                <Link 
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] group relative",
                    isActive 
                      ? "bg-blue-600/5 border border-blue-500/10 text-blue-600 shadow-[inset_0_1px_1px_rgba(37,99,235,0.02)]" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-blue-600 border border-transparent"
                  )}
                >
                  <span className={cn(
                    "transition-transform group-hover:scale-110 group-hover:rotate-3",
                    isActive ? "scale-110" : ""
                  )}>
                    {link.icon}
                  </span>
                  {link.label}
                  {isActive && (
                    <div className="absolute right-4 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Section / Termination */}
      <div className="p-6 border-t border-slate-100 flex-shrink-0 bg-slate-50/50">
        <div className="p-5 bg-white rounded-[1.5rem] flex items-center gap-4 mb-4 border border-slate-100 shadow-sm">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 shadow-sm flex items-center justify-center font-black text-white border border-slate-100">
            {session?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-slate-900 truncate">{session?.email || 'Admin User'}</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Platform Lead</p>
          </div>
        </div>
        <AdminLogoutButton />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 1. Desktop Sidebar Container */}
      <aside className="w-80 border-r border-slate-200 flex flex-col fixed inset-y-0 z-40 bg-white hidden lg:flex">
        {renderSidebarContent()}
      </aside>

      {/* 2. Mobile Nav Header Bar */}
      <header className="lg:hidden h-18 border-b border-slate-200 bg-white/95 backdrop-blur-md flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden relative">
            <Image 
              src="/logo.png" 
              alt="FreightFlow" 
              fill
              sizes="40px"
              className="object-contain p-1"
            />
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-900 tracking-tight">FreightFlow</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-blue-600">Super Admin</p>
          </div>
        </div>

        <button 
          onClick={() => setIsMobileOpen(true)}
          className="h-12 w-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all shadow-inner"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {/* 3. Mobile Backdrop Blur & Sidebar Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div 
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Sidebar */}
          <aside className="relative w-80 bg-white flex flex-col shadow-2xl h-full z-55 animate-in slide-in-from-left duration-300">
            {/* Close Button Inside Drawer */}
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="absolute top-8 right-6 h-10 w-10 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors active:scale-95 z-50"
            >
              <X className="h-5 w-5" />
            </button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* 4. Page Main Frame */}
      <main className="lg:ml-80 flex-1 pt-24 lg:pt-0 overflow-x-hidden min-h-screen">
        <div className="p-6 md:p-12 max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
