'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowDownToLine, Inbox, Package, Pencil } from 'lucide-react';
import Link from 'next/link';
import { PalletInvoiceDownloader } from '@/components/orders/PalletInvoiceDownloader';
import { cn, formatUtcDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function TodayPalletWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/pallets?limit=10');
      const result = await response.json();
      if (response.ok) setData(result.data);
    } catch {
      toast.error('Failed to load today\'s pallets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[480px] transition-all hover:shadow-2xl hover:shadow-blue-500/5">
      {/* Title Area */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
            <ArrowDownToLine className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Today's Pallet Load</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Inventory Tracking</p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border-emerald-100">
           {data.length} Batches
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="pl-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sr. No</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">LR Ref</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Partner</th>
              <th className="pr-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              Array(5).fill(0).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-6 py-6"><div className="h-10 bg-slate-50/50 rounded-xl" /></td>
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <Inbox className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pallet records today</p>
                </td>
              </tr>
            ) : data.map((item, i) => (
              <tr key={item.id} className="hover:bg-slate-50/50 transition-all group">
                <td className="pl-6 py-4 text-[10px] font-black text-slate-300">
                  0{i + 1}
                </td>
                <td className="px-4 py-4">
                   <div>
                      <p className="font-black text-slate-900 text-xs tracking-tighter uppercase">LR #{item.lrNo}</p>
                      <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter">
                         {item.palletDetails?.reduce((acc: number, d: any) => acc + d.qty, 0) || 0} Units
                      </p>
                   </div>
                </td>
                <td className="px-4 py-4 text-[10px] font-black text-slate-700">
                  {formatUtcDate(item.date, 'dd MMM')}
                </td>
                <td className="px-4 py-4">
                  <p className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[120px]">{item.dealer?.name || 'Retail Client'}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Partner Entity</p>
                </td>
                <td className="pr-6 py-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <PalletInvoiceDownloader 
                      palletId={item.id} 
                      lrNo={item.lrNo} 
                      variant="invoice" 
                      showIconOnly 
                      className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm hover:border-black hover:text-black transition-all text-xs"
                    />
                    <Link href={`/dashboard/pallets/${item.id}`}>
                      <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all text-xs"><Pencil className="h-3.5 w-3.5" /></button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/50 flex justify-end border-t border-slate-100 shrink-0">
        <Button 
          variant="ghost"
          onClick={() => window.location.href = '/dashboard/pallets'}
          className="text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-6 font-black uppercase tracking-widest text-[9px] transition-all"
        >
          Detailed Inventory
        </Button>
      </div>
    </div>
  );
}
