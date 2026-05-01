'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, XCircle, Clock, 
  Search, Filter, ChevronRight, MoreHorizontal,
  Download, RefreshCw, User, Briefcase, 
  Check, X, AlertCircle, CalendarDays,
  Activity, Users, ShieldCheck, Plus,
  LayoutGrid, ListFilter, History, Wallet,
  ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { LeaveRequestModal } from '@/components/hr/leave-request-modal';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [stats, setStats] = useState({ balance: 0, pending: 0, approved: 0, total: 0 });
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'my' | 'team'>('my');
  const [userRole, setUserRole] = useState<string>('staff');
  
  // Filtering & Pagination State
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    page: 1,
    limit: 10
  });
  const [meta, setMeta] = useState({
    total: 0,
    totalPages: 1
  });

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        status: filters.status,
        type: filters.type,
        search: search
      });

      const res = await fetch(`/api/v1/hr/leaves?${query.toString()}`);
      const data = await res.json();
      setLeaves(data.data || []);
      const metaData = data.meta || { total: 0, totalPages: 1, pendingCount: 0, approvedMTD: 0, totalVolume: 0 };
      setMeta(metaData);
      
      setStats(prev => ({
        ...prev,
        pending: metaData.pendingCount,
        approved: metaData.approvedMTD,
        total: metaData.totalVolume
      }));
    } catch (error) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocations = async (empId: string) => {
    try {
      const res = await fetch(`/api/v1/hr/leaves/allocations?employeeId=${empId}`);
      const data = await res.json();
      setAllocations(data.data || []);
      
      // Calculate total balance
      const totalBalance = (data.data || []).reduce((acc: number, curr: any) => acc + (curr.totalDays - curr.usedDays), 0);
      setStats(prev => ({ ...prev, balance: totalBalance }));
    } catch (error) {
      console.error('Failed to load allocations', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const res = await fetch('/api/v1/employees/me');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data.data);
        if (data.data?.id) fetchAllocations(data.data.id);
      }
    };
    init();
  }, []);

  const fetchProfile = async () => {
    try {
      const authRes = await fetch('/api/v1/auth/me');
      if (authRes.ok) {
        const userData = await authRes.json();
        const role = userData.role?.toLowerCase();
        setUserRole(role);
        const isUserAdmin = ['admin', 'owner', 'super_admin', 'business_owner', 'business owner', 'business-owner', 'tenant_owner', 'tenant-owner'].includes(role);
        if (isUserAdmin) {
          setActiveTab('team');
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchLeaves();
  }, [filters, search]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    const loadingToast = toast.loading(`${action === 'approved' ? 'Approving' : 'Rejecting'} leave request...`);
    try {
      const response = await fetch(`/api/v1/hr/leaves/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: action }),
      });

      if (!response.ok) throw new Error('Failed to update leave status');

      toast.success(`Leave request ${action} successfully`, { id: loadingToast });
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update leave status', { id: loadingToast });
    }
  };

  const isAdmin = ['admin', 'owner', 'super_admin', 'business_owner', 'business owner', 'business-owner', 'tenant_owner', 'tenant-owner'].includes(userRole?.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Leave Management</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Audit, authorize, and manage employee absences</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-blue-600 text-white hover:bg-blue-700 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-100 transition-all active:scale-95"
            icon={<Plus className="h-4 w-4" />}
          >
            Request Leave
          </Button>
          <Button variant="outline" onClick={fetchLeaves} className="h-12 w-12 rounded-2xl flex items-center justify-center p-0" icon={<RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />} />
        </div>
      </div>

      {/* 2. Visual Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Leave Balance" value={`${stats.balance} Days`} icon="💳" color="blue" />
        <MetricCard title="Pending Review" value={stats.pending.toString()} icon="⏳" color="amber" />
        <MetricCard title="Authorized (MTD)" value={stats.approved.toString()} icon="✅" color="emerald" />
        <MetricCard title="Total Volume" value={stats.total.toString()} icon="📊" />
      </div>

      {/* 2.5 Detailed Leave Breakdown (Only for personal view) */}
      {activeTab === 'my' && allocations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
          {allocations.map((alloc) => (
            <div key={alloc.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs uppercase shadow-inner",
                  alloc.leaveType === 'casual' ? "bg-blue-50 text-blue-600" :
                  alloc.leaveType === 'sick' ? "bg-rose-50 text-rose-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {alloc.leaveType[0]}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{alloc.leaveType} Leave</h4>
                  <p className="text-lg font-black text-slate-900 mt-0.5">{alloc.totalDays - alloc.usedDays} <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Days Left</span></p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total: {alloc.totalDays}</p>
                <div className="h-1.5 w-20 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all duration-1000",
                      alloc.leaveType === 'casual' ? "bg-blue-500" :
                      alloc.leaveType === 'sick' ? "bg-rose-500" :
                      "bg-amber-500"
                    )}
                    style={{ width: `${(alloc.usedDays / alloc.totalDays) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {/* 3. Advanced Filtering Command Bar */}
        <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex p-1 bg-slate-50 rounded-2xl w-full md:w-auto border border-slate-100">
              <TabButton active={activeTab === 'my'} onClick={() => setActiveTab('my')} icon={<User className="h-3.5 w-3.5" />} label="My Requests" />
              {isAdmin && <TabButton active={activeTab === 'team'} onClick={() => setActiveTab('team')} icon={<Users className="h-3.5 w-3.5" />} label="Team Overview" />}
            </div>
            
            <div className="flex-1 flex flex-col md:flex-row gap-3 w-full">
               <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    placeholder="Search by Applicant or Employee ID..." 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:ring-2 focus:ring-blue-100 outline-none transition-all" 
                  />
               </div>
               <div className="flex gap-2">
                 <select 
                   value={filters.status} 
                   onChange={e => setFilters({...filters, status: e.target.value, page: 1})}
                   className="h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                 >
                   <option value="all">All Status</option>
                   <option value="pending">Pending</option>
                   <option value="approved">Approved</option>
                   <option value="rejected">Rejected</option>
                 </select>
                 <select 
                   value={filters.type} 
                   onChange={e => setFilters({...filters, type: e.target.value, page: 1})}
                   className="h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100"
                 >
                   <option value="all">All Types</option>
                   <option value="casual">Casual</option>
                   <option value="sick">Sick</option>
                   <option value="earned">Earned</option>
                   <option value="unpaid">Unpaid</option>
                 </select>
               </div>
            </div>
          </div>
        </div>

        {/* 4. Scrollable Leave Ledger */}
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto overflow-y-auto max-h-[600px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50/50 text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                <tr>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">Applicant Details</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">Absence Period</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">Category & Reason</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-center border-b border-slate-100">Authorization</th>
                  <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest text-right border-b border-slate-100">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100" />
                          <div className="space-y-2">
                            <div className="h-3 w-32 bg-slate-100 rounded-lg" />
                            <div className="h-2.5 w-16 bg-slate-50 rounded-lg" />
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-2">
                          <div className="h-3 w-24 bg-slate-100 rounded-lg" />
                          <div className="h-2.5 w-20 bg-slate-50 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="space-y-2">
                          <div className="h-3 w-40 bg-slate-100 rounded-lg" />
                          <div className="h-2.5 w-32 bg-slate-50 rounded-lg" />
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="h-6 w-20 bg-slate-50 rounded-xl mx-auto" />
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="h-9 w-24 bg-slate-50 rounded-xl ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : leaves.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-40">
                        <span className="text-6xl">📬</span>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">No Leave Requests Matching Filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xs shadow-sm border transition-all",
                            leave.status === 'approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-blue-50 text-blue-600 border-blue-100"
                          )}>
                            {leave.employee.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 tracking-tight leading-none uppercase">{leave.employee.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{leave.employee.empCode || 'E-TEMP'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex flex-col">
                          <p className="text-[11px] font-black text-slate-700 tracking-tight">{format(new Date(leave.fromDate), 'dd MMM')} — {format(new Date(leave.toDate), 'dd MMM yyyy')}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">{leave.days} Day(s)</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">{leave.leaveType.replace('_', ' ')}</span>
                        <p className="text-[10px] font-bold text-slate-400 truncate max-w-[200px] mt-2 italic" title={leave.reason}>"{leave.reason || 'No reason specified'}"</p>
                      </td>
                      <td className="px-10 py-6 text-center">
                        <div className="flex justify-center">
                          <span className={cn(
                            "px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm transition-all",
                            getStatusStyle(leave.status)
                          )}>
                            {leave.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {leave.status === 'pending' && isAdmin ? (
                          <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button onClick={() => handleAction(leave.id, 'approved')} className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-100 shadow-sm"><Check className="h-5 w-5" /></button>
                            <button onClick={() => handleAction(leave.id, 'rejected')} className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center border border-rose-100 shadow-sm"><X className="h-5 w-5" /></button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end gap-2 text-[9px] font-black text-slate-300 uppercase tracking-widest">
                            {leave.status === 'approved' ? <ShieldCheck className="h-4 w-4 text-emerald-400" /> : <AlertCircle className="h-4 w-4" />}
                            {leave.status === 'pending' ? 'Pending Approval' : 'Audit Finalized'}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Pagination Controls */}
          <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Showing <span className="text-slate-900">{leaves.length}</span> of <span className="text-slate-900">{meta.total}</span> Results
             </p>
             <div className="flex items-center gap-2">
                <PaginationButton 
                  disabled={filters.page === 1 || loading} 
                  onClick={() => setFilters({...filters, page: filters.page - 1})}
                  icon={<ChevronLeft className="h-4 w-4" />}
                />
                <div className="flex items-center gap-1.5 px-4 h-10 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-slate-900 shadow-sm">
                  Page {filters.page} <span className="text-slate-300 mx-1">/</span> {meta.totalPages}
                </div>
                <PaginationButton 
                  disabled={filters.page === meta.totalPages || loading} 
                  onClick={() => setFilters({...filters, page: filters.page + 1})}
                  icon={<ChevronRight className="h-4 w-4" />}
                />
             </div>
          </div>
        </div>
      </div>

      <LeaveRequestModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} onSuccess={fetchLeaves} />
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/50 border-emerald-100',
    blue: 'bg-blue-50/50 border-blue-100',
    amber: 'bg-amber-50/50 border-amber-100',
  };

  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm hover:shadow-xl transition-all group duration-500", colorStyles[color])}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover:text-slate-600 transition-colors">{title}</p>
        <span className="text-2xl h-12 w-12 bg-white rounded-2xl shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">{icon}</span>
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
        active 
          ? "bg-white text-blue-600 shadow-lg shadow-blue-50/50" 
          : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function PaginationButton({ disabled, onClick, icon }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "h-10 w-10 flex items-center justify-center rounded-xl border transition-all",
        disabled 
          ? "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed" 
          : "bg-white text-slate-600 border-slate-200 hover:border-blue-400 hover:text-blue-600 shadow-sm active:scale-95"
      )}
    >
      {icon}
    </button>
  );
}

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'approved': return 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-50';
    case 'rejected': return 'bg-rose-50 text-rose-600 border-rose-100 shadow-rose-50';
    case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-50';
    default: return 'bg-slate-50 text-slate-600 border-slate-100';
  }
};
