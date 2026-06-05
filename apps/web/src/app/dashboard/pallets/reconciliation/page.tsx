'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Search, Download, 
  TrendingUp, TrendingDown, Package, 
  History, AlertCircle, CheckCircle2,
  Filter, BarChart3, PieChart, Info
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatUtcDate } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

interface PartyBalance {
  partyName: string;
  sent: number;
  returned: number;
  balance: number;
  lastActivity: string;
}

export default function PalletReconciliationPage() {
  const [balances, setBalances] = useState<PartyBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchBalances = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/pallets/reconciliation?search=${search}`);
      const data = await res.json();
      setBalances(data);
    } catch (error) {
      toast.error('Failed to fetch reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBalances();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleExport = () => {
    const exportData = balances.map(b => ({
      'Party Name': b.partyName,
      'Total Sent': b.sent,
      'Total Returned': b.returned,
      'Outstanding Balance': b.balance,
      'Last Activity': formatUtcDate(b.lastActivity, 'dd MMM yyyy'),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "PalletBalance");
    XLSX.writeFile(wb, `Pallet_Reconciliation_${new Date().getTime()}.xlsx`);
    toast.success("Data exported to Excel");
  };

  const totalOutstanding = balances.reduce((sum, b) => sum + b.balance, 0);
  const totalSent = balances.reduce((sum, b) => sum + b.sent, 0);
  const totalReturned = balances.reduce((sum, b) => sum + b.returned, 0);

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/dashboard/pallets">
            <button className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Pallet Reconciliation</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Global Inventory Balance & Audit</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={handleExport}
            variant="outline" 
            className="rounded-2xl h-14 px-8 border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[11px]"
          >
            <Download className="h-4 w-4 mr-2" /> Export Audit
          </Button>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Outstanding" 
          value={totalOutstanding} 
          icon={<Package className="h-6 w-6 text-blue-600" />} 
          color="blue"
          subText="Currently at parties"
        />
        <StatCard 
          label="Global Sent" 
          value={totalSent} 
          icon={<TrendingUp className="h-6 w-6 text-emerald-600" />} 
          color="emerald"
          subText="Cumulative Outward"
        />
        <StatCard 
          label="Global Returned" 
          value={totalReturned} 
          icon={<TrendingDown className="h-6 w-6 text-amber-600" />} 
          color="amber"
          subText="Cumulative Inward"
        />
        <StatCard 
          label="Recovery Rate" 
          value={totalSent > 0 ? `${Math.round((totalReturned / totalSent) * 100)}%` : '0%'} 
          icon={<History className="h-6 w-6 text-purple-600" />} 
          color="purple"
          subText="Inventory Efficiency"
        />
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          <Input 
            placeholder="Filter by Dealer or Consignee name..." 
            className="pl-14 h-14 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 font-bold text-sm"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100"><Filter className="h-4 w-4 text-slate-400" /></Button>
           <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100"><BarChart3 className="h-4 w-4 text-slate-400" /></Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Party / Entity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Total Sent</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Total Returned</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Outstanding</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-12 bg-slate-50 rounded-2xl" /></td>
                  </tr>
                ))
              ) : balances.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center">
                         <PieChart className="h-10 w-10 text-slate-200" />
                      </div>
                      <div>
                        <p className="text-lg font-black text-slate-900">No Inventory Found</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Start by adding outward loads</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                balances.map((row, i) => (
                  <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                    <td className="px-8 py-8">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-xl shadow-slate-200">
                          {row.partyName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-black text-slate-900 text-base tracking-tight">{row.partyName}</div>
                          <div className="flex items-center gap-2 mt-1">
                             <History className="h-3 w-3 text-slate-300" />
                             <span className="text-[10px] font-bold text-slate-400 uppercase">Last Activity: {formatUtcDate(row.lastActivity, 'dd MMM yyyy')}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-600 font-black text-sm">
                        <TrendingUp className="h-3 w-3" />
                        {row.sent}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-600 font-black text-sm">
                        <TrendingDown className="h-3 w-3" />
                        {row.returned}
                      </span>
                    </td>
                    <td className="px-8 py-8 text-center">
                      <div className={cn(
                        "text-2xl font-black tracking-tighter",
                        row.balance > 0 ? "text-slate-900" : "text-emerald-500"
                      )}>
                        {row.balance}
                      </div>
                      <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Pallets</p>
                    </td>
                    <td className="px-8 py-8 text-right">
                      {row.balance === 0 ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest">
                          <CheckCircle2 className="h-3 w-3" /> Reconciled
                        </div>
                      ) : row.balance > 20 ? (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-widest">
                          <AlertCircle className="h-3 w-3" /> High Risk
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                          <Info className="h-3 w-3" /> Pending
                        </div>
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

function StatCard({ label, value, icon, color, subText }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };

  return (
    <div className={cn("p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden group", colors[color])}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
           <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
              {icon}
           </div>
           <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{subText}</div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{label}</p>
        <p className="text-4xl font-black tracking-tighter leading-none">{value}</p>
      </div>
      {/* Background Decor */}
      <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </div>
  );
}
