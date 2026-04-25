'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function EInvoicePage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // In a real application, we'd fetch actual invoices above threshold.
  // We'll mock a couple of high-value invoices for demonstration.
  const mockFetch = () => {
    setLoading(true);
    setTimeout(() => {
      setInvoices([
        { id: 'inv-1', invoiceNo: 'INV-2026-001', date: '2026-04-10', customerName: 'TATA Steel', customerGstIn: '21AAAAB1234C1Z5', amount: 55000000, irnStatus: 'pending' },
        { id: 'inv-2', invoiceNo: 'INV-2026-002', date: '2026-04-12', customerName: 'Reliance Ind.', customerGstIn: '27AAACA1111A1Z5', amount: 12500000, irnStatus: 'generated', irn: '8b7f8c1f9e2d... (Mocked)' }
      ]);
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    mockFetch();
  }, []);

  const handleGenerateIRN = async (inv: any) => {
    const loadingToast = toast.loading(`Generating IRN for ${inv.invoiceNo}...`);
    try {
      // Simulate API call using our local generation endpoint
      const response = await fetch('/api/v1/compliance/gst/einvoice/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant-uuid', // Simulated middleware intercept
          'x-company-id': 'company-uuid'
        },
        body: JSON.stringify({
          invoiceId: inv.id,
          invoiceNo: inv.invoiceNo,
          amount: inv.amount,
          customerGstIn: inv.customerGstIn
        })
      });

      const result = await response.json();
      if (response.ok) {
        toast.success(`IRN successfully generated for ${inv.invoiceNo}`, { id: loadingToast });
        // Update local state to reflect generation
        setInvoices(invoices.map(i => i.id === inv.id ? { ...i, irnStatus: 'generated', irn: result.data.irn.substring(0, 20) + '...' } : i));
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`IRN Generation Failed: ${error.message}`, { id: loadingToast });
    }
  };

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">e-Invoice Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage IRN generation for B2B invoices</p>
        </div>
        <Button onClick={mockFetch} variant="outline" icon="🔄">
          Refresh List
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Invoice No</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">GSTIN</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">IRN Status</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-r-transparent align-[-0.125em]" />
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                    No eligible invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-brand-700">{inv.invoiceNo}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700">{inv.customerName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 font-mono">{inv.customerGstIn}</td>
                    <td className="px-6 py-4 text-right text-sm font-black text-slate-900">{formatAmount(inv.amount)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        inv.irnStatus === 'generated' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.irnStatus}
                      </span>
                      {inv.irnStatus === 'generated' && (
                        <div className="text-[9px] text-slate-400 mt-1 font-mono font-medium truncate max-w-[120px] mx-auto" title={inv.irn}>
                          {inv.irn}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {inv.irnStatus === 'pending' ? (
                        <Button size="sm" onClick={() => handleGenerateIRN(inv)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          Generate IRN
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="text-slate-500 hover:text-slate-700">
                          View Invoice
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
