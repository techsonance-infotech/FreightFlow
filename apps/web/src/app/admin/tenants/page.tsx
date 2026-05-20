import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  Building2, Search, Filter, 
  MoreHorizontal, Ban, CheckCircle2, 
  ExternalLink, User, History,
  Clock
} from 'lucide-react';
import { TenantActions } from '@/components/admin/tenant-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { format } from 'date-fns';

import { cn } from '@/lib/utils';

export default async function AdminTenantsPage({ searchParams }: { searchParams: Promise<{ page?: string, search?: string }> }) {
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const [tenants, total] = await Promise.all([
    prisma.tenant.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true, companies: true, vehicles: true }
        }
      }
    }),
    prisma.tenant.count()
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-12 animate-in fade-in duration-700 min-h-screen pb-20">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">Workspace Registry</h1>
          <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px]">Managing {total} Platform Nodes &bull; Page {page}/{totalPages}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search workspaces..." 
              className="pl-14 h-14 w-full lg:w-96 bg-white border-slate-100 text-slate-900 rounded-[1.5rem] font-bold shadow-sm focus:ring-0 focus:border-blue-500 transition-all placeholder:text-slate-300"
            />
          </div>
          <Button className="h-14 bg-white border border-slate-100 text-slate-600 hover:bg-slate-50 rounded-[1.5rem] px-8 font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-sm transition-all">
            <Filter className="h-4 w-4" />
            Advanced Filter
          </Button>
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm flex flex-col">
        <div className="max-h-[70vh] overflow-y-auto overflow-x-auto custom-scrollbar relative">
          <table className="w-full min-w-[1000px] lg:min-w-0 text-left border-collapse">
            <thead className="sticky top-0 bg-white z-30 shadow-sm">
              <tr className="border-b border-slate-50 bg-slate-50/30 backdrop-blur-md">
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Workspace / Owner</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Plan Status</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Usage Analytics</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Governance Expiry</th>
                <th className="px-10 py-8 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="hover:bg-slate-50/50 transition-all group cursor-pointer relative">
                  <td className="px-10 py-10 relative z-10">
                    <Link href={`/admin/tenants/${tenant.id}`} className="flex items-center gap-6">
                      <div className="h-16 w-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-black text-blue-600 text-xl shadow-inner group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                        {tenant.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg leading-tight tracking-tight group-hover:text-blue-600 transition-colors">{tenant.name}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-200" />
                          ID: {tenant.id.slice(0, 8).toUpperCase()} &bull; {format(new Date(tenant.createdAt), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 ml-1">{tenant.plan} Node</span>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          tenant.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                        )}>
                          {tenant.status}
                        </span>
                        <span className={cn(
                          "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                          tenant.kycStatus === 'verified' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                        )}>
                          KYC: {tenant.kycStatus}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>Vehicles</span>
                          <span>{tenant._count.vehicles} / 50</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${Math.min(100, (tenant._count.vehicles / 50) * 100)}%` }} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                          <span>User Nodes</span>
                          <span>{tenant._count.users} / 10</span>
                        </div>
                        <div className="h-1.5 w-32 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 transition-all duration-1000" style={{ width: `${Math.min(100, (tenant._count.users / 10) * 100)}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                        <Clock className="h-5 w-5 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-700 tracking-tight">
                          {tenant.licenseExpiresAt ? format(new Date(tenant.licenseExpiresAt), 'MMM dd, yyyy') : 'Infinite Access'}
                        </p>
                        {tenant.licenseExpiresAt && new Date(tenant.licenseExpiresAt) < new Date() && (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-[0.2em] mt-1 block">License Breach</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-right relative z-20">
                    <TenantActions tenantId={tenant.id} status={tenant.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* High-Authority Pagination Deck */}
        <div className="px-10 py-10 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
           <div className="flex items-center gap-6">
              <div className="h-10 w-10 bg-white border border-slate-200 rounded-xl flex items-center justify-center font-black text-sm text-slate-900 shadow-sm">
                 {page}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Sector Observation {skip + 1} - {Math.min(skip + limit, total)} of {total} Nodes
              </p>
           </div>
           
           <div className="flex items-center gap-4">
              <Link 
                href={`/admin/tenants?page=${Math.max(1, page - 1)}`}
                className={cn(
                  "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all",
                  page === 1 ? "bg-slate-100 text-slate-300 pointer-events-none" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white"
                )}
              >
                Previous Sector
              </Link>
              <div className="h-10 w-px bg-slate-200" />
              <Link 
                href={`/admin/tenants?page=${Math.min(totalPages, page + 1)}`}
                className={cn(
                  "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-slate-200",
                  page === totalPages ? "bg-slate-100 text-slate-300 pointer-events-none" : "bg-slate-900 text-white hover:bg-black"
                )}
              >
                Next Sector
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
