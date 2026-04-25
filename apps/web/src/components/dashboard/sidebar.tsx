'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, hasPermission, type NavItem } from '@/config/rbac';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: {
    name: string;
    role: string;
    email: string;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (id: string) => {
    setOpenMenus(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = openMenus[item.id] || (hasSubItems && pathname.startsWith(item.path));
    const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path) && !hasSubItems);
    
    // Check permissions for sub-items too
    const filteredSubItems = item.subItems?.filter(si => hasPermission(user.role, si.allowedRoles)) || [];

    if (!hasPermission(user.role, item.allowedRoles)) return null;

    return (
      <div key={item.id} className="space-y-0.5">
        {hasSubItems ? (
          <button
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
              isExpanded ? "text-white bg-white/5" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className="text-base opacity-70 group-hover:opacity-100">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            <span className={cn("text-[8px] transition-transform duration-200 opacity-30", isExpanded ? "rotate-180" : "")}>
              ▼
            </span>
          </button>
        ) : (
          <Link
            href={item.path}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all duration-200",
              isActive 
                ? "bg-blue-600/15 text-white border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]" 
                : isSubItem ? "text-white/30 hover:text-white pl-8" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn(
              "text-base transition-transform duration-200 group-hover:scale-105",
              isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
            )}>
              {item.icon}
            </span>
            {item.label}
            {isActive && (
              <div className="ml-auto h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            )}
          </Link>
        )}

        {hasSubItems && isExpanded && (
          <div className="space-y-0.5 mt-0.5 border-l border-white/[0.03] ml-5 pl-1.5 animate-in slide-in-from-top-1 duration-200">
            {filteredSubItems.map(si => renderNavItem(si, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className="no-print fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/5 shadow-2xl"
      style={{ background: 'linear-gradient(180deg, #0A1628 0%, #0F2B5B 100%)' }}
    >
      {/* Header / Logo */}
      <div className="flex items-center gap-3 px-5 py-4 flex-shrink-0 border-b border-white/5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-lg text-lg shadow-inner bg-gradient-to-br from-blue-500 to-blue-700"
          style={{ border: '1px solid rgba(255,255,255,0.1)' }}
        >
          🚛
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-bold tracking-tight text-white leading-tight">FreightFlow</h1>
          <span className="text-[9px] font-bold tracking-[0.15em] text-blue-500/80 uppercase leading-tight">Pro Edition</span>
        </div>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {NAV_ITEMS.map((group, groupIdx) => {
          const hasVisibleItems = group.items.some(item => hasPermission(user.role, item.allowedRoles));
          if (!hasVisibleItems) return null;

          return (
            <div key={group.group} className={cn(groupIdx === 0 ? "" : "mt-4")}>
              <h2 className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                {group.group}
              </h2>
              <div className="space-y-0.5">
                {group.items.map(item => renderNavItem(item))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User / Profile Section */}
      <div className="border-t border-white/5 bg-white/[0.02] p-3 flex-shrink-0">
        <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] p-2 border border-white/5 hover:bg-white/[0.05] transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 text-xs font-bold text-white shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs font-semibold text-white/90">{user.name}</p>
            <p className="truncate text-[8px] font-black uppercase tracking-wider text-blue-500/60">
              {user.role.replace('_', ' ')}
            </p>
          </div>
          <button 
            className="p-1.5 text-white/20 hover:text-white/80 transition-all hover:bg-white/5 rounded-md"
            title="Logout"
            onClick={async () => {
              const { logout } = await import('@/app/actions/auth');
              await logout();
            }}
          >
            <span className="text-xs">🚪</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
