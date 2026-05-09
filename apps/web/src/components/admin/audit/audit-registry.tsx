'use client';

import React, { useState, useEffect } from 'react';
import { getPlatformLogs, getTenantLogs } from '@/app/actions/admin/audit';
import { toast } from 'sonner';
import { DeltaViewer } from './delta-viewer';
import { 
  Shield, Globe, User, Clock, 
  Search, Filter, ChevronRight, 
  ArrowRight, Database, Zap,
  Download, FileJson, Loader2,
  AlertCircle, History, X,
  ShieldAlert, Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export function AuditRegistry() {
  const [activeTab, setActiveTab] = useState<'platform' | 'tenant'>('platform');
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    action: '',
    tenantId: '',
    adminId: ''
  });
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showInspector, setShowInspector] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = activeTab === 'platform' 
        ? await getPlatformLogs(page, 50, filters)
        : await getTenantLogs(page, 50, filters);
      
      setLogs(res.logs);
      setTotalPages(res.pages);
    } catch (error) {
      toast.error('Failed to sync observation deck');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [activeTab, page]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100">
          <button 
            onClick={() => { setActiveTab('platform'); setPage(1); }}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'platform' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Platform Governance
          </button>
          <button 
            onClick={() => { setActiveTab('tenant'); setPage(1); }}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
              activeTab === 'tenant' ? "bg-white text-blue-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
            )}
          >
            Tenant Operations
          </button>
        </div>

        <div className="flex items-center gap-4 flex-1 lg:max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              value={filters.action}
              onChange={(e) => setFilters({...filters, action: e.target.value})}
              placeholder="Search action matrix..."
              className="pl-14 h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
            />
          </div>
          <Button 
            onClick={() => fetchLogs()}
            className="h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-200"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Registry Grid */}
      <div className="bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-50">
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Timestamp</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Actor</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Action Matrix</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Target Hub</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Observatory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing activity stream...</p>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <AlertCircle className="h-10 w-10 text-slate-200 mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No activity detected in current sector</p>
                  </td>
                </tr>
              ) : logs.map((log) => (
                <tr 
                  key={log.id} 
                  onClick={() => { setSelectedLog(log); setShowInspector(true); }}
                  className="group hover:bg-slate-50/50 transition-all duration-300 cursor-pointer"
                >
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-6">
                      <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-900 tracking-tighter">{new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">{new Date(log.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-black text-[10px] border border-blue-100 shadow-inner">
                        {log.admin?.email?.[0].toUpperCase() || log.user?.name?.[0] || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{log.admin?.email || log.user?.name || 'System'}</p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{log.admin ? 'Super Admin' : (log.user?.role || 'User')}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex flex-col items-start">
                      <span className={cn(
                        "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm",
                        log.action.includes('IMPERSONATE') ? "bg-amber-50 text-amber-600 border-amber-100" : 
                        log.action.includes('CREATE') ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        "bg-slate-900 text-white border-slate-900"
                      )}>
                        {log.action}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-10">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-slate-700 tracking-tighter">
                        {log.targetTenantId || log.tenant?.name || 'GLOBAL'}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-10 text-right">
                    <button className="h-12 w-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 hover:text-blue-600 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50 transition-all active:scale-[0.95]">
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-10 py-8 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Page {page} of {totalPages} &bull; 50 Records Per Orbit
          </p>
          <div className="flex items-center gap-4">
            <Button 
              disabled={page === 1 || loading}
              onClick={() => setPage(page - 1)}
              variant="outline" 
              className="h-12 px-6 border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Previous Sector
            </Button>
            <Button 
              disabled={page === totalPages || loading}
              onClick={() => setPage(page + 1)}
              className="h-12 px-6 bg-slate-900 hover:bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
            >
              Next Sector
            </Button>
          </div>
        </div>
      </div>

      {showInspector && selectedLog && (
        <LogInspectorModal 
          log={selectedLog} 
          onClose={() => setShowInspector(false)} 
        />
      )}
    </div>
  );
}

function LogInspectorModal({ log, onClose }: { log: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-8 animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white border border-slate-100 rounded-[3.5rem] p-16 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] relative overflow-hidden text-left">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-blue-600" />
        
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-300 hover:text-slate-900 transition-colors">
          <X className="h-8 w-8" />
        </button>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12 mb-16 border-b border-slate-50 pb-16">
          <div className="flex items-center gap-8">
            <div className="h-20 w-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 rotate-6">
              <ShieldAlert className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 text-left">Protocol Analysis</p>
              <h3 className="text-4xl font-black text-slate-900 tracking-tighter text-left">{log.action}</h3>
            </div>
          </div>
          
          <div className="flex flex-col lg:items-end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-2 text-left lg:text-right">System Timestamp</p>
            <p className="text-xl font-black text-slate-900 tracking-tight text-left lg:text-right">{new Date(log.createdAt).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 mb-16">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <User className="h-3 w-3" />
              Primary Actor
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-black text-slate-900 truncate">{log.admin?.email || log.user?.email || 'System Authority'}</p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Status: VERIFIED</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Globe className="h-3 w-3" />
              Target Hub
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-black text-slate-900 truncate">{log.targetTenantId || log.tenant?.name || 'GLOBAL SYSTEM'}</p>
              <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest mt-1">Cross-Tenant Action</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Zap className="h-3 w-3" />
              Impact Level
            </p>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-sm font-black text-slate-900">MISSION CRITICAL</p>
              <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mt-1">Requires Observation</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Differential Payload (Delta)</p>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Live Metadata Decrypted</span>
            </div>
          </div>
          
          <div className="max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
            <DeltaViewer payload={log.payload || log.changes} />
          </div>
        </div>

        <div className="mt-16 pt-10 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                <Database className="h-4 w-4" />
             </div>
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Entity ID: {log.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all active:scale-[0.95]"
          >
            Close Observation
          </button>
        </div>
      </div>
    </div>
  );
}
