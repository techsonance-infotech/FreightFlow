'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PayrollTabProps {
  labourId: string;
}

export function PayrollTab({ labourId }: PayrollTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [payrollData, setPayrollData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const response = await fetch(`/api/v1/masters/labour/payroll?labourId=${labourId}&month=${monthStr}`);
      if (response.ok) {
        setPayrollData(await response.json());
      }
    } catch (error) {
      toast.error('Error calculating payroll');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [currentMonth]);

  if (loading) return <div className="p-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Calculating settlement...</div>;
  if (!payrollData) return null;

  const { summary } = payrollData;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Monthly Payroll Settlement</h3>
        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="h-8 w-8 p-0">◀</Button>
          <span className="text-xs font-black uppercase tracking-wider min-w-[120px] text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="h-8 w-8 p-0">▶</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Base Salary</p>
          <p className="text-2xl font-black text-slate-900">₹{(summary.baseSalary / 100).toLocaleString()}</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Earned Salary</p>
          <p className="text-2xl font-black text-blue-600">₹{(summary.earnedSalary / 100).toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">For {summary.workingDays} / {summary.totalDays} Days</p>
        </div>
        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Total Bonuses</p>
          <p className="text-2xl font-black text-green-600">₹{(summary.bonuses / 100).toLocaleString()}</p>
        </div>
        <div className="p-6 bg-red-50 rounded-3xl border border-red-100">
          <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-2">Advances/Deductions</p>
          <p className="text-2xl font-black text-red-600">₹{((summary.advances + summary.deductions) / 100).toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl shadow-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 text-90 opacity-5 select-none font-black">₹</div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Net Balance Payable</p>
            <h2 className="text-5xl font-black mt-2">₹{(summary.netPayable / 100).toLocaleString()}</h2>
            <p className="text-xs font-bold text-slate-500 mt-4 uppercase tracking-widest">Settlement for the month of {format(currentMonth, 'MMMM yyyy')}</p>
          </div>
          <div className="flex flex-col gap-3 min-w-[240px]">
            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black uppercase tracking-widest text-xs">
              Record Full Payment
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl border-slate-700 text-white hover:bg-slate-800 font-black uppercase tracking-widest text-xs">
              Generate Payslip PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Calculation Breakdown</h4>
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
          <div className="p-4 flex justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Base Payout (Pro-rata)</span>
            <span className="text-xs font-black text-slate-900">₹{(summary.earnedSalary / 100).toLocaleString()}</span>
          </div>
          <div className="p-4 flex justify-between bg-green-50/30">
            <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Monthly Bonuses (+)</span>
            <span className="text-xs font-black text-green-600">₹{(summary.bonuses / 100).toLocaleString()}</span>
          </div>
          <div className="p-4 flex justify-between bg-red-50/30">
            <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Advances/Deductions (-)</span>
            <span className="text-xs font-black text-red-600">(₹{((summary.advances + summary.deductions) / 100).toLocaleString()})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
