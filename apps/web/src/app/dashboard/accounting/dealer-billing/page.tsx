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
  AlertCircle,
  Edit,
  Trash2,
  X,
  Save
} from 'lucide-react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { cn, formatWeight, formatUtcDate, fetchOnlineDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Modal } from '@/components/ui/modal';
import { Textarea } from '@/components/ui/textarea';
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
  createFreightInvoice,
  getSavedInvoices,
  deleteFreightInvoice,
  updateInvoiceRecords
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
  rate?: number;
  subtotal?: number;
  cgstPct?: number;
  sgstPct?: number;
  igstPct?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  igstAmount?: number;
  totalAmount?: number;
  consignee?: any;
  companyName?: string | null;
  details: any[];
}

export default function DealerBillingPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'saved'>('generate');
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const [invoiceDate, setInvoiceDate] = useState<string>('');

  // Saved Invoices State
  const [savedInvoices, setSavedInvoices] = useState<any[]>([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing Invoice State
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);
  const [editInvoiceDate, setEditInvoiceDate] = useState('');
  const [editInvoiceNotes, setEditInvoiceNotes] = useState('');
  const [editRecords, setEditRecords] = useState<any[]>([]);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Pricing for consolidated display groups
  const [consolidatedItems, setConsolidatedItems] = useState<any[]>([]);

  // Calculate totals from database values directly (Rupees)
  const subtotal = records.reduce((acc, r) => acc + Number(r.subtotal || 0), 0);
  const hasStoredGst = records.some(r => Number(r.cgstAmount || 0) > 0 || Number(r.sgstAmount || 0) > 0 || Number(r.igstAmount || 0) > 0);

  const cgst = isGstRequired 
    ? (gstType === 'intra' ? subtotal * (gstRate / 200) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number(r.cgstAmount || 0), 0) : 0);

  const sgst = isGstRequired 
    ? (gstType === 'intra' ? subtotal * (gstRate / 200) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number(r.sgstAmount || 0), 0) : 0);

  const igst = isGstRequired 
    ? (gstType === 'inter' ? subtotal * (gstRate / 100) : 0)
    : (hasStoredGst ? records.reduce((acc, r) => acc + Number(r.igstAmount || 0), 0) : 0);

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
      setCurrentPage(1); 

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

  const loadInvoicesList = async () => {
    setIsLoadingInvoices(true);
    try {
      const data = await getSavedInvoices();
      setSavedInvoices(data);
    } catch (e) {
      toast.error('Failed to load saved invoices');
    } finally {
      setIsLoadingInvoices(false);
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
            loadType: order.loadType, 
            totalWeight: 0,
            totalQty: 0,
            unitPrice: 0,
            subtotal: 0
          };
        }
        groups[key].totalWeight += Number(detail.weight || 0);
        groups[key].totalQty += Number(detail.boxCount || 0);
        groups[key].subtotal += Number(order.subtotal || 0);

        if (Number(order.rate || 0) > 0 && groups[key].unitPrice === 0) {
          groups[key].unitPrice = Number(order.rate);
        }
      });
    });

    setConsolidatedItems(Object.values(groups));
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

  // Shared PDF generator function
  const generateInvoicePDF = async (inv: {
    invoiceNo: string;
    date: Date | string;
    dealer: { name: string; address?: string | null; area?: string | null; pincode?: string | null; code?: string | null; gstin?: string | null; pan?: string | null };
    records: any[];
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    totalAmount: number;
    notes?: string | null;
  }, printReportType: 'consolidated' | 'detailed') => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;
    const boxWidth = pageWidth - (margin * 2);
    let currentY = margin;

    // Page 1 Border
    doc.setDrawColor(200);
    doc.rect(margin - 0.5, margin - 0.5, boxWidth + 1, pageHeight - (margin * 2) + 1);

    // Box 1: Business Details & Logo
    doc.rect(margin, currentY, boxWidth, 45);
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 248, 252);
    doc.rect(margin + 0.1, currentY + 0.1, boxWidth * 0.6, 6, 'F');
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

    // Box 2: Dealer Info & Invoice Metadata
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
    doc.text(inv.dealer?.name?.toUpperCase() || 'Selected Dealer', margin + 2, dealerY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    let dealerInfoY = dealerY + 4;
    
    const fullAddress = [
      inv.dealer?.address || '',
      inv.dealer?.area ? `${inv.dealer.area}` : '',
      inv.dealer?.pincode ? `PIN: ${inv.dealer.pincode}` : ''
    ].filter(Boolean).join(', ');

    const dealerAddressLines = doc.splitTextToSize(fullAddress || 'Address: -', (boxWidth / 2) - 5);
    doc.text(dealerAddressLines, margin + 2, dealerInfoY);

    let nextY = dealerInfoY + Math.min(dealerAddressLines.length * 3.5, 7) + 1;
    doc.setFont('helvetica', 'bold');
    doc.text(`Dealer Code :- `, margin + 2, nextY);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.dealer?.code || '-', margin + 22, nextY);

    doc.setFont('helvetica', 'bold');
    doc.text(`GST No. :- `, margin + 2, nextY + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.dealer?.gstin || '-', margin + 18, nextY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.text(`PAN No. :- `, margin + 2, nextY + 7);
    doc.setFont('helvetica', 'normal');
    doc.text(inv.dealer?.pan || '-', margin + 18, nextY + 7);

    const metaX = pageWidth / 2 + 2;
    doc.setFont('helvetica', 'bold');
    doc.text(`Invoice No :- ${inv.invoiceNo}`, metaX, currentY + 12);
    doc.text(`Date :- ${formatUtcDate(inv.date || new Date(), 'dd/MM/yyyy')}`, metaX, currentY + 17);
    doc.text(`Report Copy`, metaX, currentY + 22);

    currentY += 42;

    if (printReportType === 'detailed') {
      const tableData = inv.records.map((record, index) => {
        const isPallet = record.loadType === 'PALLET' || record.loadType === 'PALLET_RETURN';
        const prodName = record.details[0]?.productName || (isPallet ? (record.loadType === 'PALLET_RETURN' ? 'Empty Pallet Return' : 'Pallet') : 'Yarn');
        const packType = isPallet ? (record.details[0]?.packingType || 'Pallet') : (record.details[0]?.packingType || 'Box');
        
        const rateOn = record.rateOn || 'weight';
        const price = Number(record.rate || 0);
        const amount = Number(record.subtotal || 0);

        return [
          (index + 1).toString(),
          formatUtcDate(record.date, 'dd/MM/yyyy'),
          record.lrNo || '-',
          (record as any).consignee?.name || (record as any).companyName || '-',
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
        head: [['SR.', 'DATE', 'LR/CH.NO', 'CUSTOMER NAME', 'DESCRIPTION OF GOODS', 'TYPE', 'QTY / WEIGHT', 'UNIT RATE', 'AMOUNT']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontSize: 8, fontStyle: 'bold', halign: 'center' },
        bodyStyles: { textColor: [0, 0, 0], fontSize: 8, halign: 'center' },
        columnStyles: {
          0: { cellWidth: 8, halign: 'center' },
          1: { cellWidth: 20, halign: 'center' },
          2: { cellWidth: 25, halign: 'center' },
          3: { cellWidth: 32, halign: 'left' },
          4: { cellWidth: 35, halign: 'left' },
          5: { cellWidth: 13, halign: 'center' },
          6: { cellWidth: 20, halign: 'center' },
          7: { cellWidth: 15, halign: 'right' },
          8: { cellWidth: 22, halign: 'right' },
        },
        margin: { left: margin, right: margin }
      });
    } else {
      const groups: Record<string, any> = {};
      inv.records.forEach(order => {
        order.details.forEach((detail: any) => {
          const key = `${detail.productName || 'Yarn'}-${detail.packingType || 'Box'}`;
          if (!groups[key]) {
            groups[key] = {
              description: detail.productName || 'Polyester Yarn',
              type: detail.packingType || 'Box',
              totalWeight: 0,
              totalQty: 0,
              unitPrice: 0,
              subtotal: 0
            };
          }
          groups[key].totalWeight += Number(order.totalWeight || 0);
          groups[key].totalQty += Number(order.totalBoxes || 0);
          groups[key].subtotal += Number(order.subtotal || 0);
          groups[key].unitPrice = Number(order.rate || 0);
        });
      });

      const tableData = Object.values(groups).map((item: any, index) => [
        (index + 1).toString(),
        item.description,
        item.type,
        item.type === 'Pallet' ? `${item.totalQty} Nos` : `${formatWeight(item.totalWeight)} KG`,
        item.unitPrice.toFixed(2),
        item.subtotal.toFixed(2)
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

    const neededHeight = 90;
    if (currentY + neededHeight > pageHeight - margin) {
      doc.addPage();
      currentY = margin + 5;
      doc.setDrawColor(200);
      doc.rect(margin - 0.5, margin - 0.5, boxWidth + 1, pageHeight - (margin * 2) + 1);
    }

    const totalsStartY = currentY;
    const rOff = Math.round(inv.totalAmount) - inv.totalAmount;

    autoTable(doc, {
      startY: currentY,
      body: [
        ['Subtotal:', inv.subtotal.toFixed(2)],
        ...(inv.cgst > 0 || inv.sgst > 0 ? [
          ['CGST:', inv.cgst.toFixed(2)],
          ['SGST:', inv.sgst.toFixed(2)],
        ] : []),
        ...(inv.igst > 0 ? [
          ['IGST:', inv.igst.toFixed(2)],
        ] : []),
        ['Round Off:', rOff.toFixed(2)],
        ['GRAND TOTAL:', `Rs. ${Math.round(inv.totalAmount).toFixed(2)}`]
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
    doc.text(`Amount in Words: ${numberToWords(Math.round(inv.totalAmount))}`, margin + 2, totalsStartY + 5);

    currentY = totalsEndY + 6;

    doc.setDrawColor(200);
    doc.rect(margin, currentY, boxWidth, 30);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Receiver\'s Signature:', margin + 2, currentY + 7);

    const companyTitle = `FOR, ${companyDetails?.name?.toUpperCase() || 'COMPANY NAME'}`;
    doc.setFont('helvetica', 'bold');
    doc.text(companyTitle, pageWidth - margin - 2, currentY + 10, { align: 'right' });

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
          doc.addImage(sigData, 'PNG', pageWidth - margin - sw - 5, currentY + 11, sw, sh);
        }
      } catch (e) { }
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Authorised Signature', pageWidth - margin - 2, currentY + 26, { align: 'right' });

    currentY += 35;

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

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Thank You For Your Business!', pageWidth / 2, currentY, { align: 'center' });

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text(`If you have any questions about this invoice, please contact: ${companyDetails?.phone || '9173101711'}`, pageWidth / 2, currentY + 6, { align: 'center' });

    doc.save(`${inv.dealer?.name || 'Dealer'}_Invoice_${inv.invoiceNo.replace(/\//g, '_')}.pdf`);
  };

  const handleGenerateInvoice = async () => {
    if (records.length === 0) {
      toast.error('No records to generate invoice');
      return;
    }

    const dealer = dealers.find(d => d.id === selectedDealerId);
    if (!dealer) {
      toast.error('Selected dealer not found');
      return;
    }

    setIsLoading(true);
    try {
      const recordsToMark = records.map(r => ({
        id: r.id,
        type: (r.loadType === 'BOX' ? 'BOX' : 'PALLET') as 'BOX' | 'PALLET'
      }));

      const res = await createFreightInvoice({
        invoiceNo: currentInvoiceNo,
        date: invoiceDate || new Date().toISOString(),
        dealerId: selectedDealerId,
        subtotal,
        cgst,
        sgst,
        igst,
        totalAmount: grandTotal,
        notes: '',
        records: recordsToMark
      });

      if (!res.success) {
        toast.error(res.error || 'Failed to save invoice');
        return;
      }

      // Generate the PDF
      await generateInvoicePDF({
        invoiceNo: currentInvoiceNo,
        date: invoiceDate,
        dealer,
        records,
        subtotal,
        cgst,
        sgst,
        igst,
        totalAmount: grandTotal
      }, reportType);

      toast.success('Invoice generated and saved successfully');
      setRecords([]);
      
      const nextNo = await getNextInvoiceNumber();
      if (nextNo) setCurrentInvoiceNo(nextNo);

      // Switch to Saved tab and refresh list
      setActiveTab('saved');
      loadInvoicesList();
    } catch (e) {
      console.error(e);
      toast.error('Error occurred while generating invoice');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice? Linked orders will be released.')) return;
    
    try {
      const res = await deleteFreightInvoice(invoiceId);
      if (res.success) {
        toast.success('Invoice deleted successfully');
        loadInvoicesList();
        const nextNo = await getNextInvoiceNumber();
        if (nextNo) setCurrentInvoiceNo(nextNo);
      } else {
        toast.error(res.error || 'Failed to delete invoice');
      }
    } catch (e) {
      toast.error('Error deleting invoice');
    }
  };

  // Open Edit Modal
  const handleStartEdit = (inv: any) => {
    setEditingInvoice(inv);
    setEditInvoiceDate(formatUtcDate(inv.date, 'yyyy-MM-dd'));
    setEditInvoiceNotes(inv.notes || '');
    
    // Copy records to editable state
    const mapped = inv.records.map((r: any) => ({
      id: r.id,
      loadType: r.loadType,
      date: r.date,
      lrNo: r.lrNo,
      companyName: r.companyName,
      consignee: r.consignee,
      details: r.details,
      totalWeight: r.totalWeight,
      totalBoxes: r.totalBoxes,
      rate: r.rate,
      rateOn: r.rateOn || 'weight',
      gstType: r.cgstAmount > 0 || r.sgstAmount > 0 ? 'intra' : (r.igstAmount > 0 ? 'inter' : 'intra'),
      gstRate: r.cgstAmount > 0 || r.sgstAmount > 0 
        ? Math.round((r.cgstPct + r.sgstPct) * 10) / 10 
        : (r.igstAmount > 0 ? Math.round(r.igstPct * 10) / 10 : 0)
    }));
    setEditRecords(mapped);
  };

  const handleUpdateRecordField = (idx: number, field: string, val: any) => {
    const updated = [...editRecords];
    updated[idx] = {
      ...updated[idx],
      [field]: val
    };
    setEditRecords(updated);
  };

  const handleSaveInvoiceEdit = async () => {
    if (!editingInvoice) return;
    setIsSavingEdit(true);
    try {
      const res = await updateInvoiceRecords(
        editingInvoice.id,
        editInvoiceDate,
        editInvoiceNotes,
        editRecords
      );

      if (res.success) {
        toast.success('Invoice updated successfully');
        setEditingInvoice(null);
        loadInvoicesList();
      } else {
        toast.error(res.error || 'Failed to update invoice');
      }
    } catch (e) {
      toast.error('Error updating invoice');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Computes invoice totals dynamically in edit dialog
  const getEditInvoiceTotals = () => {
    let sub = 0;
    let cgstAmt = 0;
    let sgstAmt = 0;
    let igstAmt = 0;

    editRecords.forEach(rec => {
      const mult = rec.loadType === 'BOX'
        ? (rec.rateOn === 'box' ? rec.totalBoxes : rec.totalWeight)
        : (rec.rateOn === 'weight' ? rec.totalWeight : rec.totalBoxes);
      const rowSub = mult * rec.rate;
      sub += rowSub;

      if (rec.gstRate > 0) {
        if (rec.gstType === 'intra') {
          const halfRate = rec.gstRate / 2;
          cgstAmt += (rowSub * halfRate) / 100;
          sgstAmt += (rowSub * halfRate) / 100;
        } else {
          igstAmt += (rowSub * rec.gstRate) / 100;
        }
      }
    });

    const grand = Math.round(sub + cgstAmt + sgstAmt + igstAmt);
    return { sub, cgstAmt, sgstAmt, igstAmt, grand };
  };

  const editTotals = getEditInvoiceTotals();

  // Search filtered saved invoices
  const filteredInvoices = savedInvoices.filter(inv => 
    inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.dealer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header & Tab Selector */}
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

        <div className="flex bg-slate-100 rounded-2xl p-1 border border-slate-200/50 shadow-sm w-fit self-start md:self-auto">
          <button
            onClick={() => setActiveTab('generate')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'generate' ? "bg-white text-brand-900 shadow-md font-black" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Generate Invoice
          </button>
          <button
            onClick={() => {
              setActiveTab('saved');
              loadInvoicesList();
            }}
            className={cn(
              "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === 'saved' ? "bg-white text-brand-900 shadow-md font-black" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Saved Invoices
          </button>
        </div>

        {activeTab === 'generate' && (
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
              onClick={handleGenerateInvoice}
              disabled={records.length === 0}
              className="h-14 px-8 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-900/20 gap-3"
            >
              <Download className="h-4 w-4" /> Generate & Print Invoice
            </Button>
          </div>
        )}
      </div>

      {activeTab === 'generate' ? (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 animate-in fade-in duration-350">
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
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Date</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">LR / CH.No</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Customer</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Item Details</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Weight/Qty</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">GST Details</th>
                          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {records
                          .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                          .map((record) => (
                            <tr key={record.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                              <td className="px-6 py-4 text-xs font-bold text-slate-900">{formatUtcDate(record.date, 'dd/MM/yyyy')}</td>
                              <td className="px-6 py-4 text-xs font-black text-slate-900">{record.lrNo}</td>
                              <td className="px-6 py-4 text-xs font-bold text-slate-900">{(record as any).consignee?.name || (record as any).companyName || '-'}</td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900">{record.details?.[0]?.productName || 'Yarn'}</span>
                                  <span className="text-[10px] text-slate-700 font-bold">{record.details?.[0]?.packingType || 'Box'}</span>
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
                              <td className="px-6 py-4">
                                {(() => {
                                  const cgstAmt = Number(record.cgstAmount || 0);
                                  const sgstAmt = Number(record.sgstAmount || 0);
                                  const igstAmt = Number(record.igstAmount || 0);
                                  if (cgstAmt > 0 || sgstAmt > 0) {
                                    return (
                                      <div className="flex flex-col text-[10px] font-bold text-slate-600">
                                        <span>CGST ({Number(record.cgstPct || 0)}%): ₹{cgstAmt.toFixed(2)}</span>
                                        <span>SGST ({Number(record.sgstPct || 0)}%): ₹{sgstAmt.toFixed(2)}</span>
                                      </div>
                                    );
                                  }
                                  if (igstAmt > 0) {
                                    return (
                                      <div className="flex flex-col text-[10px] font-bold text-slate-600">
                                        <span>IGST ({Number(record.igstPct || 0)}%): ₹{igstAmt.toFixed(2)}</span>
                                      </div>
                                    );
                                  }
                                  return <span className="text-[10px] text-slate-400 font-bold">0% (Exempted)</span>;
                                })()}
                              </td>
                              <td className="px-6 py-4 text-xs font-black text-slate-900 text-right">
                                ₹ {Number(record.subtotal || 0).toFixed(2)}
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

                  {/* Breakdown & Totals */}
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
                                ₹ {records.filter(r => r.loadType === 'BOX').reduce((acc, r) => acc + Number(r.subtotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                                ₹ {records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => acc + Number(r.subtotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                              ₹ {item.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

                  {/* Totals Summary */}
                  <div className="p-8 bg-slate-50/50 flex flex-col md:flex-row justify-between gap-8 border-t border-slate-100">
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
                              ₹ {records.filter(r => r.loadType === 'BOX').reduce((acc, r) => acc + Number(r.subtotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                              ₹ {records.filter(r => r.loadType === 'PALLET' || r.loadType === 'PALLET_RETURN').reduce((acc, r) => acc + Number(r.subtotal || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
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
      ) : (
        <div className="space-y-6 animate-in fade-in duration-350">
          {/* Saved Invoices Filter & List */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by invoice number or customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-2xl h-11 border-slate-200 bg-white text-xs font-bold"
              />
            </div>
            <Button
              onClick={loadInvoicesList}
              variant="outline"
              className="h-11 px-6 rounded-2xl border-slate-200 text-xs font-black uppercase tracking-widest"
            >
              Refresh List
            </Button>
          </div>

          <Card className="rounded-3xl border-slate-100 shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 shadow-sm">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Invoice No</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 text-right">Subtotal</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 text-right">GST</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 text-right">Total Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-800 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-900">
                  {isLoadingInvoices ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Loading Invoices...
                      </td>
                    </tr>
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No saved invoices found
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map((inv) => {
                      const gstTotal = (inv.cgst || 0) + (inv.sgst || 0) + (inv.igst || 0);
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-xs font-black text-brand-900">{inv.invoiceNo}</td>
                          <td className="px-6 py-4 text-xs font-bold">{formatUtcDate(inv.date, 'dd/MM/yyyy')}</td>
                          <td className="px-6 py-4 text-xs font-black">{inv.dealer?.name || 'Unknown'}</td>
                          <td className="px-6 py-4 text-xs font-bold text-right">₹ {Number(inv.subtotal || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-xs font-bold text-right">₹ {Number(gstTotal || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-xs font-black text-right text-slate-900">₹ {Number(inv.totalAmount || 0).toFixed(2)}</td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-blue-600 hover:text-blue-700"
                                onClick={() => generateInvoicePDF(inv, 'detailed')}
                                title="Print Detailed PDF"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-teal-600 hover:text-teal-700"
                                onClick={() => handleStartEdit(inv)}
                                title="Edit Invoice"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0 rounded-lg border-slate-200 text-rose-600 hover:text-rose-700"
                                onClick={() => handleDeleteInvoice(inv.id)}
                                title="Delete Invoice"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Edit Invoice Dialog Modal */}
      {editingInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setEditingInvoice(null)}
          title={`Edit Invoice ${editingInvoice.invoiceNo}`}
          size="3xl"
          footer={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-xl px-5 text-xs font-black uppercase tracking-widest"
                onClick={() => setEditingInvoice(null)}
              >
                Cancel
              </Button>
              <Button
                className="h-11 rounded-xl bg-brand-900 hover:bg-brand-950 text-white px-6 text-xs font-black uppercase tracking-widest gap-2"
                onClick={handleSaveInvoiceEdit}
                disabled={isSavingEdit}
              >
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </div>
          }
        >
          <div className="space-y-6 text-slate-900">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Invoice Date</Label>
                <Input
                  type="date"
                  value={editInvoiceDate}
                  onChange={(e) => setEditInvoiceDate(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase text-slate-400">Notes / Remarks</Label>
                <Input
                  type="text"
                  placeholder="Additional remarks..."
                  value={editInvoiceNotes}
                  onChange={(e) => setEditInvoiceNotes(e.target.value)}
                  className="rounded-xl h-11 border-slate-200 font-bold text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Invoice Items / Records</Label>
              <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">LR No</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Goods Description</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Weight (KG)</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Qty / Boxes</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Rate</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">Rate On</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">GST Type</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600">GST %</th>
                      <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-600 text-right">Row Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {editRecords.map((rec, idx) => {
                      const multiplier = rec.loadType === 'BOX'
                        ? (rec.rateOn === 'box' ? rec.totalBoxes : rec.totalWeight)
                        : (rec.rateOn === 'weight' ? rec.totalWeight : rec.totalBoxes);
                      const sub = multiplier * rec.rate;
                      const gst = sub * (rec.gstRate / 100);
                      const total = sub + gst;

                      return (
                        <tr key={rec.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2 font-black text-slate-900">{rec.lrNo || '-'}</td>
                          <td className="px-4 py-2 font-bold text-slate-700">
                            {rec.details?.[0]?.productName || 'Yarn'} ({rec.details?.[0]?.packingType || 'Box'})
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.001"
                              value={rec.totalWeight}
                              onChange={(e) => handleUpdateRecordField(idx, 'totalWeight', Number(e.target.value))}
                              className="w-20 h-8 rounded-lg text-xs font-bold px-2"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              value={rec.totalBoxes}
                              onChange={(e) => handleUpdateRecordField(idx, 'totalBoxes', Number(e.target.value))}
                              className="w-16 h-8 rounded-lg text-xs font-bold px-2"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <Input
                              type="number"
                              step="0.01"
                              value={rec.rate}
                              onChange={(e) => handleUpdateRecordField(idx, 'rate', Number(e.target.value))}
                              className="w-16 h-8 rounded-lg text-xs font-bold px-2"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={rec.rateOn}
                              onChange={(e) => handleUpdateRecordField(idx, 'rateOn', e.target.value)}
                              className="h-8 rounded-lg border border-slate-200 text-xs font-bold px-1 bg-white"
                            >
                              <option value="weight">Weight</option>
                              <option value="box">Box/Qty</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={rec.gstType}
                              onChange={(e) => handleUpdateRecordField(idx, 'gstType', e.target.value)}
                              className="h-8 rounded-lg border border-slate-200 text-xs font-bold px-1 bg-white"
                            >
                              <option value="intra">Intra</option>
                              <option value="inter">Inter</option>
                            </select>
                          </td>
                          <td className="px-4 py-2">
                            <select
                              value={rec.gstRate.toString()}
                              onChange={(e) => handleUpdateRecordField(idx, 'gstRate', Number(e.target.value))}
                              className="h-8 rounded-lg border border-slate-200 text-xs font-bold px-1 bg-white"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                              <option value="28">28%</option>
                            </select>
                          </td>
                          <td className="px-4 py-2 font-black text-right text-slate-900">
                            ₹ {total.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Totals summary inside modal */}
            <div className="flex flex-col items-end gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex justify-between w-64 text-xs font-bold">
                <span className="text-slate-500">SUBTOTAL</span>
                <span className="text-slate-900">₹ {editTotals.sub.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              {editTotals.cgstAmt > 0 && (
                <>
                  <div className="flex justify-between w-64 text-xs font-bold">
                    <span className="text-blue-600">CGST</span>
                    <span className="text-blue-600">+ ₹ {editTotals.cgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between w-64 text-xs font-bold">
                    <span className="text-blue-600">SGST</span>
                    <span className="text-blue-600">+ ₹ {editTotals.sgstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </>
              )}
              {editTotals.igstAmt > 0 && (
                <div className="flex justify-between w-64 text-xs font-bold">
                  <span className="text-indigo-600">IGST</span>
                  <span className="text-indigo-600">+ ₹ {editTotals.igstAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="h-[1px] w-64 bg-slate-200 my-1" />
              <div className="flex justify-between w-64 text-sm font-black">
                <span className="text-slate-900">GRAND TOTAL</span>
                <span className="text-slate-900">₹ {editTotals.grand.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
