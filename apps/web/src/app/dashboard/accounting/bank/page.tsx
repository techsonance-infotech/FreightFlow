'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function BankReconciliationPage() {
  const [data, setData] = useState<{ matched: any[], unmatchedSystem: any[], unmatchedBank: any[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccount, setSelectedAccount] = useState('');

  useEffect(() => {
    // Fetch bank accounts
    fetch('/api/v1/accounting/coa')
      .then(res => res.json())
      .then(res => {
        const flatten = (nodes: any[], r: any[] = []) => {
          nodes.forEach(n => {
            if (n.type === 'asset' && n.name.toLowerCase().includes('bank')) r.push(n);
            if (n.children) flatten(n.children, r);
          });
          return r;
        };
        setAccounts(flatten(res.data || []));
      })
      .catch(console.error);
  }, []);

  const handleSimulateUpload = async () => {
    if (!selectedAccount) {
      toast.error('Please select a bank account first');
      return;
    }

    setLoading(true);
    try {
      // Simulate CSV parsing
      const mockStatementRows = [
        { date: new Date().toISOString(), amount: 1500000, type: 'CR', reference: 'NEFT-123' }, // 15,000 INR
        { date: new Date().toISOString(), amount: -500000, type: 'DR', reference: 'UPI-456' }  // -5,000 INR
      ];

      const response = await fetch('/api/v1/accounting/bank-recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: selectedAccount, statementRows: mockStatementRows })
      });

      const result = await response.json();
      if (response.ok) {
        setData(result.data);
        toast.success('Reconciliation processed successfully');
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast.error('Failed to process reconciliation');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (paise: number) => {
    return (Math.abs(paise) / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Bank Reconciliation</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Match bank statements with system ledgers</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Bank Account</label>
            <select 
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none"
            >
              <option value="">-- Select GL Account --</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Statement (CSV)</label>
            <div className="relative">
              <input type="file" className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-2.5 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            </div>
          </div>
          <Button onClick={handleSimulateUpload} loading={loading} icon="⚡">
            Auto-Match
          </Button>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">✓</span> 
              Matched Transactions ({data.matched.length})
            </h3>
            <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {data.matched.length === 0 ? (
                <p className="p-6 text-center text-sm font-bold text-slate-400">No exact matches found.</p>
              ) : (
                data.matched.map((m, i) => (
                  <div key={i} className="p-4 bg-emerald-50/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{m.bankTransaction.reference}</p>
                      <p className="text-xs text-slate-500">{new Date(m.bankTransaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-emerald-700">{formatAmount(m.bankTransaction.amount)}</p>
                      <p className="text-[10px] font-bold text-emerald-500 uppercase">Match: {m.matchScore}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">!</span> 
              Unmatched Bank Entries ({data.unmatchedBank.length})
            </h3>
            <div className="bg-white rounded-2xl border border-rose-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {data.unmatchedBank.length === 0 ? (
                <p className="p-6 text-center text-sm font-bold text-slate-400">All bank entries matched!</p>
              ) : (
                data.unmatchedBank.map((ub, i) => (
                  <div key={i} className="p-4 bg-rose-50/30 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{ub.reference || 'Unknown Ref'}</p>
                      <p className="text-xs text-slate-500">{new Date(ub.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right flex items-center gap-4">
                      <p className="font-black text-rose-700">{formatAmount(ub.amount)}</p>
                      <Button variant="outline" size="sm">Manual Match</Button>
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
