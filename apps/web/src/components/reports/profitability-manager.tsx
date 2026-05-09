'use client';

import React from 'react';
import { 
  TrendingUp, TrendingDown, Map, 
  BarChart4, PieChart, Download,
  ArrowRight, Search, Filter,
  DollarSign, Package, Truck,
  ChevronRight, Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RouteStat {
  name: string;
  tripCount: number;
  revenue: number;
  expenses: number;
  profit: number;
  margin: number;
}

export function ProfitabilityManager({ stats }: { stats: RouteStat[] }) {
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Route Profitability</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Network Margin & Logistics Efficiency</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <Download className="h-4 w-4" /> Download PDF
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-indigo-200 gap-3">
            <BarChart4 className="h-4 w-4" /> Analysis View
          </Button>
        </div>
      </div>

      {/* Top Level Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <SummaryCard label="Top Performing Route" value="NCR - Mumbai" subValue="24.2% Margin" icon={<TrendingUp className="h-5 w-5" />} color="emerald" />
        <SummaryCard label="Average Trip Profit" value={formatCurrency(1250000)} subValue="Across all lanes" icon={<DollarSign className="h-5 w-5" />} color="blue" />
        <SummaryCard label="Network Efficiency" value="88.4%" subValue="+2.1% vs prev month" icon={<PieChart className="h-5 w-5" />} color="indigo" />
      </div>

      {/* Route List */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <h3 className="text-xl font-black text-slate-900 tracking-tight">Mission Lane Performance</h3>
           <div className="flex gap-4">
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400">Current Quarter</Button>
              <div className="h-10 w-px bg-slate-100" />
              <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-blue-600">Filter Routes</Button>
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Route / Lane</th>
                <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Trips</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Total Revenue</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Costs</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Net Profit</th>
                <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Margin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.map((route, i) => (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                        <Map className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{route.name}</p>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-0.5">Primary Corridor</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-center text-sm font-black text-slate-600">{route.tripCount}</td>
                  <td className="px-10 py-8 text-right text-sm font-black text-slate-900">{formatCurrency(route.revenue)}</td>
                  <td className="px-10 py-8 text-right text-sm font-black text-rose-500">-{formatCurrency(route.expenses)}</td>
                  <td className="px-10 py-8 text-right">
                    <p className={cn(
                      "text-sm font-black",
                      route.profit >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatCurrency(route.profit)}
                    </p>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={cn(
                        "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest",
                        route.margin > 20 ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600"
                      )}>
                        {route.margin.toFixed(1)}%
                      </span>
                      <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${route.margin}%` }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <TrendingUp className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-widest">Insufficient mission data for profitability analysis</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, subValue, icon, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-600 text-white shadow-emerald-100',
    blue: 'bg-blue-600 text-white shadow-blue-100',
    indigo: 'bg-indigo-600 text-white shadow-indigo-100'
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden",
      colors[color]
    )}>
      <div className="relative z-10">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{label}</p>
        <h4 className="text-3xl font-black">{value}</h4>
        <p className="text-[10px] font-bold text-white/40 mt-1 uppercase tracking-widest">{subValue}</p>
      </div>
      <div className="absolute right-0 bottom-0 h-24 w-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl" />
    </div>
  );
}
