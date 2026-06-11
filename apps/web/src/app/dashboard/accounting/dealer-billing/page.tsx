'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Calendar as CalendarIcon,
  Download,
  Filter,
  ChevronRight,
  Printer,
  Package,
  Table as TableIcon,
  Layers,
  IndianRupee,
  AlertCircle
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn, formatWeight, formatUtcDate, fetchOnlineDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  getDealers,
  getDealerRecords,
  getCompanyBillingDetails,
  getNextInvoiceNumber,
  markRecordsAsInvoiced
} from '@/app/actions/accounting/dealer-billing';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from '@/lib/utils/number-to-words';

interface Dealer {
  id: string;
  name: string;
  code?: string | null;
  personName?: string | null;
  address?: string | null;
  pincode?: string | null;
  area?: string | null;
  phone?: string | null;
  pan?: string | null;
  gstin?: string | null;
}

interface OrderRecord {
  id: string;
  date: Date;
  lrNo: string;
  loadType: string;
  totalWeight: any;
  totalBoxes: number;
  rateOn?: string;
  details: any[];
}

export default function DealerBillingPage() {
  const [loadType, setLoadType] = useState<'BOX' | 'PALLET' | 'BOTH' | 'PALLET_RETURN'>('BOTH');
  const [isGstRequired, setIsGstRequired] = useState(false);
  const [gstType, setGstType] = useState<'intra' | 'inter'>('intra');
  const [gstRate, setGstRate] = useState<number>(0);
  const [dealers, setDealers] = useState<Dealer[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');
  const [periodType, setPeriodType] = useState<'month' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [reportType, setReportType] = useState<'consolidated' | 'detailed'>('detailed');
  const [records, setRecords] = useState<OrderRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  const [currentInvoiceNo, setCurrentInvoiceNo] = useState<string>('INV/24-25/001');
  const [detailedPrices, setDetailedPrices] = useState<Record<string, number>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [invoiceDate, setInvoiceDate] = useState<string>('');

  // Pricing for consolidated report
  const [consolidatedItems, setConsolidatedItems] = useState<any[]>([]);

  const subtotal = records.reduce((acc, record) => {
    // Determine the key exactly as it's built in processConsolidatedData
    const isPallet = record.loadType === 'PALLET' || record.loadType === 'PALLET_RETURN';
    const prodName = record.details[0]?.productName || (isPallet ? (record.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet') : 'Yarn');
    const packType = isPallet ? (record.details[0]?.packingType || 'Pallet') : (record.details[0]?.packingType || 'Box');
    const itemKey = `${prodName}-${packType}`;

    const consolidatedItem = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey);
    const price = consolidatedItem?.unitPrice || 0;
    const rateOn = record.rateOn || 'weight';
    const multiplier = isPallet 
      ? (rateOn === 'weight' ? Number(record.totalWeight || 0) : (record.totalBoxes || 0)) 
      : (rateOn === 'box' ? (record.totalBoxes || 0) : Number(record.totalWeight || 0));

    return acc + (multiplier * price);
  }, 0);

  // Check if database records have any GST
  const hasStoredGst = records.some(r => Number((r as any).cgstAmount || 0) > 0 || Number((r as any).sgstAmount || 0) > 0 || Number((r as any).igstAmount || 0) > 0);

  const cgst = isGstRequired 
    ? (gstType === 'intra' ? subtotal * (gstRate / 200) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number((r as any).cgstAmount || 0), 0) : 0);

  const sgst = isGstRequired 
    ? (gstType === 'intra' ? subtotal * (gstRate / 200) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number((r as any).sgstAmount || 0), 0) : 0);

  const igst = isGstRequired 
    ? (gstType === 'inter' ? subtotal * (gstRate / 100) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number((r as any).igstAmount || 0), 0) : 0);

  const rawTotal = subtotal + cgst + sgst + igst;
  const grandTotal = Math.round(rawTotal);
  const roundOff = grandTotal - rawTotal;

  useEffect(() => {
    async function loadDealers() {
      const data = await getDealers();
      setDealers(data);
      const nextNo = await getNextInvoiceNumber();
      if (nextNo) setCurrentInvoiceNo(nextNo);
      
      const dateStr = await fetchOnlineDate();
      setInvoiceDate(dateStr);
    }
    loadDealers();
  }, []);

  const handleFetchRecords = async () => {
    if (!selectedDealerId) {
      toast.error('Please select a dealer');
      return;
    }

    setIsLoading(true);
    try {
      let start = new Date(startDate);
      let end = new Date(endDate);

      if (periodType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        start = new Date(year, month - 1, 1);
        end = endOfMonth(start);
      }

      const data = await getDealerRecords(selectedDealerId, start, end, loadType);
      const company = await getCompanyBillingDetails();

      setRecords(data as any);
      setCompanyDetails(company);
      processConsolidatedData(data);
      setCurrentPage(1); // Reset to first page on new fetch

      const nextNo = await getNextInvoiceNumber();
      if (nextNo) setCurrentInvoiceNo(nextNo);

      toast.success(`Found ${data.length} records`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  const processConsolidatedData = (data: any[]) => {
    const groups: Record<string, any> = {};

    data.forEach(order => {
      order.details.forEach((detail: any) => {
        const key = `${detail.productName || 'Yarn'}-${detail.packingType || 'Box'}`;
        if (!groups[key]) {
          groups[key] = {
            description: detail.productName || 'Polyester Yarn',
            type: detail.packingType || 'Box',
            loadType: order.loadType, // Track the origin (BOX vs PALLET)
            totalWeight: 0,
            totalQty: 0,
            unitPrice: 0,
          };
        }
        groups[key].totalWeight += Number(detail.weight || 0);
        groups[key].totalQty += Number(detail.boxCount || 0);

        if (Number(order.rate || 0) > 0 && groups[key].unitPrice === 0) {
          groups[key].unitPrice = Number(order.rate);
        }
      });
    });

    setConsolidatedItems(Object.values(groups));
  };

  const updateUnitPrice = (index: number, price: number) => {
    const newItems = [...consolidatedItems];
    newItems[index].unitPrice = price;
    setConsolidatedItems(newItems);
  };

  const getBase64Image = async (imgUrl: string): Promise<string | null> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = imgUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 600;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          if (width / height > MAX_WIDTH / MAX_HEIGHT) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          } else {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(null);
    });
  };

  const generatePDF = async () => {
    if (records.length === 0) {
      toast.error('No records to generate PDF');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const boxWidth = pageWidth - (margin * 2);
    let currentY = margin;

    const dealer = dealers.find(d => d.id === selectedDealerId);

    // Page 1 Border
    doc.setDrawColor(200);
    doc.rect(margin - 0.5, margin - 0.5, boxWidth + 1, pageHeight - (margin * 2) + 1);

    // 1. Box 1: Business Details & Logo (Top Section)
    doc.rect(margin, currentY, boxWidth, 45);

    // Left: Business Info
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 248, 252);
    doc.rect(margin + 0.1, currentY + 0.1, boxWidth * 0.6, 6, 'F'); // 60% width for text
    doc.text('Consignor / Principal Place Of Business', margin + 2, currentY + 4.5);

    let businessY = currentY + 12;
    doc.setFontSize(11);
    doc.text(companyDetails?.name?.toUpperCase() || 'COMPANY NAME', margin + 2, businessY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    let consignorY = businessY + 4;
    const supplierLines = doc.splitTextToSize(companyDetails?.address || '', (boxWidth * 0.6) - 5);
    doc.text(supplierLines, margin + 2, consignorY);

    let supplierInfoY = consignorY + (supplierLines.length * 3.5);
    doc.text(`GST No :- ${companyDetails?.gstin?.toUpperCase() || '-'}`, margin + 2, supplierInfoY);
    doc.text(`PAN No. :- ${companyDetails?.pan?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 4);
    doc.text(`Bank Name :- ${companyDetails?.bankName?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 8);
    doc.text(`A/C No :- ${companyDetails?.accountNo || '-'}`, margin + 2, supplierInfoY + 12);
    doc.text(`IFSC CODE :- ${companyDetails?.ifscCode?.toUpperCase() || '-'}`, margin + 2, supplierInfoY + 16);

    // Right: Logo (Aspect-ratio aware)
    if (companyDetails?.logoUrl) {
      try {
        const logoData = await getBase64Image(companyDetails.logoUrl);
        if (logoData) {
          const imgProps = doc.getImageProperties(logoData);
          const maxLogoW = 50;
          const maxLogoH = 30;
          const ratio = Math.min(maxLogoW / imgProps.width, maxLogoH / imgProps.height);
          const w = imgProps.width * ratio;
          const h = imgProps.height * ratio;

          doc.addImage(logoData, 'PNG', pageWidth - margin - w - 5, currentY + 10, w, h);
        }
      } catch (e) { }
    }

    currentY += 48;

    // 2. Box 2: Dealer Info & Invoice Metadata
    doc.setDrawColor(200);
    doc.rect(margin, currentY, boxWidth, 38);
    doc.setFillColor(245, 248, 252);
    doc.rect(margin + 0.1, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');
    doc.rect(pageWidth / 2, currentY + 0.1, boxWidth / 2 - 0.1, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Dealer / Consignee Details', margin + 2, currentY + 4.5);
    doc.text('Invoice Details', pageWidth / 2 + 2, currentY + 4.5);

    let dealerY = currentY + 11;
    doc.setFontSize(10);
    doc.text(dealer?.name?.toUpperCase() || 'Selected Dealer', margin + 2, dealerY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    let dealerInfoY = dealerY + 4;
    
    // Address & details formatting
    const fullAddress = [
      dealer?.address || '',
      dealer?.area ? `${dealer.area}` : '',
      dealer?.pincode ? `PIN: ${dealer.pincode}` : ''
    ].filter(Boolean).join(', ');

    const dealerAddressLines = doc.splitTextToSize(fullAddress || 'Address: -', (boxWidth / 2) - 5);
    doc.text(dealerAddressLines, margin + 2, dealerInfoY);

    let nextY = dealerInfoY + Math.min(dealerAddressLines.length * 3.5, 7) + 1;
    doc.setFont('helvetica', 'bold');
    doc.text(`Dealer Code :- `, margin + 2, nextY);
    doc.setFont('helvetica', 'normal');
    doc.text(dealer?.code || '-', margin + 22, nextY);

    doc.setFont('helvetica', 'bold');
    doc.text(`GST No. :- `, margin + 2, nextY + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.text(dealer?.gstin || '-', margin + 18, nextY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`PAN No. :- `, margin + 2, nextY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(dealer?.pan || '-', margin + 18, nextY + 7);

    // Right: Metadata (Invoice No, Date)
    const metaX = pageWidth / 2 + 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No :- ${currentInvoiceNo}`, metaX, currentY + 12);
    doc.text(`Date :- ${formatUtcDate(invoiceDate || new Date(), 'dd/MM/yyyy')}`, metaX, currentY + 17);
    doc.text(`Report Copy`, metaX, currentY + 22);

    currentY += 42;

    if (reportType === 'detailed') {
      const tableData = records.map((record, index) => {
        const isPallet = record.loadType === 'PALLET' || record.loadType === 'PALLET_RETURN';
        const prodName = record.details[0]?.productName || (isPallet ? (record.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet') : 'Yarn');
        const packType = isPallet ? (record.details[0]?.packingType || 'Pallet') : (record.details[0]?.packingType || 'Box');
        const itemKey = `${prodName}-${packType}`;

        const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
        const rateOn = record.rateOn || 'weight';
        const multiplier = isPallet 
          ? (rateOn === 'weight' ? Number(record.totalWeight || 0) : (record.totalBoxes || 0)) 
          : (rateOn === 'box' ? (record.totalBoxes || 0) : Number(record.totalWeight || 0));
        const amount = multiplier * price;

        return [
          (index + 1).toString(),
          prodName,
          packType,
          isPallet 
            ? (rateOn === 'weight' ? `${Number(record.totalWeight).toFixed(2)} KG` : `${record.totalBoxes} Nos`) 
            : (rateOn === 'box' ? `${record.totalBoxes} Boxes` : `${Number(record.totalWeight).toFixed(2)} KG`),
          price.toFixed(2),
          amount.toFixed(2)
        ];
      });

      autoTable(doc, {
        startY: currentY,
        head: [['SR.', 'DESCRIPTION OF GOODS', 'TYPE', 'QTY / WEIGHT', 'UNIT RATE', 'AMOUNT']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 80, halign: 'left' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin, right: margin }
      });
    } else {
      const tableData = consolidatedItems.map((item, index) => [
        (index + 1).toString(),
        item.description,
        item.type,
        item.type === 'Pallet' ? `${item.totalQty} Nos` : `${formatWeight(item.totalWeight)} KG`,
        item.unitPrice.toFixed(2),
        (item.type === 'Pallet' ? item.totalQty * item.unitPrice : item.totalWeight * item.unitPrice).toFixed(2)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['SR.', 'DESCRIPTION OF GOODS', 'TYPE', 'QTY / WEIGHT', 'UNIT RATE', 'AMOUNT']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { fontSize: 8, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          1: { cellWidth: 80, halign: 'left' },
          2: { cellWidth: 20, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'right' },
          5: { cellWidth: 30, halign: 'right' },
        },
        margin: { left: margin, right: margin }
      });
    }

    currentY = (doc as any).lastAutoTable.finalY + 5;

    // Page break check before Totals section
    const neededHeight = 90; // estimated height for Totals, Signature, Terms, Thank you
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 5;
      doc.setDrawColor(200);
      doc.rect(margin - 0.5, margin - 0.5, boxWidth + 1, pageHeight - (margin * 2) + 1);
    }

    const totalsStartY = currentY;

    // Totals Table (Professional Alignment)
    autoTable(doc, {
      startY: currentY,
      body: [
        ['Subtotal:', subtotal.toFixed(2)],
        ...((isGstRequired && gstType === 'intra') || (!isGstRequired && hasStoredGst && (cgst > 0 || sgst > 0)) ? [
          [`CGST ${isGstRequired ? `(${gstRate / 2}%)` : ''}:`, cgst.toFixed(2)],
          [`SGST ${isGstRequired ? `(${gstRate / 2}%)` : ''}:`, sgst.toFixed(2)],
        ] : []),
        ...((isGstRequired && gstType === 'inter') || (!isGstRequired && hasStoredGst && igst > 0) ? [
          [`IGST ${isGstRequired ? `(${gstRate}%)` : ''}:`, igst.toFixed(2)],
        ] : []),
        ['Round Off:', roundOff.toFixed(2)],
        ['GRAND TOTAL:', `Rs. ${grandTotal.toFixed(2)}`]
      ],
      theme: 'plain',
      styles: {
        fontSize: 8,
        halign: 'right',
        cellPadding: { top: 1, bottom: 1, left: 2, right: 5 },
        textColor: [0, 0, 0]
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 65 },
        1: { fontStyle: 'bold', cellWidth: 35 }
      },
      margin: { left: pageWidth - margin - 100 },
      didParseCell: (data) => {
        if (data.row.index === data.table.body.length - 1) {
          data.cell.styles.fontSize = 10;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    });

    const totalsEndY = (doc as any).lastAutoTable.finalY;
    const totalsBoxHeight = totalsEndY - totalsStartY + 4;
    doc.setDrawColor(200);
    doc.rect(margin, totalsStartY, boxWidth, totalsBoxHeight);

    doc.setFontSize(7.5);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.text(`Amount in Words: ${numberToWords(grandTotal)}`, margin + 2, totalsStartY + 5);

    currentY = totalsEndY + 6;

    // Footer: Auth Signature Box (compact height 30)
    doc.setDrawColor(200);
    doc.rect(margin, currentY, boxWidth, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Receiver\'s Signature:', margin + 2, currentY + 7);

    const companyTitle = `FOR, ${companyDetails?.name?.toUpperCase() || 'COMPANY NAME'}`;
    doc.setFont('helvetica', 'bold');
    doc.text(companyTitle, pageWidth - margin - 2, currentY + 10, { align: 'right' });

    // Digital Signature
    if (companyDetails?.signatureUrl) {
      try {
        const sigData = await getBase64Image(companyDetails.signatureUrl);
        if (sigData) {
          const sigProps = doc.getImageProperties(sigData);
          const maxSigW = 30;
          const maxSigH = 12;
          const sigRatio = Math.min(maxSigW / sigProps.width, maxSigH / sigProps.height);
          const sw = sigProps.width * sigRatio;
          const sh = sigProps.height * sigRatio;

          // Place between "FOR" and "Authorised Signature"
          doc.addImage(sigData, 'PNG', pageWidth - margin - sw - 5, currentY + 11, sw, sh);
        }
      } catch (e) { }
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signature', pageWidth - margin - 2, currentY + 26, { align: 'right' });

    currentY += 35;

    // Terms (dynamic compact block)
    const termsText = companyDetails?.printTerms || '1. Goods once sold will not be taken back.\n2. Subject to local Jurisdiction.';
    doc.setFontSize(7);
    const termLines = doc.splitTextToSize(termsText, boxWidth - 4);
    const termsHeight = (termLines.length * 3.5) + 6;
    doc.rect(margin, currentY, boxWidth, termsHeight);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', margin + 2, currentY + 4);
    doc.setFont('helvetica', 'normal');
    doc.text(termLines, margin + 2, currentY + 7.5);

    currentY += termsHeight + 7;

    // Thank You & Contact Info (AT THE VERY BOTTOM)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Thank You For Your Business!', pageWidth / 2, currentY, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`If you have any questions about this invoice, please contact: ${companyDetails?.phone || '9173101711'}`, pageWidth / 2, currentY + 6, { align: 'center' });

    doc.save(`${dealer?.name || 'Dealer'}_Report_${formatUtcDate(invoiceDate || new Date(), 'yyyyMMdd')}.pdf`);

    // Commit the invoice number to DB
    try {
      const recordsToMark = records.map(r => ({
        id: r.id,
        type: r.loadType === 'BOX' ? 'BOX' as const : 'PALLET' as const
      }));
      await markRecordsAsInvoiced(recordsToMark, currentInvoiceNo);
      const nextNo = await getNextInvoiceNumber();
      if (nextNo) setCurrentInvoiceNo(nextNo);
    } catch (e) { }

    toast.success('Report generated and saved successfully');
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
            <FileText className="h-8 w-8 text-brand-900 shrink-0" />
            Dealer Billing Hub
          </h1>
          <p className="text-xs font-black text-slate-400 mt-1.5 uppercase tracking-[0.2em]">
            Consolidated Invoice Generation & Distribution Intelligence
          </p>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={handleFetchRecords}
            disabled={isLoading}
            variant="outline" 
            className="h-14 px-8 rounded-2xl border-slate-250 font-black text-xs uppercase tracking-widest gap-3 shadow-sm"
          >
            <Filter className="h-4 w-4" /> Fetch Records
          </Button>
          <Button 
            onClick={generatePDF}
            disabled={records.length === 0}
            className="h-14 px-8 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-900/20 gap-3"
          >
            <Download className="h-4 w-4" /> Generate & Print Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Configuration Sidebar */}
        <Card className="xl:col-span-1 p-6 rounded-3xl border-slate-100 shadow-sm bg-white space-y-6 h-fit text-slate-900">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Party / Dealer</Label>
              <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
                <SelectTrigger className="rounded-xl border-slate-100 h-11 bg-slate-50/50 text-slate-850 font-bold text-xs">
                  <SelectValue placeholder="Select Dealer" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                  {dealers.map(dealer => (
                    <SelectItem key={dealer.id} value={dealer.id}>{dealer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Report Type</Label>
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                <span className={cn("text-xs font-bold transition-colors", reportType === 'detailed' ? "text-blue-600" : "text-slate-400")}>Detailed</span>
                <Switch
                  checked={reportType === 'consolidated'}
                  onCheckedChange={(checked) => setReportType(checked ? 'consolidated' : 'detailed')}
                />
                <span className={cn("text-xs font-bold transition-colors", reportType === 'consolidated' ? "text-blue-600" : "text-slate-400")}>Consolidated</span>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex bg-slate-100 rounded-xl p-1">
                <button 
                  onClick={() => setPeriodType('month')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    periodType === 'month' ? "bg-white text-brand-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >Monthly</button>
                <button 
                  onClick={() => setPeriodType('range')}
                  className={cn(
                    "flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                    periodType === 'range' ? "bg-white text-brand-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >Range</button>
              </div>

              {periodType === 'month' ? (
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase text-slate-400">Select Month</Label>
                  <Input 
                    type="month" 
                    value={selectedMonth} 
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-xl border-slate-100 h-11 bg-slate-50/50 text-slate-850 font-bold text-xs"
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">From</Label>
                    <Input 
                      type="date" 
                      value={startDate} 
                      onChange={(e) => setStartDate(e.target.value)}
                      className="rounded-xl border-slate-100 h-11 bg-slate-50/50 text-slate-850 font-bold text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-black uppercase text-slate-400">To</Label>
                    <Input 
                      type="date" 
                      value={endDate} 
                      onChange={(e) => setEndDate(e.target.value)}
                      className="rounded-xl border-slate-100 h-11 bg-slate-50/50 text-slate-850 font-bold text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Invoice Date</Label>
              <Input 
                type="date" 
                value={invoiceDate} 
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="rounded-xl border-slate-100 h-11 bg-slate-50/50 text-slate-850 font-bold text-xs"
              />
            </div>
          </div>

          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">GST Requirement</label>
              <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200/50">
                <button 
                  type="button" 
                  onClick={() => setIsGstRequired(true)} 
                  className={cn(
                    "flex-1 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                    isGstRequired ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  With GST
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsGstRequired(false)} 
                  className={cn(
                    "flex-1 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                    !isGstRequired ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  Without GST
                </button>
              </div>
            </div>

            {isGstRequired && (
              <>
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">GST Type</label>
                  <div className="flex bg-slate-100 rounded-full p-1 border border-slate-200/50">
                    <button 
                      type="button" 
                      onClick={() => setGstType('intra')} 
                      className={cn(
                        "flex-1 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                        gstType === 'intra' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Intra (CGST+SGST)
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setGstType('inter')} 
                      className={cn(
                        "flex-1 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", 
                        gstType === 'inter' ? 'bg-white text-brand-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                      )}
                    >
                      Inter (IGST)
                    </button>
                  </div>
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">GST Rate (%)</label>
                  <Select value={gstRate.toString()} onValueChange={(val) => setGstRate(Number(val))}>
                    <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 font-bold text-xs">
                      <SelectValue placeholder="Select Rate" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-100">
                      <SelectItem value="0" className="text-xs font-bold">0% Exempted</SelectItem>
                      <SelectItem value="5" className="text-xs font-bold">5% GST</SelectItem>
                      <SelectItem value="12" className="text-xs font-bold">12% GST</SelectItem>
                      <SelectItem value="18" className="text-xs font-bold">18% GST</SelectItem>
                      <SelectItem value="28" className="text-xs font-bold">28% GST</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Load Type</label>
              <Select value={loadType} onValueChange={(val: any) => setLoadType(val)}>
                <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 font-bold text-xs">
                  <SelectValue placeholder="Select Load Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-slate-100">
                  <SelectItem value="BOTH" className="text-[10px] font-black uppercase">Standard + Pallet</SelectItem>
                  <SelectItem value="BOX" className="text-[10px] font-black uppercase">Standard Box Only</SelectItem>
                  <SelectItem value="PALLET" className="text-[10px] font-black uppercase">Pallet Only</SelectItem>
                  <SelectItem value="PALLET_RETURN" className="text-[10px] font-black uppercase">Pallet Return Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Bulk Pricing Section - Centralized */}
            {consolidatedItems.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-blue-600">Bulk Pricing (Rates)</Label>
                  <span className="text-[9px] font-bold text-slate-400">{consolidatedItems.length} Items</span>
                </div>
                <div className="space-y-3">
                  {consolidatedItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-700 truncate max-w-[120px]">{item.description}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-900 uppercase">{item.type}</span>
                      </div>
                      <div className="relative">
                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                        <Input
                          type="number"
                          className="pl-8 h-8 rounded-lg text-xs bg-white border border-slate-100"
                          placeholder="Rate"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateUnitPrice(idx, Number(e.target.value))}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
              <p className="text-[10px] font-bold text-amber-700 leading-relaxed">
                Prices in the consolidated report can be adjusted before generation. Ensure all records are verified.
              </p>
            </div>
          </div>
        </Card>

        {/* Preview Area */}
        <Card className="xl:col-span-3 rounded-3xl border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col min-h-[600px]">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900 flex items-center gap-2">
              {reportType === 'consolidated' ? <Layers className="h-5 w-5 text-brand-900" /> : <TableIcon className="h-5 w-5 text-brand-900" />}
              {reportType === 'consolidated' ? 'Consolidated Preview' : 'Entry List Preview'}
            </h3>
            <span className="text-xs font-bold text-slate-400">{records.length} Records Found</span>
          </div>

          <div className="flex-1 overflow-auto p-0">
            {records.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-300 p-12 text-center">
                <div className="h-20 w-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Printer className="h-10 w-10 text-slate-400" />
                </div>
                <h4 className="font-black text-slate-800 uppercase tracking-wider">No records to display</h4>
                <p className="text-xs font-bold text-slate-400 mt-2 max-w-xs leading-relaxed">
                  Select a dealer and period then click "Fetch Records" to start.
                </p>
              </div>
            ) : reportType === 'detailed' ? (
              <>
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto relative border-b border-slate-100">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                      <tr>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">LR / CH.No</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Item Details</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Weight/Qty</th>
                        <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {records
                        .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                        .map((record) => (
                          <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-slate-600">{formatUtcDate(record.date, 'dd MMM yyyy')}</td>
                            <td className="px-6 py-4 text-xs font-black text-slate-900">{record.lrNo}</td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-900">{record.details?.[0]?.productName || 'Yarn'}</span>
                                <span className="text-[10px] text-slate-400">{record.details?.[0]?.packingType || 'Box'}</span>
                              </div>
                            </td>
                             <td className="px-6 py-4 text-xs font-black text-slate-900">
                              {(() => {
                                const isPallet = record.loadType === 'PALLET' || record.loadType === 'PALLET_RETURN';
                                const rateOn = record.rateOn || 'weight';
                                return isPallet 
                                  ? (rateOn === 'weight' ? `${record.totalWeight || 0} Kg` : `${record.totalBoxes || 0} Nos`) 
                                  : (rateOn === 'box' ? `${record.totalBoxes || 0} Boxes` : `${record.totalWeight || 0} Kg`);
                              })()}
                            </td>
                            <td className="px-6 py-4 text-xs font-black text-slate-900 text-right">
                              ₹ {(() => {
                                const isPallet = record.loadType === 'PALLET' || record.loadType === 'PALLET_RETURN';
                                const prodName = record.details?.[0]?.productName || (isPallet ? (record.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet') : 'Yarn');
                                const packType = isPallet ? (record.details?.[0]?.packingType || 'Pallet') : (record.details?.[0]?.packingType || 'Box');
                                const itemKey = `${prodName}-${packType}`;

                                const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
                                const rateOn = record.rateOn || 'weight';
                                const multiplier = isPallet 
                                  ? (rateOn === 'weight' ? Number(record.totalWeight || 0) : (record.totalBoxes || 0)) 
                                  : (rateOn === 'box' ? (record.totalBoxes || 0) : Number(record.totalWeight || 0));
                                return (multiplier * price).toFixed(2);
                              })()}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {records.length > itemsPerPage && (
                  <div className="px-6 py-4 flex items-center justify-between bg-white border-t border-slate-100">
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, records.length)} of {records.length} Records
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.ceil(records.length / itemsPerPage) }).map((_, i) => {
                          const page = i + 1;
                          if (page === 1 || page === Math.ceil(records.length / itemsPerPage) || (page >= currentPage - 1 && page <= currentPage + 1)) {
                            return (
                              <Button
                                key={page}
                                variant={currentPage === page ? "default" : "ghost"}
                                size="sm"
                                onClick={() => setCurrentPage(page)}
                                className={`h-8 w-8 rounded-lg text-[10px] font-black ${currentPage === page ? 'bg-blue-600 text-white' : ''}`}
                              >
                                {page}
                              </Button>
                            );
                          }
                          if (page === currentPage - 2 || page === currentPage + 2) return <span key={page} className="text-slate-400">...</span>;
                          return null;
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(Math.ceil(records.length / itemsPerPage), prev + 1))}
                        disabled={currentPage === Math.ceil(records.length / itemsPerPage)}
                        className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}

                {/* Categorical Breakdown for Detailed List */}
                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-8 border-t border-slate-100">
                  <div className="flex flex-col gap-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Load Type Breakdown</h4>
                    <div className="flex flex-wrap gap-12">
                      {records.some(r => r.loadType === 'BOX') && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Box Total (Weight / Qty)</span>
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900">
                              {formatWeight(records.filter(r => r.loadType === 'BOX').reduce((acc, r) => acc + Number(r.totalWeight), 0))} KG / {records.filter(r => r.loadType === 'BOX').reduce((acc, r) => acc + (r.totalBoxes || 0), 0)} Boxes
                            </span>
                            <span className="text-base font-black text-blue-600 mt-1">
                              ₹ {records.filter(r => r.loadType === 'BOX').reduce((acc, r) => {
                                const prodName = r.details?.[0]?.productName || 'Yarn';
                                const packType = r.details?.[0]?.packingType || 'Box';
                                const itemKey = `${prodName}-${packType}`;
                                const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
                                const rateOn = r.rateOn || 'weight';
                                const multiplier = rateOn === 'box' ? (r.totalBoxes || 0) : Number(r.totalWeight || 0);
                                return acc + (multiplier * price);
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )}
                      {records.some(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN') && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Pallet Total (Qty / Weight)</span>
                          <div className="flex flex-col">
                            <span className="text-xl font-black text-slate-900">
                              {records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => acc + (r.totalBoxes || 0), 0)} Nos / {formatWeight(records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => acc + Number(r.totalWeight), 0))} KG
                            </span>
                            <span className="text-base font-black text-orange-600 mt-1">
                              ₹ {records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => {
                                const prodName = r.details?.[0]?.productName || (r.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet');
                                const packType = r.loadType === 'PALLET_RETURN' ? 'Pallet Return' : 'Pallet';
                                const itemKey = `${prodName}-${packType}`;
                                const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
                                const rateOn = r.rateOn || 'weight';
                                const multiplier = rateOn === 'weight' ? Number(r.totalWeight || 0) : (r.totalBoxes || 0);
                                return acc + (multiplier * price);
                              }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {((isGstRequired && gstType === 'intra') || (!isGstRequired && hasStoredGst && (cgst > 0 || sgst > 0))) && (
                      <>
                        <div className="flex items-center gap-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">CGST {isGstRequired ? `(${gstRate / 2}%)` : ''}</span>
                          <span className="text-lg font-black text-blue-600">
                            + ₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">SGST {isGstRequired ? `(${gstRate / 2}%)` : ''}</span>
                          <span className="text-lg font-black text-blue-600">
                            + ₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}

                    {((isGstRequired && gstType === 'inter') || (!isGstRequired && hasStoredGst && igst > 0)) && (
                      <div className="flex items-center gap-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500">IGST {isGstRequired ? `(${gstRate}%)` : ''}</span>
                        <span className="text-lg font-black text-indigo-600">
                          + ₹ {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Round Off</span>
                      <span className="text-lg font-bold text-slate-600">
                        {roundOff >= 0 ? '+' : ''} ₹ {roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="h-[1px] w-full max-w-[300px] bg-slate-200 my-2" />

                    <div className="flex items-center gap-10">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Grand Total</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consolidatedItems.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 transition-all shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 text-brand-900 flex items-center justify-center">
                            <Package className="h-5 w-5" />
                          </div>
                          <div>
                            <h4 className="text-sm font-black text-slate-900">{item.description}</h4>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.type} Load</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Subtotal</span>
                          <span className="text-lg font-black text-brand-900">
                            ₹ {(item.type === 'Pallet' ? item.totalQty * item.unitPrice : item.totalWeight * item.unitPrice).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Total Weight</span>
                          <span className="text-sm font-black text-slate-900">{formatWeight(item.totalWeight)} KG</span>
                        </div>
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[9px] font-black text-slate-400 uppercase block">Total Quantity</span>
                          <span className="text-sm font-black text-slate-900">{item.totalQty} Nos</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Unified Totals Summary */}
                <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-8 border-t border-slate-100">
                  {/* Category Breakdown (Left Side) */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">Load Type Breakdown</h4>
                    <div className="flex flex-wrap gap-12">
                      {consolidatedItems.filter(i => i.loadType === 'BOX').length > 0 && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Box Total (Weight / Qty)</span>
                          <span className="text-lg font-black text-slate-900 block">
                            {formatWeight(consolidatedItems.filter(i => i.loadType === 'BOX').reduce((acc, i) => acc + i.totalWeight, 0))} KG / {consolidatedItems.filter(i => i.loadType === 'BOX').reduce((acc, i) => acc + i.totalQty, 0)} Boxes
                          </span>
                          <span className="text-sm font-bold text-brand-900 block mt-1">
                            ₹ {records.filter(r => r.loadType === 'BOX').reduce((acc, r) => {
                              const prodName = r.details?.[0]?.productName || 'Yarn';
                              const packType = r.details?.[0]?.packingType || 'Box';
                              const itemKey = `${prodName}-${packType}`;
                              const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
                              const rateOn = r.rateOn || 'weight';
                              const multiplier = rateOn === 'box' ? (r.totalBoxes || 0) : Number(r.totalWeight || 0);
                              return acc + (multiplier * price);
                            }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                      {consolidatedItems.filter(i => i.loadType === 'PALLET' || i.loadType === 'PALLET_RETURN').length > 0 && (
                        <div>
                          <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Pallet Total (Qty / Weight)</span>
                          <span className="text-lg font-black text-slate-900 block">
                            {consolidatedItems.filter(i => i.loadType === 'PALLET' || i.loadType === 'PALLET_RETURN').reduce((acc, i) => acc + i.totalQty, 0)} Nos / {formatWeight(consolidatedItems.filter(i => i.loadType === 'PALLET' || i.loadType === 'PALLET_RETURN').reduce((acc, i) => acc + i.totalWeight, 0))} KG
                          </span>
                          <span className="text-sm font-bold text-orange-600 block mt-1">
                            ₹ {records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => {
                              const prodName = r.details?.[0]?.productName || (r.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet');
                              const packType = r.loadType === 'PALLET_RETURN' ? 'Pallet Return' : 'Pallet';
                              const itemKey = `${prodName}-${packType}`;
                              const price = consolidatedItems.find(i => `${i.description}-${i.type}` === itemKey)?.unitPrice || 0;
                              const rateOn = r.rateOn || 'weight';
                              const multiplier = rateOn === 'weight' ? Number(r.totalWeight || 0) : (r.totalBoxes || 0);
                              return acc + (multiplier * price);
                            }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Financial Totals (Right Side) */}
                  <div className="flex flex-col items-end gap-3">
                    <div className="flex items-center gap-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Subtotal</span>
                      <span className="text-lg font-black text-slate-900">
                        ₹ {subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    {((isGstRequired && gstType === 'intra') || (!isGstRequired && hasStoredGst && (cgst > 0 || sgst > 0))) && (
                      <>
                        <div className="flex items-center gap-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-900">CGST {isGstRequired ? `(${gstRate / 2}%)` : ''}</span>
                          <span className="text-lg font-black text-brand-900">
                            + ₹ {cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="flex items-center gap-10">
                          <span className="text-[10px] font-black uppercase tracking-widest text-brand-900">SGST {isGstRequired ? `(${gstRate / 2}%)` : ''}</span>
                          <span className="text-lg font-black text-brand-900">
                            + ₹ {sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </>
                    )}
                    {((isGstRequired && gstType === 'inter') || (!isGstRequired && hasStoredGst && igst > 0)) && (
                      <div className="flex items-center gap-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-900">IGST {isGstRequired ? `(${gstRate}%)` : ''}</span>
                        <span className="text-lg font-black text-brand-900">
                          + ₹ {igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {(isGstRequired || (hasStoredGst && (cgst > 0 || sgst > 0 || igst > 0))) && (
                      <div className="flex items-center gap-10">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-900">Total GST</span>
                        <span className="text-lg font-black text-brand-900">
                          ₹ {(cgst + sgst + igst).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-10">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Round Off</span>
                      <span className="text-lg font-bold text-slate-600">
                        {roundOff >= 0 ? '+' : ''} ₹ {roundOff.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="h-[1px] w-full max-w-[300px] bg-slate-200 my-2" />
                    <div className="flex items-center gap-10">
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Grand Total</span>
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">
                        ₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
