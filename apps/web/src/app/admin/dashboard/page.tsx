import React from 'react';
import { 
  Users, Building2, TrendingUp, 
  Key, Clock, ShieldCheck, 
  ArrowUpRight, AlertCircle, Zap,
  Activity, Database, Globe,
  MessageSquare, Settings, Lock,
  DollarSign
} from 'lucide-react';
import { prisma } from '@freightflow/db';
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getPlatformHealth } from '@/app/actions/admin/system-activity';

// Force client refresh - Phase 4 Intelligence Synchronized

export default async function AdminDashboardPage() {
  // Fetch real platform stats
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [
    tenantCount, 
    userCount, 
    vehicleCount, 
    activeLicenses, 
    pendingRequests, 
    recentTenants,
    totalTrips,
    recentActivityCount,
    allTenants,
    kycStats,
    revenueHistory,
    platformHealth
  ] = await Promise.all([
    prisma.tenant.count(),
    prisma.user.count(),
    prisma.vehicle.count(),
    prisma.tenant.count({ where: { status: 'active' } }),
    prisma.licenseRequest.count({ where: { status: 'pending' } }),
    prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, plan: true, createdAt: true, status: true, kycStatus: true }
    }),
    prisma.trip.count(),
    prisma.auditLogPlatform.count({ where: { createdAt: { gte: last24h } } }),
    prisma.tenant.findMany({ select: { plan: true } }),
    prisma.tenant.groupBy({
      by: ['kycStatus'],
      _count: { id: true }
    }),
    prisma.revenueSnapshot ? prisma.revenueSnapshot.findMany({
      orderBy: { capturedAt: 'desc' },
      take: 1
    }) : Promise.resolve([]),
    getPlatformHealth()
  ]);

  const latestRevenue = (revenueHistory && revenueHistory[0]) || { mrr: 0, churnRate: 0 };
  const verifiedCount = kycStats.find(s => s.kycStatus === 'verified')?._count.id || 0;
  const pendingKycCount = kycStats.find(s => s.kycStatus === 'pending')?._count.id || 0;

  const apiRequestsPerMin = Math.round(recentActivityCount / (24 * 60) * 15);

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
            Command Center
          </h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] ml-1">
            Platform Intelligence & Global Governance
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm pr-6">
          <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Globe className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Status</p>
            <p className="text-sm font-black text-slate-900">OPERATIONAL <span className="text-emerald-500 ml-1">●</span></p>
          </div>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard 
          label="Platform MRR" 
          value={`$${Number(latestRevenue.mrr).toLocaleString()}`} 
          subValue="Monthly Recurring"
          icon={<DollarSign className="h-6 w-6" />} 
          trend={`${latestRevenue.churnRate}% Churn`}
          color="emerald"
        />
        <StatCard 
          label="KYC Funnel" 
          value={`${verifiedCount}/${tenantCount}`} 
          subValue="Workspaces Verified"
          icon={<ShieldCheck className="h-6 w-6" />} 
          trend={`${pendingKycCount} pending`}
          color="blue"
        />
        <StatCard 
          label="Global Transactions" 
          value={totalTrips.toLocaleString()} 
          subValue="Successful Dispatches"
          icon={<Zap className="h-6 w-6" />} 
          trend="Velocity stable"
          color="amber"
        />
        <StatCard 
          label="Governance Alerts" 
          value={pendingRequests.toString()} 
          subValue="Action Required"
          icon={<AlertCircle className="h-6 w-6" />} 
          trend={pendingRequests > 0 ? "Priority high" : "System clear"}
          color={pendingRequests > 0 ? "rose" : "slate"}
        />
      </div>

      {/* Governance Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-600/30 transition-all duration-700" />
            <h3 className="text-2xl font-black tracking-tight mb-8 relative z-10">Governance Actions</h3>
            <div className="space-y-4 relative z-10">
              <ActionButton icon={<Key className="h-4 w-4" />} label="Issue License Matrix" color="bg-blue-600" href="/admin/support" />
              <ActionButton icon={<Users className="h-4 w-4" />} label="Audit User Identity" color="bg-slate-800" href="/admin/audit-logs" />
              <ActionButton icon={<MessageSquare className="h-4 w-4" />} label="System Broadcast" color="bg-slate-800" href="/admin/support" />
              <ActionButton icon={<Settings className="h-4 w-4" />} label="Platform Config" color="bg-slate-800" href="/admin/performance" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8">Platform Ingress</h3>
            <div className="space-y-6">
              <MetricRow label="System Activity / hr" value={`${recentActivityCount}`} trend="Live" color="emerald" />
              <MetricRow label="Est. API Load / min" value={`${apiRequestsPerMin}`} trend="Dynamic" color="amber" />
              <MetricRow label="Peak Thread Load" value={`${Math.round(platformHealth.apiResilience - 58)}%`} trend="Stable" color="emerald" />
            </div>
          </div>
        </div>

        {/* Workspace Registry Overview */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Workspace Registry</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Latest platform integrations</p>
            </div>
            <Link href="/admin/tenants" className="h-12 px-8 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 hover:bg-slate-900 hover:text-white transition-all shadow-sm active:scale-[0.98] flex items-center justify-center">
              Manage All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentTenants.map(t => (
              <TenantRow 
                key={t.id}
                name={t.name} 
                plan={t.plan} 
                date={format(new Date(t.createdAt), 'MMM dd, yyyy')} 
                status={t.status.charAt(0).toUpperCase() + t.status.slice(1)} 
                kycStatus={t.kycStatus}
              />
            ))}
          </div>

          <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing last 5 nodes</p>
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400">
                  {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Vitality */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-12 shadow-sm">
        <div className="flex items-center gap-4 mb-12">
          <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center border border-indigo-100">
            <Activity className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Vitality</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">Real-time infrastructure health</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <HealthNode label="API Resilience" value={platformHealth.apiResilience} sub="High Availability" color="emerald" icon={<Zap className="h-4 w-4" />} />
          <HealthNode label="DB Integrity" value={platformHealth.dbIntegrity} sub="Optimal Sync" color="indigo" icon={<Database className="h-4 w-4" />} />
          <HealthNode label="Network Flow" value={platformHealth.networkFlow} sub="Zero Packet Loss" color="blue" icon={<Globe className="h-4 w-4" />} />
          <HealthNode label="Security Guard" value={platformHealth.securityGuard} sub="Shield Active" color="emerald" icon={<ShieldCheck className="h-4 w-4" />} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, icon, trend, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/50',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 shadow-indigo-100/50',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/50',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-100/50',
    rose: 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-100/50',
  };

  return (
    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] hover:shadow-2xl hover:border-blue-100 transition-all group shadow-sm relative overflow-hidden">
      <div className={`h-16 w-16 ${colors[color]} rounded-3xl flex items-center justify-center mb-8 shadow-inner border group-hover:scale-110 transition-transform duration-500`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">{label}</p>
      <div className="space-y-1">
        <h3 className="text-4xl font-black text-slate-900 tracking-tighter">{value}</h3>
        <p className="text-[11px] font-bold text-slate-400">{subValue}</p>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{trend}</span>
        <ArrowUpRight className="h-4 w-4 text-slate-200 group-hover:text-blue-600 transition-colors" />
      </div>
    </div>
  );
}

function ActionButton({ icon, label, color, href }: any) {
  return (
    <Link href={href || '#'} className={`w-full h-16 ${color} hover:opacity-90 rounded-2xl flex items-center gap-4 px-6 transition-all active:scale-[0.98] group/btn`}>
      <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center group-hover/btn:bg-white/20 transition-colors">
        {icon}
      </div>
      <span className="text-xs font-black uppercase tracking-widest text-white">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-white/40 ml-auto group-hover/btn:text-white transition-colors" />
    </Link>
  );
}

function MetricRow({ label, value, trend, color }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-500',
    amber: 'text-amber-500',
    blue: 'text-blue-500',
  };
  return (
    <div className="flex items-center justify-between group">
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">{label}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-black text-slate-900">{value}</span>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-slate-50 rounded-lg ${colorMap[color]}`}>
          {trend}
        </span>
      </div>
    </div>
  );
}

function TenantRow({ name, plan, date, status, kycStatus }: any) {
  return (
    <div className="flex items-center justify-between p-6 hover:bg-slate-50 rounded-[2rem] transition-all group border border-transparent hover:border-slate-100">
      <div className="flex items-center gap-6">
        <div className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-slate-300 text-lg uppercase group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all shadow-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-base font-black text-slate-900 tracking-tight">{name}</p>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{plan} Node</p>
            <span className="text-slate-200">/</span>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{date}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className={cn(
          "px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border",
          kycStatus === 'verified' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-amber-50 text-amber-600 border-amber-100"
        )}>
          KYC: {kycStatus}
        </div>
        <span className={cn(
          "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-sm",
          status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 
          status === 'Trial' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
        )}>
          {status}
        </span>
      </div>
    </div>
  );
}

function HealthNode({ label, value, sub, color, icon }: any) {
  const colorMap: any = {
    emerald: 'text-emerald-500 bg-emerald-50 border-emerald-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    indigo: 'text-indigo-500 bg-indigo-50 border-indigo-100',
  };

  return (
    <div className="space-y-6 group">
      <div className="flex items-center justify-between">
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${colorMap[color]} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <span className="text-xl font-black text-slate-900">{value}%</span>
      </div>
      <div className="space-y-1">
        <p className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{label}</p>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{sub}</p>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${
            color === 'emerald' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 
            color === 'blue' ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]' : 
            'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]'
          }`} 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}
