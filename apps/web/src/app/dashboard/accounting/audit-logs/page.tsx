'use client';

import React, { useState, useEffect } from 'react';
import { 
  History, Search, Filter, User, 
  Calendar, ArrowRight, Eye, ShieldCheck,
  AlertCircle, FileEdit, Trash2, PlusCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/accounting/audit-logs');
      const json = await res.json();
      if (json.data) setLogs(json.data);
    } catch (err) {
      console.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'update': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'delete': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-neutral-50 text-neutral-600 border-neutral-100';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create': return <PlusCircle className="h-3.5 w-3.5" />;
      case 'update': return <FileEdit className="h-3.5 w-3.5" />;
      case 'delete': return <Trash2 className="h-3.5 w-3.5" />;
      default: return <History className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-6 w-6 rounded-lg bg-slate-900 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Security & Compliance</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Immutable Audit Trail</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Detailed history of every accounting transaction and master record change.</p>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by user, action or entity..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Timestamp</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Auditor</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Action</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Entity</th>
                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Changes</th>
                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decrypting Logs...</p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400">No audit logs found for this period.</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-900">{format(new Date(log.createdAt), 'dd MMM yyyy')}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{format(new Date(log.createdAt), 'HH:mm:ss')}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <User className="h-4 w-4 text-slate-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{log.user?.name || 'System'}</p>
                        <p className="text-[10px] font-bold text-slate-400">{log.ipAddress || 'Internal'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <Badge className={cn("px-2.5 py-1 rounded-lg border font-black text-[9px] uppercase tracking-widest gap-1.5", getActionColor(log.action))}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </Badge>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-900">{log.entityType}</p>
                    <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">{log.entityId}</p>
                  </td>
                  <td className="px-8 py-6 max-w-md">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-600 line-clamp-2 overflow-hidden">
                      {JSON.stringify(log.changes)}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-slate-100">
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
