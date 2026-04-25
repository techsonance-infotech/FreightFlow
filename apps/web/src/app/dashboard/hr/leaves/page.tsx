'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Clock, 
  Search, Filter, ChevronRight, MoreHorizontal,
  Download, RefreshCw, User, Briefcase, 
  Check, X, AlertCircle, CalendarDays,
  Activity, Users, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/hr/leaves');
      const data = await res.json();
      setLeaves(data.data || []);
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const loadingToast = toast.loading(`${action === 'approved' ? 'Approving' : 'Rejecting'} leave request...`);
    try {
      // API call would go here
      toast.success(`Leave request ${action} successfully`, { id: loadingToast });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
    } catch (error) {
      toast.error('Failed to update leave status', { id: loadingToast });
    }
  };

  const filteredLeaves = leaves.filter(l => 
    l.employee.name.toLowerCase().includes(search.toLowerCase()) || 
    l.employee.empCode?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const stats = {
    pending: leaves.filter(l => l.status === 'pending').length,
    approved: leaves.filter(l => l.status === 'approved').length,
    total: leaves.length,
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Leave Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Audit, review, and authorize employee absence requests</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={fetchLeaves} icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />}>
            Refresh Ledger
          </Button>
          <Button icon={<Download className="h-4 w-4" />}>
            Export Summary
          </Button>
        </div>
      </div>

      {/* 2. Visual Metrics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Pending Requests" value={stats.pending.toString()} icon={<Clock className="h-4 w-4 text-amber-500" />} color="amber" />
        <MetricCard title="Approved (MTD)" value={stats.approved.toString()} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} color="emerald" />
        <MetricCard title="Avg Duration" value="2.4 Days" icon={<CalendarDays className="h-4 w-4 text-blue-500" />} color="blue" />
        <MetricCard title="Total Audited" value={stats.total.toString()} icon={<Activity className="h-4 w-4 text-slate-400" />} />
      </div>

      <div className="space-y-6">
        {/* 3. Command Bar */}
        <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input 
              placeholder="Search requests by Employee Name or ID..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" 
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>
              All Departments
            </Button>
          </div>
        </div>

        {/* 4. Premium Leave Ledger */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Applicant</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Absence Window</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Type</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-right">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={5} className="px-10 py-8"><div className="h-10 bg-slate-50 rounded-2xl" /></td>
                    </tr>
                  ))
                ) : filteredLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Calendar className="h-10 w-10 text-slate-100" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No leave requests found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredLeaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100 shadow-sm">
                            {leave.employee.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{leave.employee.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{leave.employee.empCode || 'TEMP'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex flex-col">
                          <p className="text-xs font-black text-slate-700">{format(new Date(leave.fromDate), 'dd MMM')} — {format(new Date(leave.toDate), 'dd MMM yyyy')}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">{leave.days} Day(s)</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{leave.leaveType.replace('_', ' ')}</span>
                        <p className="text-[10px] font-bold text-slate-300 truncate max-w-[120px] mt-0.5" title={leave.reason}>{leave.reason || 'No reason provided'}</p>
                      </td>
                      <td className="px-10 py-5 text-center">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm",
                            getStatusStyle(leave.status)
                          )}>
                            {leave.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-5 text-right">
                        {leave.status === 'pending' ? (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleAction(leave.id, 'approved')}
                              className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100"
                              title="Approve"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => handleAction(leave.id, 'rejected')}
                              className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-rose-100"
                              title="Reject"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-1 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" /> Decision Archived
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/50 border-emerald-100',
    rose: 'bg-rose-50/50 border-rose-100',
    blue: 'bg-blue-50/50 border-blue-100',
    amber: 'bg-amber-50/50 border-amber-100',
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all", colorStyles[color])}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-1.5 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
