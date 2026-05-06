import React from 'react';
import { getAdminSession } from '@/app/actions/admin/auth';
import { redirect } from 'next/navigation';
import { 
  Shield, LayoutDashboard, Building2, 
  Key, MessageSquare, History, 
  Settings, LogOut, Globe, 
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();

  // If not logged in and not on login page, redirect
  // Note: we can't easily check path here in server component, so we rely on the page itself or middleware
  // For now, let's assume this layout is only for protected admin pages

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      {/* Admin Sidebar */}
      <aside className="w-72 border-r border-slate-900 flex flex-col fixed inset-y-0 z-50 bg-slate-950/50 backdrop-blur-xl">
        <div className="p-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-black text-white tracking-tight">FreightFlow</h2>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-500">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <AdminNavLink href="/admin/tenants" icon={<Building2 className="h-4 w-4" />} label="Tenants" />
          <AdminNavLink href="/admin/licenses" icon={<Key className="h-4 w-4" />} label="License Keys" />
          <AdminNavLink href="/admin/support" icon={<MessageSquare className="h-4 w-4" />} label="Support Tickets" />
          <AdminNavLink href="/admin/audit-logs" icon={<History className="h-4 w-4" />} label="Audit Logs" />
          <AdminNavLink href="/admin/performance" icon={<Activity className="h-4 w-4" />} label="Performance" />
        </nav>

        <div className="p-4 border-t border-slate-900">
          <div className="p-4 bg-slate-900/50 rounded-2xl flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-blue-500">
              {session?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{session?.email || 'Admin User'}</p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Platform Lead</p>
            </div>
          </div>
          <Link href="/admin/login" className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors font-bold text-sm">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      <main className="ml-72 flex-1 p-10">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-900 hover:text-white transition-all font-bold text-sm group"
    >
      <span className="group-hover:scale-110 transition-transform">{icon}</span>
      {label}
    </Link>
  );
}
