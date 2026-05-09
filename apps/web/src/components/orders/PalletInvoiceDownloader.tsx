'use client';

import React, { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { getPalletInvoiceData } from '@/app/actions/admin/pallet-invoice';
import { generatePalletPDF } from '@/lib/pdf/pallet-invoice';
import { generatePalletReceiptPDF } from '@/lib/pdf/pallet-receipt';

interface PalletInvoiceDownloaderProps {
  palletId: string;
  lrNo?: string;
  variant?: 'invoice' | 'receipt';
  label?: string;
  className?: string;
  showIconOnly?: boolean;
}

export function PalletInvoiceDownloader({ 
  palletId, 
  lrNo, 
  variant = 'invoice',
  label,
  className,
  showIconOnly = false
}: PalletInvoiceDownloaderProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setLoading(true);
    try {
      const { pallet, company } = await getPalletInvoiceData(palletId);
      
      let doc;
      let filename;
      
      if (variant === 'invoice') {
        doc = await generatePalletPDF(pallet, company);
        filename = `Pallet_Invoice_${lrNo || pallet.lrNo || palletId}.pdf`;
      } else {
        doc = await generatePalletReceiptPDF(pallet, company);
        filename = `Pallet_Challan_${lrNo || pallet.lrNo || palletId}.pdf`;
      }

      doc.save(filename);
      toast.success(`${variant === 'invoice' ? 'Invoice' : 'Challan'} generated and downloaded`);
    } catch (error: any) {
      console.error('PDF Generation failed', error);
      toast.error(error.message || 'Failed to generate PDF');
    } finally {
      setLoading(false);
    }
  };

  if (showIconOnly) {
    return (
      <button 
        onClick={handleDownload}
        disabled={loading}
        className={className}
        title={variant === 'invoice' ? 'Download PDF Invoice' : 'Download Pallet Challan'}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
      </button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload} 
      disabled={loading}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating...
        </>
      ) : variant === 'invoice' ? (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label || 'Download Invoice'}
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {label || 'Download Challan'}
        </>
      )}
    </Button>
  );
}
