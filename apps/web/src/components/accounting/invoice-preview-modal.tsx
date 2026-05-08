'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { 
  Download, Mail, Share2, 
  FileText, Calendar, Landmark, 
  Hash, Users, MapPin, CheckCircle2,
  Clock, AlertCircle, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { generateInvoicePDF } from '@/lib/pdf/invoice-pdf';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
}

export function InvoicePreviewModal({ isOpen, onClose, invoice }: InvoicePreviewModalProps) {
  const [downloading, setDownloading] = React.useState(false);
  if (!invoice) return null;

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amt / 100);
  };

  const statusConfig = {
    paid: { color: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <CheckCircle2 className="h-3 w-3" />, label: 'Fully Paid' },
    sent: { color: 'bg-blue-50 text-blue-700 border-blue-100', icon: <FileText className="h-3 w-3" />, label: 'Invoice Sent' },
    overdue: { color: 'bg-rose-50 text-rose-700 border-rose-100', icon: <AlertCircle className="h-3 w-3" />, label: 'Overdue' },
    partial: { color: 'bg-amber-50 text-amber-700 border-amber-100', icon: <Clock className="h-3 w-3" />, label: 'Partially Paid' },
    draft: { color: 'bg-neutral-50 text-neutral-700 border-neutral-100', icon: <FileText className="h-3 w-3" />, label: 'Draft' },
  };

  const status = (invoice.status || 'draft').toLowerCase() as keyof typeof statusConfig;
  const config = statusConfig[status] || statusConfig.draft;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = await generateInvoicePDF(invoice, invoice.company);
      doc.save(`Invoice_${invoice.invoiceNo}.pdf`);
      toast.success('Professional PDF Generated');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Invoice Preview"
      size="xl"
    >
      <div className="flex flex-col h-full bg-neutral-50/30 rounded-2xl border border-neutral-100 overflow-hidden">
        {/* Action Toolbar */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <Badge className={cn("px-3 py-1 text-[10px] font-black uppercase tracking-widest", config.color)}>
              <span className="mr-1.5">{config.icon}</span>
              {config.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase" onClick={handleDownloadPDF} disabled={downloading}>
              {downloading ? <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Download className="h-3.5 w-3.5 mr-2" />}
              Download PDF
            </Button>
            <Button size="sm" className="h-9 px-4 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-[10px] font-black uppercase shadow-lg shadow-accent-600/20">
              <Mail className="h-3.5 w-3.5 mr-2" /> Email
            </Button>
          </div>
        </div>

        {/* Professional Invoice Layout */}
        <div className="p-12 bg-white m-6 shadow-sm border border-neutral-100 rounded-xl">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
                  <Landmark className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase">{invoice.company?.name || 'FreightFlow Trans'}</h2>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{invoice.company?.type || 'Transport & Logistics'}</p>
                </div>
              </div>
              <div className="space-y-1 text-xs text-neutral-500 font-medium max-w-[240px]">
                <p>{invoice.company?.address || '102, Logistics Hub, Sector 62'}</p>
                <p>{invoice.company?.city || 'Gurgaon'}, {invoice.company?.state || 'Haryana'} - {invoice.company?.zip || '122001'}</p>
                <p>GSTIN: {invoice.company?.gstin || '07AABCU9603R1ZN'}</p>
              </div>
            </div>
            <div className="text-right">
              <h1 className="text-4xl font-black text-neutral-900 mb-2">TAX INVOICE</h1>
              <div className="space-y-1">
                <p className="text-sm font-black text-accent-600 tracking-tight">{invoice.invoiceNo}</p>
                <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Date: {new Date(invoice.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4 border-b border-neutral-100 pb-2">Bill To</h3>
              <div className="space-y-1.5">
                <p className="text-base font-black text-neutral-900">{invoice.customer?.name}</p>
                <div className="text-xs text-neutral-500 font-medium space-y-1">
                  <p className="flex items-center gap-2"><MapPin className="h-3 w-3 text-neutral-300" /> {invoice.customer?.address || 'Address not provided'}</p>
                  <p className="flex items-center gap-2"><Landmark className="h-3 w-3 text-neutral-300" /> GSTIN: {invoice.customer?.gstin || 'N/A'}</p>
                  <p className="flex items-center gap-2"><Users className="h-3 w-3 text-neutral-300" /> PAN: {invoice.customer?.pan || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-100 flex flex-col justify-center items-end">
              <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-1">Amount Due</p>
              <h2 className="text-3xl font-black text-neutral-900 tracking-tighter underline decoration-accent-600 decoration-4 underline-offset-8">
                {formatAmount(invoice.totalAmount)}
              </h2>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="mb-12 overflow-hidden border border-neutral-100 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50">
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-900 uppercase tracking-widest">Description</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-900 uppercase tracking-widest text-right">SAC/HSN</th>
                  <th className="px-6 py-4 text-[10px] font-black text-neutral-900 uppercase tracking-widest text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                <tr className="group hover:bg-neutral-50/50 transition-colors">
                  <td className="px-6 py-6">
                    <p className="text-xs font-black text-neutral-900 mb-1">Freight Charges - {invoice.orders?.length || 0} Consignments</p>
                    <p className="text-[10px] font-medium text-neutral-400">Services for transportation of goods by road</p>
                  </td>
                  <td className="px-6 py-6 text-xs font-bold text-neutral-500 text-right">996511</td>
                  <td className="px-6 py-6 text-xs font-black text-neutral-900 text-right">{formatAmount(invoice.subtotal)}</td>
                </tr>
                {invoice.orders?.map((order: any, idx: number) => (
                  <React.Fragment key={idx}>
                    <tr className="bg-neutral-50/30">
                      <td className="px-6 py-2 text-[9px] font-black text-slate-900 uppercase" colSpan={2}>
                        LR #{order.lrNo} — {order.fromLocation} to {order.toLocation} ({new Date(order.date).toLocaleDateString()})
                      </td>
                      <td className="px-6 py-2 text-[9px] font-bold text-slate-900 text-right uppercase">
                        {formatAmount(order.totalAmount)}
                      </td>
                    </tr>
                    {order.items?.map((item: any, iidx: number) => (
                      <tr key={`${idx}-${iidx}`} className="bg-white">
                        <td className="px-10 py-1 text-[8px] font-medium text-slate-400 italic">
                          • {item.description} ({item.quantity} {item.unit} @ {formatAmount(item.rate)}/{item.unit})
                        </td>
                        <td className="px-6 py-1 text-[8px] font-medium text-slate-400 text-right">
                          {item.hsnCode || '—'}
                        </td>
                        <td className="px-6 py-1 text-[8px] font-medium text-slate-400 text-right">
                          {formatAmount(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals Section */}
          <div className="flex justify-end mb-12">
            <div className="w-[320px] space-y-4">
              <div className="flex justify-between items-center px-4">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Subtotal</span>
                <span className="text-sm font-bold text-neutral-700">{formatAmount(invoice.subtotal)}</span>
              </div>
              
              <div className="space-y-2 py-3 bg-neutral-50 rounded-xl border border-neutral-100">
                {invoice.cgst > 0 && (
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">CGST</span>
                    <span className="text-xs font-bold text-neutral-600">{formatAmount(invoice.cgst)}</span>
                  </div>
                )}
                {invoice.sgst > 0 && (
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">SGST</span>
                    <span className="text-xs font-bold text-neutral-600">{formatAmount(invoice.sgst)}</span>
                  </div>
                )}
                {invoice.igst > 0 && (
                  <div className="flex justify-between items-center px-4">
                    <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">IGST</span>
                    <span className="text-xs font-bold text-neutral-600">{formatAmount(invoice.igst)}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center px-4 pt-4 border-t border-neutral-100">
                <span className="text-xs font-black text-neutral-900 uppercase tracking-tighter">Total Payable</span>
                <span className="text-2xl font-black text-neutral-900 tracking-tighter underline decoration-accent-600 decoration-2 underline-offset-4">
                  {formatAmount(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="grid grid-cols-2 gap-12 pt-12 border-t border-neutral-100">
            <div>
              <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Info className="h-3 w-3" /> Notes & Terms
              </h4>
              <p className="text-[10px] font-medium text-neutral-400 leading-relaxed italic">
                {invoice.notes || 'Please pay the total amount within 15 days of receiving this invoice. Interest of 2% per month will be charged for delayed payments.'}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <div className="h-16 w-32 bg-neutral-50 border border-dashed border-neutral-200 rounded-xl mb-3 flex items-center justify-center">
                <p className="text-[8px] font-black text-neutral-300 uppercase tracking-[0.2em] rotate-[-12deg]">Authorized Sign</p>
              </div>
              <p className="text-[10px] font-black text-neutral-900 uppercase">For FreightFlow Trans</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
