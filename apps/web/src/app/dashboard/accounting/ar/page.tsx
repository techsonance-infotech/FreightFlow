'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Clock, Users, Search, RefreshCcw, 
  Download, Filter, ChevronRight, AlertCircle,
  CheckCircle2, Landmark, ArrowRight, FileText,
  Mail, Calendar, BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  ReportContainer, StatCard, ReportSectionHeader, 
  LoadingState, EmptyReportState, Pagination
} from '@/components/reports/report-components';
import { DataTable } from '@/components/ui/data-table';
import { Badge } from '@/components/ui/badge';
import { ReceiptModal } from '@/components/accounting/receipt-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function AccountsReceivablePage() {
  const [data, setData] = useState<{ buckets: any, items: any[], meta: any }>({ buckets: {}, items: [], meta: {} });
  const [loading, setLoading] = useState(true);
  const [dealers, setDealers] = useState<any[]>([]);
  
  // Filters
  const [search, setSearch] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: 'AR',
        search,
        customerId,
        startDate,
        endDate,
        page: page.toString(),
        limit: limit.toString()
      });
      const response = await fetch(`/api/v1/accounting/reports/ageing?${params}`);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to fetch Accounts Receivable');
    } finally {
      setLoading(false);
    }
  };

  const fetchDealers = async () => {
    try {
      const res = await fetch('/api/v1/masters/dealers');
      const json = await res.json();
      if (json.data) setDealers(json.data);
    } catch (err) {
      console.error('Failed to fetch dealers');
    }
  };

  useEffect(() => {
    fetchDealers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [search, customerId, startDate, endDate, page, limit]);

  const formatAmount = (paise: number) => {
    return new Intl.NumberFormat('en-IN', { 
      style: 'currency', 
      currency: 'INR',
      maximumFractionDigits: 0 
    }).format(paise / 100);
  };

  const columns = [
    {
      header: 'Invoice Details',
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-neutral-50 flex items-center justify-center border border-neutral-100 group-hover:bg-accent-50 transition-colors">
            <FileText className="h-5 w-5 text-neutral-400 group-hover:text-accent-600" />
          </div>
          <div>
            <p className="font-black text-neutral-900 leading-tight">{row.invoiceNo}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
              {new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>
      )
    },
    {
      header: 'Customer',
      accessor: (row: any) => (
        <div>
          <p className="font-bold text-neutral-700 leading-tight">{row.customer.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 bg-neutral-50 border-neutral-100 text-neutral-400">
              PAN: {row.customer.pan}
            </Badge>
          </div>
        </div>
      )
    },
    {
      header: 'Ageing Status',
      accessor: (row: any) => {
        const days = row.daysOverdue;
        const config = days > 90 ? { color: 'bg-error-50 text-error-700 border-error-100', icon: <AlertCircle className="h-3 w-3" />, label: '90+ Days' } :
                      days > 60 ? { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" />, label: '61-90 Days' } :
                      days > 30 ? { color: 'bg-accent-50 text-accent-700 border-accent-100', icon: <Clock className="h-3 w-3" />, label: '31-60 Days' } :
                      { color: 'bg-success-50 text-success-700 border-success-100', icon: <CheckCircle2 className="h-3 w-3" />, label: '0-30 Days' };
        
        return (
          <div className="flex flex-col gap-1.5">
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border", config.color)}>
              {config.icon}
              {config.label}
            </span>
            <p className="text-[10px] font-bold text-neutral-400 italic ml-1">{days} Days Outstanding</p>
          </div>
        );
      }
    },
    {
      header: 'Outstanding Amount',
      className: 'text-right',
      accessor: (row: any) => (
        <div className="space-y-0.5">
          <p className="text-sm font-black text-neutral-900">{formatAmount(row.totalAmount)}</p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest italic">Base: {formatAmount(row.subtotal)}</p>
        </div>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      accessor: (row: any) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" className="h-8 rounded-lg border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-bold text-[10px] uppercase">
            <Mail className="h-3 w-3 mr-1.5" /> Remind
          </Button>
          <Button 
            size="sm" 
            className="h-8 rounded-lg bg-accent-600 hover:bg-accent-700 text-white font-bold text-[10px] uppercase"
            onClick={() => {
              setSelectedInvoice(row);
              setIsReceiptModalOpen(true);
            }}
          >
            Record Receipt
          </Button>
        </div>
      )
    }
  ];

  const total = data.buckets.total || 1;
  const getWidth = (amt: number) => `${(amt / total) * 100}%`;

  return (
    <ReportContainer>
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Core Accounting</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Accounts Receivable</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Monitor unpaid invoices and manage customer collection cycles</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button className="h-11 px-6 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 rounded-xl font-bold text-xs uppercase tracking-widest transition-all">
            <Download className="h-4 w-4 mr-2" />
            Collection Report
          </Button>
          <Button 
            onClick={fetchData}
            variant="outline" 
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Refresh Ageing
          </Button>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Outstanding"
          value={formatAmount(data.buckets.total || 0)}
          subValue={`${data.meta?.total || 0} Pending Invoices`}
          icon={<CreditCard className="h-6 w-6" />}
          color="slate"
        />
        <StatCard 
          title="Overdue (>30 Days)"
          value={formatAmount(data.buckets.overdue || 0)}
          subValue="High Priority Collection"
          icon={<AlertCircle className="h-6 w-6" />}
          color="rose"
          trend={{ value: `${Math.round(((data.buckets.overdue || 0) / (data.buckets.total || 1)) * 100)}% of total`, isUp: true }}
        />
        <StatCard 
          title="Avg. Ageing"
          value={`${data.meta?.averageAgeing || 0} Days`}
          subValue="Current Collection Cycle"
          icon={<Clock className="h-6 w-6" />}
          color="amber"
        />
        <StatCard 
          title="Collection Efficiency"
          value={`${data.meta?.collectionEfficiency || 0}%`}
          subValue="Vs. Target 90%"
          icon={<BarChart3 className="h-6 w-6" />}
          color="emerald"
        />
      </div>

      {/* Improved Ageing Buckets Visualizer */}
      <div className="bg-white p-8 rounded-[32px] border border-neutral-100 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between mb-8 px-2">
          <div>
            <h3 className="text-sm font-black text-neutral-900 uppercase tracking-widest">Ageing Distribution</h3>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Weighted allocation of receivables</p>
          </div>
          <div className="flex gap-6">
            {[
              { label: 'Current', color: 'bg-success-500', value: data.buckets['0_30'] },
              { label: '31-60', color: 'bg-accent-500', value: data.buckets['31_60'] },
              { label: '61-90', color: 'bg-amber-500', value: data.buckets['61_90'] },
              { label: '90+', color: 'bg-error-500', value: data.buckets['90_plus'] },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-2">
                  <div className={cn("h-2 w-2 rounded-full", b.color)} />
                  <span className="text-[10px] font-black text-neutral-900 uppercase tracking-wider">{b.label}</span>
                </div>
                <p className="text-[10px] font-bold text-neutral-400">{formatAmount(b.value || 0)}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative h-14 w-full bg-neutral-50 rounded-2xl overflow-hidden shadow-inner flex border border-neutral-100 p-1">
          <div className="h-full bg-success-500 rounded-l-xl transition-all duration-700 hover:brightness-110 flex items-center justify-center group/bucket overflow-hidden" style={{ width: getWidth(data.buckets['0_30'] || 0) }}>
            <span className="text-[8px] font-black text-white opacity-0 group-hover/bucket:opacity-100 transition-opacity whitespace-nowrap px-2">0-30 DAYS</span>
          </div>
          <div className="h-full bg-accent-500 transition-all duration-700 hover:brightness-110 flex items-center justify-center group/bucket overflow-hidden border-x border-white/10" style={{ width: getWidth(data.buckets['31_60'] || 0) }}>
            <span className="text-[8px] font-black text-white opacity-0 group-hover/bucket:opacity-100 transition-opacity whitespace-nowrap px-2">31-60 DAYS</span>
          </div>
          <div className="h-full bg-amber-500 transition-all duration-700 hover:brightness-110 flex items-center justify-center group/bucket overflow-hidden border-r border-white/10" style={{ width: getWidth(data.buckets['61_90'] || 0) }}>
            <span className="text-[8px] font-black text-white opacity-0 group-hover/bucket:opacity-100 transition-opacity whitespace-nowrap px-2">61-90 DAYS</span>
          </div>
          <div className="h-full bg-error-500 rounded-r-xl transition-all duration-700 hover:brightness-110 flex items-center justify-center group/bucket overflow-hidden" style={{ width: getWidth(data.buckets['90_plus'] || 0) }}>
            <span className="text-[8px] font-black text-white opacity-0 group-hover/bucket:opacity-100 transition-opacity whitespace-nowrap px-2">OVERDUE 90+</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm flex flex-wrap items-center gap-6">
        <div className="flex-1 min-w-[300px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Quick Search</p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
            <input 
              type="text"
              placeholder="Search by invoice # or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/5 focus:border-accent-600 transition-all"
            />
          </div>
        </div>

        <div className="w-[240px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Customer Filter</p>
          <div className="relative group">
            <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
            <select 
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/5 focus:border-accent-600 transition-all appearance-none cursor-pointer"
            >
              <option value="">All Customers</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="w-[320px]">
          <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-2 px-1">Date Range Filtering</p>
          <div className="flex items-center gap-2 bg-neutral-50 p-1 rounded-2xl border border-neutral-100">
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
            />
            <div className="h-4 w-[1px] bg-neutral-200" />
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="flex-1 bg-transparent border-none text-xs font-bold outline-none text-neutral-700 h-10 px-2"
            />
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      {loading && data.items.length === 0 ? (
        <LoadingState rows={8} />
      ) : data.items.length === 0 ? (
        <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm p-12">
          <EmptyReportState 
            title="Clean Sheet!" 
            description="No outstanding receivables found matching your current filters. Great collection effort!"
            icon={<CheckCircle2 className="h-12 w-12 text-success-500" />}
          />
        </div>
      ) : (
        <div className="bg-white rounded-[40px] border border-neutral-100 shadow-sm overflow-hidden">
          <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
            <DataTable 
              columns={columns as any} 
              data={data.items} 
              loading={loading}
              pagination={{
                page,
                limit,
                total: data.meta?.total || 0,
                onPageChange: setPage,
                onLimitChange: setLimit
              }}
            />
          </div>
          <div className="px-8 py-6 bg-neutral-50/50 border-t border-neutral-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Generated at: {new Date().toLocaleString()}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-error-500 animate-pulse" />
                <span className="text-[10px] font-black text-error-600 uppercase tracking-widest">Live Audit Data</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={fetchData}
      />
    </ReportContainer>
  );
}

