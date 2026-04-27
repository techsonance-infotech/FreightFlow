'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, FileText, Printer, 
  MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown,
  Download, Calendar, CheckCircle2, Clock, AlertCircle,
  MapPin, Truck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/orders?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      setOrders(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'loaded': return 'bg-purple-50 text-purple-600 border-purple-100';
      case 'in_transit': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Lorry Receipts (LR)</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage and track your transport orders and LR lifecycle</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export CSV
          </Button>
          <Link href="/dashboard/orders/new">
            <Button icon={<Plus className="h-4 w-4" />}>
              Create New LR
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary Cards (Matching Reference Pattern) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Today's LRs</p>
          <h3 className="text-xl font-black text-slate-900">12</h3>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">+4 since yesterday</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Transit</p>
          <h3 className="text-xl font-black text-slate-900">48</h3>
          <p className="text-[10px] font-bold text-amber-500 mt-1 uppercase tracking-tighter">15 delayed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Delivered (MTD)</p>
          <h3 className="text-xl font-black text-slate-900">156</h3>
          <p className="text-[10px] font-bold text-emerald-500 mt-1 uppercase tracking-tighter">98% success rate</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Revenue (MTD)</p>
          <h3 className="text-xl font-black text-slate-900">₹ 8.4L</h3>
          <p className="text-[10px] font-bold text-blue-500 mt-1 uppercase tracking-tighter">12% growth</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Input 
            placeholder="Search by LR No, Dealer, Consignee, or Bill No..." 
            icon={<Search className="h-4 w-4" />} 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="bg-white border-none focus:ring-0" 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="h-10 px-4">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button variant="outline" className="h-10 px-4">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Data Table Section (Matching Reference Pattern) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">LR Details</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Dealer & Consignee</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Route & Vehicle</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-10 w-10 text-slate-200" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No LRs found</p>
                      <Link href="/dashboard/orders/new" className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline">Create LR Now</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-black text-slate-900 uppercase tracking-tighter">LR #{order.lrNo}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1 mt-0.5">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.date), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700">{order.dealer?.name}</div>
                      <div className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                        to {order.consignee?.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-black text-slate-600 flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-blue-500" />
                        {order.fromLocation} → {order.toLocation}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {order.vehicle?.regNo || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="font-black text-slate-900">₹{(order.totalAmount / 100).toLocaleString('en-IN')}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Incl. GST</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border shadow-sm ${getStatusColor(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
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
            Showing {orders.length} of {meta.total} orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === 1}
              onClick={() => fetchOrders(meta.page - 1)}
              className="h-8 text-[10px] font-black uppercase"
            >
              <ChevronLeft className="h-3 w-3 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchOrders(meta.page + 1)}
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
