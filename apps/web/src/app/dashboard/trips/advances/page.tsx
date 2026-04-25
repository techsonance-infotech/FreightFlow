'use client';

import React, { useState, useEffect } from 'react';
import { 
  Wallet, User, ArrowRight, History, 
  TrendingDown, AlertTriangle, CheckCircle2,
  Filter, Search
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DriverAdvancesPage() {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdvances = async () => {
      try {
        setLoading(true);
        // This would typically be a specialized endpoint for the ledger
        const res = await fetch('/api/v1/trips?limit=100'); 
        const data = await res.json();
        // Flatten advances from trips for demo
        const allAdvances = (data.data || []).flatMap((t: any) => 
          (t.advances || []).map((a: any) => ({ ...a, trip: t, driver: t.driver }))
        );
        setAdvances(allAdvances);
      } catch (error) {
        toast.error('Failed to fetch advance ledger');
      } finally {
        setLoading(false);
      }
    };
    fetchAdvances();
  }, []);

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Driver Advance Ledger</h1>
          <p className="text-slate-500 font-medium">Monitor disbursements, recoveries, and outstanding balances</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="p-3 bg-blue-50 rounded-2xl text-blue-600 w-fit mb-4"><Wallet className="h-6 w-6" /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Disbursed (MTD)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 2.45L</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
          <div className="p-3 bg-green-50 rounded-2xl text-green-600 w-fit mb-4"><TrendingDown className="h-6 w-6" /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Recovered</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 1.80L</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="p-3 bg-red-50 rounded-2xl text-red-600 w-fit mb-4"><AlertTriangle className="h-6 w-6" /></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Outstanding Exposure</p>
          <h3 className="text-2xl font-black text-red-600 mt-1">₹ 65,400</h3>
          <div className="absolute right-0 top-0 h-full w-2 bg-red-500/10" />
        </div>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-4">
           <div className="relative flex-1">
             <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Filter by Driver or Trip ID..." className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/10" />
           </div>
           <button className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all"><Filter className="h-5 w-5" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-8 py-4 text-left">Advance Date</th>
                <th className="px-8 py-4 text-left">Captain Details</th>
                <th className="px-8 py-4 text-left">Mission / Purpose</th>
                <th className="px-8 py-4 text-center">Mode</th>
                <th className="px-8 py-4 text-right">Amount</th>
                <th className="px-8 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-16"><td colSpan={6} className="px-8"><div className="h-8 bg-slate-50 rounded-xl w-full" /></td></tr>
                ))
              ) : advances.length === 0 ? (
                <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs opacity-50">No advance history found in current period</td></tr>
              ) : (
                advances.map((adv: any) => (
                  <tr key={adv.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5 font-bold text-slate-600">{format(new Date(adv.date), 'dd MMM yyyy')}</td>
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900">{adv.driver?.name}</div>
                      <div className="text-[10px] text-slate-400 font-bold">Emp ID: {adv.driver?.empId}</div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="font-bold text-blue-600 text-xs">TR-{adv.trip?.id?.slice(0, 4).toUpperCase()}</div>
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-[200px]">{adv.purpose}</div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">{adv.mode}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-slate-900">{formatCurrency(adv.amount)}</td>
                    <td className="px-8 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        adv.status === 'recovered' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {adv.status}
                      </span>
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
