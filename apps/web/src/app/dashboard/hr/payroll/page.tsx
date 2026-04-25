'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function PayrollPage() {
  const [month, setMonth] = useState<string>(new Date().getMonth().toString()); // Previous month usually
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [payrollRun, setPayrollRun] = useState<any>(null);

  const handleProcess = async () => {
    setLoading(true);
    const loadingToast = toast.loading(`Processing payroll for ${month}/${year}...`);
    try {
      const res = await fetch('/api/v1/hr/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      
      if (res.ok) {
        setPayrollRun(data.data);
        toast.success('Payroll processed successfully', { id: loadingToast });
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      toast.error(`Payroll Error: ${error.message}`, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">Payroll Processing</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Calculate monthly salaries, deductions and generate payslips</p>
        </div>
      </div>

      {!payrollRun ? (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6">💰</div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Initialize Monthly Payroll</h2>
          <p className="text-sm font-medium text-slate-500 mb-8">Select the period to calculate attendance-based pro-rata salary and statutory deductions.</p>
          
          <div className="flex gap-4 mb-8 justify-center">
            <select 
              value={month} 
              onChange={(e) => setMonth(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
            <select 
              value={year} 
              onChange={(e) => setYear(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <Button 
            size="lg" 
            onClick={handleProcess} 
            loading={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-black uppercase tracking-widest py-6"
          >
            Start Payroll Run
          </Button>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Gross Salary</p>
              <h3 className="text-3xl font-black text-slate-900">{formatAmount(payrollRun.totalGross)}</h3>
            </div>
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Total Deductions</p>
              <h3 className="text-3xl font-black text-rose-700">{formatAmount(payrollRun.totalDeductions)}</h3>
            </div>
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-6 shadow-sm">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Net Payable</p>
              <h3 className="text-3xl font-black text-emerald-700">{formatAmount(payrollRun.totalNet)}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex justify-between items-center">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payroll Summary - {month}/{year}</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">Download Excel</Button>
                <Button size="sm" className="bg-blue-600 text-white">Approve & Disburse</Button>
              </div>
            </div>
            <div className="p-12 text-center text-slate-400">
              <p className="text-sm font-bold uppercase tracking-widest">Detailed payroll lines view implemented in master detail screen</p>
              <Button variant="link" onClick={() => setPayrollRun(null)} className="mt-4">Reset & Run Another</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
