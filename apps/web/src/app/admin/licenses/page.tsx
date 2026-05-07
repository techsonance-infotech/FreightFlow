import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  Key, ShieldCheck, Clock, 
  TrendingUp, Search, Filter,
  CheckCircle2, XCircle, MessageSquare,
  Building2, Users, Truck, Zap
} from 'lucide-react';
import { format } from 'date-fns';
import Link from 'next/link';
import { LicenseApproveButton } from '@/components/admin/license-approve-button';

export default async function LicenseHubPage() {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [
    pendingRequests,
    totalApproved,
    expiringSoon,
    tierDistribution,
    recentRequests
  ] = await Promise.all([
    prisma.licenseRequest.count({ where: { status: 'pending' } }),
    prisma.licenseRequest.count({ where: { status: 'approved' } }),
    prisma.tenant.count({ 
      where: { 
        licenseExpiresAt: { 
          lte: thirtyDaysFromNow,
          gte: now
        } 
      } 
    }),
    prisma.tenant.groupBy({
      by: ['plan'],
      _count: true
    }),
    prisma.licenseRequest.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        tenant: true,
        user: true
      }
    })
  ]);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">License Hub</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Governance Matrix & SaaS Fulfillment</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin/licenses/tiers">
            <button className="h-14 px-8 bg-white border border-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-sm hover:bg-slate-50 transition-all">
              <ShieldCheck className="h-4 w-4" />
              Manage Tier Matrix
            </button>
          </Link>
        </div>
      </div>

      {/* KPI Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard label="Pending Requests" value={pendingRequests.toString()} sub="Action Required" color="amber" icon={<Zap className="h-5 w-5" />} />
        <StatCard label="Active Licenses" value={totalApproved.toString()} sub="Platform Wide" color="emerald" icon={<CheckCircle2 className="h-5 w-5" />} />
        <StatCard label="Governance Breach" value={expiringSoon.toString()} sub="Expiring < 30d" color="rose" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Total Inventory" value={(pendingRequests + totalApproved).toString()} sub="Lifecycle Volume" color="blue" icon={<Key className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Request Queue */}
        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Fulfillment Queue</h3>
              <div className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Stream</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50">
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Requested Plan</th>
                    <th className="py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentRequests.map((req) => (
                    <tr key={req.id} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center font-black text-blue-600 text-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all">
                            {req.tenant.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{req.tenant.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{req.user.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6">
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                          {req.planType}
                        </span>
                      </td>
                      <td className="py-6">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/support/${req.id}`}>
                            <button className="h-10 w-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </Link>
                          {req.status === 'pending' && (
                            <LicenseApproveButton requestId={req.id} />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Plan Distribution & Tiers */}
        <div className="lg:col-span-1 space-y-10">
          <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-10">SaaS Distribution</h3>
            <div className="space-y-8">
              {tierDistribution.map((tier) => (
                <TierDistributionItem 
                  key={tier.plan} 
                  label={tier.plan} 
                  count={tier._count} 
                  percentage={Math.round((tier._count / totalApproved) * 100) || 0} 
                />
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl -mr-16 -mt-16" />
            <h3 className="text-xl font-black tracking-tight mb-6">Tier DNA</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed mb-8">
              Configure global constraints for hierarchical businesses and fleets.
            </p>
            <Link href="/admin/licenses/tiers">
              <button className="w-full h-14 bg-white/10 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 transition-all">
                Access Tier Matrix
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color, icon }: any) {
  const colors: any = {
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
  };
  return (
    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm group hover:shadow-xl transition-all">
      <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-8 border shadow-inner transition-transform group-hover:scale-110 ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
      <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-1">{value}</h3>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{sub}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-rose-50 text-rose-600 border-rose-100',
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
}

function TierDistributionItem({ label, count, percentage }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</span>
        <span className="text-[10px] font-black text-slate-400">{count} Nodes</span>
      </div>
      <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
