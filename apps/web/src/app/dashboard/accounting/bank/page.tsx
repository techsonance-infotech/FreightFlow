'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Upload, CheckCircle2, AlertCircle, Landmark, 
  Search, Filter, Save, History, FileCheck, 
  ArrowRight, IndianRupee, RefreshCcw, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';

export default function BankReconciliationPage() {
  const [data, setData] = useState<{ matched: any[], unmatchedSystem: any[], unmatchedBank: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [bookBalance, setBookBalance] = useState(0);
  const [statementBalance, setStatementBalance] = useState(0);
  const [isParsing, setIsParsing] = useState(false);

  useEffect(() => {
    // Fetch bank accounts from COA
    fetch('/api/v1/accounting/coa')
      .then(res => res.json())
      .then(res => {
        const flatten = (nodes: any[], r: any[] = []) => {
          if (!nodes || !Array.isArray(nodes)) return r;
          nodes.forEach(n => {
            if (n && n.type === 'asset') {
              r.push(n);
            }
            if (n && n.children) flatten(n.children, r);
          });
          return r;
        };
        setAccounts(flatten(res.data || []));
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      // Fetch current book balance from trial balance
      fetch('/api/v1/accounting/reports/trial-balance')
        .then(res => res.json())
        .then(res => {
          const accBalance = res.data?.find((b: any) => b.account.id === selectedAccount);
          setBookBalance(accBalance ? accBalance.closingBalance : 0);
        })
        .catch(console.error);
    }
  }, [selectedAccount]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAccount) {
      if (!selectedAccount) toast.error('Please select a bank account first');
      return;
    }

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rows = XLSX.utils.sheet_to_json(ws);

        // Map standard columns (Flexible mapping)
        const statementRows = rows.map((row: any) => ({
          date: row.Date || row.date || row['Value Date'] || new Date().toISOString(),
          amount: Math.round((Number(row.Amount || row.amount || row.Credit || row.Debit || 0)) * 100),
          type: row.Type || row.type || (row.Credit ? 'CR' : 'DR'),
          reference: row.Reference || row.reference || row['Cheque No'] || row.Description || 'Bank Entry'
        }));

        setStatementBalance(statementRows.reduce((acc, r) => acc + r.amount, 0));
        
        // Send to backend for auto-matching
        setLoading(true);
        const response = await fetch('/api/v1/accounting/bank-recon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: selectedAccount, statementRows })
        });

        const result = await response.json();
        if (response.ok) {
          setData(result.data);
          toast.success(`Successfully parsed ${statementRows.length} transactions`);
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        toast.error(`Parsing Error: ${error.message}`);
      } finally {
        setIsParsing(false);
        setLoading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const formatAmount = (paise: number) => {
    return (Math.abs(paise) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Bank Reconciliation</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Audit and align your digital ledger with official bank statements</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-neutral-200 font-bold text-xs uppercase tracking-widest">
            <History className="h-4 w-4 mr-2" /> History
          </Button>
          {data && (
             <Button 
              className="h-12 px-8 rounded-2xl bg-accent-600 hover:bg-accent-700 shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest"
              icon={<Save className="h-4 w-4" />}
            >
              Finalize Reconciliation
            </Button>
          )}
        </div>
      </div>

      {/* 2. Reconciliation Engine Control */}
      <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] rotate-12">
          <Landmark className="h-48 w-48" />
        </div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Active Bank Ledger</label>
            <div className="relative group">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
              <select 
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full h-14 pl-12 pr-10 bg-neutral-50 border-none rounded-2xl text-sm font-black text-neutral-700 outline-none focus:ring-4 focus:ring-accent-600/5 transition-all appearance-none cursor-pointer"
              >
                <option value="">-- Select GL Bank Account --</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.code} — {acc.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Statement Upload (CSV/XLSX)</label>
            <div className="relative group">
              <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-focus-within:text-accent-600 transition-colors" />
              <input 
                type="file" 
                accept=".csv, .xlsx, .xls"
                onChange={handleFileUpload}
                disabled={!selectedAccount || isParsing}
                className="w-full h-14 pl-12 pr-4 bg-neutral-50 border-none rounded-2xl text-xs font-bold text-neutral-500 flex items-center pt-4 cursor-pointer file:hidden" 
              />
              {!isParsing && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-accent-600 uppercase">Click to Browse</span>}
              {isParsing && <RefreshCcw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-600 animate-spin" />}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Button 
              className="w-full h-14 rounded-2xl bg-accent-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent-600/20 hover:bg-accent-700 transition-all"
              onClick={() => {
                if (!selectedAccount) toast.error('Select an account first');
                else document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
              }}
            >
              Start Engine
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Reconciliation Dashboard (Bridge) */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
           <BalanceCard 
              label="Balance as per Books" 
              value={formatAmount(bookBalance)} 
              status="System Ledger"
              icon={<FileCheck className="h-5 w-5 text-accent-600" />}
              color="accent"
           />
           <BalanceCard 
              label="Balance as per Bank" 
              value={formatAmount(statementBalance)} 
              status="Uploaded Statement"
              icon={<Landmark className="h-5 w-5 text-neutral-600" />}
              color="neutral"
           />
           <BalanceCard 
              label="Difference to Reconcile" 
              value={formatAmount(bookBalance - statementBalance)} 
              status={bookBalance === statementBalance ? "Fully Reconciled" : "Pending Adjustment"}
              icon={bookBalance === statementBalance ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <AlertCircle className="h-5 w-5 text-rose-500" />}
              color={bookBalance === statementBalance ? "emerald" : "rose"}
           />
        </div>
      )}

      {/* 4. Comparison View */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Matched Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </span> 
                Verified Matches ({data.matched.length})
              </h3>
            </div>
            <div className="bg-white rounded-[2rem] border border-emerald-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
              {data.matched.length === 0 ? (
                <div className="p-16 text-center">
                  <p className="text-sm font-bold text-neutral-400">No automatic matches detected.</p>
                </div>
              ) : (
                data.matched.map((m, i) => (
                  <div key={i} className="p-6 hover:bg-emerald-50/20 transition-all group flex justify-between items-center">
                    <div>
                      <p className="font-black text-neutral-900 text-sm tracking-tight">{m.bankTransaction.reference}</p>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight">{new Date(m.bankTransaction.date).toLocaleDateString('en-IN')}</span>
                         <span className="h-1 w-1 rounded-full bg-neutral-200" />
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">{m.matchScore}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-lg tracking-tighter">{formatAmount(m.bankTransaction.amount)}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase">Ref: {m.systemTransaction.journalEntry.voucherNo}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Unmatched Panel */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <AlertCircle className="h-4 w-4" />
                </span> 
                Unmatched Statement Entries ({data.unmatchedBank.length})
              </h3>
            </div>
            <div className="bg-white rounded-[2rem] border border-rose-100 shadow-sm overflow-hidden divide-y divide-neutral-50">
              {data.unmatchedBank.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="h-16 w-16 rounded-3xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-black text-neutral-900">Zero Variance</p>
                  <p className="text-xs font-bold text-neutral-400 mt-1 uppercase">All bank entries successfully matched</p>
                </div>
              ) : (
                data.unmatchedBank.map((ub, i) => (
                  <div key={i} className="p-6 hover:bg-rose-50/20 transition-all group flex justify-between items-center">
                    <div>
                      <p className="font-black text-neutral-900 text-sm tracking-tight">{ub.reference || 'Unknown Entry'}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-tight mt-1">{new Date(ub.date).toLocaleDateString('en-IN')}</p>
                    </div>
                    <div className="text-right flex items-center gap-6">
                      <div>
                        <p className="font-black text-rose-600 text-lg tracking-tighter">{formatAmount(ub.amount)}</p>
                        <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Entry Missing in Books</p>
                      </div>
                      <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-neutral-200 font-bold text-[10px] uppercase tracking-widest hover:bg-accent-600 hover:text-white hover:border-accent-600 transition-all">
                        Post Adjustment
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BalanceCard({ label, value, status, icon, color }: any) {
  const styles: any = {
    accent: 'bg-accent-50/30 border-accent-100',
    neutral: 'bg-neutral-50/30 border-neutral-100',
    emerald: 'bg-emerald-50/30 border-emerald-100',
    rose: 'bg-rose-50/30 border-rose-100',
  };

  return (
    <div className={cn("p-8 rounded-[2rem] border shadow-sm group hover:shadow-md transition-all", styles[color])}>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">{label}</p>
        <div className="p-2.5 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <h3 className="text-3xl font-black text-neutral-900 tracking-tighter">{value}</h3>
      <div className="flex items-center gap-2 mt-2">
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
          color === 'emerald' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 
          color === 'rose' ? 'bg-rose-100 text-rose-700 border-rose-200' :
          'bg-white text-neutral-500 border-neutral-100'
        )}>
          {status}
        </span>
      </div>
    </div>
  );
}
