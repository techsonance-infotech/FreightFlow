'use client';

import React, { useState, useEffect } from 'react';
import { DataTable } from '@/components/ui/data-table';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { VoucherForm } from '@/components/accounting/voucher-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Plus, Search, Filter, Printer, Copy, FileText, 
  CheckCircle2, History, Landmark, ArrowRight, Download, RefreshCcw,
  Calendar, X
} from 'lucide-react';

export default function VouchersPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountOptions, setAccountOptions] = useState<{id: string, name: string, code: string}[]>([]);
  const [dealers, setDealers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedParty, setSelectedParty] = useState('all');

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      let url = `/api/v1/accounting/vouchers?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&type=${typeFilter}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;
      if (selectedParty !== 'all') url += `&partyId=${selectedParty}`;
      
      const response = await fetch(url);
      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        setTotal(result.meta.total);
      }
    } catch (error) {
      toast.error('Failed to fetch vouchers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch COA and Dealers for dropdowns
    const fetchMasters = async () => {
      try {
        const [resCoa, resDealers] = await Promise.all([
          fetch('/api/v1/accounting/coa'),
          fetch('/api/v1/masters/dealers')
        ]);
        
        const coaData = await resCoa.json();
        const dealersData = await resDealers.json();
        
        const flatten = (nodes: any[], r: any[] = []) => {
          nodes.forEach(n => {
            r.push(n);
            if (n.children) flatten(n.children, r);
          });
          return r;
        };
        setAccountOptions(flatten(coaData.data || []));
        setDealers(dealersData.data || []);
      } catch (error) {
        console.error('Failed to fetch masters:', error);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [page, typeFilter, selectedParty, startDate, endDate]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (page === 1) fetchVouchers();
      else setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setStartDate('');
    setEndDate('');
    setSelectedParty('all');
    setPage(1);
    toast.success('Filters cleared');
  };

  // Logic consolidated into fetchMasters above

  const columns = [
    { 
      header: 'Voucher Date', 
      accessor: (row: any) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-neutral-50 flex items-center justify-center text-neutral-400">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{row.voucherType}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Voucher Identity', 
      accessor: (row: any) => (
        <div className="group">
          <div className="flex items-center gap-2">
            <p className="font-black text-neutral-900 text-sm tracking-tight">{row.voucherNo}</p>
            <CheckCircle2 className="h-3 w-3 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">{row.narration || 'No Narration'}</p>
        </div>
      )
    },
    { 
      header: 'Total Value', 
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className="font-black text-neutral-900 text-sm">
            ₹{(row.totalAmount / 100).toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Balanced Entry</span>
        </div>
      )
    },
    {
      header: 'Ledger Impact',
      accessor: (row: any) => (
        <div className="space-y-2 py-1">
          {row.lines.slice(0, 2).map((l: any, i: number) => (
            <div key={i} className="flex items-center gap-2 text-[10px]">
              <div className={`w-1 h-3 rounded-full ${l.debit > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="font-bold text-neutral-500 truncate max-w-[120px]">{l.account?.name}</span>
              <span className={`font-black ml-auto ${l.debit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {l.debit > 0 ? `DR ${(l.debit/100).toLocaleString()}` : `CR ${(l.credit/100).toLocaleString()}`}
              </span>
            </div>
          ))}
          {row.lines.length > 2 && (
            <div className="flex items-center gap-2 text-[9px] font-black text-accent-600 uppercase tracking-tighter pl-3">
              + {row.lines.length - 2} more accounting lines
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex justify-end gap-1">
          <button title="Print Voucher" className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-all">
            <Printer className="h-4 w-4" />
          </button>
          <button title="Duplicate Entry" className="p-2 hover:bg-accent-50 rounded-lg text-neutral-400 hover:text-accent-600 transition-all">
            <Copy className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Journal Intelligence</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Universal ledger for manual vouchers, adjustments, and contra entries</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            className="h-12 w-12 p-0 rounded-2xl border-neutral-200"
            title="Export to CSV"
          >
            <Download className="h-4 w-4 text-neutral-400" />
          </Button>
          <Button 
            variant="outline" 
            className="h-12 w-12 p-0 rounded-2xl border-neutral-200" 
            onClick={fetchVouchers}
            title="Refresh Data"
          >
            <RefreshCcw className={cn("h-4 w-4 text-neutral-400", loading && "animate-spin")} />
          </Button>
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="h-12 px-8 rounded-2xl bg-accent-600 hover:bg-accent-700 shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest"
            icon={<Plus className="h-4 w-4" />}
          >
            Post New Voucher
          </Button>
        </div>
      </div>

      {/* 2. Advanced Controls Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="lg:col-span-3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
          <input 
            placeholder="Search Reference..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-11 pl-12 pr-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all shadow-sm"
          />
        </div>
        
        {/* Type Filter */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
            <select 
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-white border border-neutral-100 rounded-xl text-[11px] font-bold text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Types</option>
              <option value="journal">Journal</option>
              <option value="payment">Payment</option>
              <option value="receipt">Receipt</option>
              <option value="contra">Contra</option>
            </select>
          </div>
        </div>

        {/* Dealer/Party Filter */}
        <div className="lg:col-span-2">
          <div className="relative group">
            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
            <select 
              value={selectedParty}
              onChange={e => setSelectedParty(e.target.value)}
              className="w-full h-11 pl-10 pr-8 bg-white border border-neutral-100 rounded-xl text-[11px] font-bold text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Parties / Dealers</option>
              {dealers.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range */}
        <div className="lg:col-span-2 relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
          <input 
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full h-11 pl-10 pr-3 bg-white border border-neutral-100 rounded-xl text-[10px] font-bold text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all shadow-sm"
          />
        </div>

        <div className="lg:col-span-2 relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
          <input 
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="w-full h-11 pl-10 pr-3 bg-white border border-neutral-100 rounded-xl text-[10px] font-bold text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 focus:border-accent-600 transition-all shadow-sm"
          />
        </div>

        {/* Clear Filters */}
        <div className="lg:col-span-1 flex items-center justify-center">
          <Button 
            variant="ghost" 
            onClick={clearFilters}
            className="h-11 w-11 p-0 rounded-xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all"
            title="Clear All Filters"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 3. Data Registry */}
      <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden">
        <DataTable
          columns={columns as any}
          data={data}
          loading={loading}
          pagination={{
            page,
            total,
            limit,
            onPageChange: setPage
          }}
        />
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Manual Voucher"
        size="xl"
      >
        <VoucherForm
          accountOptions={accountOptions}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchVouchers();
          }}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
