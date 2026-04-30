'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Landmark, Calendar, CreditCard, Hash, FileText } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: any;
  onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, bill, onSuccess }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: bill?.totalAmount || 0,
    bankAccountId: '',
    referenceNo: '',
    notes: ''
  });

  useEffect(() => {
    if (bill) {
      setFormData(prev => ({ ...prev, amount: bill.totalAmount }));
    }
  }, [bill]);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        // Flatten and filter for Asset accounts (Bank/Cash)
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

  useEffect(() => {
    if (isOpen) fetchAccounts();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bankAccountId) {
      toast.error('Please select a Bank/Cash account');
      return;
    }
    if (formData.amount <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    setLoading(true);
    try {
      // 1. Fetch AP Account (System Account - Sundry Creditors / Payable)
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

      if (!apAccountId) throw new Error('Could not identify Accounts Payable ledger in Chart of Accounts');

      // Convert Rupees to Paise and round
      const amountPaise = Math.round(formData.amount * 100);

      // 2. Post Voucher (Payment)
      const voucherData = {
        date: formData.date,
        voucherType: 'payment',
        narration: `Payment made for Bill ${bill.invoiceNo}. ${formData.referenceNo ? 'Ref: ' + formData.referenceNo : ''}. ${formData.notes || ''}`,
        voucherNo: `PV-${bill.invoiceNo}-${Date.now().toString().slice(-4)}`,
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
            description: `Paid to ${bill.vendor?.name || 'Vendor'}`
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Vendor Payment"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-accent-50/50 p-6 rounded-2xl border border-accent-100 flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center border border-accent-100 shadow-sm">
              <FileText className="h-6 w-6 text-accent-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-accent-600 uppercase tracking-widest">Bill Details</p>
              <h3 className="text-xl font-black text-neutral-900">{bill?.invoiceNo}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Amount Due</p>
            <p className="text-xl font-black text-neutral-900">₹{(bill?.totalAmount / 100).toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Payment Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Amount Paid (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400">₹</span>
              <input 
                type="number"
                required
                step="0.01"
                placeholder="0.00"
                value={formData.amount / 100 || ''}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) * 100})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
            <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Values will be rounded to nearest integer</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Pay From (Bank/Cash Account)</label>
          <div className="relative">
            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select 
              required
              value={formData.bankAccountId}
              onChange={e => setFormData({...formData, bankAccountId: e.target.value})}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
            >
              <option value="">Select Account...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Reference / UTR No.</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="e.g. NEFT/123456"
              value={formData.referenceNo}
              onChange={e => setFormData({...formData, referenceNo: e.target.value})}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
            />
          </div>
        </div>

        <div className="pt-6 flex gap-3">
          <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-2 h-12 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-black uppercase tracking-widest text-xs">
            Confirm Payment
          </Button>
        </div>
      </form>
    </Modal>
  );
}
