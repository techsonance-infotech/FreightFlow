'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Package, FileText, Edit, Trash2, Inbox, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { LRInvoiceDownloader } from '@/components/orders/LRInvoiceDownloader';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function TodayLRWidget() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/v1/orders?limit=10');
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
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden flex flex-col h-[480px] transition-all hover:shadow-2xl hover:shadow-blue-500/5">
      {/* Title Area */}
      <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">Today's Lorry Receipts</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Operational Overview</p>
          </div>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-[9px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border-blue-100">
           {data.length} Records
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-md">
            <tr>
              <th className="pl-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">LR No</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
              <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Docs</th>
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
                  <div className="flex flex-col items-center justify-center">
                    <Inbox className="h-10 w-10 text-slate-200 mb-2" strokeWidth={1.5} />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No LR orders today</p>
                  </div>
                </td>
              </tr>
            ) : data.map((item, i) => (
              <React.Fragment key={item.id}>
                <tr 
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className={cn(
                    "hover:bg-slate-50/50 transition-all group cursor-pointer",
                    expandedId === item.id && "bg-blue-50/30"
                  )}
                >
                  <td className="pl-6 py-4">
                    <span className="text-[10px] font-black text-slate-300">0{i + 1}</span>
                  </td>
                  <td className="px-4 py-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <p className="font-black text-slate-900 text-xs tracking-tighter uppercase">#{item.lrNo}</p>
                           <p className="text-[9px] font-bold text-blue-600 uppercase tracking-tighter truncate max-w-[100px]">{item.dealer?.name || 'Retail Client'}</p>
                        </div>
                        <ChevronDown className={cn("h-3 w-3 text-slate-300 transition-transform", expandedId === item.id && "rotate-180 text-blue-500")} />
                     </div>
                  </td>
                  <td className="px-4 py-4 text-[10px] font-black text-slate-700">
                    {format(new Date(item.date), 'dd MMM')}
                  </td>
                  <td className="px-4 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                     <div className="flex items-center justify-center gap-1">
                        <LRInvoiceDownloader 
                          orderId={item.id} 
                          variant="print" 
                          className="h-7 w-7 p-0 rounded-lg hover:bg-white text-slate-400 hover:text-blue-600 transition-all border border-transparent hover:border-blue-100 shadow-none"
                          label=" "
                        />
                        <LRInvoiceDownloader 
                          orderId={item.id} 
                          variant="receipt" 
                          className="h-7 w-7 p-0 rounded-lg hover:bg-white text-slate-400 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 shadow-none"
                          label=" "
                        />
                     </div>
                  </td>
                  <td className="pr-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <Link href={`/dashboard/orders/${item.id}`}>
                        <button className="h-7 w-7 flex items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
                {expandedId === item.id && (
                  <tr className="bg-blue-50/10">
                    <td colSpan={5} className="px-6 py-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-blue-600" />
                          <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-500">Items Breakdown</h4>
                        </div>
                        <div className="bg-white rounded-2xl border border-blue-100 overflow-hidden shadow-sm">
                          <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                              <tr>
                                <th className="px-4 py-2 text-[8px] font-black uppercase text-slate-400">Product</th>
                                <th className="px-2 py-2 text-[8px] font-black uppercase text-slate-400 text-center">Qty</th>
                                <th className="px-2 py-2 text-[8px] font-black uppercase text-slate-400 text-right">Rate</th>
                                <th className="px-2 py-2 text-[8px] font-black uppercase text-slate-400 text-right">Amt</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                              {(item.details || []).map((detail: any, dIdx: number) => {
                                const unitPrice = (item.rate || 0) / 100;
                                const rowAmount = item.rateOn === 'weight' 
                                  ? (detail.weight || 0) * unitPrice 
                                  : (detail.boxCount || 0) * unitPrice;
                                return (
                                  <tr key={dIdx}>
                                    <td className="px-4 py-2 text-[10px] font-bold text-slate-700">{detail.productName}</td>
                                    <td className="px-2 py-2 text-[10px] font-black text-slate-900 text-center">{detail.boxCount}</td>
                                    <td className="px-2 py-2 text-[9px] font-black text-slate-500 text-right">₹{unitPrice}</td>
                                    <td className="px-2 py-2 text-[9px] font-black text-blue-600 text-right">₹{rowAmount.toFixed(0)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        <Button 
                          onClick={() => window.location.href = `/dashboard/orders/${item.id}`}
                          className="w-full h-8 rounded-lg bg-slate-900 text-white font-black uppercase tracking-widest text-[8px] flex items-center justify-center gap-2"
                        >
                          <FileText className="h-3 w-3" /> Full Details
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-50/50 flex justify-end border-t border-slate-100 shrink-0">
        <Button 
          variant="ghost"
          onClick={() => window.location.href = '/dashboard/orders'}
          className="text-blue-600 hover:bg-blue-50 rounded-xl h-9 px-6 font-black uppercase tracking-widest text-[9px] transition-all"
        >
          Detailed Ledger
        </Button>
      </div>
    </div>
  );
}
