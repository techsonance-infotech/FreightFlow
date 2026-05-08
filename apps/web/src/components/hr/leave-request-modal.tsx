'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Umbrella, Thermometer, Trophy, IndianRupee, 
  Calendar, MessageSquare, X, FileText, Send, Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LEAVE_TYPES = [
  { value: 'casual', label: 'Casual Leave', icon: <Umbrella className="h-4 w-4" /> },
  { value: 'sick', label: 'Sick Leave', icon: <Thermometer className="h-4 w-4" /> },
  { value: 'earned', label: 'Earned Leave', icon: <Trophy className="h-4 w-4" /> },
  { value: 'unpaid', label: 'Unpaid Leave', icon: <IndianRupee className="h-4 w-4" /> },
];

export function LeaveRequestModal({ isOpen, onClose, onSuccess }: LeaveRequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    leaveType: 'casual',
    fromDate: '',
    toDate: '',
    reason: '',
  });
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = async (empId: string, type: string) => {
    if (type === 'unpaid') {
      setBalance(999);
      return;
    }
    try {
      const res = await fetch(`/api/v1/hr/leaves/allocations?employeeId=${empId}&year=${new Date().getFullYear()}`);
      const data = await res.json();
      const alloc = data.data?.find((a: any) => a.leaveType === type);
      setBalance(alloc ? alloc.totalDays - alloc.usedDays : 0);
    } catch (error) {
      setBalance(0);
    }
  };

  useEffect(() => {
    const fetchMyEmployee = async () => {
      try {
        const res = await fetch('/api/v1/employees/me');
        if (res.ok) {
          const data = await res.json();
          setEmployeeId(data.id);
          fetchBalance(data.id, formData.leaveType);
        }
      } catch (error) {}
    };

    if (isOpen) {
      fetchMyEmployee();
    }
  }, [isOpen]);

  useEffect(() => {
    if (employeeId) fetchBalance(employeeId, formData.leaveType);
  }, [formData.leaveType, employeeId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) {
      toast.error('Employee profile not found. Please contact support.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/v1/hr/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          employeeId
        }),
      });

      if (!response.ok) throw new Error('Failed to submit leave request');

      toast.success('Leave request submitted successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error submitting leave request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Request Leave</h2>
            <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Submit your absence application</p>
          </div>
          <button onClick={onClose} className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Leave Type Grid */}
          <div className="space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Leave Type</label>
            <div className="grid grid-cols-2 gap-3">
              {LEAVE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, leaveType: type.value })}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left",
                    formData.leaveType === type.value
                      ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-50"
                      : "border-slate-100 hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-lg flex items-center justify-center transition-all",
                    formData.leaveType === type.value ? "bg-white shadow-sm text-blue-600" : "bg-slate-50 text-slate-400"
                  )}>
                    {type.icon}
                  </div>
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-widest",
                    formData.leaveType === type.value ? "text-blue-600" : "text-slate-500"
                  )}>
                    {type.label}
                  </span>
                </button>
              ))}
            </div>
            
            {balance !== null && formData.leaveType !== 'unpaid' && (
              <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Available Balance</span>
                <span className={cn(
                  "text-xs font-black uppercase tracking-widest",
                  balance <= 0 ? "text-rose-600" : "text-blue-700"
                )}>
                  {balance} Days Remaining
                </span>
              </div>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">From Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="date"
                  required
                  value={formData.fromDate}
                  onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">To Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="date"
                  required
                  value={formData.toDate}
                  onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Reason for Absence</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 h-4 w-4 text-slate-300" />
              <textarea
                required
                rows={3}
                placeholder="Briefly describe the reason for your leave..."
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                className="w-full pl-11 pr-4 py-4 bg-slate-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-100 transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !employeeId}
              className="flex-[2] h-14 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <>Submit Application <Send className="ml-2 h-4 w-4" /></>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
