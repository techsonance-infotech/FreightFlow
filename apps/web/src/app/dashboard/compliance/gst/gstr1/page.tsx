'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function GSTR1Page() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<string>('2026-04');

  const fetchGSTR1 = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compliance/gst/returns?period=${period}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch GSTR-1 data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGSTR1();
  }, [period]);

  const handleDownloadJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GSTR1_${period}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('GSTR-1 JSON downloaded successfully');
  };

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">GSTR-1 Preparation</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Review outward supplies and generate GSTN-compliant JSON</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="month" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold shadow-sm"
          />
          <Button onClick={fetchGSTR1} variant="outline" icon="🔄">
            Refresh
          </Button>
          <Button onClick={handleDownloadJson} disabled={!data || loading} icon="⬇️" className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20">
            Download JSON
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Compiling GSTR-1...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Taxable Value</p>
              <h3 className="text-2xl font-black text-slate-900">{formatAmount(data.totalTaxableValue)}</h3>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total CGST</p>
              <h3 className="text-2xl font-black text-blue-700">{formatAmount(data.totalCGST)}</h3>
            </div>
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Total SGST</p>
              <h3 className="text-2xl font-black text-blue-700">{formatAmount(data.totalSGST)}</h3>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Total IGST</p>
              <h3 className="text-2xl font-black text-amber-700">{formatAmount(data.totalIGST)}</h3>
            </div>
          </div>

          {/* B2B Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-black tracking-widest text-slate-700 uppercase">B2B Invoices (4A, 4B, 4C, 6B, 6C)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Invoice No</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Taxable Val</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">CGST</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">SGST</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">IGST</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.b2b.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                        No B2B invoices found for this period
                      </td>
                    </tr>
                  ) : (
                    data.b2b.map((inv: any, idx: number) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-black text-brand-700">{inv.invoiceNo}</td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{inv.date}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{formatAmount(inv.taxableValue)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">{formatAmount(inv.cgst)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-blue-600">{formatAmount(inv.sgst)}</td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-amber-600">{formatAmount(inv.igst)}</td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">{formatAmount(inv.total)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
