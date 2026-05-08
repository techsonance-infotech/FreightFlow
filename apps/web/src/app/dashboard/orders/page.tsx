'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, FileText, Edit, Trash2, 
  Download, Calendar, MapPin, Truck, ChevronDown, ChevronUp, Package, Hash, Info,
  ClipboardList, CheckCircle2, IndianRupee
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import { LorryReceiptTemplate } from '@/components/orders/LorryReceiptTemplate';
import { LRInvoiceDownloader } from '@/components/orders/LRInvoiceDownloader';

export default function OrderListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [printOrder, setPrintOrder] = useState<any | null>(null);
  const [printOrders, setPrintOrders] = useState<any[] | null>(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [stats, setStats] = useState({
    todayCount: 0,
    inTransitCount: 0,
    deliveredCount: 0,
    monthlyRevenue: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/orders/stats');
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/v1/orders?page=${page}&limit=10&search=${search}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      if (filters.status) url += `&status=${filters.status}`;
      
      const res = await fetch(url);
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
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchOrders, 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

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
    <div className="p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100">
              <ClipboardList className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Lorry Receipts</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Fleet Operations & Order Management</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
          <Link href="/dashboard/orders/new">
            <Button className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
              <Plus className="h-4 w-4" /> Create New LR
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Today LRs', value: stats.todayCount.toString(), icon: <ClipboardList className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'In Transit', value: stats.inTransitCount.toString(), icon: <Truck className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Delivered', value: stats.deliveredCount.toString(), icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'Monthly Rev', value: `₹${(stats.monthlyRevenue / 1000).toFixed(1)}k`, icon: <IndianRupee className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50' },
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
            placeholder="Search by LR No, Dealer, Consignee or Vehicle..." 
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100"
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

        <select 
          className="h-16 px-8 rounded-2xl border-none bg-white shadow-sm font-black text-[11px] uppercase tracking-widest outline-none appearance-none cursor-pointer"
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Statuses</option>
          <option value="created">Created</option>
          <option value="loaded">Loaded</option>
          <option value="in_transit">In Transit</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>

        {(filters.startDate || filters.endDate || filters.status || search) && (
          <Button 
            variant="ghost" 
            className="h-16 px-6 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-2xl"
            onClick={() => {
              setFilters({ startDate: '', endDate: '', status: '' });
              setSearch('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {selectedOrders.length > 0 && (
        <div className="bg-blue-600 p-4 rounded-2xl text-white flex items-center justify-between shadow-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4 ml-4">
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center font-black">{selectedOrders.length}</div>
            <p className="text-xs font-black uppercase tracking-widest">Lorry Receipts Selected</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white rounded-xl h-10 px-6 font-black text-[10px] uppercase"
              onClick={() => {
                const toPrint = orders.filter(o => selectedOrders.includes(o.id));
                setPrintOrders(toPrint);
              }}
            >
              Bulk Print
            </Button>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white rounded-xl h-10 px-6 font-black text-[10px] uppercase">Update Status</Button>
            <Button variant="ghost" className="text-white hover:bg-white/10 rounded-xl h-10 px-4" onClick={() => setSelectedOrders([])}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-5 w-16">
                  <input 
                    type="checkbox" 
                    className="rounded-lg border-slate-200" 
                    checked={selectedOrders.length === orders.length && orders.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedOrders(orders.map(o => o.id));
                      else setSelectedOrders([]);
                    }}
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">LR Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Party Information</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-blue-600">Logistics</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-6"><div className="h-12 bg-slate-50 rounded-2xl" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="h-12 w-12 text-slate-100" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No order records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: any, idx: number) => (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={cn(
                        "hover:bg-slate-50/50 transition-all group cursor-pointer",
                        expandedOrderId === order.id && "bg-blue-50/30",
                        selectedOrders.includes(order.id) && "bg-blue-50"
                      )}
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-3">
                          <input 
                            type="checkbox" 
                            className="rounded-lg border-slate-200" 
                            checked={selectedOrders.includes(order.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedOrders(s => [...s, order.id]);
                              else setSelectedOrders(s => s.filter(id => id !== order.id));
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 text-slate-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 tracking-tighter uppercase text-xs">#{order.lrNo}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {format(new Date(order.date), 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-slate-700 uppercase text-xs">{order.dealer?.name}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          to {order.consignee?.name}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Truck className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">{order.vehicle?.plateNumber || 'Self Service'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase truncate max-w-[150px]">{order.fromLocation} → {order.toLocation}</span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="font-black text-slate-900">₹{((order.totalAmount || 0) / 100).toLocaleString()}</div>
                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-1">Settled: Cash</div>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                          getStatusColor(order.status)
                        )}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <LRInvoiceDownloader 
                            orderId={order.id} 
                            variant="print" 
                            label="Print"
                            className="h-9 px-3 rounded-xl bg-white border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <LRInvoiceDownloader 
                            orderId={order.id} 
                            variant="receipt" 
                            label="Receipt"
                            className="h-9 px-3 rounded-xl bg-white border-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <Link href={`/dashboard/orders/${order.id}`} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-slate-100 transition-all shadow-sm"><Edit className="h-4 w-4 text-slate-400" /></Link>
                        </div>
                      </td>
                    </tr>
                    {expandedOrderId === order.id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={7} className="px-12 py-8 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Inventory Payload */}
                            <div className="lg:col-span-2 space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Package className="h-4 w-4 text-blue-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Payload</h4>
                              </div>
                              <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50/50">
                                    <tr>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Boxes</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Weight</th>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">DCPI #</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(order.details || []).map((detail: any, dIdx: number) => (
                                      <tr key={dIdx}>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.productName}</td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.boxCount} <span className="text-[9px] text-slate-400">Pcs</span></td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.weight} <span className="text-[9px] text-slate-400">KG</span></td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right">{detail.dcpiNo || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Order Context & Extras */}
                            <div className="space-y-6">
                              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Info className="h-4 w-4 text-blue-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logistics Context</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Origin Address</p>
                                    <p className="text-xs font-medium text-slate-600 mt-1">{order.fromAddress || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Destination Address</p>
                                    <p className="text-xs font-medium text-slate-600 mt-1">{order.toAddress || 'N/A'}</p>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Tonnage</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">{(order.details || []).reduce((acc: number, d: any) => acc + (d.weight || 0), 0).toFixed(2)} KG</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Units</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">{(order.details || []).reduce((acc: number, d: any) => acc + (d.boxCount || 0), 0)} Boxes</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button className="w-full h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200">
                                <FileText className="h-4 w-4 mr-2" /> Full Manifest Details
                              </Button>
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

      {printOrder && (
        <LorryReceiptTemplate order={printOrder} onClose={() => setPrintOrder(null)} />
      )}

      {printOrders && (
        <LorryReceiptTemplate orders={printOrders} onClose={() => setPrintOrders(null)} />
      )}
    </div>
  );
}
