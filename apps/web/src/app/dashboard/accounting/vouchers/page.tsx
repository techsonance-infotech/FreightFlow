'use client';

import React, { useState, useEffect } from 'react';
import { 
  Landmark, Receipt, ArrowUpRight, ArrowDownLeft, 
  Settings2, Search, Filter, Calendar, FileText, 
  Trash2, Copy, MoreVertical, X, Layers,
  CheckCircle2, AlertCircle, Clock, Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import ReportTable from '@/components/reports/ReportTable';
import SimpleVoucherModal from '@/components/accounting/SimpleVoucherModal';
import AdvancedVoucherModal from '@/components/accounting/AdvancedVoucherModal';

export default function AccountingVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().substring(0, 7));
  const [accountFilter, setAccountFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountOptions, setAccountOptions] = useState<any[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimpleModalOpen, setIsSimpleModalOpen] = useState(false);
  const [simpleModalType, setSimpleModalType] = useState<'payment' | 'receipt'>('payment');
  const [editingEntry, setEditingEntry] = useState<any>(null);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        month: monthFilter,
        search,
        accountId: accountFilter,
        status: statusFilter
      });
      const res = await fetch(`/api/v1/accounting/vouchers?${params}`);
      const json = await res.json();
      if (json.data) setVouchers(json.data);
    } catch (err) {
      toast.error('Failed to sync ledger transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/v1/accounting/coa');
      const json = await res.json();
      if (json.data) {
        const flat: any[] = [];
        const flatten = (items: any[]) => {
          items.forEach(i => {
            flat.push(i);
            if (i.children) flatten(i.children);
          });
        };
        flatten(json.data);
        setAccountOptions(flat);
      }
    } catch (err) {
      console.error('Failed to fetch accounts');
    }
  };

  useEffect(() => {
    fetchVouchers();
    fetchAccounts();
  }, [monthFilter, accountFilter, statusFilter]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/accounting/vouchers/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        toast.success('Voucher approved and posted to ledger');
        fetchVouchers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Approval failed');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setMonthFilter(new Date().toISOString().substring(0, 7));
    setAccountFilter('all');
    setStatusFilter('all');
  };

  const handleEdit = (row: any) => {
    setEditingEntry(row);
    setIsModalOpen(true);
  };

  const columns = [
    { 
      header: 'Date & Type', 
      accessor: (row: any) => (
        <div className="flex items-center gap-4">
          <div className={cn(
            "h-10 w-10 rounded-xl flex items-center justify-center border shadow-sm",
            row.voucherType === 'payment' ? "bg-rose-50 border-rose-100 text-rose-600" : 
            row.voucherType === 'receipt' ? "bg-emerald-50 border-emerald-100 text-emerald-600" : 
            "bg-neutral-50 border-neutral-100 text-neutral-600"
          )}>
            {row.voucherType === 'payment' ? <ArrowUpRight className="h-5 w-5" /> : 
             row.voucherType === 'receipt' ? <ArrowDownLeft className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-black text-neutral-900">{new Date(row.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{row.voucherType}</p>
          </div>
        </div>
      )
    },
    { 
      header: 'Reference', 
      accessor: (row: any) => (
        <div className="group">
          <div className="flex items-center gap-2">
            <p className="font-black text-neutral-900 text-sm tracking-tight">{row.voucherNo}</p>
            {row.metadata?.receiptUrl && (
              <FileText className="h-3 w-3 text-accent-600" />
            )}
          </div>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest truncate max-w-[200px]">{row.narration || 'No Narration'}</p>
        </div>
      )
    },
    { 
      header: 'Amount', 
      accessor: (row: any) => (
        <div className="flex flex-col">
          <span className={cn(
            "font-black text-sm",
            row.voucherType === 'payment' ? "text-rose-600" : 
            row.voucherType === 'receipt' ? "text-emerald-600" : "text-neutral-900"
          )}>
            {row.voucherType === 'payment' ? '-' : '+'} ₹{(row.totalAmount / 100).toLocaleString('en-IN')}
          </span>
          <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">
            {row.status === 'posted' ? 'Impacted Ledger' : 'Draft Only'}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row: any) => (
        <Badge className={cn(
          "font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-lg border-none shadow-sm",
          row.status === 'posted' ? "bg-emerald-50 text-emerald-600" :
          row.status === 'pending' ? "bg-amber-50 text-amber-600" : "bg-neutral-100 text-neutral-500"
        )}>
          {row.status === 'posted' ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
          {row.status || 'posted'}
        </Badge>
      )
    },
    {
      header: 'Operational Context',
      accessor: (row: any) => (
        <div className="flex flex-col gap-1.5">
          {row.category ? (
            <div className="flex items-center gap-2">
              <Badge className={cn(
                "font-black text-[8px] uppercase tracking-widest px-2 py-0.5 rounded border-none",
                row.category === 'fuel' ? "bg-amber-100 text-amber-700" :
                row.category === 'maintenance' ? "bg-blue-100 text-blue-700" :
                row.category === 'trip' ? "bg-purple-100 text-purple-700" : "bg-neutral-100 text-neutral-600"
              )}>
                {row.category}
              </Badge>
            </div>
          ) : (
            <span className="text-[9px] font-bold text-neutral-300 uppercase italic">General Ledger</span>
          )}
          {row.tripId && (
            <div className="flex items-center gap-1.5 text-[9px] font-black text-accent-600 uppercase bg-accent-50 px-2 py-0.5 rounded w-fit">
              <Layers className="h-2.5 w-2.5" />
              Trip Link
            </div>
          )}
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: (row: any) => (
        <div className="flex justify-end items-center gap-2">
          {row.status !== 'posted' && (
            <button 
              onClick={() => handleApprove(row.id)} 
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg transition-all flex items-center gap-1.5 font-black text-[9px] uppercase tracking-widest border border-emerald-100 shadow-sm"
              title="Approve & Post"
            >
              <CheckCircle2 className="h-3 w-3" /> Approve
            </button>
          )}
          <div className="flex gap-1">
            <button onClick={() => handleEdit(row)} className="p-2 hover:bg-neutral-100 rounded-lg text-neutral-400 hover:text-neutral-600 transition-all">
              <Settings2 className="h-4 w-4" />
            </button>
            <button className="p-2 hover:bg-accent-50 rounded-lg text-neutral-400 hover:text-accent-600 transition-all">
              <Copy className="h-4 w-4" />
            </button>
          </div>
        </div>
      )
    }
  ];

  const openSimpleModal = (type: 'payment' | 'receipt') => {
    setEditingEntry(null);
    setSimpleModalType(type);
    setIsSimpleModalOpen(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded bg-accent-600 flex items-center justify-center">
              <Landmark className="h-3 w-3 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Financial Ledger</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Cash & Bank Transactions</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Record money move, operational expenses, and miscellaneous receipts</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setIsModalOpen(true)} className="h-12 px-5 rounded-2xl border-neutral-200 font-bold text-xs uppercase tracking-widest gap-2 bg-white shadow-sm hover:bg-neutral-50">
            <Settings2 className="h-4 w-4" /> Advanced
          </Button>
          <div className="h-8 w-[1px] bg-neutral-100 mx-1" />
          <Button onClick={() => openSimpleModal('receipt')} className="h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95">
            <ArrowDownLeft className="h-4 w-4 mr-2" /> Money In
          </Button>
          <Button onClick={() => openSimpleModal('payment')} className="h-12 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-xl shadow-rose-600/20 font-black text-xs uppercase tracking-widest transition-all active:scale-95">
            <ArrowUpRight className="h-4 w-4 mr-2" /> Money Out
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2.5rem] border border-neutral-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-center">
          <div className="xl:col-span-4 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
            <input 
              placeholder="Search Reference or Narration..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-neutral-50 border border-transparent rounded-2xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all shadow-inner"
            />
          </div>
          <div className="xl:col-span-2">
            <input type="month" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} className="w-full h-12 px-4 bg-neutral-50 border border-transparent rounded-2xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all cursor-pointer shadow-inner" />
          </div>
          <div className="xl:col-span-3">
            <select value={accountFilter} onChange={e => setAccountFilter(e.target.value)} className="w-full h-12 px-4 bg-neutral-50 border border-transparent rounded-2xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all cursor-pointer shadow-inner appearance-none">
              <option value="all">All Cash / Bank Accounts</option>
              {accountOptions.filter(a => a.name.toLowerCase().includes('bank') || a.name.toLowerCase().includes('cash')).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name}</option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full h-12 px-4 bg-neutral-50 border border-transparent rounded-2xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all cursor-pointer shadow-inner appearance-none">
              <option value="all">All Statuses</option>
              <option value="posted">Posted (Ledger)</option>
              <option value="pending">Pending Approval</option>
              <option value="draft">Drafts</option>
            </select>
          </div>
          <div className="xl:col-span-1 flex justify-center">
            <Button variant="ghost" onClick={clearFilters} className="h-12 w-12 p-0 rounded-2xl text-neutral-400 hover:text-rose-500 hover:bg-rose-50 transition-all">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <ReportTable 
          columns={columns} 
          data={vouchers} 
          loading={loading}
          onRowClick={handleEdit}
        />
      </div>

      <SimpleVoucherModal 
        isOpen={isSimpleModalOpen} 
        onClose={() => setIsSimpleModalOpen(false)} 
        type={simpleModalType}
        initialData={editingEntry}
        accountOptions={accountOptions}
        onSuccess={fetchVouchers}
      />

      <AdvancedVoucherModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingEntry}
        accountOptions={accountOptions}
        onSuccess={fetchVouchers}
      />
    </div>
  );
}
