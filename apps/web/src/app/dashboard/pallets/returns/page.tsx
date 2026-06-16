'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Calendar, Edit, Trash2, 
  Download, Package, Inbox, Scale, BarChart3,
  RefreshCw, CheckCircle2, AlertCircle, Box, Truck,
  IndianRupee, Users, FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn, formatWeight, formatUtcDate } from '@/lib/utils';
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

export default function PalletReturnListPage() {
  const [pallets, setPallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [expandedPalletId, setExpandedPalletId] = useState<string | null>(null);
  const [selectedPallets, setSelectedPallets] = useState<string[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isInvoiceFlow = searchParams.get('action') === 'generate_invoice';
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    month: '',
  });
  const [stats, setStats] = useState({
    todayCount: 0,
    totalWeight: 0,
    totalBoxes: 0,
    monthlyCount: 0
  });

  const fetchStats = async () => {
    try {
      let url = '/api/v1/pallets/stats?type=RETURN';
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

  const handleExport = (exportFormat: 'csv' | 'excel' | 'pdf') => {
    const exportData = pallets.map(p => ({
      'Return ID': `#${p.lrNo}`,
      'Date': formatUtcDate(p.date, 'dd MMM yyyy'),
      'Dealer': p.dealer?.name || p.companyName,
      'Vehicle': p.vehicle?.regNo || 'N/A',
      'Units': (p.palletDetails?.length > 0 ? p.palletDetails : (p.consigneeDetails || [])).reduce((acc: number, d: any) => acc + d.qty, 0),
      'Tax %': p.gstPct,
      'Subtotal': p.subtotal / 100,
      'Total Amount': p.totalAmount / 100,
    }));

    if (exportFormat === 'csv' || exportFormat === 'excel') {
      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "PalletReturns");
      XLSX.writeFile(wb, `Pallet_Returns_Export_${new Date().getTime()}.${exportFormat === 'excel' ? 'xlsx' : 'csv'}`);
      toast.success(`Data exported as ${exportFormat.toUpperCase()}`);
    } else if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      doc.text("Pallet Return Records", 14, 15);
      autoTable(doc, {
        startY: 20,
        head: [['Return ID', 'Date', 'Dealer', 'Vehicle', 'Units', 'Total']],
        body: exportData.map(d => [d['Return ID'], d['Date'], d['Dealer'], d['Vehicle'], d['Units'], `Rs. ${d['Total Amount']}`]),
      });
      doc.save(`Pallet_Returns_Report_${new Date().getTime()}.pdf`);
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
              <RefreshCw className="h-7 w-7" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Pallet Returns</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-12 text-blue-500/50">Reverse Logistics Pipeline</p>
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
              <DropdownMenuItem onClick={() => handleExport('pdf')} className="rounded-xl font-bold text-[10px] uppercase tracking-widest p-3 cursor-pointer text-rose-500">Export PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
          { label: 'Total Returns', value: stats.todayCount.toString(), icon: <RefreshCw className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Units Collected', value: stats.totalBoxes.toString(), icon: <Box className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'This Month', value: stats.monthlyCount.toString(), icon: <BarChart3 className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
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
                <th className="px-6 py-5 w-16">
                  <input 
                    type="checkbox" 
                    className="rounded-lg border-slate-200" 
                    checked={selectedPallets.length === pallets.length && pallets.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedPallets(pallets.map(p => p.id));
                      else setSelectedPallets([]);
                    }}
                  />
                </th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Return Details</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Dealer Reference</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Consignees</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-blue-600">Return Payload</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Grand Settlement</th>
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
                          <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 text-blue-400">
                            <RefreshCw className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 tracking-tighter uppercase text-xs">#{pallet.lrNo}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                              {formatUtcDate(pallet.date, 'dd MMM yyyy')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="font-black text-slate-700 uppercase text-xs">{pallet.dealer?.name || pallet.companyName}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                          Ref: {pallet.partyCode || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        {(() => {
                          const names: string[] = [];
                          if (pallet.consignee?.name) names.push(pallet.consignee.name);
                          (pallet.palletDetails || []).forEach((d: any) => { if (d.consigneeName) names.push(d.consigneeName); });
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
                            {(pallet.palletDetails?.length > 0 ? pallet.palletDetails : (pallet.consigneeDetails || [])).reduce((acc: number, d: any) => acc + (parseInt(d.qty as any) || 0), 0)} Units
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Package className="h-3 w-3 text-slate-300" />
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            {(pallet.palletDetails?.length > 0 ? pallet.palletDetails : (pallet.consigneeDetails || [])).length} Destinations
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-right">
                        <div className="font-black text-slate-900">₹{((pallet.totalAmount || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-1">
                          {pallet.cgstAmount > 0 || pallet.sgstAmount > 0 || pallet.igstAmount > 0 ? "With GST" : "No GST"}
                        </div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {pallet.rate > 0 
                            ? `By ${pallet.rateOn === 'weight' ? 'KG' : 'Unit'}` 
                            : 'Fixed'}
                        </div>
                      </td>
                      <td className="px-6 py-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-2">
                          <PalletInvoiceDownloader 
                            palletId={pallet.id} 
                            lrNo={pallet.lrNo}
                            variant="invoice"
                            label="Invoice"
                            className="h-9 px-3 rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <PalletInvoiceDownloader 
                            palletId={pallet.id} 
                            lrNo={pallet.lrNo}
                            variant="receipt"
                            label="Receipt"
                            className="h-9 px-3 rounded-xl bg-white border border-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white shadow-sm font-black text-[10px] uppercase"
                          />
                          <Link href={`/dashboard/pallets/returns/${pallet.id}`} className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-amber-600 hover:text-white transition-all shadow-sm"><Edit className="h-4 w-4" /></Link>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to delete this pallet return record?')) {
                                try {
                                  const res = await fetch(`/api/v1/pallets/${pallet.id}`, { method: 'DELETE' });
                                  if (res.ok) {
                                    toast.success('Palletized return deleted successfully');
                                    fetchPallets(meta.page);
                                    fetchStats();
                                  } else {
                                    toast.error('Failed to delete pallet return record');
                                  }
                                } catch (error) {
                                  toast.error('An error occurred while deleting');
                                }
                              }
                            }}
                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-rose-600 hover:text-white transition-all shadow-sm group"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {expandedPalletId === pallet.id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={7} className="px-12 py-8 border-l-4 border-blue-500">
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Return Breakdown */}
                            <div className="lg:col-span-2 space-y-6">
                              <div className="flex items-center gap-2 mb-2">
                                <Box className="h-4 w-4 text-blue-600" />
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Return Consignee Breakdown</h4>
                              </div>
                              <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                <table className="w-full text-left">
                                  <thead className="bg-slate-50/50">
                                    <tr>
                                      <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Consignee</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Weight</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Rate</th>
                                      <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-50">
                                    {(pallet.palletDetails?.length > 0 ? pallet.palletDetails : (pallet.consigneeDetails || [])).map((detail: any, dIdx: number) => {
                                      const unitPrice = (pallet.rate || 0) / 100;
                                      const rowAmount = pallet.rateOn === 'weight'
                                        ? (parseFloat(detail.weight as any) || 0) * unitPrice
                                        : (parseInt(detail.qty as any) || 0) * unitPrice;
                                      return (
                                        <tr key={dIdx}>
                                          <td className="px-6 py-4 text-xs font-bold text-slate-700">
                                            {detail.consigneeName}
                                            {detail.palletDisplayId && (
                                              <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] text-slate-400 font-black">
                                                {detail.palletDisplayId}
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.qty} <span className="text-[9px] text-slate-400">Nodes</span></td>
                                          <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{formatWeight(detail.weight || 0)} <span className="text-[9px] text-slate-400">KG</span></td>
                                          <td className="px-4 py-4 text-xs font-black text-slate-600 text-right">₹{unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                          <td className="px-4 py-4 text-xs font-black text-blue-600 text-right">₹{rowAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>

                              {/* Financial Summary & Breakdown */}
                              <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-6">
                                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                  <div className="flex items-center gap-2">
                                    <IndianRupee className="h-4 w-4 text-emerald-600" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Financial Summary</h4>
                                  </div>
                                  <span className={cn(
                                    "px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                    pallet.cgstAmount > 0 || pallet.sgstAmount > 0 || pallet.igstAmount > 0 
                                      ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                                      : "bg-slate-50 border-slate-100 text-slate-500"
                                  )}>
                                    {pallet.cgstAmount > 0 || pallet.sgstAmount > 0 || pallet.igstAmount > 0 ? "GST Billed" : "Non-GST Billed"}
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  {/* Left: Calculation Logic */}
                                  <div className="space-y-4">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Calculation Method</p>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/50 space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-500">Pricing Mode:</span>
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-wide">
                                          {pallet.rate > 0 
                                            ? `Rate per ${pallet.rateOn === 'weight' ? 'KG' : 'Unit'}` 
                                            : "Fixed Freight"}
                                        </span>
                                      </div>
                                      {pallet.rate > 0 && (
                                        <>
                                          <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-slate-500">Base Rate:</span>
                                            <span className="text-[10px] font-black text-slate-700">₹{(pallet.rate / 100).toFixed(2)}</span>
                                          </div>
                                          <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-1">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Formula</span>
                                            <span className="text-xs font-black text-blue-600 tracking-tighter">
                                              {pallet.rateOn === 'weight' 
                                                ? `${formatWeight(pallet.totalWeight)} KG × ₹${(pallet.rate / 100).toFixed(2)}`
                                                : `${pallet.totalBoxes || 0} Units × ₹${(pallet.rate / 100).toFixed(2)}`
                                              }
                                              {" = "}
                                              ₹{(pallet.freight / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                            </span>
                                          </div>
                                        </>
                                      )}
                                      {!pallet.rate && (
                                        <div className="text-[10px] font-medium text-slate-500 leading-relaxed pt-1">
                                          Freight is set at a flat fixed rate, bypassing weight/quantity multiplication.
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  {/* Right: Detailed Ledger */}
                                  <div className="space-y-3">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Ledger</p>
                                    <div className="space-y-2.5">
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Base Freight</span>
                                        <span className="font-black text-slate-700">₹{(pallet.freight / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-500">Hamali Charges</span>
                                        <span className="font-black text-slate-700">+ ₹{(pallet.hamali / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                      <div className="h-px bg-slate-100 my-1" />
                                      <div className="flex justify-between items-center text-xs">
                                        <span className="font-bold text-slate-600">Subtotal</span>
                                        <span className="font-black text-slate-800">₹{(pallet.subtotal / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                      </div>

                                      {/* GST Breakdown */}
                                      {(pallet.cgstAmount > 0 || pallet.sgstAmount > 0 || pallet.igstAmount > 0) && (
                                        <div className="bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100/50 space-y-2 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                                          {pallet.gstType === 'intra' ? (
                                            <>
                                              <div className="flex justify-between items-center text-[11px]">
                                                <span className="font-bold text-emerald-700">CGST ({pallet.cgstPct || 0}%)</span>
                                                <span className="font-black text-emerald-800">+ ₹{(pallet.cgstAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                              </div>
                                              <div className="flex justify-between items-center text-[11px]">
                                                <span className="font-bold text-emerald-700">SGST ({pallet.sgstPct || 0}%)</span>
                                                <span className="font-black text-emerald-800">+ ₹{(pallet.sgstAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                              </div>
                                            </>
                                          ) : (
                                            <div className="flex justify-between items-center text-[11px]">
                                              <span className="font-bold text-emerald-700">IGST ({pallet.igstPct || 0}%)</span>
                                              <span className="font-black text-emerald-800">+ ₹{(pallet.igstAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                          )}
                                        </div>
                                      )}

                                      <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                                        <span className="text-xs font-black uppercase tracking-wider text-slate-800">Grand Settlement</span>
                                        <span className="text-xl font-black text-slate-900 tracking-tight">₹{(pallet.totalAmount / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
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
                                    <p className="text-xs font-black text-slate-700 mt-1">{pallet.dealer?.name || pallet.companyName}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Assigned Vehicle</p>
                                    <p className="text-xs font-black text-slate-700 mt-1">{pallet.vehicle?.plateNumber || pallet.vehicle?.regNo || 'Self Service'}</p>
                                  </div>
                                  <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expected Net Margin</p>
                                    {(() => {
                                      const marginVal = ((pallet.freight || 0) - (pallet.hamali || 0)) / 100;
                                      return (
                                        <div className={cn(
                                          "px-3 py-2 rounded-xl mt-1 text-xs font-black uppercase tracking-wider text-center border inline-block",
                                          marginVal > 0 
                                            ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                                            : marginVal < 0 
                                              ? "bg-rose-50 border-rose-100 text-rose-700" 
                                              : "bg-slate-50 border-slate-100 text-slate-600"
                                        )}>
                                          ₹{marginVal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </div>
                                      );
                                    })()}
                                  </div>
                                  <div className="pt-3 border-t border-slate-50 flex justify-between items-end">
                                    <div>
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Load</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        {formatWeight(pallet.totalWeight)} KG
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Revenue (Base)</p>
                                      <p className="text-xl font-black text-slate-900 tracking-tighter">
                                        ₹{(pallet.freight / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <Button 
                                onClick={() => router.push(`/dashboard/pallets/returns/${pallet.id}`)}
                                className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02]"
                              >
                                <FileText className="h-4 w-4" /> Edit Manifest Details
                              </Button>

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
                <Box className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Selected for Billing</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black">{selectedPallets.length}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Return Records</span>
                </div>
              </div>
              <div className="h-10 w-px bg-white/10 hidden md:block" />
              <div className="hidden md:block">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Est. Total Base</p>
                <p className="text-xl font-black text-emerald-400">
                  ₹{(pallets.filter(p => selectedPallets.includes(p.id)).reduce((acc, curr) => acc + (curr.subtotal || 0), 0) / 100).toLocaleString()}
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
