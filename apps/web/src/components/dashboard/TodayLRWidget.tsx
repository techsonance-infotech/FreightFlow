'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Package, Printer, FileText, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function TodayLRWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/orders?limit=3');
      const result = await response.json();
      if (response.ok) setData(result.data);
    } catch {
      toast.error('Failed to load today\'s LR');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full transition-all hover:shadow-md">
      {/* Title Area — Labour Registry Style */}
      <div className="p-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center text-xl shadow-sm border border-blue-100">
            📦
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Today's Lorry Receipts</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Operational Overview</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 border-y border-slate-50">
            <tr>
              <th className="pl-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">LR No</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order Date</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Total Weight</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Receipt</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">LR Print</th>
              <th className="pr-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={7} className="px-8 py-6"><div className="h-10 bg-slate-50/50 rounded-xl" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <p className="text-3xl mb-4">📭</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No LR orders today</p>
                </td>
              </tr>
            ) : data.map((item, i) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="pl-8 py-5">
                  <span className="text-[10px] font-black text-slate-300">0{i + 1}</span>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-neutral-100 flex items-center justify-center text-lg shadow-sm border border-neutral-200/50">
                      📄
                    </div>
                    <div>
                      <p className="font-black text-slate-900 text-xs tracking-tighter uppercase">#{item.lrNo}</p>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter truncate max-w-[100px]">{item.dealer?.name || 'Retail Client'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-5 text-[10px] font-black text-slate-700">
                  {format(new Date(item.date), 'dd/MM/yyyy')}
                </td>
                <td className="px-4 py-5">
                  <div className="font-black text-blue-600 text-xs tabular-nums">
                    {item.totalWeight || item.details?.reduce((acc: number, d: any) => acc + (parseFloat(d.weight) || 0), 0) || 0}kg
                  </div>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Gross Weight</p>
                </td>
                <td className="px-4 py-5 text-center">
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">🖨️</button>
                </td>
                <td className="px-4 py-5 text-center">
                  <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors">📄</button>
                </td>
                <td className="pr-8 py-5">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all text-xs">✏️</button>
                    <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm hover:border-red-200 hover:text-red-600 transition-all text-xs">🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 bg-slate-50/50 flex justify-end border-t border-slate-100">
        <Button 
          onClick={() => window.location.href = '/dashboard/orders'}
          className="bg-blue-600 text-white hover:bg-blue-700 rounded-2xl h-11 px-8 font-black uppercase tracking-[0.1em] text-[10px] shadow-lg shadow-blue-600/20 transition-transform active:scale-95"
        >
          View All Orders
        </Button>
      </div>
    </div>
  );
}
