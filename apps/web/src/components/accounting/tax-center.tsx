'use client';

import React from 'react';
import { 
  ShieldCheck, Calculator, Landmark, 
  FileText, Calendar, AlertCircle,
  Download, ArrowUpRight, TrendingDown,
  PieChart, History, CheckCircle2,
  Lock, ArrowRight, Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TaxSummary {
  gst: {
    output: {
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    };
  };
  tds: {
    payable: number;
    receivable: number;
  };
}

export function TaxCenter({ summary }: { summary: TaxSummary }) {
  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Tax Compliance Center</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Global GST & TDS Integrity Audit</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <Download className="h-4 w-4" /> Download GSTR-1 JSON
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 gap-3">
            <ShieldCheck className="h-4 w-4" /> Finalize Quarterly TDS
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* GST Output Summary */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner">
                    <Calculator className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">GST Output Liability</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Month (Provisonal)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-slate-900 leading-none">{formatCurrency(summary.gst.output.total)}</p>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Ready for filing</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TaxComponentCard label="CGST (9%)" amount={summary.gst.output.cgst} color="blue" />
                <TaxComponentCard label="SGST (9%)" amount={summary.gst.output.sgst} color="blue" />
                <TaxComponentCard label="IGST (18%)" amount={summary.gst.output.igst} color="indigo" />
              </div>

              <div className="mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <p className="text-xs font-bold text-slate-600">You have 4 invoices missing HSN codes. Please resolve before GSTR-1 generation.</p>
                </div>
                <Button variant="ghost" className="font-black text-[10px] uppercase tracking-widest text-blue-600 gap-2">
                  View List <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="text-lg font-black tracking-tight">TDS Payable</h3>
              </div>
              <p className="text-4xl font-black mb-2">{formatCurrency(summary.tds.payable)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Deducted from vendor payments</p>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section 194C (Transport)</span>
                  <span className="text-sm font-black text-slate-200">{formatCurrency(summary.tds.payable)}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Section 194I (Rent)</span>
                  <span className="text-sm font-black text-slate-200">₹0.00</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
               <div className="flex items-center gap-4 mb-8">
                <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <PieChart className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">TDS Receivable</h3>
              </div>
              <p className="text-4xl font-black text-slate-900 mb-2">{formatCurrency(summary.tds.receivable)}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-8">Deducted by customers (26AS)</p>
              <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center text-center">
                <Lock className="h-6 w-6 text-slate-200 mb-2" />
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                  Connect GSTN Portal to sync 26AS data automatically.
                </p>
                <Button variant="outline" className="mt-4 h-10 px-6 rounded-xl border-slate-200 font-black text-[9px] uppercase tracking-widest">Connect Portal</Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar: Calendar & Recent */}
        <div className="space-y-8">
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-3">
              <Calendar className="h-4 w-4 text-rose-500" /> Compliance Calendar
            </h3>
            <div className="space-y-6">
              <CalendarItem date="07 May" label="TDS Deposit" desc="Due for April 2024" status="overdue" />
              <CalendarItem date="11 May" label="GSTR-1 Filing" desc="Outward supplies" status="upcoming" />
              <CalendarItem date="20 May" label="GSTR-3B Filing" desc="Summary return" status="upcoming" />
              <CalendarItem date="31 May" label="TDS Quarterly" desc="Form 26Q (Q4)" status="upcoming" />
            </div>
          </div>

          <div className="bg-slate-50 rounded-[2.5rem] p-8">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <History className="h-4 w-4 text-indigo-600" /> Recent Filings
            </h3>
            <div className="space-y-4">
              <FilingRecord label="GSTR-1 (Mar 2024)" date="10 Apr" id="ARN-88219" />
              <FilingRecord label="GSTR-3B (Mar 2024)" date="18 Apr" id="ARN-99120" />
              <FilingRecord label="TDS Apr-Jun 2024" date="-- --" id="DRAFT" />
            </div>
            <Button variant="ghost" className="w-full mt-6 font-black text-[10px] uppercase tracking-widest text-slate-400">View Filing History</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaxComponentCard({ label, amount, color }: any) {
  return (
    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-xl font-black text-slate-900">₹{(amount / 100).toLocaleString()}</p>
    </div>
  );
}

function CalendarItem({ date, label, desc, status }: any) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center">
        <span className="text-xs font-black text-slate-900">{date.split(' ')[0]}</span>
        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{date.split(' ')[1]}</span>
      </div>
      <div>
        <h4 className="text-sm font-black text-slate-900">{label}</h4>
        <p className="text-[10px] font-medium text-slate-400">{desc}</p>
        <span className={cn(
          "text-[8px] font-black uppercase tracking-widest mt-1 inline-block",
          status === 'overdue' ? 'text-rose-500' : 'text-amber-500'
        )}>
          {status}
        </span>
      </div>
    </div>
  );
}

function FilingRecord({ label, date, id }: any) {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between">
      <div>
        <p className="text-xs font-black text-slate-700">{label}</p>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Filed: {date}</p>
      </div>
      <div className="text-right">
        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">{id}</span>
      </div>
    </div>
  );
}
