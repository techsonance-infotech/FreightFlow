'use client';

import React, { useState } from 'react';
import { X, Loader2, ArrowDown, Wallet, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  advance: {
    id: string;
    amount: number;
    recoveredAmount: number;
    driver?: { employee?: { name?: string } };
  } | null;
}

export function RecoveryModal({ isOpen, onClose, onSuccess, advance }: RecoveryModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ recoveryAmount: '', mode: 'cash' as 'cash' | 'bank', notes: '' });

  if (!isOpen || !advance) return null;

  const outstanding = advance.amount - advance.recoveredAmount;
  const formatCurrency = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountPaise = Math.round(parseFloat(form.recoveryAmount) * 100);
    if (amountPaise > outstanding) {
      toast.error('Recovery amount exceeds outstanding balance');
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/trips/advances/${advance.id}/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recoveryAmount: amountPaise, mode: form.mode, notes: form.notes }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error || 'Failed'); }
      toast.success('Recovery recorded successfully');
      onSuccess();
      onClose();
      setForm({ recoveryAmount: '', mode: 'cash', notes: '' });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400">
          <X className="h-5 w-5" />
        </button>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-xl text-green-600"><ArrowDown className="h-5 w-5" /></div>
            Record Recovery
          </h3>
          <p className="text-xs text-slate-400 font-bold mb-6">
            Driver: <span className="text-slate-700">{advance.driver?.employee?.name || 'N/A'}</span>
          </p>

          {/* Balance Card */}
          <div className="bg-slate-900 rounded-2xl p-6 mb-6 text-white">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Given</p>
                <p className="text-sm font-black mt-1">{formatCurrency(advance.amount)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Recovered</p>
                <p className="text-sm font-black mt-1 text-green-400">{formatCurrency(advance.recoveredAmount)}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Outstanding</p>
                <p className="text-sm font-black mt-1 text-amber-400">{formatCurrency(outstanding)}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recovery Amount (₹) *</label>
              <div className="relative">
                <Wallet className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input type="number" step="0.01" min="1" max={outstanding / 100} value={form.recoveryAmount}
                  onChange={(e) => setForm({ ...form, recoveryAmount: e.target.value })} required placeholder="0.00"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-green-600/10" />
              </div>
              <p className="text-[9px] text-slate-400 font-bold">Max: {formatCurrency(outstanding)}</p>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</label>
              <div className="flex bg-slate-50 p-1 rounded-xl h-[46px]">
                {(['cash', 'bank'] as const).map((m) => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, mode: m })}
                    className={`flex-1 text-[10px] font-black uppercase rounded-lg transition-all ${form.mode === m ? 'bg-white text-green-600 shadow-sm' : 'text-slate-400'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
              <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Recovery notes..."
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-green-600/10 resize-none" />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-600/20 hover:bg-green-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                {loading ? 'Processing...' : 'Record Recovery'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
