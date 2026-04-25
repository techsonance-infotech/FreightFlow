'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AccountsPayablePage() {
  const [data, setData] = useState<{ buckets: any, items: any[] }>({ buckets: {}, items: [] });
  const [loading, setLoading] = useState(true);

  const fetchAP = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/accounting/reports/ageing?type=AP');
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch Accounts Payable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAP();
  }, []);

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Accounts Payable</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage vendor dues, scheduling, and TDS</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={fetchAP} variant="outline" icon="🔄">
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Calculating Ageing...</p>
        </div>
      ) : (
        <>
          {/* Ageing Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Outstanding</p>
              <h3 className="text-xl font-black text-slate-900">{formatAmount(data.buckets.total || 0)}</h3>
            </div>
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">0 - 30 Days</p>
              <h3 className="text-xl font-black text-emerald-700">{formatAmount(data.buckets['0_30'] || 0)}</h3>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">31 - 60 Days</p>
              <h3 className="text-xl font-black text-blue-700">{formatAmount(data.buckets['31_60'] || 0)}</h3>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">61 - 90 Days</p>
              <h3 className="text-xl font-black text-amber-700">{formatAmount(data.buckets['61_90'] || 0)}</h3>
            </div>
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">90+ Days</p>
              <h3 className="text-xl font-black text-rose-700">{formatAmount(data.buckets['90_plus'] || 0)}</h3>
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Bill No</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Vendor</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Ageing</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Amount Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No outstanding vendor bills</p>
                      </td>
                    </tr>
                  ) : (
                    data.items.map((inv, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-black text-slate-700">{inv.invoiceNo}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-600">{inv.vendor?.name || 'Unknown Vendor'}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{new Date(inv.date).toLocaleDateString('en-IN')}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            inv.daysOverdue > 90 ? 'bg-rose-100 text-rose-700' :
                            inv.daysOverdue > 60 ? 'bg-amber-100 text-amber-700' :
                            inv.daysOverdue > 30 ? 'bg-blue-100 text-blue-700' :
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {inv.daysOverdue} Days
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">
                          {formatAmount(inv.totalAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
