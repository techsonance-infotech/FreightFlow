'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Landmark, Calendar, CreditCard, Hash, FileText, Users, Percent, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialSelectedIds?: string[];
  sourceType?: 'LR' | 'PALLET';
}

export function InvoiceModal({ isOpen, onClose, onSuccess, initialSelectedIds, sourceType }: InvoiceModalProps) {
  // 1. ALL STATE AT THE VERY TOP
  const [loading, setLoading] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [revenueAccounts, setRevenueAccounts] = useState<any[]>([]);
  const [arAccounts, setArAccounts] = useState<any[]>([]);
  const [creditLimitExceeded, setCreditLimitExceeded] = useState(false);
  const [currentOutstanding, setCurrentOutstanding] = useState(0);

  const [formData, setFormData] = useState({
    customerId: '',
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    gstRate: 0,
    gstType: 'intra' as 'intra' | 'inter',
    revenueAccountId: '',
    arAccountId: '',
    narration: ''
  });

  // 2. DERIVED VALUES
  const gstAmount = useMemo(() => (formData.amount * formData.gstRate) / 100, [formData.amount, formData.gstRate]);
  const totalAmount = useMemo(() => formData.amount + gstAmount, [formData.amount, gstAmount]);

  // 3. HELPER FUNCTIONS
  const fetchNextInvoiceNumber = async () => {
    try {
      const res = await fetch('/api/v1/accounting/invoices?nextNumber=true');
      const json = await res.json();
      if (json.data) {
        setFormData(prev => ({ ...prev, invoiceNo: json.data }));
      }
    } catch (err) {
      console.error('Failed to fetch next invoice number');
    }
  };

  const fetchCustomerBalance = async (cid: string) => {
    try {
      const res = await fetch(`/api/v1/accounting/reports/ageing?type=AR&customerId=${cid}`);
      const json = await res.json();
      if (json.data) {
        const total = json.data.buckets.total;
        setCurrentOutstanding(total);
        setCreditLimitExceeded(total > 50000000); 
      }
    } catch (err) {
      console.error('Failed to fetch balance');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/v1/masters/dealers');
      const json = await res.json();
      if (json.data) setCustomers(json.data);
    } catch (err) {
      console.error('Failed to fetch customers');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        const revenue: any[] = [];
        const receivables: any[] = [];
        
        const flatten = (nodes: any[]) => {
          nodes.forEach(node => {
            const type = node.type?.toLowerCase();
            const name = node.name?.toLowerCase() || '';
            const hasChildren = node.children && node.children.length > 0;
            
            // Revenue accounts - Show any leaf node of type revenue/income
            if ((type === 'revenue' || type === 'income') && !hasChildren) {
              revenue.push(node);
            }
            
            // Assets / Receivables - Show any node that is an asset AND likely an AR ledger
            // We broaden this to any Asset that doesn't have children (actual ledgers)
            if ((type === 'asset' || type === 'assets') && !hasChildren) {
              receivables.push(node);
            }
            
            if (node.children) flatten(node.children);
          });
        };
        flatten(result.data);
        
        // If no specific receivables found, try to include all assets as a fallback
        setRevenueAccounts(revenue);
        setArAccounts(receivables);

        const bestMatch = receivables.find(p => {
          const n = p.name.toLowerCase();
          return n.includes('receivable') || n.includes('debtor') || n.includes('trade');
        });
        if (bestMatch) {
          setFormData(prev => ({ ...prev, arAccountId: bestMatch.id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts', error);
    }
  };

  const fetchSelectedDetails = async () => {
    try {
      setLoading(true);
      const endpoint = sourceType === 'LR' ? '/api/v1/orders' : '/api/v1/pallets';
      const items = await Promise.all(
        initialSelectedIds!.map(id => fetch(`${endpoint}/${id}`).then(res => res.json()))
      );

      const validItems = items.filter(i => i.id);
      if (validItems.length > 0) {
        const first = validItems[0];
        const totalBase = validItems.reduce((acc, curr) => acc + (curr.totalAmount || curr.subtotal || 0), 0) / 100;
        
        setFormData(prev => ({
          ...prev,
          customerId: first.dealerId || first.customerId || '',
          amount: totalBase,
          narration: `Generated from ${sourceType}s: ${validItems.map(i => i.lrNo).join(', ')}`
        }));
      }
    } catch (err) {
      console.error('Failed to fetch selected details', err);
    } finally {
      setLoading(false);
    }
  };

  // 4. ALL EFFECTS AT THE END OF DEFINITIONS
  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
      fetchAccounts();
      fetchNextInvoiceNumber();

      if (initialSelectedIds && initialSelectedIds.length > 0) {
        fetchSelectedDetails();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.customerId) {
      fetchCustomerBalance(formData.customerId);
    }
  }, [formData.customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId) { toast.error('Please select a customer'); return; }
    if (!formData.invoiceNo) { toast.error('Please enter the invoice number'); return; }
    if (!formData.revenueAccountId) { toast.error('Please select a revenue category'); return; }
    if (!formData.arAccountId) { toast.error('Please select an Accounts Receivable ledger'); return; }
    if (formData.amount <= 0) { toast.error('Please enter a valid amount'); return; }

    setLoading(true);
    try {
      const coaRes = await fetch('/api/v1/accounting/coa');
      const coaData = await coaRes.json();
      
      const basePaise = Math.round(formData.amount * 100);
      const gstPaise = Math.round(gstAmount * 100);
      const totalPaise = Math.round(totalAmount * 100);
      const source = sourceType || 'LR';

      const cgstPaise = formData.gstType === 'intra' ? Math.round(gstPaise / 2) : 0;
      const sgstPaise = formData.gstType === 'intra' ? gstPaise - cgstPaise : 0;
      const igstPaise = formData.gstType === 'inter' ? gstPaise : 0;

      const invoicePayload = {
        invoiceNo: formData.invoiceNo,
        date: formData.date,
        customerId: formData.customerId,
        subtotal: basePaise,
        cgst: cgstPaise,
        sgst: sgstPaise,
        igst: igstPaise,
        totalAmount: totalPaise,
        notes: formData.narration,
        orderIds: source === 'LR' ? (initialSelectedIds || []) : [],
        arAccountId: formData.arAccountId,
        revenueAccountId: formData.revenueAccountId
      };

      const response = await fetch('/api/v1/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoicePayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to record freight invoice');
      }

      toast.success('Freight invoice generated and recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Customer Invoice / Revenue"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Customer / Dealer <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select 
                required
                value={formData.customerId}
                onChange={e => setFormData({...formData, customerId: e.target.value})}
                className={cn(
                  "w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none",
                  creditLimitExceeded && "border-rose-500 bg-rose-50"
                )}
              >
                <option value="">Select Customer...</option>
                {customers.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Invoice Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text"
                required
                placeholder="INV/2026-27/001"
                value={formData.invoiceNo}
                onChange={e => setFormData({...formData, invoiceNo: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
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
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Revenue Category <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select 
                required
                value={formData.revenueAccountId}
                onChange={e => setFormData({...formData, revenueAccountId: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
              >
                <option value="">{revenueAccounts.length === 0 ? 'No Revenue Accounts Found' : 'Select Revenue Type...'}</option>
                {revenueAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
            {revenueAccounts.length === 0 && (
              <p className="text-[9px] font-bold text-amber-500 px-1 mt-1 italic">Note: Only "Revenue" type accounts with no children are shown here.</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
            Accounts Receivable Ledger <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <select 
              required
              value={formData.arAccountId}
              onChange={e => setFormData({...formData, arAccountId: e.target.value})}
              className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
            >
              <option value="">{arAccounts.length === 0 ? 'No Asset Accounts Found' : 'Select Receivable Account (Sundry Debtor)...'}</option>
              {arAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name} ({acc.type})</option>
              ))}
            </select>
          </div>
          {arAccounts.length === 0 && (
            <div className="flex items-start gap-2 mt-1 px-1">
              <AlertCircle className="h-3 w-3 text-rose-500 mt-0.5" />
              <p className="text-[9px] font-bold text-rose-500">
                Critical: No "Asset" type accounts found. Invoices require an Asset ledger (like Sundry Debtors) to record the balance.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-2 col-span-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Base Amount (₹) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-neutral-400">₹</span>
              <input 
                type="number"
                required
                step="0.01"
                placeholder="0.00"
                value={formData.amount || ''}
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value) || 0})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2 col-span-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">GST Rate (%)</label>
            <select 
              value={formData.gstRate}
              onChange={e => setFormData({...formData, gstRate: parseFloat(e.target.value)})}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
            >
              <option value="0">0% (Exempt)</option>
              <option value="5">5%</option>
              <option value="12">12%</option>
              <option value="18">18%</option>
              <option value="28">28%</option>
            </select>
          </div>

          <div className="space-y-2 col-span-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">GST Type</label>
            <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100 h-12">
              <button
                type="button"
                onClick={() => setFormData({...formData, gstType: 'intra'})}
                className={cn("flex-1 text-[9px] font-black uppercase transition-all rounded-lg", formData.gstType === 'intra' ? "bg-white text-accent-600 shadow-sm" : "text-neutral-400")}
              >
                Intra (CGST+SGST)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, gstType: 'inter'})}
                className={cn("flex-1 text-[9px] font-black uppercase transition-all rounded-lg", formData.gstType === 'inter' ? "bg-white text-accent-600 shadow-sm" : "text-neutral-400")}
              >
                Inter (IGST)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-accent-50/30 rounded-2xl border border-accent-100 space-y-3">
          <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase tracking-widest">
            <span>Subtotal (Taxable Value)</span>
            <span>₹{(formData.amount || 0).toLocaleString()}</span>
          </div>
          
          {formData.gstRate > 0 && (
            <>
              {formData.gstType === 'intra' ? (
                <>
                  <div className="flex justify-between text-[11px] font-bold text-accent-600 uppercase tracking-widest pl-4">
                    <span>CGST ({formData.gstRate / 2}%)</span>
                    <span>+ ₹{(gstAmount / 2).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-accent-600 uppercase tracking-widest pl-4">
                    <span>SGST ({formData.gstRate / 2}%)</span>
                    <span>+ ₹{(gstAmount / 2).toLocaleString()}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between text-[11px] font-bold text-accent-600 uppercase tracking-widest pl-4">
                  <span>IGST ({formData.gstRate}%)</span>
                  <span>+ ₹{gstAmount.toLocaleString()}</span>
                </div>
              )}
            </>
          )}

          <div className="pt-3 border-t border-accent-100 flex justify-between items-center">
            <span className="text-sm font-black text-neutral-900 uppercase tracking-tighter">Total Invoice Amount</span>
            <span className="text-xl font-black text-neutral-900 underline decoration-accent-600 decoration-2 underline-offset-4">₹{totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Narration / Notes</label>
          <textarea 
            rows={2}
            value={formData.narration}
            onChange={e => setFormData({...formData, narration: e.target.value})}
            placeholder="Additional details..."
            className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all resize-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Attachments (Invoice Copy)</label>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl">
            <input 
              type="file" 
              id="invoice-file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAttachmentLoading(true);
                  try {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    uploadData.append('type', 'invoice');
                    uploadData.append('masterId', formData.invoiceNo || 'pending');
                    uploadData.append('masterType', 'accounting');

                    const { uploadMasterDocument } = await import('@/app/actions/masters/labour');
                    const res = await uploadMasterDocument(uploadData);
                    if (res.error) throw new Error(res.error);
                    if (res.publicUrl) {
                      setAttachments(prev => [...prev, res.publicUrl!]);
                    }
                    toast.success('Document uploaded');
                  } catch (err: any) {
                    toast.error(err.message);
                  } finally {
                    setAttachmentLoading(false);
                  }
                }
              }}
            />
            <label htmlFor="invoice-file" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-neutral-50 transition-all">
              {attachmentLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileText className="h-3 w-3 text-accent-600" />}
              Attach Document
            </label>
            <div className="flex gap-2">
              {attachments.map((url, i) => (
                <div key={i} className="h-8 w-8 rounded-lg bg-accent-100 flex items-center justify-center relative group">
                  <FileText className="h-4 w-4 text-accent-600" />
                  <button 
                    type="button"
                    onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white rounded-full flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-2 h-12 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-black uppercase tracking-widest text-xs">
            Save Customer Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
