'use client';

import React, { useState } from 'react';
import { 
  BarChart4, FileSpreadsheet, PieChart, 
  TrendingUp, TrendingDown, Download,
  Calendar, ChevronRight,
  ChevronDown, Search, Filter,
  Building2, ArrowRight, Scale
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
  balanceSheet: {
    items: {
      assets: any[];
      liabilities: any[];
      equity: any[];
    };
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netProfit: number;
    totalLiabilitiesEquity: number;
  };
}

export function FinancialStatements({ reports }: { reports: FinancialReports }) {
  const [activeView, setActiveView] = useState<'pnl' | 'trial' | 'bs'>('pnl');

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Financial Intelligence</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">{activeView === 'bs' ? 'Balance Sheet' : activeView === 'pnl' ? 'Profit & Loss Statement' : 'Trial Balance'} — FY 2026-27</p>
        </div>
        <div className="flex gap-4">
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 gap-3">
            <FileSpreadsheet className="h-4 w-4" /> Export Statement
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex bg-slate-100 p-2 rounded-[2rem] w-fit">
        <button
          onClick={() => setActiveView('pnl')}
          className={cn(
            "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all gap-3 flex items-center",
            activeView === 'pnl' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          P&L
        </button>
        <button
          onClick={() => setActiveView('bs')}
          className={cn(
            "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all gap-3 flex items-center",
            activeView === 'bs' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <Scale className="h-4 w-4" />
          Balance Sheet
        </button>
        <button
          onClick={() => setActiveView('trial')}
          className={cn(
            "px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all gap-3 flex items-center",
            activeView === 'trial' ? "bg-white text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600"
          )}
        >
          <BarChart4 className="h-4 w-4" />
          Trial Balance
        </button>
      </div>

      {activeView === 'pnl' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in slide-in-from-bottom-4 duration-500">
          {/* P&L Statement */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-12 border-b border-slate-50 pb-8 uppercase tracking-widest">Operating Performance</h2>
              <div className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Revenue / Income</h3>
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

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Expenses / Outflows</h3>
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

                <div className="pt-10 border-t-2 border-slate-900 flex justify-between items-end">
                   <div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Net Period Profit</p>
                     <h4 className={cn("text-4xl font-black tracking-tighter", reports.pnl.netProfit >= 0 ? "text-emerald-600" : "text-rose-600")}>
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

          {/* Sidebar Analytics */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8">Performance Snapshot</h3>
              <div className="space-y-8">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Top Contributor</p>
                  <p className="text-lg font-black">{reports.pnl.items.revenue[0]?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Highest Outflow</p>
                  <p className="text-lg font-black text-rose-400">{reports.pnl.items.expenses[0]?.name || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'bs' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 animate-in slide-in-from-bottom-4 duration-500">
          {/* Assets Side */}
          <div className="bg-white rounded-[3rem] border border-slate-100 p-12 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-widest mb-12 border-b border-slate-50 pb-8 uppercase">Assets / Applications of Funds</h2>
            <div className="space-y-12">
               <div className="space-y-4">
                  {reports.balanceSheet.items.assets.map((a: any) => (
                    <div key={a.id} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                      <span className="text-sm font-medium text-slate-600">{a.name}</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(a.balance)}</span>
                    </div>
                  ))}
               </div>
               <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Assets</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(reports.balanceSheet.totalAssets)}</span>
               </div>
            </div>
          </div>

          {/* Liabilities Side */}
          <div className="bg-slate-50 rounded-[3rem] p-12 border border-slate-100 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 tracking-widest mb-12 border-b border-slate-200 pb-8 uppercase">Liabilities & Equity / Sources of Funds</h2>
            <div className="space-y-10">
               {/* Liabilities Section */}
               <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Liabilities</h3>
                  {reports.balanceSheet.items.liabilities.map((l: any) => (
                    <div key={l.id} className="flex justify-between items-center py-1">
                      <span className="text-xs font-bold text-slate-500">{l.name}</span>
                      <span className="text-xs font-black text-slate-900">{formatCurrency(Math.abs(l.balance))}</span>
                    </div>
                  ))}
               </div>

               {/* Equity Section */}
               <div className="space-y-3 pt-6 border-t border-slate-200">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Equity & Reserves</h3>
                  {reports.balanceSheet.items.equity.map((q: any) => (
                    <div key={q.id} className="flex justify-between items-center py-1">
                      <span className="text-xs font-bold text-slate-500">{q.name}</span>
                      <span className="text-xs font-black text-slate-900">{formatCurrency(Math.abs(q.balance))}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-2 bg-emerald-50 px-3 rounded-lg mt-2">
                    <span className="text-xs font-black text-emerald-700">Retained Earnings (Current Profit)</span>
                    <span className="text-xs font-black text-emerald-900">{formatCurrency(reports.balanceSheet.netProfit)}</span>
                  </div>
               </div>

               <div className="pt-8 border-t-2 border-slate-900 flex justify-between items-center">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Liabilities & Equity</span>
                  <span className="text-2xl font-black text-slate-900">{formatCurrency(reports.balanceSheet.totalLiabilitiesEquity)}</span>
               </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'trial' && (
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
           </table>
        </div>
      )}
    </div>
  );
}
