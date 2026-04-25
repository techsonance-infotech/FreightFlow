'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Layers, Printer, MoreHorizontal, 
  Eye, Building2, Truck, Calendar, Download,
  ArrowUpDown, Filter, Package
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
    const subtotal = pallet.palletDetails?.reduce((sum: number, d: any) => sum + (d.qty * d.rate), 0) || 0;
    const gst = Math.round((subtotal * Number(pallet.gstPct)) / 100);
    return subtotal + gst;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pallet Management</h1>
          <p className="text-muted-foreground">Track pallet inventory, distribution, and billing records</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            href="/dashboard/pallets/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            New Pallet Record
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Company, LR No, or Dealer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
            <Calendar className="h-4 w-4" />
            Date
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-muted-foreground border-b">
                <th className="px-4 py-3 text-left font-medium">Date & LR</th>
                <th className="px-4 py-3 text-left font-medium">Company & Party</th>
                <th className="px-4 py-3 text-left font-medium">Dealer & Vehicle</th>
                <th className="px-4 py-3 text-center font-medium">Qty</th>
                <th className="px-4 py-3 text-right font-medium">Total Amount</th>
                <th className="px-4 py-3 text-right font-medium w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-4 py-4"><div className="h-10 bg-muted rounded"></div></td>
                  </tr>
                ))
              ) : pallets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Layers className="h-10 w-10 opacity-20" />
                      <p>No pallet records found.</p>
                      <Link href="/dashboard/pallets/new" className="text-primary font-medium hover:underline">Add First Record</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                pallets.map((pallet: any) => (
                  <tr key={pallet.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-medium">{format(new Date(pallet.date), 'dd MMM yyyy')}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {pallet.lrNo ? `LR #${pallet.lrNo}` : 'No LR Link'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-primary flex items-center gap-2">
                        <Building2 className="h-3 w-3" />
                        {pallet.companyName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Code: {pallet.partyCode || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-medium">{pallet.dealer?.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {pallet.vehicle?.regNo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold text-xs">
                        {calculateTotalQty(pallet)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-bold">
                      ₹{(calculateGrandTotal(pallet) / 100).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary">
                          <Printer className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-primary">
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

        {/* Pagination */}
        <div className="px-4 py-3 bg-muted/30 border-t flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Showing {pallets.length} of {meta.total} records
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => fetchPallets(meta.page - 1)}
              className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchPallets(meta.page + 1)}
              className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
