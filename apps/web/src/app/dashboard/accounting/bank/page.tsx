'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Upload, CheckCircle2, AlertCircle, Landmark, 
  Search, Filter, Save, History, FileCheck, 
  ArrowRight, IndianRupee, RefreshCcw, Download, ChevronDown,
  ArrowUpRight, ArrowDownLeft, X, Activity, Layers, ListFilter
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/modal';
import { SimplifiedTransactionForm } from '@/components/accounting/simplified-transaction-form';
import { Badge } from '@/components/ui/badge';

export default function BankReconciliationPage() {
  const [data, setData] = useState<{ matched: any[], unmatchedSystem: any[], unmatchedBank: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [bookBalance, setBookBalance] = useState(0);
  const [statementBalance, setStatementBalance] = useState(0);
  const [isParsing, setIsParsing] = useState(false);
  
  // Tab State for Unmatched
  const [activeTab, setActiveTab] = useState<'bank' | 'system'>('bank');

  // Adjustment Modal
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [pendingAdjustment, setPendingAdjustment] = useState<any>(null);
  const [accountOptions, setAccountOptions] = useState<any[]>([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await fetch('/api/v1/accounting/coa');
        const json = await response.json();
        
        const flatten = (nodes: any[], r: any[] = []) => {
          if (!nodes || !Array.isArray(nodes)) return r;
          nodes.forEach(n => {
            if (!n.isGroup) r.push(n);
            if (n.children) flatten(n.children, r);
          });
          return r;
        };

        const allAccounts = flatten(json.data || []);
        setAccountOptions(allAccounts);
        setAccounts(allAccounts.filter(a => 
          a.name.toLowerCase().includes('bank') || 
          a.name.toLowerCase().includes('cash') || 
          a.type.toLowerCase() === 'asset'
        ));
      } catch (error: any) {
        toast.error('Failed to load bank ledgers');
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
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
    if (!file || !selectedAccount) return;

    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws);

        const statementRows = rows.map((row: any, index: number) => {
          const rawDate = row.Date || row.date || row['Value Date'] || row['Transaction Date'];
          const credit = row.Credit || row.credit || row['Deposit'] || 0;
          const debit = row.Debit || row.debit || row['Withdrawal'] || 0;
          const amount = Math.abs(parseFloat(credit) || parseFloat(debit) || parseFloat(row.Amount) || 0);
          
          return {
            date: new Date(rawDate).toISOString(),
            amount: Math.round(amount * 100),
            type: credit > 0 ? 'CR' : 'DR',
            reference: row.Reference || row.Description || row.Narration || `Txn #${index + 1}`
          };
        }).filter(r => !isNaN(new Date(r.date).getTime()));

        setStatementBalance(statementRows.reduce((acc, r) => acc + (r.type === 'CR' ? r.amount : -r.amount), 0));
        
        setLoading(true);
        const res = await fetch('/api/v1/accounting/bank-recon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accountId: selectedAccount, statementRows })
        });

        const result = await res.json();
        if (res.ok) {
          setData(result.data);
          toast.success(`Parsed ${statementRows.length} transactions`);
        }
      } catch (error: any) {
        toast.error('Parsing Error');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-5 rounded bg-accent-600 flex items-center justify-center">
              <Activity className="h-3 w-3 text-white" />
            </div>
            <span className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Reconciliation Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-neutral-900">Bank Reconciliation</h1>
          <p className="text-sm font-medium text-neutral-500 mt-1">Audit and align your digital ledger with official bank statements</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="h-12 px-6 rounded-2xl border-neutral-200 font-bold text-xs uppercase tracking-widest gap-2">
            <History className="h-4 w-4" /> History
          </Button>
          {data && (
             <Button className="h-12 px-8 rounded-2xl bg-accent-600 hover:bg-accent-700 shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest gap-2">
              <FileCheck className="h-4 w-4" /> Finalize Reconciliation
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-neutral-100 p-10 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end relative z-10">
          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Select Bank Ledger</label>
            <div className="relative">
              <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300" />
              <select 
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full h-14 pl-12 pr-10 bg-neutral-50 border-none rounded-2xl text-sm font-black text-neutral-700 outline-none appearance-none cursor-pointer"
              >
                <option value="">-- Choose Account --</option>
                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 pointer-events-none" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-3">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Statement File</label>
            <div className="relative group">
              <Upload className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-300 group-hover:text-accent-600 transition-colors" />
              <input 
                type="file" 
                onChange={handleFileUpload}
                disabled={!selectedAccount || isParsing}
                className="w-full h-14 pl-12 pr-4 bg-neutral-50 border-none rounded-2xl text-xs font-bold text-neutral-500 pt-4 cursor-pointer file:hidden" 
              />
              {isParsing && <RefreshCcw className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-600 animate-spin" />}
            </div>
          </div>

          <div className="lg:col-span-2">
            <Button 
              className="w-full h-14 rounded-2xl bg-accent-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-accent-600/20"
              onClick={() => document.querySelector<HTMLInputElement>('input[type="file"]')?.click()}
            >
              Analyze Statement
            </Button>
          </div>
        </div>
      </div>

      {data && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-bottom-4 duration-700">
             <BalanceCard label="Ledger Balance" value={formatAmount(bookBalance)} status="System Books" color="accent" />
             <BalanceCard label="Statement Balance" value={formatAmount(statementBalance)} status="Uploaded File" color="neutral" />
             <BalanceCard label="Net Variance" value={formatAmount(bookBalance - statementBalance)} status="To Reconcile" color="rose" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left Column: Matched (Auto-Pilot) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">Auto-Matched Entries ({data.matched.length})</h3>
              </div>
              
              <div className="bg-white rounded-[2.5rem] border border-neutral-100 shadow-sm overflow-hidden divide-y divide-neutral-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {data.matched.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 font-bold text-xs">No auto-matches found.</div>
                ) : data.matched.map((m, i) => (
                  <div key={i} className="p-6 hover:bg-emerald-50/20 transition-colors flex justify-between items-center group">
                    <div>
                      <p className="font-black text-neutral-900 text-sm tracking-tight">{m.bankTransaction.reference}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                        {new Date(m.bankTransaction.date).toLocaleDateString('en-IN')} • {m.systemTransaction.journalEntry.voucherNo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-600 text-lg tracking-tighter">{formatAmount(m.bankTransaction.amount)}</p>
                      <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase mt-1">98% SCORE</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Exception Management */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-neutral-900">Exception Handling</h3>
                </div>
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                   <button 
                    onClick={() => setActiveTab('bank')}
                    className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'bank' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-600")}
                   >Statement Only</button>
                   <button 
                    onClick={() => setActiveTab('system')}
                    className={cn("px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", activeTab === 'system' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-400 hover:text-neutral-600")}
                   >Books Only</button>
                </div>
              </div>

              <div className="bg-white rounded-[2.5rem] border border-rose-100 shadow-sm overflow-hidden divide-y divide-neutral-50 min-h-[500px]">
                {activeTab === 'bank' ? (
                  data.unmatchedBank.length === 0 ? (
                    <div className="p-20 text-center space-y-4">
                      <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <p className="text-sm font-black text-neutral-900">No Statement Exceptions</p>
                    </div>
                  ) : data.unmatchedBank.map((ub, i) => (
                    <div key={i} className="p-8 hover:bg-rose-50/10 transition-colors flex justify-between items-center group">
                      <div>
                        <p className="font-black text-neutral-900 text-sm tracking-tight">{ub.reference}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">{new Date(ub.date).toLocaleDateString('en-IN')}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-right">
                          <p className="font-black text-rose-600 text-lg tracking-tighter">{formatAmount(ub.amount)}</p>
                          <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Missing in Books</p>
                        </div>
                        <Button 
                          onClick={() => {
                            setPendingAdjustment({
                              date: ub.date,
                              totalAmount: ub.amount,
                              narration: ub.reference,
                              voucherType: ub.type === 'CR' ? 'receipt' : 'payment',
                              lines: [{ accountId: selectedAccount, [ub.type === 'CR' ? 'debit' : 'credit']: ub.amount }]
                            });
                            setIsAdjustmentModalOpen(true);
                          }}
                          className="h-12 px-6 rounded-2xl bg-neutral-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-neutral-800 transition-all"
                        >Post Adj.</Button>
                      </div>
                    </div>
                  ))
                ) : (
                  data.unmatchedSystem.length === 0 ? (
                    <div className="p-20 text-center text-neutral-400 font-bold text-xs">No unmatched system entries.</div>
                  ) : data.unmatchedSystem.map((sys, i) => (
                    <div key={i} className="p-8 hover:bg-amber-50/10 transition-colors flex justify-between items-center">
                      <div>
                        <p className="font-black text-neutral-900 text-sm tracking-tight">{sys.journalEntry.voucherNo}</p>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">
                          {new Date(sys.journalEntry.date).toLocaleDateString('en-IN')} • {sys.description || 'System Entry'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-neutral-900 text-lg tracking-tighter">{formatAmount(sys.debit || sys.credit)}</p>
                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">In Books, Not in Bank</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={isAdjustmentModalOpen}
        onClose={() => setIsAdjustmentModalOpen(false)}
        title="Post Reconciliation Adjustment"
        size="lg"
      >
        {pendingAdjustment && (
          <SimplifiedTransactionForm
            type={pendingAdjustment.voucherType}
            accountOptions={accountOptions}
            initialData={pendingAdjustment}
            onSuccess={() => {
              setIsAdjustmentModalOpen(false);
              toast.success('Adjustment posted. Refresh to update.');
            }}
            onCancel={() => setIsAdjustmentModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function BalanceCard({ label, value, status, color }: any) {
  const styles: any = {
    accent: 'bg-accent-50/50 border-accent-100 text-accent-600',
    neutral: 'bg-neutral-50/50 border-neutral-100 text-neutral-600',
    rose: 'bg-rose-50/50 border-rose-100 text-rose-600',
  };

  return (
    <div className={cn("p-8 rounded-[2.5rem] border shadow-sm", styles[color])}>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
      <h3 className="text-3xl font-black tracking-tighter text-neutral-900 mb-4">{value}</h3>
      <Badge className={cn("border-none font-black text-[9px] px-2.5 py-1 rounded-lg", 
        color === 'accent' ? 'bg-accent-100 text-accent-700' : 
        color === 'rose' ? 'bg-rose-100 text-rose-700' : 'bg-neutral-100 text-neutral-700'
      )}>
        {status}
      </Badge>
    </div>
  );
}
