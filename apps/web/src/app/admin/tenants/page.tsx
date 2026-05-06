import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  Building2, Search, Filter, 
  MoreHorizontal, Ban, CheckCircle2, 
  ExternalLink, User, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default async function AdminTenantsPage() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true, companies: true }
      }
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">Workspace Registry</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Managing {tenants.length} Active Tenants</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <Input 
              placeholder="Search workspaces..." 
              className="pl-12 h-12 w-80 bg-slate-900 border-slate-800 text-white rounded-xl font-bold"
            />
          </div>
          <Button className="h-12 bg-slate-800 hover:bg-slate-700 rounded-xl px-6 font-bold flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Workspace / Owner</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Plan Status</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Usage</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Expiry</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900">
            {tenants.map((tenant) => (
              <tr key={tenant.id} className="hover:bg-slate-900/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-blue-500 text-lg">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg leading-tight tracking-tight">{tenant.name}</p>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-1">
                        ID: {tenant.id.slice(0, 8)}... &bull; Joined {new Date(tenant.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">{tenant.plan}</span>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest w-fit",
                      tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    )}>
                      {tenant.status}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <User className="h-3 w-3" /> {tenant._count.users} Users
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <Building2 className="h-3 w-3" /> {tenant._count.companies} Companies
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="text-sm font-bold text-slate-300">
                    {tenant.licenseExpiresAt ? new Date(tenant.licenseExpiresAt).toLocaleDateString() : 'Lifetime'}
                  </p>
                  {tenant.licenseExpiresAt && new Date(tenant.licenseExpiresAt) < new Date() && (
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Expired</span>
                  )}
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-800 rounded-xl">
                      <History className="h-4 w-4 text-slate-400" />
                    </Button>
                    <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-xl">
                      <Ban className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-slate-800 rounded-xl">
                      <MoreHorizontal className="h-4 w-4 text-slate-400" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
