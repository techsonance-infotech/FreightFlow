import React from 'react';
import { getAdminSession } from '@/app/actions/admin/auth';
import { redirect } from 'next/navigation';
import { 
  Shield, LayoutDashboard, Building2, 
  Key, MessageSquare, History, 
  Settings, LogOut, Globe, 
  Activity, Truck, Users, Zap
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { AdminLogoutButton } from '@/components/admin/logout-button';
import { headers } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  const headerList = await headers();
  const pathname = headerList.get('x-pathname') || '';
  const isLoginPage = pathname === '/admin/login';

  // Strict session guard — Middleware handles most of this, but layout serves as a secondary barrier
  if (!session && !isLoginPage) {
    redirect('/admin/login');
  }

  // If it's the login page, render without the admin shell
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Admin Sidebar */}
      <aside className="w-80 border-r border-slate-200 flex flex-col fixed inset-y-0 z-50 bg-white">
        <div className="p-10 flex items-center gap-4">
          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 overflow-hidden">
            <Image 
              src="/logo.png" 
              alt="FreightFlow" 
              width={48} 
              height={48} 
              className="object-contain p-1"
            />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tighter">FreightFlow</h2>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Super Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-6 py-4 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 ml-5 mb-4">Command & Governance</p>
            <AdminNavLink href="/admin/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Command Center" />
            <AdminNavLink href="/admin/tenants" icon={<Building2 className="h-4 w-4" />} label="Workspaces" />
            <AdminNavLink href="/admin/licenses" icon={<Key className="h-4 w-4" />} label="License Hub" />
          </div>

          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 ml-5 mb-4">Operations & Health</p>
            <AdminNavLink href="/admin/fleet" icon={<Truck className="h-4 w-4" />} label="Fleet Pulse" />
            <AdminNavLink href="/admin/performance" icon={<Activity className="h-4 w-4" />} label="System Vitality" />
            <AdminNavLink href="/admin/compliance" icon={<Shield className="h-4 w-4" />} label="Compliance" />
          </div>

          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 ml-5 mb-4">Sovereignty & Audit</p>
            <AdminNavLink href="/admin/workforce" icon={<Users className="h-4 w-4" />} label="Workforce" />
            <AdminNavLink href="/admin/features" icon={<Zap className="h-4 w-4" />} label="Feature Engine" />
            <AdminNavLink href="/admin/support" icon={<MessageSquare className="h-4 w-4" />} label="Assistance Deck" />
            <AdminNavLink href="/admin/audit-logs" icon={<History className="h-4 w-4" />} label="Audit Trail" />
          </div>

          <div className="space-y-2">
            <p className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 ml-5 mb-4">System Settings</p>
            <AdminNavLink href="/admin/settings" icon={<Settings className="h-4 w-4" />} label="Platform Config" />
          </div>
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="p-5 bg-slate-50 rounded-[1.5rem] flex items-center gap-4 mb-4 border border-slate-100">
            <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center font-black text-blue-600 border border-slate-100">
              {session?.email?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-900 truncate">{session?.email || 'Admin User'}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Platform Lead</p>
            </div>
          </div>
          <AdminLogoutButton />
        </div>
      </aside>

      <main className="ml-80 flex-1 p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function AdminNavLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-all font-black text-[10px] uppercase tracking-[0.2em] group"
    >
      <span className="group-hover:scale-110 transition-transform group-hover:rotate-3">{icon}</span>
      {label}
    </Link>
  );
}
