'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { LorryReceiptTemplate } from './LorryReceiptTemplate';
import { generateLRPrintPDF } from '@/lib/pdf/lr-print';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface OrderPrintHubProps {
  order: any;
  company: any;
}

export const OrderPrintHub: React.FC<OrderPrintHubProps> = ({ order, company }) => {
  const [downloading, setDownloading] = useState(false);

  if (!order) return null;

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const configRes = await fetch('/api/v1/companies/branding');
      const config = await configRes.json();
      const doc = await generateLRPrintPDF(order, config.data);
      doc.save(`LR_${order.lrNo}_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('LR PDF Generated');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-12 p-8 bg-slate-50 min-h-screen">
      {/* Action Bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Print Preview</h2>
          <p className="text-sm font-medium text-slate-500">LR #{order.lrNo} - {order.dealer?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {downloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>
      </div>

      {/* Main Document Area */}
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Copy 1: Consignee */}
        <div className="shadow-2xl">
          <LorryReceiptTemplate 
            order={order} 
            company={company} 
            copyType="CONSIGNEE COPY" 
            onClose={() => {}}
          />
        </div>

        {/* Copy 2: Office/Driver */}
        <div className="shadow-2xl">
          <LorryReceiptTemplate 
            order={order} 
            company={company} 
            copyType="OFFICE/DRIVER COPY" 
            onClose={() => {}}
          />
        </div>

      </div>
    </div>
  );
};
