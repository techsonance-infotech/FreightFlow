'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, hasPermission, type NavItem } from '@/config/rbac';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { 
  Truck, Home, MessageSquare, Box, Inbox, Route, Camera, IndianRupee,
  BarChart4, TrendingUp, ArrowUpFromLine, Receipt, Landmark, Scroll,
  FolderKanban, Scale, Building2, Calculator, Scissors, Users,
  Calendar, Umbrella, ShieldAlert, Fuel, Circle, Wrench, Bot,
  Construction, Settings, Palette, Shield, CreditCard, LogOut
} from 'lucide-react';

const ICON_MAP: Record<string, React.ReactNode> = {
  home: <Home className="h-4 w-4" />,
  message: <MessageSquare className="h-4 w-4" />,
  box: <Box className="h-4 w-4" />,
  inbox: <Inbox className="h-4 w-4" />,
  route: <Route className="h-4 w-4" />,
  camera: <Camera className="h-4 w-4" />,
  rupee: <IndianRupee className="h-4 w-4" />,
  chart: <BarChart4 className="h-4 w-4" />,
  trending: <TrendingUp className="h-4 w-4" />,
  outbox: <ArrowUpFromLine className="h-4 w-4" />,
  receipt: <Receipt className="h-4 w-4" />,
  bank: <Landmark className="h-4 w-4" />,
  scroll: <Scroll className="h-4 w-4" />,
  folder: <FolderKanban className="h-4 w-4" />,
  scale: <Scale className="h-4 w-4" />,
  building: <Building2 className="h-4 w-4" />,
  calculator: <Calculator className="h-4 w-4" />,
  scissors: <Scissors className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  palm: <Umbrella className="h-4 w-4" />,
  truck: <Truck className="h-4 w-4" />,
  alert: <ShieldAlert className="h-4 w-4" />,
  fuel: <Fuel className="h-4 w-4" />,
  circle: <Circle className="h-4 w-4" />,
  wrench: <Wrench className="h-4 w-4" />,
  bot: <Bot className="h-4 w-4" />,
  construction: <Construction className="h-4 w-4" />,
  settings: <Settings className="h-4 w-4" />,
  palette: <Palette className="h-4 w-4" />,
  shield: <Shield className="h-4 w-4" />,
  'credit-card': <CreditCard className="h-4 w-4" />,
  hardhat: <Construction className="h-4 w-4" />,
};

interface SidebarProps {
  user: {
    name: string;
    role: string;
    email: string;
    permissions?: any;
  };
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [hasInteracted, setHasInteracted] = useState(false);

  // Reset manual interaction state when navigating to a new page
  // This allows the sidebar to "auto-expand" the correct section for the new page
  React.useEffect(() => {
    setHasInteracted(false);
    setOpenMenus({});
  }, [pathname]);

  // Calculate active items and paths
  const activeIds = useMemo(() => {
    const ids = new Set<string>();

    const checkActive = (items: NavItem[]): boolean => {
      let anyActive = false;

      for (const item of items) {
        let isThisItemActive = false;

        // 1. Exact match
        if (pathname === item.path) {
          isThisItemActive = true;
        }

        // 2. Child match (recursive)
        if (item.subItems && checkActive(item.subItems)) {
          isThisItemActive = true;
        }

        // 3. Prefix match (for leaf nodes/detail pages)
        // We only consider it active if no sibling is an exact match or a better prefix match
        if (!isThisItemActive && (!item.subItems || item.subItems.length === 0)) {
          if (item.path !== '/dashboard' && pathname.startsWith(item.path + '/')) {
            const betterSibling = items.find(sibling =>
              sibling.id !== item.id &&
              (pathname === sibling.path || (pathname.startsWith(sibling.path + '/') && sibling.path.length > item.path.length))
            );
            if (!betterSibling) {
              isThisItemActive = true;
            }
          }
        }

        if (isThisItemActive) {
          ids.add(item.id);
          anyActive = true;
        }
      }

      return anyActive;
    };

    NAV_ITEMS.forEach(group => checkActive(group.items));
    return ids;
  }, [pathname]);

  const toggleMenu = (id: string, defaultExpanded: boolean) => {
    setHasInteracted(true);
    setOpenMenus(prev => {
      const isCurrentlyOpen = prev[id] !== undefined ? prev[id] : defaultExpanded;
      // Close others and toggle the current one for strict single-open behavior
      return { [id]: !isCurrentlyOpen };
    });
  };

  const renderNavItem = (item: NavItem, isSubItem = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = activeIds.has(item.id);

    // Logic: 
    // 1. If user has interacted, use the manual state (openMenus).
    // 2. Otherwise, use the "active path" auto-expansion.
    const isExpanded = hasInteracted
      ? !!openMenus[item.id]
      : (hasSubItems && isActive);

    const filteredSubItems = item.subItems?.filter(si => hasPermission(user.role, si, user.permissions)) || [];

    if (!hasPermission(user.role, item, user.permissions)) return null;

    return (
      <div key={item.id} className="space-y-0.5">
        {hasSubItems ? (
          <button
            onClick={() => toggleMenu(item.id, isActive)}
            className={cn(
              "group flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200",
              isActive ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn(
              "text-base transition-all duration-200",
              isActive ? "opacity-100 scale-110" : "opacity-70 group-hover:opacity-100"
            )}>
              {ICON_MAP[item.icon as string] || item.icon}
            </span>
            <span className="flex-1 text-left">{item.label}</span>
            <span className={cn("text-[8px] transition-transform duration-300 opacity-30", isExpanded ? "rotate-180" : "")}>
              ▼
            </span>
          </button>
        ) : (
          <Link
            href={item.path}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-xs font-bold transition-all duration-200",
              isSubItem && "pl-8",
              isActive
                ? "bg-blue-600/15 text-white border border-blue-500/20 shadow-[0_0_15px_rgba(37,99,235,0.05)]"
                : isSubItem ? "text-white/30 hover:text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <span className={cn(
              "text-base transition-transform duration-200 group-hover:scale-105",
              isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
            )}>
              {ICON_MAP[item.icon as string] || item.icon}
            </span>
            {item.label}
            {isActive && (
              <div className="ml-auto h-1 w-1 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            )}
          </Link>
        )}

        {hasSubItems && isExpanded && (
          <div className="space-y-0.5 mt-0.5 border-l border-white/[0.03] ml-5 pl-1.5 animate-in slide-in-from-top-1 duration-300">
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
      <div className="flex items-center gap-3 px-5 py-6 flex-shrink-0 border-b border-white/5">
        <div className="relative h-10 w-10 flex-shrink-0 rounded-xl overflow-hidden shadow-lg ring-1 ring-white/10">
          <Image 
            src="/apple-touch-icon.png" 
            alt="FreightFlow" 
            fill
            priority
            sizes="40px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-black tracking-tight text-white leading-tight">FreightFlow</h1>
          <span className="text-[8px] font-black tracking-[0.1em] text-blue-400 uppercase leading-tight opacity-70">Account, Manage, Move Ahead</span>
        </div>
      </div>

      {/* Navigation Area */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-6 flex flex-col scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{ gap: 'clamp(12px, 2.5vh, 24px)' }}
      >
        {NAV_ITEMS.map((group, groupIdx) => {
          const hasVisibleItems = group.items.some(item => hasPermission(user.role, item, user.permissions));
          if (!hasVisibleItems) return null;

          return (
            <div key={group.group} className="flex flex-col">
              <h2 className="mb-2.5 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
                {group.group}
              </h2>
              <div className="space-y-1">
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
            <p className="truncate text-xs font-bold text-white/90">{user.name}</p>
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
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
