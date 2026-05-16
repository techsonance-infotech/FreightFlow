'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Landmark, Calendar, CreditCard, Hash, FileText, AlertCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: any;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, bill, onSuccess }: PaymentModalProps) {
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'neft' | 'cheque'>('bank');
  const [leaves, setLeaves] = useState<any[]>([]);
  const [selectedLeafId, setSelectedLeafId] = useState('');
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: bill?.totalAmount / 100 || 0,
    date: new Date().toISOString().split('T')[0],
    bankAccountId: '',
    referenceNo: '',
    notes: ''
  });

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        const bankAccounts: any[] = [];
        const flatten = (nodes: any[]) => {
          nodes.forEach(node => {
            if (node.type === 'asset' && !node.children?.length) {
              bankAccounts.push(node);
            }
            if (node.children) flatten(node.children);
          });
        };
        flatten(result.data);
        setAccounts(bankAccounts);
      }
    } catch (error) {
      console.error('Failed to fetch accounts');
    }
  };

  const fetchLeaves = async (accountId: string) => {
    if (!accountId || paymentMode !== 'cheque') return;
    try {
      const res = await fetch(`/api/v1/accounting/cheques/leaves?bankAccountId=${accountId}`);
      const json = await res.json();
      if (json.data) setLeaves(json.data);
    } catch (err) {
      console.error('Failed to fetch cheque leaves');
    }
  };

  useEffect(() => {
    if (isOpen) fetchAccounts();
  }, [isOpen]);

  useEffect(() => {
    if (formData.bankAccountId && paymentMode === 'cheque') {
      fetchLeaves(formData.bankAccountId);
    }
  }, [formData.bankAccountId, paymentMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankAccountId) {
      toast.error('Please select an account');
      return;
    }
    if (paymentMode === 'cheque' && !selectedLeafId) {
      toast.error('Please select a cheque leaf');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch AP Account
      const coaRes = await fetch('/api/v1/accounting/coa');
      const coaData = await coaRes.json();
      let apAccountId = '';
      const findAP = (nodes: any[]) => {
        nodes.forEach(node => {
          if (node.name.toLowerCase().includes('payable') || node.name.toLowerCase().includes('creditor')) apAccountId = node.id;
          if (node.children) findAP(node.children);
        });
      };
      findAP(coaData.data);

      if (!apAccountId) throw new Error('Could not identify Accounts Payable ledger');

      const amountPaise = Math.round(formData.amount * 100);

      // 2. Post Voucher
      const voucherData = {
        date: formData.date,
        voucherType: 'payment',
        narration: `Payment for Bill ${bill.invoiceNo}. Mode: ${paymentMode.toUpperCase()}. ${formData.referenceNo ? 'Ref: ' + formData.referenceNo : ''}`,
        voucherNo: `PV-${Date.now().toString().slice(-6)}`,
        chequeLeafId: paymentMode === 'cheque' ? selectedLeafId : undefined,
        metadata: {
          billId: bill.id,
          referenceNo: formData.referenceNo,
          paymentMode
        },
        lines: [
          {
            accountId: apAccountId,
            debit: amountPaise,
            credit: 0,
            description: `Payment for ${bill.invoiceNo}`
          },
          {
            accountId: formData.bankAccountId,
            debit: 0,
            credit: amountPaise,
            description: `Paid via ${paymentMode.toUpperCase()}`
          }
        ]
      };

      const response = await fetch('/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      if (!response.ok) throw new Error('Failed to post payment voucher');

      toast.success('Payment recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Vendor Payment" size="xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm">
              <FileText className="h-6 w-6 text-slate-900" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Details</p>
              <h3 className="text-xl font-black text-slate-900">{bill?.invoiceNo}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount Due</p>
            <p className="text-xl font-black text-slate-900">₹{(bill?.totalAmount / 100).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Mode</label>
            <select 
              value={paymentMode}
              onChange={e => setPaymentMode(e.target.value as any)}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none"
            >
              <option value="bank">Bank Transfer / NEFT</option>
              <option value="cheque">Physical Cheque</option>
              <option value="cash">Cash Payment</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date</label>
            <input 
              type="date"
              required
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Bank/Cash Account</label>
            <select 
              required
              value={formData.bankAccountId}
              onChange={e => setFormData({...formData, bankAccountId: e.target.value})}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none"
            >
              <option value="">Select Account...</option>
              {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount Paid (₹)</label>
            <input 
              type="number"
              required
              step="0.01"
              value={formData.amount}
              onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
              className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
            />
          </div>
        </div>

        {paymentMode === 'cheque' && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Select Cheque Number</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
              <select 
                required
                value={selectedLeafId}
                onChange={e => setSelectedLeafId(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm font-black text-blue-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all appearance-none shadow-sm"
              >
                <option value="">Choose Leaf...</option>
                {leaves.map(leaf => (
                  <option key={leaf.id} value={leaf.id}>CHQ # {leaf.leafNo}</option>
                ))}
              </select>
            </div>
            {leaves.length === 0 && (
              <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1 ml-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> No available leaves for this bank. Please add a cheque book first.
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference / UTR No.</label>
          <input 
            type="text"
            placeholder="e.g. NEFT/123456"
            value={formData.referenceNo}
            onChange={e => setFormData({...formData, referenceNo: e.target.value})}
            className="w-full h-12 px-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
          />
        </div>

        <div className="pt-6 flex gap-3">
          <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading} className="flex-2 h-14 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-slate-200">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
