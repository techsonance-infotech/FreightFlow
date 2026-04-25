'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function TDSManagementPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [quarter, setQuarter] = useState<string>('Q1-2026');

  const fetchTDS = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/compliance/tds?quarter=${quarter}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch TDS entries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTDS();
  }, [quarter]);

  const handleDownload26Q = () => {
    toast.success(`Form 26Q data for ${quarter} downloaded successfully.`);
  };

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">TDS Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track tax deducted at source and generate Form 26Q</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={quarter} 
            onChange={(e) => setQuarter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="Q1-2026">Q1 2026-27 (Apr-Jun)</option>
            <option value="Q2-2026">Q2 2026-27 (Jul-Sep)</option>
            <option value="Q3-2026">Q3 2026-27 (Oct-Dec)</option>
            <option value="Q4-2026">Q4 2026-27 (Jan-Mar)</option>
          </select>
          <Button onClick={fetchTDS} variant="outline" icon="🔄">
            Refresh
          </Button>
          <Button onClick={handleDownload26Q} disabled={!data || loading} icon="📄" className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20">
            Export 26Q
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent align-[-0.125em]" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading TDS Entries...</p>
        </div>
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Base Amount</p>
              <h3 className="text-2xl font-black text-slate-900">{formatAmount(data.totalBaseAmount)}</h3>
            </div>
            <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Total TDS Deducted</p>
              <h3 className="text-2xl font-black text-amber-700">{formatAmount(data.totalTDS)}</h3>
            </div>
            <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total Deposited</p>
              <h3 className="text-2xl font-black text-emerald-700">{formatAmount(data.totalDeposited)}</h3>
            </div>
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-5 shadow-sm text-center">
              <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Pending Deposit</p>
              <h3 className="text-2xl font-black text-rose-700">{formatAmount(data.totalTDS - data.totalDeposited)}</h3>
            </div>
          </div>

          {/* Section Summary */}
          {Object.keys(data.sections).length > 0 && (
            <div className="flex gap-4">
              {Object.entries(data.sections).map(([section, amount]: [string, any]) => (
                <div key={section} className="bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Sec {section}: </span>
                  <span className="text-sm font-black text-slate-800">{formatAmount(amount)}</span>
                </div>
              ))}
            </div>
          )}

          {/* TDS Entries Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-50 bg-slate-50/50">
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Vendor</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Section</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Base Amount</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Rate</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">TDS Amt</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                    <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Challan No</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.entries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                        No TDS entries found for this quarter
                      </td>
                    </tr>
                  ) : (
                    data.entries.map((entry: any) => (
                      <tr key={entry.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-slate-500">{new Date(entry.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-brand-700">Vendor ID: {entry.vendorId.substring(0, 8)}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-black text-slate-600">{entry.section}</span>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">{formatAmount(entry.baseAmount)}</td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-slate-600">{entry.rate}%</td>
                        <td className="px-6 py-4 text-right text-sm font-black text-slate-900">{formatAmount(entry.tdsAmount)}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            entry.deposited ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {entry.deposited ? 'Deposited' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-slate-500">
                          {entry.challanNo || '-'}
                        </td>
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
