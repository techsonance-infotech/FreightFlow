import React from 'react';
import { 
  Users, Building2, TrendingUp, 
  Key, Clock, ShieldCheck, 
  ArrowUpRight, AlertCircle
} from 'lucide-react';
import { prisma } from '@freightflow/db';

export default async function AdminDashboardPage() {
  // Fetch real platform stats
  const [tenantCount, userCount, activeLicenses, pendingRequests] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.tenant.count({ where: { status: 'active' } }),
    prisma.licenseRequest.count({ where: { status: 'pending' } })
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">Command Center</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Platform Intelligence & Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Tenants" 
          value={tenantCount.toString()} 
          icon={<Building2 className="h-6 w-6" />} 
          trend="+12% vs last month"
          color="blue"
        />
        <StatCard 
          label="Total Fleet Size" 
          value={userCount.toString()} 
          icon={<Users className="h-6 w-6" />} 
          trend="+8% vs last month"
          color="indigo"
        />
        <StatCard 
          label="Active Licenses" 
          value={activeLicenses.toString()} 
          icon={<ShieldCheck className="h-6 w-6" />} 
          trend="94% retention"
          color="emerald"
        />
        <StatCard 
          label="Pending Requests" 
          value={pendingRequests.toString()} 
          icon={<AlertCircle className="h-6 w-6" />} 
          trend={pendingRequests > 0 ? "Attention required" : "All cleared"}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Recent Tenants */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-black text-white">Recent Workspaces</h3>
            <button className="text-[10px] font-black uppercase tracking-widest text-blue-500 hover:text-blue-400">View All</button>
          </div>
          <div className="space-y-4">
            <TenantRow name="TechSonance Logistics" plan="Enterprise" date="2 hours ago" status="Active" />
            <TenantRow name="Global Freight Co." plan="Starter" date="5 hours ago" status="Trial" />
            <TenantRow name="Speedy Couriers" plan="Pro" date="Yesterday" status="Active" />
            <TenantRow name="Indo-Express Ltd" plan="Pro" date="2 days ago" status="Expired" />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-900/50 border border-slate-900 rounded-[2.5rem] p-8">
          <h3 className="text-xl font-black text-white mb-8">System Performance</h3>
          <div className="space-y-6">
            <HealthBar label="API Response Time" value={98} color="blue" sub="42ms avg" />
            <HealthBar label="Database Load" value={34} color="indigo" sub="Healthy" />
            <HealthBar label="Storage Capacity" value={12} color="emerald" sub="4.2 TB free" />
            <HealthBar label="License Check Sync" value={100} color="emerald" sub="Live" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 shadow-blue-500/20 text-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-500/20 text-indigo-100',
    emerald: 'bg-emerald-600 shadow-emerald-500/20 text-emerald-100',
    amber: 'bg-amber-600 shadow-amber-500/20 text-amber-100',
  };

  return (
    <div className="bg-slate-900/30 border border-slate-900 p-8 rounded-[2rem] hover:border-slate-800 transition-all group">
      <div className={`h-12 w-12 ${colors[color]} rounded-xl flex items-center justify-center mb-6 shadow-xl`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-3">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <span className="text-[10px] font-bold text-slate-600">{trend}</span>
      </div>
    </div>
  );
}

function TenantRow({ name, plan, date, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-2xl transition-colors">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-slate-800 rounded-xl flex items-center justify-center font-black text-slate-400 text-xs uppercase">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-bold text-white">{name}</p>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{plan} Plan &bull; {date}</p>
        </div>
      </div>
      <span className={cn(
        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
        status === 'Active' ? 'bg-emerald-500/10 text-emerald-500' : 
        status === 'Trial' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
      )}>
        {status}
      </span>
    </div>
  );
}

function HealthBar({ label, value, color, sub }: any) {
  const colors: any = {
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-600">{sub}</span>
      </div>
      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} rounded-full transition-all duration-1000`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
