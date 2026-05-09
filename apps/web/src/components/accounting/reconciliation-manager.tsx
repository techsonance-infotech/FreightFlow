'use client';

import React, { useState } from 'react';
import { 
  Building2, Search, Filter, 
  CheckCircle2, XCircle, Clock,
  ArrowRight, Landmark, CreditCard,
  FileText, Download, Upload,
  MoreHorizontal, Eye, ShieldCheck,
  RotateCcw, Save, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { reconcileTransaction, unreconcileTransaction } from '@/app/actions/accounting/reconciliation';

interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  chartOfAccountId: string;
}

interface JournalLine {
  id: string;
  description: string | null;
  debit: number;
  credit: number;
  reconciledAt: any;
  statementRef: string | null;
  journalEntry: {
    voucherNo: string;
    date: Date;
    voucherType: string;
  };
  account: {
    name: string;
  };
}

interface ReconciliationManagerProps {
  bankAccounts: BankAccount[];
  unreconciledLines: JournalLine[];
  reconciledLines: JournalLine[];
}

export function ReconciliationManager({ bankAccounts, unreconciledLines, reconciledLines }: ReconciliationManagerProps) {
  const [activeBankId, setActiveBankId] = useState(bankAccounts[0]?.id || '');
  const [filter, setFilter] = useState<'pending' | 'reconciled'>('pending');
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [statementRef, setStatementRef] = useState<Record<string, string>>({});

  const activeBank = bankAccounts.find(b => b.id === activeBankId);
  
  const currentLines = filter === 'pending' ? unreconciledLines : reconciledLines;
  const filteredLines = currentLines.filter(line => 
    line.account.name.toLowerCase().includes(search.toLowerCase()) ||
    line.journalEntry.voucherNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleReconcile = async (lineId: string) => {
    const ref = statementRef[lineId];
    if (!ref) {
      toast.error('Please enter a statement reference number');
      return;
    }

    setLoadingId(lineId);
    try {
      await reconcileTransaction(lineId, ref);
      toast.success('Transaction reconciled successfully');
      setStatementRef(prev => {
        const next = { ...prev };
        delete next[lineId];
        return next;
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnreconcile = async (lineId: string) => {
    setLoadingId(lineId);
    try {
      await unreconcileTransaction(lineId);
      toast.success('Transaction unmatched');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Bank Reconciliation</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Financial Integrity & Audit Hub</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3">
            <Upload className="h-4 w-4" /> Import Statement
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 gap-3">
            <Download className="h-4 w-4" /> Export Ledger
          </Button>
        </div>
      </div>

      {/* Bank Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bankAccounts.map((bank) => (
          <button
            key={bank.id}
            onClick={() => setActiveBankId(bank.id)}
            className={cn(
              "relative p-8 rounded-[2.5rem] border-2 transition-all text-left group overflow-hidden",
              activeBankId === bank.id 
                ? "bg-slate-900 border-slate-900 text-white shadow-2xl shadow-slate-900/20 scale-[1.02]" 
                : "bg-white border-slate-100 text-slate-900 hover:border-blue-200"
            )}
          >
            <div className="relative z-10">
              <div className={cn(
                "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg",
                activeBankId === bank.id ? "bg-white/10 text-white" : "bg-blue-50 text-blue-600"
              )}>
                <Landmark className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-1">{bank.bankName}</h3>
              <p className={cn("text-[10px] font-black uppercase tracking-widest", activeBankId === bank.id ? "text-slate-400" : "text-slate-400")}>
                {bank.accountName}
              </p>
            </div>
            {activeBankId === bank.id && (
              <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-white/5 rounded-full blur-2xl" />
            )}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-50 p-2 rounded-2xl">
          <button
            onClick={() => setFilter('pending')}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
              filter === 'pending' ? "bg-white text-blue-600 shadow-md" : "text-slate-400"
            )}
          >
            <Clock className="h-4 w-4" />
            Outstanding ({unreconciledLines.length})
          </button>
          <button
            onClick={() => setFilter('reconciled')}
            className={cn(
              "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all gap-2 flex items-center",
              filter === 'reconciled' ? "bg-white text-emerald-600 shadow-md" : "text-slate-400"
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Reconciled ({reconciledLines.length})
          </button>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search reference, voucher or account..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Voucher</th>
                <th className="px-10 py-6 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">Account / Description</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Debit (Out)</th>
                <th className="px-10 py-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Credit (In)</th>
                <th className="px-10 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredLines.map((line) => (
                <tr key={line.id} className="group hover:bg-slate-50/30 transition-colors">
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-slate-900">{new Date(line.journalEntry.date).toLocaleDateString()}</p>
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{line.journalEntry.voucherNo}</p>
                    <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">{line.journalEntry.voucherType}</p>
                  </td>
                  <td className="px-10 py-8">
                    <p className="text-sm font-black text-slate-700">{line.account.name}</p>
                    <p className="text-xs font-medium text-slate-400 mt-1 max-w-xs truncate">{line.description || 'No description'}</p>
                  </td>
                  <td className="px-10 py-8 text-right">
                    {line.debit > 0 && (
                      <span className="text-sm font-black text-rose-500">₹{(line.debit / 100).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-10 py-8 text-right">
                    {line.credit > 0 && (
                      <span className="text-sm font-black text-emerald-500">₹{(line.credit / 100).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-10 py-8">
                    {filter === 'pending' ? (
                      <div className="flex items-center justify-center gap-3">
                        <Input 
                          placeholder="Statement Ref #"
                          value={statementRef[line.id] || ''}
                          onChange={(e) => setStatementRef({ ...statementRef, [line.id]: e.target.value })}
                          className="w-40 h-10 rounded-xl bg-slate-50 border-none text-[10px] font-black placeholder:text-slate-300"
                        />
                        <Button 
                          onClick={() => handleReconcile(line.id)}
                          disabled={loadingId === line.id}
                          className="h-10 px-6 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10"
                        >
                          {loadingId === line.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Match'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="flex items-center gap-2 text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                          <ShieldCheck className="h-3 w-3" /> Reconciled
                        </div>
                        <p className="text-[9px] font-bold text-slate-400">Ref: {line.statementRef}</p>
                        <button 
                          onClick={() => handleUnreconcile(line.id)}
                          disabled={loadingId === line.id}
                          className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline mt-1 opacity-0 group-hover:opacity-100 transition-all"
                        >
                          Unmatch
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredLines.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-10 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                        <RotateCcw className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No transactions found for reconciliation</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
