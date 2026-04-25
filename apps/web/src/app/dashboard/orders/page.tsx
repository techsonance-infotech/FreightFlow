'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, FileText, Printer, 
  MoreHorizontal, Eye, Edit, Trash2, ArrowUpDown,
  Download, Calendar, CheckCircle2, Clock, AlertCircle,
  MapPin, Truck
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
      case 'created': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'loaded': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'in_transit': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'created': return <FileText className="h-3 w-3" />;
      case 'delivered': return <CheckCircle2 className="h-3 w-3" />;
      case 'in_transit': return <Clock className="h-3 w-3" />;
      case 'cancelled': return <AlertCircle className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lorry Receipts (LR)</h1>
          <p className="text-muted-foreground">Manage and track your transport orders and LR lifecycle</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <Link
            href="/dashboard/orders/new"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all text-sm font-semibold shadow-md shadow-primary/20"
          >
            <Plus className="h-4 w-4" />
            Create New LR
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Today's LRs</p>
          <h3 className="text-2xl font-bold mt-1">12</h3>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
            <Plus className="h-3 w-3" /> 4 since yesterday
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">In Transit</p>
          <h3 className="text-2xl font-bold mt-1">48</h3>
          <div className="flex items-center gap-1 text-xs text-amber-600 mt-2 font-medium">
            <Clock className="h-3 w-3" /> 15 delayed
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Delivered (MTD)</p>
          <h3 className="text-2xl font-bold mt-1">156</h3>
          <div className="flex items-center gap-1 text-xs text-green-600 mt-2 font-medium">
            <CheckCircle2 className="h-3 w-3" /> 98% success rate
          </div>
        </div>
        <div className="bg-card border rounded-xl p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">Total Revenue (MTD)</p>
          <h3 className="text-2xl font-bold mt-1">₹ 8.4L</h3>
          <div className="flex items-center gap-1 text-xs text-blue-600 mt-2 font-medium">
            <ArrowUpDown className="h-3 w-3" /> 12% vs last month
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by LR No, Dealer, Consignee, or Bill No..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 transition-all text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
            <Calendar className="h-4 w-4" />
            Date Range
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
                <th className="px-4 py-3 text-left font-medium">LR Details</th>
                <th className="px-4 py-3 text-left font-medium">Dealer & Consignee</th>
                <th className="px-4 py-3 text-left font-medium">Route & Vehicle</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
                <th className="px-4 py-3 text-center font-medium">Status</th>
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
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-10 w-10 opacity-20" />
                      <p>No LRs found. Create your first order to get started.</p>
                      <Link href="/dashboard/orders/new" className="text-primary font-medium hover:underline">Create LR Now</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-bold text-primary flex items-center gap-2">
                        LR #{order.lrNo}
                        {order.gstBillNo && <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-normal text-muted-foreground">B: {order.gstBillNo}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(order.date), 'dd MMM yyyy')}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-foreground">{order.dealer?.name}</div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1 italic">
                        to {order.consignee?.name}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-xs font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {order.fromLocation} → {order.toLocation}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Truck className="h-3 w-3" />
                        {order.vehicle?.regNo || 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="font-bold">₹{(order.totalAmount / 100).toLocaleString('en-IN')}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">Incl. GST</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </div>
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
            Showing {orders.length} of {meta.total} orders
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => fetchOrders(meta.page - 1)}
              className="px-3 py-1 text-xs border rounded hover:bg-muted disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchOrders(meta.page + 1)}
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
