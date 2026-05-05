'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, Filter, Download, Plus, 
  FileText, CreditCard, AlertCircle, 
  TrendingUp, Landmark, RefreshCcw,
  Eye, Receipt, MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InvoicePreviewModal } from '@/components/accounting/invoice-preview-modal';
import { InvoiceModal } from '@/components/accounting/invoice-modal';

interface StatCardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ReactNode;
  color: 'blue' | 'rose' | 'amber' | 'emerald' | 'slate' | 'accent';
  trend?: { value: string; isUp: boolean };
}

function StatCard({ title, value, subValue, icon, color, trend }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100',
    accent: 'bg-accent-50 text-accent-600 border-accent-100',
  };

  return (
    <Card className="p-6 rounded-[32px] border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-2xl border transition-colors group-hover:bg-white group-hover:shadow-sm", colorMap[color])}>
          {icon}
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
            trend.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{value}</h3>
        <p className="text-[10px] font-bold text-neutral-400 mt-1 uppercase tracking-widest">{subValue}</p>
      </div>
    </Card>
  );
}

export default function InvoicesPage() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search ? { search } : {}),
        ...(status !== 'all' ? { status } : {}),
      });

      const [invoicesRes, summaryRes] = await Promise.all([
        fetch(`/api/v1/accounting/invoices?${queryParams}`),
        fetch(`/api/v1/accounting/invoices?summary=true`)
      ]);

      const invoices = await invoicesRes.json();
      const summaryData = await summaryRes.json();

      if (invoicesRes.ok) {
        setData(invoices.data);
        setTotal(invoices.meta.total);
      }
      if (summaryRes.ok) {
        setSummary(summaryData.data);
      }
    } catch (error) {
      toast.error('Failed to sync invoice data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, status]);

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt / 100);
  };

  const columns = [
    { 
      header: 'Invoice Details', 
      accessor: (row: any) => (
        <div className="flex items-center gap-4 py-1">
          <div className="h-10 w-10 rounded-xl bg-neutral-50 border border-neutral-100 flex items-center justify-center group-hover:bg-white group-hover:shadow-sm transition-all">
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
          <p className="font-bold text-neutral-700 leading-tight">{row.customer?.name}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-[8px] font-black uppercase tracking-tighter px-1.5 py-0 bg-neutral-50 border-neutral-100 text-neutral-400">
              GST: {row.customer?.gstin || 'N/A'}
            </Badge>
          </div>
        </div>
      )
    },
    { 
      header: 'Linked Orders', 
      accessor: (row: any) => (
        <div className="flex -space-x-2">
          {row.orders?.slice(0, 3).map((o: any, i: number) => (
            <div key={i} className="h-7 w-7 rounded-full bg-white border-2 border-neutral-50 flex items-center justify-center text-[8px] font-black text-neutral-400 shadow-sm" title={o.lrNo}>
              {o.lrNo.substring(0, 2)}
            </div>
          ))}
          {row.orders?.length > 3 && (
            <div className="h-7 w-7 rounded-full bg-accent-50 border-2 border-white flex items-center justify-center text-[8px] font-black text-accent-600 shadow-sm">
              +{row.orders.length - 3}
            </div>
          )}
        </div>
      )
    },
    { 
      header: 'Financials', 
      accessor: (row: any) => (
        <div className="text-right pr-4">
          <p className="font-black text-neutral-900">{formatAmount(row.totalAmount)}</p>
          <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
            GST: {formatAmount(row.cgst + row.sgst + row.igst)}
          </p>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Badge className={cn(
            "px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full",
            row.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
            row.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' :
            row.status === 'sent' ? 'bg-blue-50 text-blue-600 border-blue-100' :
            'bg-neutral-50 text-neutral-500 border-neutral-100'
          )}>
            {row.status}
          </Badge>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-lg text-neutral-400 hover:text-accent-600 hover:bg-accent-50"
            onClick={() => {
              setSelectedInvoice(row);
              setIsPreviewOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-lg text-neutral-400 hover:text-emerald-600 hover:bg-emerald-50"
            onClick={() => {
              toast.info('Recording receipt shortcut coming soon');
            }}
          >
            <Receipt className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
              <Landmark className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Billing Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Freight Invoices</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Manage transport billing, tax compliance and collection cycles</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button 
            variant="outline" 
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
            onClick={fetchData}
          >
            <RefreshCcw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
            Sync Invoices
          </Button>
          <Button 
            variant="outline"
            className="h-11 px-6 rounded-xl border-neutral-200 font-bold text-xs uppercase tracking-widest transition-all bg-white"
            onClick={() => window.location.href = '/dashboard/orders'}
          >
            <Plus className="h-4 w-4 mr-2" /> Generate from Orders
          </Button>
          <Button 
            className="bg-accent-600 hover:bg-accent-700 text-white font-black uppercase tracking-widest text-[10px] h-10 px-6 rounded-xl shadow-lg shadow-accent-600/20"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> New Manual Invoice
          </Button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Billed"
          value={formatAmount(summary?.totalBilled || 0)}
          subValue="Revenue Recognition"
          icon={<CreditCard className="h-6 w-6" />}
          color="slate"
        />
        <StatCard 
          title="Outstanding"
          value={formatAmount(summary?.totalOutstanding || 0)}
          subValue="Collection Pipeline"
          icon={<AlertCircle className="h-6 w-6" />}
          color="rose"
        />
        <StatCard 
          title="Monthly Billing"
          value={formatAmount(summary?.monthlyBilling || 0)}
          subValue="Current Month"
          icon={<TrendingUp className="h-6 w-6" />}
          color="blue"
          trend={{ value: 'Active', isUp: true }}
        />
        <StatCard 
          title="GST Liability"
          value={formatAmount(summary?.gstLiability || 0)}
          subValue="Tax Payable Pool"
          icon={<Landmark className="h-6 w-6" />}
          color="accent"
        />
      </div>

      {/* Registry Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-[24px] border border-neutral-100 shadow-sm">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
          <Input 
            placeholder="Search Invoice No or Notes..." 
            className="pl-11 h-12 bg-neutral-50/50 border-neutral-100 rounded-xl focus:ring-accent-600 focus:border-accent-600 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchData()}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100">
            {['all', 'sent', 'paid', 'overdue'].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  status === s ? "bg-white text-accent-600 shadow-sm" : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-neutral-100 hover:bg-neutral-50">
            <Filter className="h-4 w-4 text-neutral-400" />
          </Button>
          <Button variant="outline" className="h-12 w-12 p-0 rounded-xl border-neutral-100 hover:bg-neutral-50">
            <Download className="h-4 w-4 text-neutral-400" />
          </Button>
        </div>
      </div>

      {/* Main Registry */}
      <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden p-2">
        <DataTable
          columns={columns as any}
          data={data}
          loading={loading}
          pagination={{
            page,
            total,
            limit: 50,
            onPageChange: setPage
          }}
        />
      </div>

      <InvoicePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        invoice={selectedInvoice}
      />

      <InvoiceModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchData}
      />
    </div>
  );
}
