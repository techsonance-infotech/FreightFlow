'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Landmark, Calendar, CreditCard, Hash, FileText, Users, Percent, Loader2, ArrowUpRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BillModal({ isOpen, onClose, onSuccess }: BillModalProps) {
  const [loading, setLoading] = useState(false);
  const [attachmentLoading, setAttachmentLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [expenseAccounts, setExpenseAccounts] = useState<any[]>([]);
  const [apAccounts, setApAccounts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    vendorId: '',
    billNo: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    gstRate: 0,
    gstType: 'intra' as 'intra' | 'inter',
    tdsRate: 0,
    expenseAccountId: '',
    apAccountId: '',
    narration: ''
  });

  const fetchVendors = async () => {
    try {
      const res = await fetch('/api/v1/masters/dealers');
      const json = await res.json();
      if (json.data) setVendors(json.data);
    } catch (err) {
      console.error('Failed to fetch vendors');
    }
  };

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/v1/accounting/coa');
      const result = await response.json();
      if (response.ok) {
        const expenses: any[] = [];
        const payables: any[] = [];
        
        const flatten = (nodes: any[]) => {
          nodes.forEach(node => {
            const type = node.type?.toLowerCase();
            const name = node.name.toLowerCase();
            
            // Collect expenses for category selection
            if ((type === 'expense' || type === 'expenses' || type === 'direct expense' || type === 'indirect expense') && !node.children?.length) {
              expenses.push(node);
            }
            
            // Collect liabilities for AP selection
            if (type === 'liability' || type === 'liabilities') {
              payables.push(node);
            }
            
            if (node.children) flatten(node.children);
          });
        };
        flatten(result.data);
        setExpenseAccounts(expenses);
        setApAccounts(payables);

        // Auto-detect AP Account best match
        const bestMatch = payables.find(p => {
          const n = p.name.toLowerCase();
          return n.includes('payable') || n.includes('creditor') || n.includes('trade payable') || n.includes('sundry creditor');
        });
        if (bestMatch) {
          setFormData(prev => ({ ...prev, apAccountId: bestMatch.id }));
        }
      }
    } catch (error) {
      console.error('Failed to fetch accounts');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVendors();
      fetchAccounts();
    }
  }, [isOpen]);

  const handleVendorChange = (id: string) => {
    const vendor = vendors.find(v => v.id === id);
    setFormData(prev => ({
      ...prev,
      vendorId: id,
      tdsRate: vendor?.tdsRate || 0
    }));
  };

  const gstAmount = (formData.amount * formData.gstRate) / 100;
  const totalAmount = formData.amount + gstAmount;
  const tdsAmount = (formData.amount * formData.tdsRate) / 100;
  const netPayable = totalAmount - tdsAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.vendorId) { toast.error('Please select a vendor'); return; }
    if (!formData.billNo) { toast.error('Please enter the bill number'); return; }
    if (!formData.expenseAccountId) { toast.error('Please select an expense category'); return; }
    if (!formData.apAccountId) { toast.error('Please select an Accounts Payable ledger'); return; }
    if (formData.amount <= 0) { toast.error('Please enter a valid base amount'); return; }

    setLoading(true);
    try {
      const coaRes = await fetch('/api/v1/accounting/coa');
      const coaData = await coaRes.json();
      
      let tdsAccountId = '';
      let cgstAccountId = '';
      let sgstAccountId = '';
      let igstAccountId = '';

      const findTaxAccounts = (nodes: any[]) => {
        nodes.forEach(node => {
          const name = node.name.toLowerCase();
          if ((name.includes('tds') && (name.includes('payable') || name.includes('liability'))) || name.includes('tax deducted')) {
            tdsAccountId = node.id;
          }
          if (name.includes('cgst') && (name.includes('input') || name.includes('receivable'))) cgstAccountId = node.id;
          if (name.includes('sgst') && (name.includes('input') || name.includes('receivable'))) sgstAccountId = node.id;
          if (name.includes('igst') && (name.includes('input') || name.includes('receivable'))) igstAccountId = node.id;
          if (node.children) findTaxAccounts(node.children);
        });
      };
      findTaxAccounts(coaData.data);

      const basePaise = Math.round(formData.amount * 100);
      const gstPaise = Math.round(gstAmount * 100);
      const tdsPaise = Math.round(tdsAmount * 100);
      const netPayablePaise = Math.round(netPayable * 100);
      const vendor = vendors.find(v => v.id === formData.vendorId);

      const voucherData = {
        date: formData.date,
        voucherType: 'purchase',
        narration: `${vendor?.name} - Bill ${formData.billNo}. ${formData.narration}`,
        voucherNo: `PB-${formData.billNo}-${Date.now().toString().slice(-4)}`,
        metadata: {
          partyId: formData.vendorId,
          partyType: 'vendor',
          attachments: attachments,
          baseAmount: basePaise,
          gstAmount: gstPaise,
          tdsAmount: tdsPaise
        },
        lines: [
          {
            accountId: formData.expenseAccountId,
            debit: basePaise,
            credit: 0,
            description: `Base Expense for Bill ${formData.billNo}`
          }
        ]
      };

      // Add GST Lines
      if (gstPaise > 0) {
        if (formData.gstType === 'intra') {
          const halfGst = Math.round(gstPaise / 2);
          if (cgstAccountId) voucherData.lines.push({ accountId: cgstAccountId, debit: halfGst, credit: 0, description: 'Input CGST' });
          if (sgstAccountId) voucherData.lines.push({ accountId: sgstAccountId, debit: halfGst, credit: 0, description: 'Input SGST' });
        } else {
          if (igstAccountId) voucherData.lines.push({ accountId: igstAccountId, debit: gstPaise, credit: 0, description: 'Input IGST' });
        }
      }

      // Add Payable Line
      voucherData.lines.push({
        accountId: formData.apAccountId,
        debit: 0,
        credit: netPayablePaise,
        description: `Net Payable to ${vendor?.name}`
      });

      // Add TDS Line
      if (tdsPaise > 0 && tdsAccountId) {
        voucherData.lines.push({
          accountId: tdsAccountId,
          debit: 0,
          credit: tdsPaise,
          description: `TDS @ ${formData.tdsRate}% deducted`
        });
      }

      const response = await fetch('/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherData)
      });

      if (!response.ok) throw new Error('Failed to post bill voucher');

      toast.success('Vendor bill recorded successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to record bill');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Vendor Bill (GST & TDS)"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Vendor / Partner <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select 
                required
                value={formData.vendorId}
                onChange={e => handleVendorChange(e.target.value)}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
              >
                <option value="">Select Vendor...</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Bill / Invoice No. <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input 
                type="text"
                required
                placeholder="e.g. INV/2024/001"
                value={formData.billNo}
                onChange={e => setFormData({...formData, billNo: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
              Bill Date <span className="text-rose-500">*</span>
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
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
                Expense Category <span className="text-rose-500">*</span>
              </label>
              <a 
                href="/dashboard/accounting/coa" 
                target="_blank" 
                className="text-[9px] font-bold text-accent-600 hover:underline flex items-center gap-1"
              >
                Manage Categories <ArrowUpRight className="h-2 w-2" />
              </a>
            </div>
            <div className="relative">
              <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <select 
                required
                value={formData.expenseAccountId}
                onChange={e => setFormData({...formData, expenseAccountId: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none"
              >
                <option value="">{expenseAccounts.length === 0 ? 'No Expense Accounts Found' : 'Select Expense Type...'}</option>
                {expenseAccounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">
              Accounts Payable Ledger <span className="text-rose-500">*</span>
            </label>
            <a 
              href="/dashboard/accounting/coa" 
              target="_blank" 
              className="text-[9px] font-bold text-accent-600 hover:underline flex items-center gap-1"
            >
              Manage Ledgers <ArrowUpRight className="h-2 w-2" />
            </a>
          </div>
          <div className="relative group">
            <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 group-focus-within:text-accent-600 transition-colors" />
            <select 
              required
              value={formData.apAccountId}
              onChange={e => setFormData({...formData, apAccountId: e.target.value})}
              className="w-full h-12 pl-11 pr-10 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none cursor-pointer"
            >
              <option value="">{apAccounts.length === 0 ? 'No Payable Accounts Found' : 'Select Payable Account (Sundry Creditor)...'}</option>
              {apAccounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-300">
              <Hash className="h-4 w-4" />
            </div>
          </div>
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
                onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
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
                className={cn("flex-1 text-[10px] font-black uppercase transition-all rounded-lg", formData.gstType === 'intra' ? "bg-white text-accent-600 shadow-sm" : "text-neutral-400")}
              >
                Intra (CGST/SGST)
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, gstType: 'inter'})}
                className={cn("flex-1 text-[10px] font-black uppercase transition-all rounded-lg", formData.gstType === 'inter' ? "bg-white text-accent-600 shadow-sm" : "text-neutral-400")}
              >
                Inter (IGST)
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-accent-50/30 rounded-2xl border border-accent-100 space-y-3">
          <div className="flex justify-between text-xs font-bold text-neutral-500 uppercase tracking-widest">
            <span>Base Amount</span>
            <span>₹{formData.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-accent-600 uppercase tracking-widest">
            <span>GST ({formData.gstRate}%)</span>
            <span>+ ₹{gstAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs font-bold text-rose-600 uppercase tracking-widest">
            <div className="flex flex-col">
              <span>TDS Deduction</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[9px] text-neutral-400">Rate (%)</span>
                <input 
                  type="number"
                  step="0.1"
                  value={formData.tdsRate}
                  onChange={e => setFormData({...formData, tdsRate: parseFloat(e.target.value)})}
                  className="w-16 h-6 px-2 bg-white border border-neutral-200 rounded text-[10px] font-black"
                />
              </div>
            </div>
            <span className="self-end">- ₹{tdsAmount.toLocaleString()}</span>
          </div>
          <div className="pt-3 border-t border-accent-100 flex justify-between items-center">
            <span className="text-sm font-black text-neutral-900 uppercase tracking-tighter">Total Net Payable</span>
            <span className="text-xl font-black text-neutral-900 underline decoration-accent-600 decoration-2 underline-offset-4">₹{netPayable.toLocaleString()}</span>
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
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Attachments (Bill Copy)</label>
          <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl">
            <input 
              type="file" 
              id="bill-file"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setAttachmentLoading(true);
                  try {
                    const uploadData = new FormData();
                    uploadData.append('file', file);
                    uploadData.append('type', 'bill');
                    uploadData.append('masterId', formData.billNo || 'pending');
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
            <label htmlFor="bill-file" className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 rounded-lg text-[10px] font-black uppercase cursor-pointer hover:bg-neutral-50 transition-all">
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
                    <X className="h-2 w-2" />
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
            Save Vendor Bill
          </Button>
        </div>
      </form>
    </Modal>
  );
}
