'use client';

import React, { useState } from 'react';
import { 
  CreditCard, QrCode, Send, 
  Loader2, Banknote, Building2,
  Hash, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dispatchPaymentInfo } from '@/app/actions/admin/support-ultimate';
import { toast } from 'sonner';

export function PaymentDispatcher({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [data, setData] = useState({
    bankName: 'HDFC BANK',
    accountHolder: 'FREIGHTFLOW LOGISTICS SOLUTIONS',
    accountNumber: '',
    ifscCode: '',
    upiId: 'freightflow@okaxis',
    qrUrl: '/scanners/default_upi.png'
  });

  const handleDispatch = async () => {
    if (!data.accountNumber || !data.ifscCode) {
      toast.error('Account Number and IFSC are required');
      return;
    }

    setLoading(true);
    try {
      const res = await dispatchPaymentInfo(requestId, data);
      if (res.success) {
        toast.success('Payment details dispatched to stream');
        setShowForm(false);
      }
    } catch (error) {
      toast.error('Failed to dispatch payment info');
    } finally {
      setLoading(false);
    }
  };

  if (!showForm) {
    return (
      <Button 
        onClick={() => setShowForm(true)}
        className="w-full h-16 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-[0.98]"
      >
        <CreditCard className="h-4 w-4" />
        Dispatch Payment Info
      </Button>
    );
  }

  return (
    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-6 animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Payment Fulfillment</h4>
        <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white transition-colors">
          <Hash className="h-4 w-4 rotate-45" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">Bank Details</label>
          <Input 
            value={data.bankName}
            onChange={(e) => setData({...data, bankName: e.target.value})}
            placeholder="Bank Name"
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-[11px] font-bold focus:ring-0 focus:border-blue-500"
          />
          <Input 
            value={data.accountNumber}
            onChange={(e) => setData({...data, accountNumber: e.target.value})}
            placeholder="A/C Number"
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-[11px] font-bold focus:ring-0 focus:border-blue-500"
          />
          <Input 
            value={data.ifscCode}
            onChange={(e) => setData({...data, ifscCode: e.target.value})}
            placeholder="IFSC Code"
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-[11px] font-bold focus:ring-0 focus:border-blue-500"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-500 ml-2">UPI & Scanner</label>
          <Input 
            value={data.upiId}
            onChange={(e) => setData({...data, upiId: e.target.value})}
            placeholder="UPI ID"
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-[11px] font-bold focus:ring-0 focus:border-blue-500"
          />
          <Input 
            value={data.qrUrl}
            onChange={(e) => setData({...data, qrUrl: e.target.value})}
            placeholder="QR Code Image URL (optional)"
            className="h-12 bg-white/5 border-white/10 text-white rounded-xl text-[11px] font-bold focus:ring-0 focus:border-blue-500"
          />
          <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
            <QrCode className="h-5 w-5 text-blue-400 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Dynamic Scan-to-Pay QR Scanner Active</span>
          </div>
        </div>

        <Button 
          onClick={handleDispatch}
          disabled={loading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-2xl shadow-blue-500/20"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {loading ? 'Dispatching...' : 'Send to Stream'}
        </Button>
      </div>
    </div>
  );
}
