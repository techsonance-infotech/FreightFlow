import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  History, Shield, Activity, 
  Search, Filter, ArrowRight,
  Database, UserCheck
} from 'lucide-react';

export default async function AdminAuditLogsPage() {
  const logs = await prisma.auditLogPlatform.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      admin: { select: { email: true } }
    },
    take: 50
  });

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">Platform Audit Trail</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Governance & Compliance Monitoring</p>
      </div>

      <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 bg-blue-600/10 rounded-2xl flex items-center justify-center">
              <History className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-black text-white tracking-tight">Governance Logs</h3>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Last 50 administrative actions</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Timestamp</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Administrator</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Target Tenant</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-blue-500 text-[10px]">
                        {log.admin?.email?.charAt(0).toUpperCase() || 'S'}
                      </div>
                      <span className="text-sm font-bold text-white">{log.admin?.email || 'System'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      getActionColor(log.action)
                    )}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-sm font-bold text-slate-400">
                    {log.targetTenantId ? log.targetTenantId.slice(0, 8) : 'Global'}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-[10px] font-bold text-slate-500 font-mono truncate max-w-xs">
                      {JSON.stringify(log.payload)}
                    </p>
                  </td>
                </tr>
              ))}
              
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <Database className="h-10 w-10 text-slate-800" />
                      <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">No audit logs found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getActionColor(action: string) {
  if (action.includes('license')) return 'bg-blue-500/10 text-blue-500';
  if (action.includes('suspend') || action.includes('block')) return 'bg-red-500/10 text-red-500';
  if (action.includes('create')) return 'bg-emerald-500/10 text-emerald-500';
  return 'bg-slate-500/10 text-slate-500';
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
