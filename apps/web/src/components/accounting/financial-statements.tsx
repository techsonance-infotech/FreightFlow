'use client';

import React, { useState } from 'react';
import { 
  BarChart4, FileSpreadsheet, PieChart, 
  TrendingUp, TrendingDown, Download,
  Calendar, ChevronRight,
  ChevronDown, Search, Filter,
  Building2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FinancialReports {
  trialBalance: any[];
  pnl: {
    items: {
      revenue: any[];
      expenses: any[];
    };
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
  };
}

export function FinancialStatements({ reports }: { reports: FinancialReports }) {
  const [activeView, setActiveView] = useState<'pnl' | 'trial'>('pnl');

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
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Real-time Performance & Solvency Reports</p>
        </div>
        <div className="flex gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 gap-3">
            <FileSpreadsheet className="h-4 w-4" /> Export to Excel
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] w-fit">
        <button
          onClick={() => setActiveView('pnl')}
          className={cn(
            "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all gap-3 flex items-center",
            activeView === 'pnl' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Profit & Loss
        </button>
        <button
          onClick={() => setActiveView('trial')}
          className={cn(
            "px-10 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all gap-3 flex items-center",
            activeView === 'trial' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400"
          )}
        >
          <BarChart4 className="h-4 w-4" />
          Trial Balance
        </button>
      </div>

      {activeView === 'pnl' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Statement */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-12 border-b border-slate-50 pb-8">Operating Performance</h2>
              
              <div className="space-y-12">
                {/* Revenue Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Revenue Channels</h3>
                    <span className="text-sm font-black text-slate-900">{formatCurrency(reports.pnl.totalRevenue)}</span>
                  </div>
                  <div className="space-y-3">
                    {reports.pnl.items.revenue.map((r: any) => (
                      <div key={r.id} className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-500">{r.name}</span>
                        <span className="text-sm font-bold text-slate-700">{formatCurrency(Math.abs(r.balance))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Expenses Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Operating Expenses</h3>
                    <span className="text-sm font-black text-slate-900">({formatCurrency(reports.pnl.totalExpenses)})</span>
                  </div>
                  <div className="space-y-3">
                    {reports.pnl.items.expenses.map((e: any) => (
                      <div key={e.id} className="flex justify-between items-center py-2">
                        <span className="text-sm font-medium text-slate-500">{e.name}</span>
                        <span className="text-sm font-bold text-slate-700">{formatCurrency(Math.abs(e.balance))}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Net Profit */}
                <div className="pt-10 border-t-2 border-slate-900 flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Mission Profit</p>
                     <h4 className={cn(
                       "text-4xl font-black tracking-tighter",
                       reports.pnl.netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                     )}>
                       {formatCurrency(reports.pnl.netProfit)}
                     </h4>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Operating Margin</p>
                      <p className="text-2xl font-black text-slate-900">
                        {reports.pnl.totalRevenue > 0 ? ((reports.pnl.netProfit / reports.pnl.totalRevenue) * 100).toFixed(1) : 0}%
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side Analytics */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Performance Snapshot</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top Revenue Contributor</p>
                  <p className="text-lg font-black">{reports.pnl.items.revenue[0]?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Highest Expense Category</p>
                  <p className="text-lg font-black text-rose-400">{reports.pnl.items.expenses[0]?.name || 'N/A'}</p>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <TrendingUp className="h-5 w-5" />
                    <span className="text-sm font-black">12.5% Growth vs Last Month</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2.5rem] p-10 border border-blue-100">
              <PieChart className="h-10 w-10 text-blue-600 mb-6" />
              <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">Cash Flow Index</h3>
              <p className="text-xs leading-relaxed text-blue-700 font-medium">
                Your current liquidity ratio is healthy at 1.8. You have enough cash reserves to cover mission advances for the next 45 days.
              </p>
              <Button variant="ghost" className="mt-6 px-0 font-black text-[10px] uppercase tracking-widest text-blue-600 gap-2">
                Detailed Analysis <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
           <table className="w-full">
             <thead className="bg-slate-50 text-slate-400">
               <tr>
                 <th className="px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">A/C Code</th>
                 <th className="px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">Account Name</th>
                 <th className="px-12 py-6 text-left text-[10px] font-black uppercase tracking-widest">Category</th>
                 <th className="px-12 py-6 text-right text-[10px] font-black uppercase tracking-widest">Debit</th>
                 <th className="px-12 py-6 text-right text-[10px] font-black uppercase tracking-widest">Credit</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-50">
               {reports.trialBalance.map((acc) => (
                 <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors">
                   <td className="px-12 py-6 text-sm font-black text-blue-600">{acc.code}</td>
                   <td className="px-12 py-6 text-sm font-bold text-slate-700">{acc.name}</td>
                   <td className="px-12 py-6">
                     <span className="px-3 py-1 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                       {acc.type}
                     </span>
                   </td>
                   <td className="px-12 py-6 text-right text-sm font-black text-slate-900">
                     {acc.debit > 0 ? formatCurrency(acc.debit) : '—'}
                   </td>
                   <td className="px-12 py-6 text-right text-sm font-black text-slate-900">
                     {acc.credit > 0 ? formatCurrency(acc.credit) : '—'}
                   </td>
                 </tr>
               ))}
             </tbody>
             <tfoot className="bg-slate-900 text-white">
               <tr>
                 <td colSpan={3} className="px-12 py-8 text-xs font-black uppercase tracking-widest">Total Trial Balance</td>
                 <td className="px-12 py-8 text-right text-lg font-black">
                   {formatCurrency(reports.trialBalance.reduce((sum, a) => sum + a.debit, 0))}
                 </td>
                 <td className="px-12 py-8 text-right text-lg font-black">
                   {formatCurrency(reports.trialBalance.reduce((sum, a) => sum + a.credit, 0))}
                 </td>
               </tr>
             </tfoot>
           </table>
        </div>
      )}
    </div>
  );
}
