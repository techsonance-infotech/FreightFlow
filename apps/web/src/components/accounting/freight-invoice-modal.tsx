'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { 
  FileText, Hash, Calendar, Users, 
  Truck, Calculator, Landmark, AlertCircle,
  Package, ArrowRight, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreightInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrders: any[];
  onSuccess: () => void;
}

export function FreightInvoiceModal({ isOpen, onClose, selectedOrders, onSuccess }: FreightInvoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    invoiceNo: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    gstRate: 12, // Standard transport GST is 12% with ITC or 5% without
    gstType: 'intra' as 'intra' | 'inter'
  });

  const subtotal = useMemo(() => {
    return selectedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  }, [selectedOrders]);

  const gstAmount = useMemo(() => Math.round((subtotal * formData.gstRate) / 100), [subtotal, formData.gstRate]);
  const totalAmount = useMemo(() => subtotal + gstAmount, [subtotal, gstAmount]);

  const customer = selectedOrders[0]?.dealer;

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

  useEffect(() => {
    if (isOpen) {
      fetchNextInvoiceNumber();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    setLoading(true);
    try {
      const payload = {
        date: formData.date,
        invoiceNo: formData.invoiceNo,
        customerId: customer.id,
        orderIds: selectedOrders.map(o => o.id),
        subtotal: subtotal,
        cgst: formData.gstType === 'intra' ? Math.round(gstAmount / 2) : 0,
        sgst: formData.gstType === 'intra' ? Math.round(gstAmount / 2) : 0,
        igst: formData.gstType === 'inter' ? gstAmount : 0,
        totalAmount: totalAmount,
        notes: formData.notes
      };

      const response = await fetch('/api/v1/accounting/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate invoice');
      }

      toast.success(`Invoice ${formData.invoiceNo || ''} generated successfully`);
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Finalize Freight Invoice"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer & Summary Header */}
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
              <Users className="h-7 w-7 text-accent-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Billed To</p>
              <h3 className="text-xl font-black text-slate-900">{customer?.name}</h3>
              <p className="text-xs font-bold text-slate-500">{customer?.gstin || 'No GSTIN Provided'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Items</p>
            <div className="flex items-center gap-2 justify-end mt-1">
              <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-900 shadow-sm">
                {selectedOrders.length} LRs
              </span>
            </div>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Invoice Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <input 
                type="text"
                required
                placeholder="e.g. INV/24-25/001"
                value={formData.invoiceNo}
                onChange={e => setFormData({...formData, invoiceNo: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
              Invoice Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-accent-600 transition-colors" />
              <input 
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Order Preview List */}
        <div className="space-y-3">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Included Lorry Receipts</label>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
            {selectedOrders.map((order: any) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-slate-200 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-accent-600 group-hover:bg-accent-50 transition-all">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase">LR #{order.lrNo}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {order.fromLocation} → {order.toLocation}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Delivered</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Tax Configuration</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase px-1">Rate</p>
                  <select 
                    value={formData.gstRate}
                    onChange={e => setFormData({...formData, gstRate: parseInt(e.target.value)})}
                    className="w-full h-10 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black text-slate-700 outline-none focus:ring-2 focus:ring-accent-600/10 transition-all"
                  >
                    <option value="0">0% (Exempt)</option>
                    <option value="5">5% (No ITC)</option>
                    <option value="12">12% (Forward)</option>
                    <option value="18">18% (Service)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase px-1">Type</p>
                  <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100 h-10">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, gstType: 'intra'})}
                      className={cn("flex-1 text-[9px] font-black uppercase transition-all rounded-lg", formData.gstType === 'intra' ? "bg-white text-accent-600 shadow-sm" : "text-slate-400")}
                    >
                      Intra
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, gstType: 'inter'})}
                      className={cn("flex-1 text-[9px] font-black uppercase transition-all rounded-lg", formData.gstType === 'inter' ? "bg-white text-accent-600 shadow-sm" : "text-slate-400")}
                    >
                      Inter
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Narration / Internal Notes</label>
              <textarea 
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Details for the invoice..."
                className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-accent-600/10 transition-all resize-none"
              />
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-900/20">
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-white/40">
                <span>Freight Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-accent-400">
                <span>GST ({formData.gstRate}%)</span>
                <span>+ {formatCurrency(gstAmount)}</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Total Invoice Amount</p>
                <h4 className="text-3xl font-black tracking-tight">{formatCurrency(totalAmount)}</h4>
              </div>
              <div className="pt-4 flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Tax Compliant Entry</span>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 h-40 w-40 bg-accent-600/20 rounded-full blur-3xl" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex gap-4">
          <Button type="button" variant="ghost" className="flex-1 h-12 rounded-xl" onClick={onClose}>
            Discard
          </Button>
          <Button 
            type="submit" 
            loading={loading} 
            className="flex-2 h-12 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-accent-600/20"
          >
            Create Tax Invoice
          </Button>
        </div>
      </form>
    </Modal>
  );
}
