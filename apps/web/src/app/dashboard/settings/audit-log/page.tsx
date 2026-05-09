'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollText, Shield, UserCog, Users, Key, 
  ChevronLeft, ChevronRight, Search,
  Clock, Activity, Eye, RefreshCw,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

const ACTION_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  'user.created':             { label: 'User Created',         icon: <Users className="h-3.5 w-3.5" />,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'user.role_changed':        { label: 'Role Changed',         icon: <UserCog className="h-3.5 w-3.5" />, color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  'user.status_toggled':      { label: 'Status Changed',       icon: <Shield className="h-3.5 w-3.5" />,  color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-100' },
  'user.permissions_updated': { label: 'Permissions Modified',  icon: <Shield className="h-3.5 w-3.5" />,  color: 'text-purple-600',  bg: 'bg-purple-50',  border: 'border-purple-100' },
  'user.credentials_resent':  { label: 'Credentials Resent',   icon: <Key className="h-3.5 w-3.5" />,     color: 'text-cyan-600',    bg: 'bg-cyan-50',    border: 'border-cyan-100' },
  'employee.created':         { label: 'Employee Onboarded',   icon: <Users className="h-3.5 w-3.5" />,   color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
  'employee.updated':         { label: 'Employee Updated',     icon: <UserCog className="h-3.5 w-3.5" />, color: 'text-blue-600',    bg: 'bg-blue-50',    border: 'border-blue-100' },
  'company.updated':          { label: 'Company Updated',      icon: <Activity className="h-3.5 w-3.5" />,color: 'text-slate-600',   bg: 'bg-slate-50',   border: 'border-slate-100' },
};

const DEFAULT_ACTION = { label: 'System Action', icon: <Activity className="h-3.5 w-3.5" />, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100' };

interface AuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  changes: any;
  ipAddress: string | null;
  createdAt: string;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterAction, setFilterAction] = useState('');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterAction) params.set('action', filterAction);
      const res = await fetch(`/api/v1/audit-logs?${params}`);
      const json = await res.json();
      if (json.data) {
        setLogs(json.data);
        setTotalPages(json.pagination.totalPages);
        setTotal(json.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  }, [page, filterAction]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const getConfig = (action: string) => ACTION_CONFIG[action] || DEFAULT_ACTION;

  const filteredLogs = search
    ? logs.filter(log => {
        const s = search.toLowerCase();
        const target = log.changes?.targetUser?.name || log.changes?.name || '';
        const email = log.changes?.targetUser?.email || log.changes?.email || '';
        const performer = log.changes?.performedBy?.name || '';
        return target.toLowerCase().includes(s) || email.toLowerCase().includes(s) || performer.toLowerCase().includes(s) || log.action.toLowerCase().includes(s);
      })
    : logs;

  const getSummary = (log: AuditEntry) => {
    const target = log.changes?.targetUser;
    switch (log.action) {
      case 'user.role_changed':
        return <>{target?.name || 'User'} role → <span className="text-blue-600 font-black">{log.changes?.newRole}</span> <span className="text-slate-300 mx-0.5">from</span> <span className="text-slate-400 line-through">{log.changes?.previousRole}</span></>;
      case 'user.status_toggled':
        return <>{target?.name || 'User'} → <span className={log.changes?.newStatus === 'active' ? 'text-emerald-600 font-black' : 'text-rose-500 font-black'}>{log.changes?.newStatus}</span></>;
      case 'user.permissions_updated':
        return <>{target?.name || 'User'} — module access modified</>;
      case 'user.credentials_resent':
        return <>Credentials resent to <span className="text-blue-600">{target?.email}</span></>;
      case 'user.created':
        return <><span className="text-slate-900">{log.changes?.name}</span> ({log.changes?.email}) — {log.changes?.role}</>;
      default:
        return <>{log.entityType} record modified</>;
    }
  };

  return (
    <div className="p-8 lg:p-10 space-y-6 max-h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center shadow-lg">
            <ScrollText className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit Trail</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              {total} events recorded
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchLogs()}
          className="h-9 w-9 p-0 rounded-xl border-slate-200"
        >
          <RefreshCw className={cn("h-3.5 w-3.5 text-slate-400", loading && "animate-spin")} />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
          <Input
            placeholder="Search by user, email, or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 pl-10 rounded-xl bg-slate-50 border-none text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300 pointer-events-none" />
          <select
            value={filterAction}
            onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
            className="h-10 pl-10 pr-6 rounded-xl bg-slate-50 border-none font-bold text-xs text-slate-500 outline-none focus:ring-2 focus:ring-blue-100 appearance-none cursor-pointer"
          >
            <option value="">All Actions</option>
            <option value="user.created">User Created</option>
            <option value="user.role_changed">Role Changed</option>
            <option value="user.status_toggled">Status Changed</option>
            <option value="user.permissions_updated">Permissions</option>
            <option value="user.credentials_resent">Credentials Resent</option>
            <option value="employee">Employee Actions</option>
            <option value="company">Company Actions</option>
          </select>
        </div>
      </div>

      {/* Scrollable Event List */}
      <div className="flex-1 overflow-y-auto min-h-0 rounded-2xl border border-slate-100 bg-white">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-50 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-2.5 w-36 bg-slate-200 rounded-full" />
                    <div className="h-2 w-52 bg-slate-200 rounded-full" />
                  </div>
                  <div className="h-2 w-16 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center">
            <ScrollText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-400">No audit events found</p>
            <p className="text-xs text-slate-300 mt-1">Administrative actions will appear here automatically.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {filteredLogs.map((log) => {
              const config = getConfig(log.action);
              const isExpanded = expandedId === log.id;
              const performer = log.changes?.performedBy;

              return (
                <div 
                  key={log.id}
                  className={cn(
                    "transition-all cursor-pointer",
                    isExpanded ? "bg-slate-50/50" : "hover:bg-slate-50/30"
                  )}
                  onClick={() => setExpandedId(isExpanded ? null : log.id)}
                >
                  {/* Compact row */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    <div className={cn("p-1.5 rounded-lg border shrink-0", config.bg, config.border)}>
                      <span className={config.color}>{config.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("text-[10px] font-black uppercase tracking-wider", config.color)}>{config.label}</span>
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{log.entityType}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-600 mt-0.5 truncate">{getSummary(log)}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-wider whitespace-nowrap hidden sm:block">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                      <Eye className={cn("h-3 w-3 transition-all", isExpanded ? "text-blue-400" : "text-slate-200")} />
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-1 duration-200">
                      <div className="p-4 rounded-xl bg-white border border-slate-100 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Performed By</p>
                            <p className="text-xs font-black text-slate-800">{performer?.name || 'System'}</p>
                            <p className="text-[10px] font-bold text-slate-400">{performer?.email || '—'}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Timestamp</p>
                            <p className="text-xs font-black text-slate-800">{format(new Date(log.createdAt), 'dd MMM yyyy')}</p>
                            <p className="text-[10px] font-bold text-slate-400">{format(new Date(log.createdAt), 'hh:mm:ss a')}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">IP Address</p>
                            <p className="text-xs font-black text-slate-800 font-mono">{log.ipAddress || 'N/A'}</p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-900 rounded-lg max-h-48 overflow-y-auto">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Change Payload</p>
                          <pre className="text-[10px] font-mono text-emerald-400 whitespace-pre-wrap break-words leading-relaxed">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fixed Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 shrink-0">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="h-9 px-3 rounded-xl font-bold text-xs"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Prev
            </Button>
            {/* Page buttons */}
            <div className="hidden sm:flex gap-1">
              {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                const pageNum = page <= 3 ? i + 1 : page - 2 + i;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(pageNum)}
                    className={cn("h-9 w-9 p-0 rounded-xl text-xs font-black", pageNum === page && "bg-slate-900")}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="h-9 px-3 rounded-xl font-bold text-xs"
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
