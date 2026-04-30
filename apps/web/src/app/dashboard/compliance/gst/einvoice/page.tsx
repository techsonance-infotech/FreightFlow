'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Landmark, Download, RefreshCcw, 
  Search, Calendar, Filter, Users, ChevronRight,
  Package, Layers, Calculator, ShieldCheck,
  Plus, ArrowRight, Printer, FileSpreadsheet,
  ChevronLeft, LayoutGrid, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ReportContainer, StatCard, ReportSectionHeader, 
  LoadingState, EmptyReportState, Pagination
} from '@/components/reports/report-components';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function EInvoicePage() {
  const [activeTab, setActiveTab] = useState('standard');
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<any[]>([]);

  const formatCurrency = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };
  
  // Standard B2B State
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [b2bDealer, setB2bDealer] = useState('');
  const [b2bType, setB2bType] = useState('');
  const [b2bStartDate, setB2bStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [b2bEndDate, setB2bEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [b2bPage, setB2bPage] = useState(1);
  const [b2bTotal, setB2bTotal] = useState(0);
  
  // Consolidated View State
  const [filterType, setFilterType] = useState<'month' | 'date'>('month');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedDealer, setSelectedDealer] = useState<string>('');
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [consolidatedType, setConsolidatedType] = useState<string>('');
  const [consolidatedData, setConsolidatedData] = useState<any>(null);

  // Fetch Dealers for filters
  useEffect(() => {
    const fetchDealers = async () => {
      try {
        const res = await fetch('/api/v1/masters/dealers');
        const json = await res.json();
        if (json.data) setDealers(json.data);
      } catch (err) {
        console.error('Failed to fetch dealers', err);
      }
    };
    fetchDealers();
  }, []);

  const fetchStandardInvoices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: b2bPage.toString(),
        limit: '10',
        search,
        dealerId: b2bDealer,
        type: b2bType,
        startDate: b2bStartDate,
        endDate: b2bEndDate,
      });
      const res = await fetch(`/api/v1/compliance/gst/einvoice?${params}`);
      const json = await res.json();
      if (json.data) {
        setInvoices(json.data);
        setB2bTotal(json.meta.total);
      }
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsolidatedData = async () => {
    if (!selectedDealer) return;
    setLoading(true);
    try {
      let finalStart = startDate;
      let finalEnd = endDate;
      
      if (filterType === 'month') {
        const monthDate = parseISO(`${selectedMonth}-01`);
        finalStart = format(startOfMonth(monthDate), 'yyyy-MM-dd');
        finalEnd = format(endOfMonth(monthDate), 'yyyy-MM-dd');
      }

      const params = new URLSearchParams({
        dealerId: selectedDealer,
        startDate: finalStart,
        endDate: finalEnd,
        type: consolidatedType,
      });
      const res = await fetch(`/api/v1/compliance/gst/einvoice/consolidated?${params}`);
      const json = await res.json();
      if (json.data) {
        setConsolidatedData(json.data);
      }
    } catch (err) {
      toast.error('Failed to aggregate data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'consolidated') {
      fetchConsolidatedData();
    }
  }, [activeTab, selectedDealer, selectedMonth, startDate, endDate, filterType, consolidatedType]);

  const handleBulkGenerate = async () => {
    const pendingInvoices = invoices.filter(i => i.irnStatus === 'pending').map(i => i.id);
    if (pendingInvoices.length === 0) {
      toast.info('No pending invoices found in current view');
      return;
    }

    const loadingToast = toast.loading(`Processing ${pendingInvoices.length} invoices...`);
    try {
      const res = await fetch('/api/v1/compliance/gst/einvoice/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceIds: pendingInvoices })
      });
      const json = await res.json();
      if (res.ok) {
        toast.success(`Successfully processed ${json.data.successCount} invoices`, { id: loadingToast });
        fetchStandardInvoices();
      }
    } catch (err) {
      toast.error('Bulk generation failed', { id: loadingToast });
    }
  };

  useEffect(() => {
    if (activeTab === 'standard') {
      fetchStandardInvoices();
    }
  }, [activeTab, b2bPage, b2bDealer, search, b2bType, b2bStartDate, b2bEndDate]);

  const handleGenerateIRN = async (inv: any) => {
    const loadingToast = toast.loading(`Generating IRN for ${inv.invoiceNo}...`);
    try {
      const response = await fetch('/api/v1/compliance/gst/einvoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          invoiceId: inv.id, 
          invoiceNo: inv.invoiceNo, 
          amount: inv.totalAmount, 
          customerGstIn: inv.customerGstin 
        })
      });
      const result = await response.json();
      if (response.ok) {
        toast.success(`IRN successfully generated`, { id: loadingToast });
        fetchStandardInvoices();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`IRN Generation Failed: ${error.message}`, { id: loadingToast });
    }
  };

  const handleApproveConsolidation = async () => {
    const loadingToast = toast.loading('Sealing Consolidated Cycle...');
    try {
      // Mock API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Consolidated Cycle Approved & Sealed', { id: loadingToast });
      fetchConsolidatedData();
    } catch (err) {
      toast.error('Approval failed', { id: loadingToast });
    }
  };

  return (
    <ReportContainer>
      {/* Header & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-brand-900 flex items-center justify-center">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-brand-900 uppercase tracking-[0.2em]">Compliance & Billing</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">E-Invoice Management</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Regulated IRN generation & monthly consolidated billing suite</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            onClick={handleBulkGenerate}
            disabled={loading || invoices.filter(i => i.irnStatus === 'pending').length === 0}
            className="h-11 px-6 rounded-xl bg-brand-900 hover:bg-black text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-brand-900/20"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Generate All Invoices
          </Button>
          <Button 
            variant="outline" 
            onClick={() => activeTab === 'standard' ? fetchStandardInvoices() : fetchConsolidatedData()}
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Sync Data
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="IRN Pending" 
          value={b2bTotal} 
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="amber"
        />
        <StatCard 
          title="Consolidated Drafts" 
          value={consolidatedData ? 1 : 0} 
          icon={<Layers className="h-5 w-5" />} 
          color="blue"
        />
        <StatCard 
          title="Total B2B Value" 
          value={formatCurrency(invoices.reduce((acc, i) => acc + i.totalAmount, 0))} 
          icon={<Landmark className="h-5 w-5" />} 
          color="slate"
        />
        <StatCard 
          title="E-Invoice Compliance" 
          value="100%" 
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="emerald"
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-1">
          <TabsList className="bg-transparent p-0 h-auto gap-8">
            <TabsTrigger 
              value="standard" 
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-bold text-neutral-500 transition-all data-[state=active]:border-brand-900 data-[state=active]:text-brand-900 data-[state=active]:shadow-none"
            >
              Standard B2B Invoices
            </TabsTrigger>
            <TabsTrigger 
              value="consolidated" 
              className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-bold text-neutral-500 transition-all data-[state=active]:border-brand-900 data-[state=active]:text-brand-900 data-[state=active]:shadow-none"
            >
              Consolidated Billing (Monthly)
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="standard" className="m-0 border-none outline-none">
          <div className="space-y-6">
            {/* Standard Filters */}
            <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-wrap items-center gap-6">
              <div className="flex-1 min-w-[240px]">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Search Invoice / Customer</p>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-brand-900 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Search by Invoice No..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-900/5 focus:border-brand-900 transition-all"
                  />
                </div>
              </div>

              <div className="min-w-[240px]">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Date Range</p>
                <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
                  <input 
                    type="date"
                    value={b2bStartDate}
                    onChange={(e) => setB2bStartDate(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
                  />
                  <div className="h-4 w-[1px] bg-neutral-200" />
                  <input 
                    type="date"
                    value={b2bEndDate}
                    onChange={(e) => setB2bEndDate(e.target.value)}
                    className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
                  />
                </div>
              </div>

              <div className="min-w-[200px]">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Filter by Dealer</p>
                <select 
                  value={b2bDealer}
                  onChange={(e) => setB2bDealer(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-900/5 focus:border-brand-900 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Dealers</option>
                  {dealers.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="min-w-[140px]">
                <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Filter by Type</p>
                <select 
                  value={b2bType}
                  onChange={(e) => setB2bType(e.target.value)}
                  className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-900/5 focus:border-brand-900 transition-all appearance-none cursor-pointer"
                >
                  <option value="">All Types</option>
                  <option value="Pallet">Pallets</option>
                  <option value="Box">Boxes</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingState rows={6} />
            ) : invoices.length === 0 ? (
              <EmptyReportState 
                title="No Invoices Found" 
                description="Try adjusting your search or filters to find standard B2B invoices."
              />
            ) : (
              <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                <ReportSectionHeader 
                  title="B2B Supply Register" 
                  subtitle="High-value invoices requiring IRN/QR code generation for compliance."
                  className="px-8 pt-8 mb-4"
                />
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-white">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400">Invoice No</TableHead>
                        <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400">Customer Intelligence</TableHead>
                        <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-right">Taxable Amount</TableHead>
                        <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-center">Status</TableHead>
                        <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoices.map((inv) => (
                        <TableRow key={inv.id} className="hover:bg-neutral-50/50 transition-colors group border-b border-neutral-50 last:border-none">
                          <TableCell className="px-8 py-6">
                            <p className="text-sm font-black text-brand-900 tracking-tight">{inv.invoiceNo}</p>
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{format(new Date(inv.date), 'dd MMM yyyy')}</p>
                          </TableCell>
                          <TableCell className="px-8 py-6">
                            <p className="text-sm font-bold text-neutral-700 uppercase tracking-tight">{inv.customerName}</p>
                            <p className="text-[10px] font-black text-neutral-400 font-mono mt-0.5">{inv.customerGstin}</p>
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right font-black text-neutral-900">{formatCurrency(inv.totalAmount)}</TableCell>
                          <TableCell className="px-8 py-6 text-center">
                            <Badge className={cn(
                              "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
                              inv.irnStatus === 'generated' ? "bg-success-50 text-success-700 border-success-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            )}>
                              {inv.irnStatus}
                            </Badge>
                            {inv.irn && <p className="text-[9px] text-neutral-300 font-mono mt-1.5 truncate max-w-[120px] mx-auto">{inv.irn}</p>}
                          </TableCell>
                          <TableCell className="px-8 py-6 text-right">
                            <Button 
                              size="sm" 
                              variant={inv.irnStatus === 'pending' ? 'default' : 'outline'}
                              onClick={() => inv.irnStatus === 'pending' ? handleGenerateIRN(inv) : toast.info('Opening invoice viewer...')}
                              className={cn(
                                "h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
                                inv.irnStatus === 'pending' ? "bg-brand-900 hover:bg-black text-white shadow-lg shadow-brand-900/20" : "border-neutral-200 text-neutral-500"
                              )}
                            >
                              {inv.irnStatus === 'pending' ? 'Generate IRN' : 'View Docs'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
                  <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Showing {invoices.length} of {b2bTotal} Invoices</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={b2bPage === 1}
                      onClick={() => setB2bPage(p => p - 1)}
                      className="h-9 w-9 p-0 rounded-lg border-neutral-200"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="h-9 px-4 flex items-center justify-center bg-white border border-neutral-200 rounded-lg text-xs font-black text-brand-900">
                      {b2bPage}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={b2bPage * 10 >= b2bTotal}
                      onClick={() => setB2bPage(p => p + 1)}
                      className="h-9 w-9 p-0 rounded-lg border-neutral-200"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="consolidated" className="m-0 border-none outline-none">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Advanced Consolidated Filter Bar */}
            <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4 border-b border-neutral-50 pb-6">
                <div>
                  <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider">Consolidation Engine</h3>
                  <p className="text-xs font-medium text-neutral-400">Aggregate multi-order dispatches for high-volume dealers</p>
                </div>
                <div className="flex p-1 bg-neutral-100 rounded-2xl">
                  <Button 
                    variant={filterType === 'month' ? 'default' : 'ghost'}
                    onClick={() => setFilterType('month')}
                    className={cn(
                      "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      filterType === 'month' ? "bg-white text-brand-900 shadow-sm hover:bg-white" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    By Month
                  </Button>
                  <Button 
                    variant={filterType === 'date' ? 'default' : 'ghost'}
                    onClick={() => setFilterType('date')}
                    className={cn(
                      "h-10 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all",
                      filterType === 'date' ? "bg-white text-brand-900 shadow-sm hover:bg-white" : "text-neutral-400 hover:text-neutral-600"
                    )}
                  >
                    By Date Range
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-8">
                <div className="flex-1 min-w-[280px]">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 px-1">Target Dealer</p>
                  <div className="relative group">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-brand-900 transition-colors" />
                    <select 
                      value={selectedDealer}
                      onChange={(e) => setSelectedDealer(e.target.value)}
                      className="w-full h-14 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-900/5 focus:border-brand-900 transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Dealer Account...</option>
                      {dealers.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 px-1">
                    {filterType === 'month' ? 'Select Billing Month' : 'Select Billing Period'}
                  </p>
                  <div className="flex items-center gap-2 bg-neutral-50 p-2 rounded-2xl border border-neutral-100 h-14">
                    {filterType === 'month' ? (
                      <div className="flex items-center gap-3 px-4 w-[240px]">
                        <Calendar className="h-4 w-4 text-neutral-400" />
                        <input 
                          type="month" 
                          value={selectedMonth} 
                          onChange={(e) => setSelectedMonth(e.target.value)}
                          className="bg-transparent border-none text-xs font-black outline-none text-neutral-700 cursor-pointer w-full" 
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3 px-4">
                          <Calendar className="h-4 w-4 text-neutral-400" />
                          <input 
                            type="date" 
                            value={startDate} 
                            onChange={(e) => setStartDate(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black outline-none w-28 text-neutral-700 cursor-pointer" 
                          />
                        </div>
                        <div className="h-6 w-[1px] bg-neutral-200" />
                        <div className="flex items-center gap-3 px-4">
                          <input 
                            type="date" 
                            value={endDate} 
                            onChange={(e) => setEndDate(e.target.value)}
                            className="bg-transparent border-none text-[11px] font-black outline-none w-28 text-neutral-700 cursor-pointer" 
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex flex-col">
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 px-1">Filter by Type</p>
                  <select 
                    value={consolidatedType}
                    onChange={(e) => setConsolidatedType(e.target.value)}
                    className="h-14 px-6 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-brand-900/5 focus:border-brand-900 transition-all appearance-none cursor-pointer min-w-[140px]"
                  >
                    <option value="">All Types</option>
                    <option value="Pallet">Pallets</option>
                    <option value="Box">Boxes</option>
                  </select>
                </div>

                <div className="flex items-end h-14">
                  <Button 
                    onClick={fetchConsolidatedData} 
                    disabled={!selectedDealer || loading}
                    className="h-14 px-10 bg-brand-900 hover:bg-black text-white shadow-xl shadow-brand-900/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
                  >
                    <Calculator className="h-4 w-4 mr-2" />
                    Aggregate
                  </Button>
                </div>
              </div>
            </div>

            {loading && activeTab === 'consolidated' ? (
              <LoadingState rows={4} />
            ) : consolidatedData ? (
              <div className="space-y-8 animate-in zoom-in-95 duration-500">
                {/* Aggregation Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard 
                    title="Total Pallets" 
                    value={consolidatedData.summary.totalPallets} 
                    subValue={`& ${consolidatedData.summary.totalBoxes} Boxes`}
                    icon={<Package className="h-5 w-5" />} 
                    color="blue"
                  />
                  <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-brand-900 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      <Badge className={cn(
                        "font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg",
                        consolidatedData.status === 'draft' ? "bg-amber-100 text-amber-700" : "bg-neutral-900 text-white"
                      )}>
                        {consolidatedData.status}
                      </Badge>
                    </div>
                    <h3 className="text-xl font-black text-neutral-900 tracking-tight">{consolidatedData.masterInvoiceNo}</h3>
                    <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-2">{consolidatedData.period}</p>
                  </div>
                  <StatCard 
                    title="Missing PODs" 
                    value={consolidatedData.summary.missingPODs} 
                    subValue="Governance Alert"
                    icon={<ShieldCheck className="h-5 w-5" />} 
                    color="rose"
                  />
                  <div className="bg-neutral-900 p-8 rounded-[32px] shadow-xl shadow-brand-900/10 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500">
                        <Landmark className="h-6 w-6" />
                      </div>
                      <Badge className="bg-white/20 text-white border-white/10 font-black text-[9px] uppercase tracking-widest">Total Billing</Badge>
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tighter">{formatCurrency(consolidatedData.summary.totalAmount)}</h3>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-4">Includes GST ({formatCurrency(consolidatedData.summary.totalTax)})</p>
                  </div>
                </div>

                {/* Aggregation Ledger */}
                <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                  <div className="p-8 border-b border-neutral-50 flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <h3 className="text-lg font-black text-neutral-900 tracking-tight">Aggregation Ledger</h3>
                      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mt-1">Detailed breakdown of all dispatches in this cycle</p>
                    </div>
                    <div className="flex gap-3">
                      {consolidatedData.status === 'draft' && (
                        <Button 
                          onClick={handleApproveConsolidation}
                          className="h-11 px-8 bg-success-600 hover:bg-success-700 text-white shadow-lg shadow-success-600/20 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                        >
                          Approve & Seal Invoice
                        </Button>
                      )}
                      <Button variant="outline" className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-[10px] uppercase tracking-widest text-neutral-500 bg-white">
                        <Printer className="h-3.5 w-3.5 mr-2" />
                        Print Draft
                      </Button>
                      <Button 
                        disabled={consolidatedData.status !== 'approved'}
                        className="h-11 px-8 bg-brand-900 hover:bg-black text-white shadow-lg shadow-brand-900/20 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 disabled:opacity-50"
                      >
                        Generate & Download PDF
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
                    <Table>
                      <TableHeader className="bg-neutral-50/50 sticky top-0 z-10">
                        <TableRow className="border-none hover:bg-transparent">
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400">Date</TableHead>
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400">Reference No</TableHead>
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-center">POD Status</TableHead>
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400">Asset Category</TableHead>
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-center">Quantity</TableHead>
                          <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-wider text-neutral-400 text-right">Freight Value</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {consolidatedData.items.map((item: any, i: number) => (
                          <TableRow key={i} className="hover:bg-neutral-50/30 transition-colors border-b border-neutral-50 last:border-none">
                            <TableCell className="px-8 py-6 text-sm font-bold text-neutral-700">{format(new Date(item.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="px-8 py-6 font-black text-brand-900 text-sm tracking-tight">{item.orderNo}</TableCell>
                            <TableCell className="px-8 py-6 text-center">
                              {item.podVerified ? (
                                <Badge className="bg-success-50 text-success-700 border-success-100 font-black text-[8px] uppercase tracking-widest px-2 py-1 rounded-lg">Verified</Badge>
                              ) : (
                                <Badge className="bg-rose-50 text-rose-700 border-rose-100 font-black text-[8px] uppercase tracking-widest px-2 py-1 rounded-lg">Missing POD</Badge>
                              )}
                            </TableCell>
                            <TableCell className="px-8 py-6">
                              <Badge className="bg-neutral-100 text-neutral-600 border-neutral-200 font-black text-[9px] uppercase tracking-widest">{item.type}</Badge>
                            </TableCell>
                            <TableCell className="px-8 py-6 text-center font-black text-neutral-900">{item.qty}</TableCell>
                            <TableCell className="px-8 py-6 text-right font-black text-neutral-900">{formatCurrency(item.amount)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] border-2 border-dashed border-neutral-100 py-32 flex flex-col items-center justify-center text-center px-6 animate-in fade-in duration-700">
                <div className="h-24 w-24 rounded-full bg-neutral-50 flex items-center justify-center text-neutral-300 mb-6 border border-neutral-100 shadow-inner">
                  <Calculator className="h-10 w-10" />
                </div>
                <h3 className="text-xl font-black text-neutral-900 tracking-tight">Ready for Aggregation</h3>
                <p className="text-sm font-medium text-neutral-400 max-w-sm mt-2 leading-relaxed">
                  Select a dealer and specify a billing period to generate a master consolidated invoice across multiple dispatches.
                </p>
                <div className="mt-8 flex items-center gap-2 text-[10px] font-black text-neutral-300 uppercase tracking-[0.2em]">
                  <ShieldCheck className="h-4 w-4" />
                  Secure Multi-Order Processing
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </ReportContainer>
  );
}
