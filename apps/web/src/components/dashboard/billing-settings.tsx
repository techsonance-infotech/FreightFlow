'use client';

import React, { useState } from 'react';
import { 
  CreditCard, Zap, Package, Calendar, 
  ArrowUpRight, CheckCircle2, AlertCircle,
  Download, Plus, ShieldCheck, Clock,
  PieChart, Settings2, HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function BillingSettings() {
  const [currentPlan, setCurrentPlan] = useState('Pro');

  const invoices = [
    { id: 'INV-001', date: 'April 01, 2026', amount: '₹14,999', status: 'Paid' },
    { id: 'INV-002', date: 'March 01, 2026', amount: '₹14,999', status: 'Paid' },
    { id: 'INV-003', date: 'February 01, 2026', amount: '₹14,999', status: 'Paid' },
  ];

  return (
    <div className="divide-y divide-slate-100">
      {/* 1. Subscription Overview */}
      <div className="p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-start gap-6">
            <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-200 shrink-0">
              <Zap className="h-10 w-10 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Plan: {currentPlan}</h2>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Auto-Renew Enabled</span>
              </div>
              <p className="text-slate-500 font-bold mt-2 flex items-center gap-2">
                Next billing cycle on <span className="text-slate-900 underline decoration-blue-500/30">May 01, 2026</span>
              </p>
            </div>
          </div>
          <button className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:scale-105">
            Upgrade Subscription
          </button>
        </div>

        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UsageMetric label="Fleet Capacity" used={42} total={50} sub="Vehicles Registered" color="bg-blue-600" />
          <UsageMetric label="Admin Seats" used={8} total={10} sub="Staff Accounts" color="bg-indigo-600" />
          <UsageMetric label="Cloud Storage" used={7.2} total={10} sub="Document Uploads (GB)" color="bg-amber-500" />
        </div>
      </div>

      {/* 2. Payment Methods */}
      <div className="p-8 lg:p-12 bg-slate-50/30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
              <CreditCard className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Payment Methods</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary source for renewals</p>
            </div>
          </div>
          <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-700">
            <Plus className="h-4 w-4" /> Add New Card
          </button>
        </div>

        <div className="max-w-md">
          <div className="group relative p-6 rounded-3xl bg-slate-900 text-white shadow-2xl overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl transition-transform group-hover:scale-125" />
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Primary Card</span>
                <h4 className="text-lg font-black tracking-tight mt-1">HDFC Bank Platinum</h4>
              </div>
              <div className="h-8 w-12 bg-white/10 rounded-md backdrop-blur-md flex items-center justify-center text-[10px] font-black italic tracking-tighter">VISA</div>
            </div>
            <div className="flex items-end justify-between">
              <div className="space-y-1">
                <p className="text-xl font-mono font-bold tracking-widest">•••• •••• •••• 4242</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires 12/28</p>
              </div>
              <button className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all">
                <Settings2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Billing History */}
      <div className="p-8 lg:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Clock className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Invoice History</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Audit trail for your account</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-100 overflow-hidden bg-white">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Invoice ID</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Billing Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-black text-slate-700 text-sm">{inv.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-500 text-sm">{inv.date}</td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm">{inv.amount}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Paid</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 rounded-xl text-slate-300 hover:text-blue-600 hover:bg-white transition-all">
                      <Download className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UsageMetric({ label, used, total, sub, color }: any) {
  const percentage = (used / total) * 100;
  return (
    <div className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 shadow-inner">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <span className="text-xs font-black text-slate-900">{used} / {total}</span>
      </div>
      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
        <div 
          className={cn("h-full rounded-full transition-all duration-1000", color)} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] font-bold text-slate-400 italic tracking-tight">{sub}</p>
    </div>
  );
}
