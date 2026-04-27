'use client';

import React, { useState } from 'react';
import { 
  IndianRupee, Calendar, TrendingUp, TrendingDown,
  CheckCircle2, AlertCircle, Loader2, Save,
  ArrowRight, Download, RefreshCcw, Wallet,
  CreditCard, ShieldCheck, History, MoreHorizontal,
  ChevronRight, Calculator, Landmark
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function PayrollPage() {
  const [month, setMonth] = useState<string>((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState<string>(new Date().getFullYear().toString());
  const [loading, setLoading] = useState(false);
  const [payrollRun, setPayrollRun] = useState<any>(null);

  const handleProcess = async () => {
    setLoading(true);
    const loadingToast = toast.loading(`Initializing Payroll Engine for ${month}/${year}...`);
    try {
      const res = await fetch('/api/v1/hr/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      });
      const data = await res.json();
      
      if (res.ok) {
        setPayrollRun(data.data);
        toast.success('Payroll engine successfully calculated all pro-rata settlements', { id: loadingToast });
      } else {
        throw new Error(data.error || 'Engine calculation failed');
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
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Payroll Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Calculate monthly pro-rata settlements, statutory deductions, and disbursement files</p>
        </div>
        {payrollRun && (
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setPayrollRun(null)} icon={<RefreshCcw className="h-4 w-4" />}>
              Reset Calculation
            </Button>
            <Button icon={<Download className="h-4 w-4" />}>
              Bank File (Excel)
            </Button>
          </div>
        )}
      </div>

      {!payrollRun ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-16 shadow-2xl shadow-slate-100/50 text-center max-w-3xl mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
            <Calculator className="h-64 w-64" />
          </div>
          
          <div className="relative z-10">
            <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-blue-100">
              <IndianRupee className="h-10 w-10 text-blue-600" />
            </div>
            
            <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Initiate Payroll Run</h2>
            <p className="text-sm font-medium text-slate-500 mb-10 max-w-md mx-auto leading-relaxed">
              Our automated engine will fetch attendance records, pro-rata base salary, and calculate PF/ESI contributions for the selected period.
            </p>
            
            <div className="flex flex-col md:flex-row gap-4 mb-10 justify-center items-center">
              <div className="space-y-1.5 text-left flex-1 max-w-[200px]">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Period Month</label>
                <select 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((m, i) => (
                    <option key={m} value={i + 1}>{m}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5 text-left flex-1 max-w-[140px]">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Fiscal Year</label>
                <select 
                  value={year} 
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full h-14 px-6 bg-slate-50 border-none rounded-2xl text-sm font-black outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                >
                  {[2024, 2025, 2026].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            <Button 
              size="lg" 
              onClick={handleProcess} 
              loading={loading}
              className="w-full md:w-auto h-16 px-16 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-200 active:scale-95 transition-all"
            >
              Authorize Calculation Engine
              <ArrowRight className="h-4 w-4 ml-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-700">
          {/* 2. Financial Dashboard Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FinancialSummaryCard 
              label="Gross Salary Pool" 
              value={formatAmount(payrollRun.totalGross)} 
              sub="Total Workforce Cost"
              icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
              color="blue"
            />
            <FinancialSummaryCard 
              label="Statutory Deductions" 
              value={formatAmount(payrollRun.totalDeductions)} 
              sub="PF, ESI & Prof. Tax"
              icon={<TrendingDown className="h-5 w-5 text-rose-500" />}
              color="rose"
            />
            <FinancialSummaryCard 
              label="Net Payable Liability" 
              value={formatAmount(payrollRun.totalNet)} 
              sub="Total Bank Disbursement"
              icon={<Wallet className="h-5 w-5 text-emerald-500" />}
              color="emerald"
            />
          </div>

          {/* 3. Detailed Processing Hub */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-10 py-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                  <Calculator className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Calculation Result — {month}/{year}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Verification & Disbursement Status</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" icon={<MoreHorizontal className="h-4 w-4" />}>
                  Audit Logs
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" icon={<Landmark className="h-4 w-4" />}>
                  Approve & Disburse
                </Button>
              </div>
            </div>

            <div className="p-20 text-center">
              <div className="max-w-md mx-auto space-y-6">
                <div className="h-20 w-20 rounded-[2rem] bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">System Ready for Disbursement</h2>
                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                  The payroll calculation is complete. All pro-rata adjustments for {payrollRun.count || 0} employees have been cross-verified against the attendance ledger.
                </p>
                <div className="pt-6 flex flex-col gap-3">
                  <button onClick={() => setPayrollRun(null)} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">
                    Re-run Calculation Engine
                  </button>
                  <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-4 border-t border-slate-50">
                    <ShieldCheck className="h-3 w-3" /> Audit Reference: PAY-{year}-{month}-X04
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FinancialSummaryCard({ label, value, sub, icon, color }: any) {
  const colorStyles: any = {
    blue: 'bg-blue-50/30 border-blue-100',
    rose: 'bg-rose-50/30 border-rose-100',
    emerald: 'bg-emerald-50/30 border-emerald-100',
  };

  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm group hover:shadow-md transition-all", colorStyles[color])}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">{sub}</p>
    </div>
  );
}
