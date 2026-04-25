'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const loadingToast = toast.loading(`${action === 'approved' ? 'Approving' : 'Rejecting'} leave...`);
    try {
      // Note: We'll use a specific endpoint for the action if needed, 
      // but for now we'll simulate it via the list logic
      toast.success(`Leave request ${action} successfully`, { id: loadingToast });
      setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: action } : l));
    } catch (error) {
      toast.error('Failed to update leave status', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">Leave Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review and approve employee leave requests</p>
        </div>
        <Button onClick={fetchLeaves} variant="outline" icon="🔄">
          Refresh List
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Dates</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Reason</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                    No leave requests found
                  </td>
                </tr>
              ) : (
                leaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-brand-700">
                      {leave.employee.name}
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{leave.employee.empCode}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">
                      {new Date(leave.fromDate).toLocaleDateString()} - {new Date(leave.toDate).toLocaleDateString()}
                      <p className="text-[10px] text-slate-400 uppercase tracking-widest">{leave.days} Day(s)</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-600 uppercase tracking-wider">{leave.leaveType}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-[200px] truncate" title={leave.reason}>
                      {leave.reason || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        leave.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        leave.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleAction(leave.id, 'approved')}
                            className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Approve"
                          >
                            ✅
                          </button>
                          <button 
                            onClick={() => handleAction(leave.id, 'rejected')}
                            className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                            title="Reject"
                          >
                            ❌
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No Action</span>
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
  );
}
