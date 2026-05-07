'use client';

import React, { useState } from 'react';
import { 
  CreditCard, Plus, DollarSign, 
  Clock, CheckCircle2, AlertCircle,
  FileText, Download, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { generateInvoice, markInvoiceAsPaid } from '@/app/actions/admin/billing';
import { cn } from '@/lib/utils';

export function BillingGovernance({ tenantId, invoices }: { tenantId: string, invoices: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleMarkPaid = async (invoiceId: string) => {
    setLoading(invoiceId);
    try {
      await markInvoiceAsPaid(invoiceId);
      toast.success('Invoice marked as paid');
    } catch (error) {
      toast.error('Failed to update invoice status');
    } finally {
      setLoading(null);
    }
  };

  const handleNewInvoice = async () => {
    toast.info('Invoice Generation Wizard Initializing...');
    // In a real app, this would open a modal to enter items/amount
    // For demo, we'll generate a standard license renewal invoice
    try {
      await generateInvoice(tenantId, 1200, [{ description: 'Annual License Renewal (Pro)', amount: 1200 }], new Date(Date.now() + 30*24*60*60*1000));
      toast.success('Standard Renewal Invoice Generated');
    } catch (error) {
      toast.error('Failed to generate invoice');
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-6">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Fiscal Hub</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">SaaS Revenue & Billing Governance</p>
          </div>
        </div>
        <Button 
          onClick={handleNewInvoice}
          className="h-16 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl transition-all active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Generate Invoice Node
        </Button>
      </div>

      <div className="space-y-6 relative z-10">
        {invoices.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <DollarSign className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Invoices Recorded for this Workspace</p>
          </div>
        ) : invoices.map((invoice) => (
          <div key={invoice.id} className="flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500 group">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 tracking-tight">{invoice.invoiceNumber}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-2">
                   Issued {new Date(invoice.createdAt).toLocaleDateString()} &bull; 
                   Amount: <span className="text-slate-900">${invoice.amount}</span> &bull;
                   <span className={cn(
                     "font-black",
                     invoice.status === 'paid' ? "text-emerald-600" : "text-amber-500"
                   )}>STATUS: {invoice.status.toUpperCase()}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all">
                <Download className="h-5 w-5" />
              </button>
              
              {invoice.status === 'unpaid' && (
                <Button 
                  onClick={() => handleMarkPaid(invoice.id)}
                  disabled={!!loading}
                  className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all flex items-center gap-3"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
         <SummaryCard label="Total Revenue" value={`$${invoices.reduce((acc, inv) => acc + (inv.status === 'paid' ? Number(inv.amount) : 0), 0)}`} color="emerald" />
         <SummaryCard label="Outstanding" value={`$${invoices.reduce((acc, inv) => acc + (inv.status === 'unpaid' ? Number(inv.amount) : 0), 0)}`} color="amber" />
         <SummaryCard label="Pending Nodes" value={invoices.filter(i => i.status === 'unpaid').length.toString()} color="slate" />
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: any) {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    slate: 'bg-slate-50 text-slate-600 border-slate-100'
  };
  return (
    <div className={cn("p-8 rounded-[2rem] border", colors[color])}>
       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">{label}</p>
       <p className="text-3xl font-black tracking-tighter">{value}</p>
    </div>
  );
}
