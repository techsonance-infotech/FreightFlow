'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Calendar, Edit, Trash2, 
  Download, Package, Inbox, Scale, BarChart3,
  RefreshCw, CheckCircle2, AlertCircle, Box, Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { PalletInvoiceDownloader } from '@/components/orders/PalletInvoiceDownloader';

export default function PalletReturnListPage() {
  const [pallets, setPallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [expandedPalletId, setExpandedPalletId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const fetchPallets = async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/v1/pallets?page=${page}&limit=10&search=${search}&type=RETURN`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setPallets(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch return records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchPallets(1), 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100 text-blue-600">
              <RefreshCw className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Pallet Returns</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12 text-blue-500/50">Reverse Logistics Pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Link href="/dashboard/pallets/returns/new">
            <Button className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
              <Plus className="h-4 w-4" /> Log Return
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary - Minimal for Returns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Active Returns', value: meta.total.toString(), icon: <RefreshCw className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Pending Collection', value: '12', icon: <Box className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Completed Hub', value: '45', icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
          <Input 
            placeholder="Search by LR No, Consignee or Dealer..." 
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 font-bold"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex items-center gap-2 bg-white px-4 rounded-2xl shadow-sm border border-slate-50">
          <Calendar className="h-4 w-4 text-blue-500 ml-2" />
          <input 
            type="date" 
            className="h-16 bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none" 
            value={filters.startDate}
            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
          />
          <span className="text-slate-300">→</span>
          <input 
            type="date" 
            className="h-16 bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none" 
            value={filters.endDate}
            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
          />
        </div>

        {(filters.startDate || filters.endDate || search) && (
          <Button 
            variant="ghost" 
            className="h-16 px-6 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-2xl"
            onClick={() => {
              setFilters({ startDate: '', endDate: '' });
              setSearch('');
            }}
          >
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Return ID</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Logistics Context</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-blue-600">Return Payload</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tax (%)</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-6"><div className="h-12 bg-slate-50 rounded-2xl" /></td>
                  </tr>
                ))
              ) : pallets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Inbox className="h-12 w-12 text-slate-100" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No return records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pallets.map((pallet: any) => (
                  <React.Fragment key={pallet.id}>
                    <tr 
                      className={cn(
                        "hover:bg-slate-50/50 transition-all group cursor-pointer",
                        expandedPalletId === pallet.id && "bg-blue-50/30"
                      )}
                      onClick={() => setExpandedPalletId(expandedPalletId === pallet.id ? null : pallet.id)}
                    >
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 text-blue-400">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 tracking-tighter uppercase text-xs">#{pallet.lrNo}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {format(new Date(pallet.date), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-slate-700 uppercase text-xs">{pallet.dealer?.name || pallet.companyName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Vehicle: {pallet.vehicle?.regNo || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Box className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                            {pallet.consigneeDetails?.reduce((acc: number, d: any) => acc + d.qty, 0)} Units Returned
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {pallet.consigneeDetails?.length} Consignees
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right font-black text-slate-900">{pallet.gstPct}%</td>
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/dashboard/pallets/returns/${pallet.id}`} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Edit className="h-4 w-4" /></Link>
                        </div>
                      </td>
                    </tr>
                    {expandedPalletId === pallet.id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={5} className="px-12 py-8 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Return Breakdown */}
                            <div className="lg:col-span-2 space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Box className="h-4 w-4 text-blue-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Return Consignees</h4>
                              </div>
                              <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50/50">
                                    <tr>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Consignee</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Rate (₹)</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(pallet.consigneeDetails || []).map((detail: any, dIdx: number) => (
                                      <tr key={dIdx}>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.consigneeName}</td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.qty}</td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-right">{(detail.rate / 100).toLocaleString()}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Financial Summary */}
                            <div className="space-y-6">
                              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Financial Context</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Billing Party</p>
                                    <p className="text-xs font-black text-slate-700 mt-1">{pallet.dealer?.name || 'N/A'}</p>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Subtotal</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        ₹{(pallet.subtotal / 100).toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Bill</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        ₹{(pallet.totalAmount / 100).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
