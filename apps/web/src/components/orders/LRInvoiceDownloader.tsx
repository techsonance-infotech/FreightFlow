'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, Download, Loader2 } from 'lucide-react';
import { getLRInvoiceData } from '@/app/actions/admin/lr-invoice';
import { generateLRPrintPDF } from '@/lib/pdf/lr-print';
import { generateLRReceiptPDF } from '@/lib/pdf/lr-receipt';

interface LRInvoiceDownloaderProps {
  orderId: string;
  variant?: 'print' | 'receipt';
  label?: string;
  className?: string;
}

export function LRInvoiceDownloader({ orderId, variant = 'print', label, className }: LRInvoiceDownloaderProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoading(true);
      const { order, company } = await getLRInvoiceData(orderId);
      
      let doc;
      let filename;
      
      if (variant === 'print') {
        doc = await generateLRPrintPDF(order, company);
        filename = `LR_Print_${order.lrNo}.pdf`;
      } else {
        doc = await generateLRReceiptPDF(order, company);
        filename = `LR_Receipt_${order.lrNo}.pdf`;
      }

      doc.save(filename);
      toast.success(`${variant === 'print' ? 'LR Print' : 'LR Receipt'} downloaded`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  const ariaLabel = label?.trim() ? label : (variant === 'print' ? 'Download LR' : 'Download Receipt');

  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      disabled={loading}
      onClick={handleDownload}
      aria-label={ariaLabel}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {label || (variant === 'print' ? 'Download LR' : 'Download Receipt')}
    </Button>
  );
}
