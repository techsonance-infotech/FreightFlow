'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, FileText, Edit, Trash2, 
  Download, Calendar, MapPin, Truck, ChevronDown, ChevronUp, Package, Hash, Info, Box,
  Inbox, Scale, BarChart3, Users
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { InvoiceModal } from '@/components/accounting/invoice-modal';
import { PalletInvoiceDownloader } from '@/components/orders/PalletInvoiceDownloader';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PalletListPage() {
  const [pallets, setPallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [expandedPalletId, setExpandedPalletId] = useState<string | null>(null);
  const [selectedPallets, setSelectedPallets] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: '',
  });
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvoiceFlow = searchParams.get('action') === 'generate_invoice';
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [stats, setStats] = useState({
    todayCount: 0,
    totalWeight: 0,
    totalBoxes: 0,
    monthlyCount: 0
  });

  const fetchStats = async () => {
    try {
      let url = '/api/v1/pallets/stats?type=OUTWARD';
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  const fetchPallets = async (page = 1) => {
    try {
      setLoading(true);
      let url = `/api/v1/pallets?page=${page}&limit=10&search=${search}&type=OUTWARD`;
      if (filters.startDate) url += `&startDate=${filters.startDate}`;
      if (filters.endDate) url += `&endDate=${filters.endDate}`;
      
      const res = await fetch(url);
      const data = await res.json();
      setPallets(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch pallet records');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (exportFormat: 'csv' | 'excel' | 'pdf') => {
    const exportData = pallets.map(p => ({
      'LR No': `#${p.lrNo}`,
      'Date': format(new Date(p.date), 'dd MMM yyyy'),
      'Dealer': p.dealer?.name || p.companyName,
      'Vehicle': p.vehicle?.regNo || 'N/A',
      'Pallets': p.palletDetails?.reduce((acc: number, d: any) => acc + (parseInt(d.qty as any) || 0), 0),
      'Tax %': p.gstPct,
      'Total Amount': p.totalAmount / 100,
    }));

    if (exportFormat === 'csv' || exportFormat === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PalletTracking");
      XLSX.writeFile(wb, `Pallet_Tracking_Export_${new Date().getTime()}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
      toast.success(`Data exported as ${exportFormat.toUpperCase()}`);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(30, 41, 59); // Slate 800
      doc.text("FREIGHTFLOW LOGISTICS", 14, 22);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate 400
      doc.text("Inventory & Distribution Control Report", 14, 28);
      doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy HH:mm')}`, 14, 33);
      
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.line(14, 38, 196, 38);

      autoTable(doc, {
        startY: 45,
        head: [['LR No', 'Date', 'Dealer', 'Vehicle', 'Pallets', 'Total Amount']],
        body: exportData.map(d => [d['LR No'], d['Date'], d['Dealer'], d['Vehicle'], d['Pallets'], `Rs. ${d['Total Amount'].toLocaleString()}`]),
        headStyles: { 
          fillColor: [37, 99, 235], 
          textColor: 255, 
          fontStyle: 'bold',
          halign: 'center'
        },
        columnStyles: {
          0: { halign: 'left' },
          1: { halign: 'left' },
          2: { halign: 'left' },
          3: { halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'right' }
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { top: 45 }
      });
      
      doc.save(`Pallet_Tracking_Report_${new Date().getTime()}.pdf`);
      toast.success("Data exported as PDF");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPallets(1);
      fetchStats();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters]);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-700 pb-24">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center shadow-sm border border-blue-100 text-blue-600">
              <Inbox className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Pallet Tracking</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12">Inventory & Distribution Control</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/pallets/reconciliation">
            <Button variant="outline" className="rounded-xl border-slate-200 text-blue-600 font-black text-[10px] uppercase h-14 px-6 hover:bg-blue-50 transition-all">
              <BarChart3 className="h-4 w-4 mr-2" /> Reconciliation Report
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase h-14 px-6">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 p-2 shadow-2xl">
              <DropdownMenuItem onClick={() => handleExport('csv')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer">Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('excel')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer">Export Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer text-rose-500">Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link href="/dashboard/pallets/new">
            <Button className="rounded-2xl h-14 px-8 bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/10 font-black uppercase tracking-widest text-[11px] flex items-center gap-3">
              <Plus className="h-4 w-4" /> Establish Load
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Today Records', value: stats.todayCount.toString(), icon: <Inbox className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Total Weight', value: `${(stats.totalWeight / 1000).toFixed(1)} MT`, icon: <Scale className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Total Pallets', value: stats.totalBoxes.toString(), icon: <Box className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'This Month', value: stats.monthlyCount.toString(), icon: <BarChart3 className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50' },
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
            placeholder="Search by LR No, Dealer, Consignee, Company or Party Code..." 
            className="pl-14 h-16 bg-white border-none rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-100 font-bold"
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-purple-400 uppercase tracking-widest ml-4">Month</span>
          <div className="flex items-center gap-2 bg-white px-4 rounded-2xl shadow-sm border border-slate-50">
            <Calendar className="h-4 w-4 text-purple-500" />
            <input 
              type="month" 
              className="h-12 bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none cursor-pointer" 
              value={filters.month}
              onChange={(e) => {
                const val = e.target.value;
                if (val) {
                  const [year, month] = val.split('-');
                  const start = `${year}-${month}-01`;
                  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();
                  const end = `${year}-${month}-${String(lastDay).padStart(2, '0')}`;
                  setFilters(f => ({ ...f, month: val, startDate: start, endDate: end }));
                } else {
                  setFilters(f => ({ ...f, month: '', startDate: '', endDate: '' }));
                }
              }}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest ml-4">Date Range</span>
          <div className="flex items-center gap-2 bg-white px-4 rounded-2xl shadow-sm border border-slate-50">
            <Calendar className="h-4 w-4 text-blue-500" />
            <input 
              type="date" 
              className="h-12 bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none" 
              value={filters.startDate}
              onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value, month: '' }))}
            />
            <span className="text-slate-300">→</span>
            <input 
              type="date" 
              className="h-12 bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none" 
              value={filters.endDate}
              onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value, month: '' }))}
            />
          </div>
        </div>

        {(filters.startDate || filters.endDate || filters.month || search) && (
          <Button 
            variant="ghost" 
            className="h-16 px-6 text-rose-500 font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 rounded-2xl"
            onClick={() => {
              setFilters({ startDate: '', endDate: '', month: '' });
              setSearch('');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>

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
                    checked={selectedPallets.length === pallets.length && pallets.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPallets(pallets.map(o => o.id));
                      else setSelectedPallets([]);
                    }}
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Pallet Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Party Reference</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Consignee</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-blue-600">Inventory</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Tax (%)</th>
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
              ) : pallets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="h-12 w-12 text-slate-100" />
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">No palletized records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pallets.map((pallet: any) => (
                  <React.Fragment key={pallet.id}>
                    <tr 
                      className={cn(
                        "hover:bg-slate-50/50 transition-all group cursor-pointer",
                        expandedPalletId === pallet.id && "bg-blue-50/30",
                        selectedPallets.includes(pallet.id) && "bg-blue-50"
                      )}
                      onClick={() => setExpandedPalletId(expandedPalletId === pallet.id ? null : pallet.id)}
                    >
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          className="rounded-lg border-slate-200" 
                          checked={selectedPallets.includes(pallet.id)}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedPallets(s => [...s, pallet.id]);
                            else setSelectedPallets(s => s.filter(id => id !== pallet.id));
                          }}
                        />
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 text-slate-400">
                            <Inbox className="h-5 w-5" />
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
                        <div className="font-black text-slate-700 uppercase text-xs">{pallet.companyName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Ref: {pallet.partyCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {(() => {
                          const names: string[] = [];
                          // From the main consignee relation
                          if (pallet.consignee?.name) names.push(pallet.consignee.name);
                          // From pallet details
                          (pallet.palletDetails || []).forEach((d: any) => { if (d.consigneeName) names.push(d.consigneeName); });
                          // From consignee details
                          (pallet.consigneeDetails || []).forEach((d: any) => { if (d.consigneeName) names.push(d.consigneeName); });
                          const consignees = [...new Set(names)];
                          return consignees.length > 0 ? (
                            <div>
                              <div className="flex items-center gap-1.5 mb-1">
                                <Users className="h-3 w-3 text-blue-500" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{consignees.length} Consignee{consignees.length > 1 ? 's' : ''}</span>
                              </div>
                              {consignees.map((name: string, ci: number) => (
                                <div key={ci} className="text-[10px] font-bold text-slate-700 uppercase truncate max-w-[200px]" title={name}>
                                  {name}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-300 uppercase">-</span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2 mb-1">
                          <Box className="h-3 w-3 text-blue-500" />
                          <span className="text-[10px] font-black text-slate-700 uppercase tracking-tighter">
                            {pallet.palletDetails?.reduce((acc: number, d: any) => acc + (parseInt(d.qty as any) || 0), 0)} Units
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {pallet.palletDetails?.length} Destinations
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right font-black text-slate-900">{pallet.gstPct}%</td>
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <PalletInvoiceDownloader 
                            palletId={pallet.id} 
                            lrNo={pallet.lrNo}
                            variant="invoice"
                            label="Invoice"
                            className="h-9 px-3 rounded-xl bg-white border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <PalletInvoiceDownloader 
                            palletId={pallet.id} 
                            lrNo={pallet.lrNo}
                            variant="receipt"
                            label="Receipt"
                            className="h-9 px-3 rounded-xl bg-white border-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <Link href={`/dashboard/pallets/${pallet.id}`} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Edit className="h-4 w-4" /></Link>
                        </div>
                      </td>
                    </tr>
                    {expandedPalletId === pallet.id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={7} className="px-12 py-8 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Pallet Breakdown */}
                            <div className="lg:col-span-2 space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <Box className="h-4 w-4 text-blue-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Consignment Breakdown</h4>
                              </div>
                              <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50/50">
                                    <tr>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Pallet Identification</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Quantity</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Unit Rate</th>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Consignee Ref</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(pallet.palletDetails || []).map((detail: any, dIdx: number) => (
                                      <tr key={dIdx}>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.palletDisplayId}</td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.qty} Nodes</td>
                                        <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">₹{(parseFloat(detail.rate as any) / 100).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-xs font-bold text-slate-400 text-right">{detail.consigneeName || '-'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Logistics Summary */}
                            <div className="space-y-6">
                              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Truck className="h-4 w-4 text-blue-600" />
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logistics Context</h4>
                                </div>
                                <div className="space-y-3">
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Dealer / Payer</p>
                                    <p className="text-xs font-black text-slate-700 mt-1">{pallet.dealer?.name}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Vehicle</p>
                                    <p className="text-xs font-black text-slate-700 mt-1">{pallet.vehicle?.plateNumber || pallet.vehicle?.regNo}</p>
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Load</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        {(pallet.palletDetails || []).reduce((acc: number, d: any) => acc + (parseFloat(d.weight as any) || 0), 0).toFixed(2)} KG
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Revenue (Base)</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        ₹{( (pallet.palletDetails || []).reduce((acc: number, d: any) => acc + ( (parseInt(d.qty as any) || 0) * (parseFloat(d.rate as any) || 0) ), 0) / 100).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                                <div className="flex gap-2">
                                  <PalletInvoiceDownloader 
                                    palletId={pallet.id} 
                                    lrNo={pallet.lrNo}
                                    variant="receipt"
                                    label="Challan"
                                    className="flex-1 h-12 rounded-2xl bg-slate-800 hover:bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200"
                                  />
                                  <PalletInvoiceDownloader 
                                    palletId={pallet.id} 
                                    lrNo={pallet.lrNo}
                                    variant="invoice"
                                    label="Invoice"
                                    className="flex-1 h-12 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200"
                                  />
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
      {/* Pagination Footer */}
      <div className="flex items-center justify-between px-8 py-6 bg-white border border-slate-100 rounded-[32px] shadow-sm">
        <div className="flex items-center gap-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Showing <span className="text-slate-900">{pallets.length}</span> of <span className="text-slate-900">{meta.total}</span> records
          </p>
          <div className="h-4 w-[1px] bg-slate-100" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Page <span className="text-slate-900">{meta.page}</span> of <span className="text-slate-900">{meta.totalPages}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            disabled={meta.page <= 1}
            onClick={() => fetchPallets(meta.page - 1)}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase disabled:opacity-30"
          >
            Previous
          </Button>
          {Array.from({ length: Math.min(5, meta.totalPages) }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <Button 
                key={pageNum}
                variant={meta.page === pageNum ? 'default' : 'outline'}
                onClick={() => fetchPallets(pageNum)}
                className={cn(
                  "h-10 w-10 p-0 rounded-xl font-bold text-[10px] transition-all",
                  meta.page === pageNum ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                )}
              >
                {pageNum}
              </Button>
            );
          })}
          <Button 
            variant="outline" 
            disabled={meta.page >= meta.totalPages}
            onClick={() => fetchPallets(meta.page + 1)}
            className="h-10 px-4 rounded-xl border-slate-200 text-slate-600 font-bold text-[10px] uppercase disabled:opacity-30"
          >
            Next
          </Button>
        </div>
      </div>
      {/* Sticky Action Bar for Invoice Generation */}
      {isInvoiceFlow && selectedPallets.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-4xl px-4 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 text-white rounded-[2.5rem] shadow-2xl p-6 flex items-center justify-between border border-white/10 backdrop-blur-xl">
            <div className="flex items-center gap-6">
              <div className="h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Inbox className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Selected for Billing</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{selectedPallets.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pallet Loads</span>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Total Base</p>
                <p className="text-xl font-black text-emerald-400">
                  ₹{(pallets.filter(p => selectedPallets.includes(p.id)).reduce((acc, curr) => acc + (curr.totalAmount || 0), 0) / 100).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                className="text-slate-400 hover:text-white font-black uppercase tracking-widest text-[10px]"
                onClick={() => setSelectedPallets([])}
              >
                Clear
              </Button>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white h-14 px-8 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20 gap-3"
                onClick={() => setIsInvoiceModalOpen(true)}
              >
                Process Invoice
                <Truck className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        onSuccess={() => {
          fetchPallets();
          setSelectedPallets([]);
          router.push('/dashboard/accounting/invoices');
        }}
        initialSelectedIds={selectedPallets}
        sourceType="PALLET"
      />
    </div>
  );
}
