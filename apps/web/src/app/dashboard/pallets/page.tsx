'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Layers, Printer, MoreHorizontal, 
  Eye, Building2, Truck, Calendar, Download,
  ArrowUpDown, Filter, Package, ChevronLeft, ChevronRight,
  MapPin, Box
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PalletListPage() {
  const [pallets, setPallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const fetchPallets = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/pallets?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      setPallets(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch pallet records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPallets();
  }, [search]);

  const calculateTotalQty = (pallet: any) => {
    return pallet.palletDetails?.reduce((sum: number, d: any) => sum + d.qty, 0) || 0;
  };

  const calculateGrandTotal = (pallet: any) => {
    const subtotal = pallet.palletDetails?.reduce((sum: number, d: any) => sum + (Number(d.qty) * Number(d.rate || 0)), 0) || 0;
    const gst = Math.round((subtotal * Number(pallet.gstPct)) / 100);
    return subtotal + gst;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Pallet Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Track pallet inventory, distribution, and billing records</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export Audit
          </Button>
          <Link href="/dashboard/pallets/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              New Pallet Record
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Metrics (Matching Global Blue Pattern) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Available Stock</p>
          <h3 className="text-xl font-black text-slate-900">1,240</h3>
          <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-tighter italic">Main Warehouse</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Circulation</p>
          <h3 className="text-xl font-black text-slate-900">482</h3>
          <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-tighter italic">Tracking Active</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue (MTD)</p>
          <h3 className="text-xl font-black text-slate-900">₹ 2.45L</h3>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter italic">+18% Growth</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search by Company, LR No, or Dealer..." 
            icon={<Search className="h-4 w-4" />} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="bg-white border-none focus:ring-0" 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 px-4">
            <Calendar className="h-4 w-4 mr-2" />
            Select Date
          </Button>
          <Button variant="outline" className="h-10 px-4">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Date & Reference</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Company & Party</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Dealer & Vehicle</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Settlement</th>
                <th className="px-6 py-4 w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-4"><div className="h-10 bg-slate-50 rounded-xl"></div></td>
                  </tr>
                ))
              ) : pallets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Box className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No pallet records found</p>
                      <Link href="/dashboard/pallets/new" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Add First Record</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                pallets.map((pallet: any) => (
                  <tr key={pallet.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 uppercase tracking-tighter">
                        {format(new Date(pallet.date), 'dd MMM yyyy')}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {pallet.lrNo ? `LR #${pallet.lrNo}` : 'Direct Transaction'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{pallet.companyName}</div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                        Code: {pallet.partyCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-black text-slate-600 flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-blue-500" />
                        {pallet.dealer?.name || 'External'}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {pallet.vehicle?.regNo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-black text-xs border border-blue-100 shadow-inner">
                        {calculateTotalQty(pallet)} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-slate-900">₹{(calculateGrandTotal(pallet) / 100).toLocaleString('en-IN')}</div>
                      <div className="text-[9px] font-bold text-emerald-500 uppercase tracking-tighter">Cleared</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-blue-600">
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Showing {pallets.length} of {meta.total} records
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => fetchPallets(meta.page - 1)}
              className="h-8 text-[10px] font-black uppercase"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchPallets(meta.page + 1)}
              className="h-8 text-[10px] font-black uppercase"
            >
              Next <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
