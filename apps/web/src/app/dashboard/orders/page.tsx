'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, FileText, Edit, Trash2, 
  Download, Calendar, MapPin, Truck, ChevronDown, ChevronUp, Package, Hash, Info,
  ClipboardList, CheckCircle2, IndianRupee, ChevronLeft, ChevronRight, Receipt, ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { InvoiceModal } from '@/components/accounting/invoice-modal';

import { LorryReceiptTemplate } from '@/components/orders/LorryReceiptTemplate';
import { LRInvoiceDownloader } from '@/components/orders/LRInvoiceDownloader';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function OrderListPage() {
  const router = useRouter();
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
  const searchParams = useSearchParams();
  const isInvoiceFlow = searchParams.get('action') === 'generate_invoice';
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const fetchStats = async () => {
    try {
      let url = `/api/v1/orders/stats?search=${search}`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/v1/orders?page=${page}&limit=${meta.limit}&search=${search}`;
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

  const handleExport = async (exportFormat: 'csv' | 'excel' | 'pdf') => {
    try {
      // Prepare data for export
      const exportData = orders.map(order => ({
        'LR No': `#${order.lrNo}`,
        'Date': format(new Date(order.date), 'dd MMM yyyy'),
        'Dealer': order.dealer?.name || 'Retail Client',
        'Consignee': order.consignee?.name || 'N/A',
        'Vehicle': order.vehicle?.plateNumber || order.vehicle?.regNo || 'Self Service',
        'From': order.fromLocation || 'N/A',
        'To': order.toLocation || 'N/A',
        'Weight': `${Number(order.totalWeight || 0).toFixed(2)} KG`,
        'Boxes': order.totalBoxes || 0,
        'Amount': (order.totalAmount || 0) / 100,
        'Status': order.status.toUpperCase().replace('_', ' ')
      }));

      if (exportFormat === 'csv' || exportFormat === 'excel') {
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "LorryReceipts");
        XLSX.writeFile(wb, `Lorry_Receipts_Export_${new Date().getTime()}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
        toast.success(`Data exported as ${exportFormat.toUpperCase()}`);
      } else if (exportFormat === 'pdf') {
        const doc = new jsPDF('l', 'mm', 'a4');
        
        // Fetch company details for header
        let businessDetails = { name: "FREIGHTFLOW LOGISTICS", address: "", gstin: "" };
        try {
          const res = await fetch('/api/v1/companies/branding');
          const companyRes = await res.json();
          if (companyRes.data) businessDetails = companyRes.data;
        } catch (e) { console.error("Could not fetch business details", e); }

        // Header
        doc.setFontSize(20);
        doc.setTextColor(30, 41, 59); // Slate 800
        doc.text(businessDetails.name.toUpperCase(), 14, 20);
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139); // Slate 400
        if (businessDetails.address) {
          doc.text(businessDetails.address, 14, 26, { maxWidth: 100 });
        }
        if (businessDetails.gstin) {
          doc.text(`GSTIN: ${businessDetails.gstin}`, 14, businessDetails.address ? 32 : 26);
        }

        doc.setFontSize(14);
        doc.setTextColor(37, 99, 235); // Blue 600
        doc.text("LORRY RECEIPT MANIFEST REPORT", 280, 20, { align: 'right' });
        
        doc.setFontSize(9);
        doc.setTextColor(100, 116, 139);
        doc.text(`Generated: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 280, 26, { align: 'right' });
        
        doc.setDrawColor(226, 232, 240);
        doc.line(14, 38, 280, 38);

        autoTable(doc, {
          startY: 45,
          head: [['LR No', 'Date', 'Dealer', 'Consignee', 'Vehicle', 'From → To', 'Weight', 'Qty', 'Amount', 'Status']],
          body: exportData.map(d => [
            d['LR No'], 
            d['Date'], 
            d['Dealer'], 
            d['Consignee'], 
            d['Vehicle'], 
            `${d['From']} → ${d['To']}`, 
            d['Weight'], 
            d['Boxes'], 
            `Rs. ${d['Amount'].toLocaleString()}`,
            d['Status']
          ]),
          headStyles: { 
            fillColor: [37, 99, 235], 
            textColor: 255, 
            fontStyle: 'bold',
            halign: 'left',
            fontSize: 8
          },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 22 },
            6: { halign: 'right' },
            7: { halign: 'center' },
            8: { halign: 'right' },
            9: { halign: 'center' }
          },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          margin: { top: 45 }
        });
        
        doc.save(`Lorry_Receipt_Report_${new Date().getTime()}.pdf`);
        toast.success("Manifest exported as PDF");
      }
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Export failed. Please try again.");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
      fetchStats();
    }, 300);
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase h-14 px-6">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 p-2 shadow-2xl">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer">Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer">Export Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer text-rose-500">Export PDF Report</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/dashboard/orders/new">
            <Button className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
              <Plus className="h-4 w-4" /> Create New LR
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Today LRs', value: (stats?.todayCount || 0).toString(), icon: <ClipboardList className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'In Transit', value: (stats?.inTransitCount || 0).toString(), icon: <Truck className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Delivered', value: (stats?.deliveredCount || 0).toString(), icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'Monthly Rev', value: `₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}k`, icon: <IndianRupee className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50' },
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

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-white shadow-sm">
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
                          <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform duration-300 ml-auto", expandedOrderId === order.id && "rotate-180 text-blue-500")} />
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
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">DCPI #</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {(order.details || []).map((detail: any, dIdx: number) => {
                                          const unitPrice = (order.rate || 0) / 100;
                                          const rowAmount = order.rateOn === 'weight' 
                                            ? (detail.weight || 0) * unitPrice 
                                            : (detail.boxCount || 0) * unitPrice;
                                          return (
                                            <tr key={dIdx}>
                                              <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.productName}</td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.boxCount} <span className="text-[9px] text-slate-400">Pcs</span></td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.weight} <span className="text-[9px] text-slate-400">KG</span></td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-600 text-right">₹{unitPrice.toLocaleString()}</td>
                                              <td className="px-4 py-4 text-xs font-black text-blue-600 text-right">₹{rowAmount.toLocaleString()}</td>
                                              <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right">{detail.dcpiNo || '-'}</td>
                                            </tr>
                                          );
                                        })}
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
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Address</p>
                                    <p className="text-[11px] font-bold text-slate-600 mt-1.5 leading-relaxed">{order.fromAddress || 'N/A'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination Address</p>
                                    <p className="text-[11px] font-bold text-slate-600 mt-1.5 leading-relaxed">{order.toAddress || 'N/A'}</p>
                                  </div>
                                  <div className="pt-5 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Tonnage</p>
                                      <p className="text-2xl font-black text-slate-900 tracking-tighter mt-1">
                                        {Number(order.totalWeight || 0).toFixed(2)} <span className="text-[10px] text-slate-400 uppercase ml-1">KG</span>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Units</p>
                                      <p className="text-2xl font-black text-slate-900 tracking-tighter mt-1">
                                        {order.totalBoxes || 0} <span className="text-[10px] text-slate-400 uppercase ml-1">Boxes</span>
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Button 
                                onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                              >
                                <FileText className="h-4 w-4" /> Full Manifest Details
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

        {/* Pagination Footer */}
        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Showing <span className="text-slate-900">{((meta.page - 1) * meta.limit) + 1}</span> to <span className="text-slate-900">{Math.min(meta.page * meta.limit, meta.total)}</span> of <span className="text-slate-900">{meta.total}</span> LRs
            </p>
            <div className="h-4 w-px bg-slate-200 hidden sm:block" />
            <select 
              className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-blue-600 outline-none cursor-pointer"
              value={meta.limit}
              onChange={(e) => {
                const newLimit = parseInt(e.target.value);
                setMeta(m => ({ ...m, limit: newLimit, page: 1 }));
                fetchOrders(1);
              }}
            >
              <option value="10">10 Per Page</option>
              <option value="25">25 Per Page</option>
              <option value="50">50 Per Page</option>
              <option value="100">100 Per Page</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              disabled={meta.page === 1}
              onClick={() => fetchOrders(meta.page - 1)}
              className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, meta.totalPages) }).map((_, i) => {
                // Logic to show pages around current page
                let pageNum = meta.page;
                if (meta.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (meta.page <= 3) {
                  pageNum = i + 1;
                } else if (meta.page >= meta.totalPages - 2) {
                  pageNum = meta.totalPages - 4 + i;
                } else {
                  pageNum = meta.page - 2 + i;
                }

                return (
                  <Button
                    key={i}
                    variant={meta.page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => fetchOrders(pageNum)}
                    className={cn(
                      "h-10 min-w-[40px] rounded-xl font-black text-[10px] uppercase transition-all",
                      meta.page === pageNum ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : "hover:bg-white hover:shadow-sm text-slate-400 hover:text-slate-900"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchOrders(meta.page + 1)}
              className="h-10 w-10 p-0 rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Sticky Action Bar for Invoice Generation */}
      {isInvoiceFlow && selectedOrders.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-6 flex items-center justify-between border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Selected for Billing</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{selectedOrders.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Lorry Receipts</span>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Total Base</p>
                <p className="text-xl font-black text-emerald-400">
                  ₹{(orders.filter(o => selectedOrders.includes(o.id)).reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]"
                onClick={() => setSelectedOrders([])}
              >
                Clear
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 gap-3"
                onClick={() => setIsInvoiceModalOpen(true)}
              >
                Process Invoice
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          fetchOrders();
          setSelectedOrders([]);
          router.push('/dashboard/accounting/invoices');
        }}
        initialSelectedIds={selectedOrders}
        sourceType="LR"
      />

      {printOrder && (
        <LorryReceiptTemplate order={printOrder} onClose={() => setPrintOrder(null)} />
      )}

      {printOrders && (
        <LorryReceiptTemplate orders={printOrders} onClose={() => setPrintOrders(null)} />
      )}
    </div>
  );
}
