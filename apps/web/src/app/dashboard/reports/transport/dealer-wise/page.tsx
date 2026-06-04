'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Calendar, 
  Download, 
  Filter, 
  ChevronRight, 
  ChevronLeft,
  Printer, 
  Package, 
  Table as TableIcon,
  Layers,
  IndianRupee,
  LayoutGrid,
  ClipboardList,
  User,
  Users,
  Box,
  Truck,
  ArrowRight
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn, formatWeight } from '@/lib/utils';
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
import { getDealers, getCompanyBillingDetails } from '@/app/actions/accounting/dealer-billing';
import { getDealerEntryRecords } from '@/app/actions/reports/dealer-entry';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RecordItem {
  id: string;
  date: string;
  lrNo: string;
  billNo: string;
  dealerName: string;
  consigneeName: string;
  loadType: string;
  weight: number;
  boxes: number;
  pallets: number;
  amount: number;
  details: any[];
}

export default function DealerEntryReportPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(endOfMonth(new Date()), 'yyyy-MM-dd'));
  const [periodType, setPeriodType] = useState<'range' | 'month'>('range');
  const [selectedMonth, setSelectedMonth] = useState<string>(format(new Date(), 'yyyy-MM'));
  const [reportOption, setReportOption] = useState<'BOX' | 'PALLET' | 'EMPTY' | 'BOTH'>('BOTH');
  const [isCumulative, setIsCumulative] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [companyDetails, setCompanyDetails] = useState<any>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Get processed records for the table preview dynamically based on cumulative view toggle
  const processedRecords = React.useMemo(() => {
    if (isCumulative) {
      const cumulative: any[] = [];
      records.forEach(r => {
        r.details.forEach((d, idx) => {
          cumulative.push({
            id: `${r.id}-${d.product}-${d.type}-${idx}`,
            date: r.date,
            lrNo: r.lrNo,
            billNo: r.billNo,
            dealerName: r.dealerName,
            consigneeName: r.consigneeName,
            loadType: d.type || r.loadType,
            boxes: d.qty,
            weight: d.weight,
            productDescription: d.product || 'Standard Cargo',
          });
        });
      });
      return cumulative;
    } else {
      return records.map(r => ({
        id: r.id,
        date: r.date,
        lrNo: r.lrNo,
        billNo: r.billNo,
        dealerName: r.dealerName,
        consigneeName: r.consigneeName,
        loadType: r.loadType,
        boxes: r.boxes,
        weight: r.weight,
        productDescription: r.details.map((d: any) => `${d.product} (${d.qty})`).join(', ') || 'Standard Cargo',
      }));
    }
  }, [records, isCumulative]);

  const totalPages = Math.ceil(processedRecords.length / itemsPerPage);
  const paginatedRecords = processedRecords.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    async function init() {
      const dealerList = await getDealers();
      setDealers(dealerList);
      const company = await getCompanyBillingDetails();
      setCompanyDetails(company);
    }
    init();
  }, []);

  const handleFetch = async () => {
    setIsLoading(true);
    try {
      let start = new Date(startDate);
      let end = new Date(endDate);

      if (periodType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        start = new Date(year, month - 1, 1);
        end = endOfMonth(start);
      }

      const data = await getDealerEntryRecords(
        selectedDealerId,
        start,
        end,
        reportOption
      );
      setRecords(data as any);
      setCurrentPage(1);
      toast.success(`Retrieved ${data.length} records`);
    } catch (err) {
      toast.error('Failed to fetch records');
    } finally {
      setIsLoading(false);
    }
  };

  const generatePDF = async () => {
    if (records.length === 0) {
      toast.error('No data to generate report');
      return;
    }

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let currentY = 15;

    // Header logic
    const drawHeader = () => {
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(companyDetails?.name?.toUpperCase() || 'FREIGHTFLOW LOGISTICS', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(companyDetails?.address || '', pageWidth / 2, currentY, { align: 'center' });
      currentY += 4;
      doc.text(`GSTIN: ${companyDetails?.gstin || '-'} | PAN: ${companyDetails?.pan || '-'}`, pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('DEALER ENTRY REPORT', pageWidth / 2, currentY, { align: 'center' });
      currentY += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const dealerLabel = selectedDealerId === 'ALL' ? 'All Dealers' : dealers.find(d => d.id === selectedDealerId)?.name || 'Unknown';
      doc.text(`Dealer: ${dealerLabel}`, margin, currentY);
      
      let periodLabel = `${format(parseISO(startDate), 'dd MMM yyyy')} - ${format(parseISO(endDate), 'dd MMM yyyy')}`;
      if (periodType === 'month') {
        const [year, month] = selectedMonth.split('-').map(Number);
        periodLabel = format(new Date(year, month - 1, 1), 'MMMM yyyy');
      }
      doc.text(`Period: ${periodLabel}`, pageWidth - margin, currentY, { align: 'right' });
      currentY += 4;
      const reportTypeLabel = 
        reportOption === 'BOTH' ? 'Standard + Pallet' :
        reportOption === 'BOX' ? 'Standard Box Only' :
        reportOption === 'PALLET' ? 'Pallet Only' :
        'Empty Pallet Returns';
      doc.text(`Report Type: ${reportTypeLabel} | Mode: ${isCumulative ? 'Cumulative' : 'Individual'}`, margin, currentY);
      currentY += 10;
    };

    drawHeader();

    if (isCumulative) {
      // Group by Date, Consignee, LR No, Product, Type
      const cumulative: Record<string, any> = {};
      records.forEach(r => {
        r.details.forEach(d => {
          const dateStr = format(new Date(r.date), 'dd/MM/yy');
          const key = `${dateStr}-${r.consigneeName || 'Direct Customer'}-${r.lrNo || '-'}-${d.product || 'Standard Cargo'}-${d.type || 'BOX'}`;
          if (!cumulative[key]) {
            cumulative[key] = {
              date: dateStr,
              consigneeName: r.consigneeName || 'Direct Customer',
              lrNo: r.lrNo || '-',
              product: d.product || 'Standard Cargo',
              type: d.type || 'BOX',
              qty: 0,
              weight: 0,
              records: 0
            };
          }
          cumulative[key].qty += d.qty;
          cumulative[key].weight += d.weight;
          cumulative[key].records += 1;
        });
      });

      const tableBody = Object.values(cumulative).map((item, idx) => [
        (idx + 1).toString(),
        item.date,
        item.consigneeName,
        item.lrNo,
        item.product,
        item.type,
        item.qty.toString(),
        formatWeight(item.weight)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['SR.', 'DATE', 'CONSIGNEE / CUSTOMER', 'LR NO.', 'PRODUCT DESCRIPTION', 'TYPE', 'TOTAL QTY/BOX', 'TOTAL WEIGHT']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 43, 91], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        foot: [['', '', '', '', 'GRAND TOTAL', '', 
          Object.values(cumulative).reduce((a, b) => a + b.qty, 0).toString(),
          formatWeight(Object.values(cumulative).reduce((a, b) => a + b.weight, 0))
        ]],
        footStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    } else {
      // Individual Records
      const tableBody = records.map((r, idx) => [
        (idx + 1).toString(),
        format(new Date(r.date), 'dd/MM/yy'),
        r.lrNo,
        r.dealerName,
        r.consigneeName,
        r.details.map((d: any) => `${d.product} (${d.qty})`).join(', ') || 'Standard Cargo',
        r.loadType === 'PALLET_RETURN' ? 'PALLET RETURN' : r.loadType,
        r.boxes.toString(),
        formatWeight(r.weight)
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['SR.', 'DATE', 'LR NO.', 'DEALER', 'CONSIGNEE / CUSTOMER', 'PRODUCT DESCRIPTION', 'TYPE', 'QUANTITY', 'WEIGHT']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [15, 43, 91], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
        bodyStyles: { fontSize: 8 },
        foot: [['', '', '', '', 'TOTAL', '', '', 
          records.reduce((a, b) => a + b.boxes, 0).toString(),
          formatWeight(records.reduce((a, b) => a + b.weight, 0))
        ]],
        footStyles: { fillColor: [245, 248, 252], textColor: [0, 0, 0], fontStyle: 'bold' }
      });
    }

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(8);
    doc.text('This is a computer generated report and does not require signature.', margin, finalY);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth - margin, finalY, { align: 'right' });

    doc.save(`Dealer_Entry_Report_${format(new Date(), 'yyyyMMdd')}.pdf`);
    toast.success('PDF Generated Successfully');
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Dealer Entry Audit</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Advanced Logistics & Distribution Intelligence</p>
        </div>
        <div className="flex gap-4">
          <Button 
            onClick={handleFetch}
            disabled={isLoading}
            variant="outline" 
            className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm"
          >
            <Search className="h-4 w-4" /> Fetch Records
          </Button>
          <Button 
            onClick={generatePDF}
            disabled={records.length === 0}
            className="h-14 px-8 rounded-2xl bg-brand-900 hover:bg-brand-950 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-brand-900/20 gap-3"
          >
            <Download className="h-4 w-4" /> Export Production PDF
          </Button>
        </div>
      </div>

      {/* Control Panel */}
      <Card className="p-8 rounded-[2.5rem] border-slate-100 shadow-sm bg-white overflow-hidden relative">
        <div className="flex flex-col lg:flex-row items-center gap-6 relative z-10">
          
          <div className="flex-1 w-full space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <User className="h-3 w-3 text-blue-500" /> Dealer Selection
            </Label>
            <Select value={selectedDealerId} onValueChange={setSelectedDealerId}>
              <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-xs">
                <SelectValue placeholder="Select Dealer" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="ALL" className="font-bold text-xs">All Active Dealers</SelectItem>
                {dealers.map(d => (
                  <SelectItem key={d.id} value={d.id} className="font-bold text-xs">{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-[1.8] w-full space-y-2">
            <div className="flex items-center justify-between ml-1 h-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="h-3 w-3 text-blue-500" /> Reporting Period
              </Label>
              <div className="flex bg-slate-100 rounded-lg p-0.5 scale-75 origin-right translate-y-[-1px]">
                <button 
                  onClick={() => setPeriodType('range')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                    periodType === 'range' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                  )}
                >Range</button>
                <button 
                  onClick={() => setPeriodType('month')}
                  className={cn(
                    "px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-widest transition-all",
                    periodType === 'month' ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"
                  )}
                >Monthly</button>
              </div>
            </div>

            {periodType === 'range' ? (
              <div className="flex items-center gap-3 bg-slate-50/50 px-5 rounded-2xl border border-slate-100 h-16 animate-in fade-in slide-in-from-left-2 duration-300">
                <input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none flex-1"
                />
                <ArrowRight className="h-4 w-4 text-slate-300 shrink-0" />
                <input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-[11px] font-black uppercase tracking-widest outline-none flex-1"
                />
              </div>
            ) : (
              <div className="relative animate-in fade-in slide-in-from-right-2 duration-300">
                <Input 
                  type="month" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-black text-[11px] uppercase tracking-[0.2em] px-6"
                />
              </div>
            )}
          </div>

          <div className="flex-1 w-full space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <Box className="h-3 w-3 text-blue-500" /> Load Type
            </Label>
            <Select value={reportOption} onValueChange={(val: any) => setReportOption(val)}>
              <SelectTrigger className="h-16 rounded-2xl border-slate-100 bg-slate-50/50 font-bold text-xs">
                <SelectValue placeholder="Load Type" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-100">
                <SelectItem value="BOTH" className="font-bold text-xs uppercase">Standard + Pallet</SelectItem>
                <SelectItem value="BOX" className="font-bold text-xs uppercase">Standard Box Only</SelectItem>
                <SelectItem value="PALLET" className="font-bold text-xs uppercase">Pallet Only</SelectItem>
                <SelectItem value="EMPTY" className="font-bold text-xs uppercase">Empty Pallet Returns</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 w-full space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 ml-1">
              <LayoutGrid className="h-3 w-3 text-blue-500" /> View Mode
            </Label>
            <div className="flex h-16 bg-slate-50/50 rounded-2xl p-2 border border-slate-100">
              <button 
                onClick={() => setIsCumulative(false)}
                className={cn(
                  "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  !isCumulative ? "bg-white text-brand-900 shadow-md border border-slate-100" : "text-slate-400"
                )}
              >Individual</button>
              <button 
                onClick={() => setIsCumulative(true)}
                className={cn(
                  "flex-1 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  isCumulative ? "bg-brand-900 text-white shadow-md" : "text-slate-400"
                )}
              >Cumulative</button>
            </div>
          </div>

        </div>
        <div className="absolute right-0 top-0 h-40 w-40 bg-brand-50 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl opacity-50" />
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Entries', value: records.length.toString(), icon: <ClipboardList className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Total Weight (KG)', value: formatWeight(records.reduce((a, b) => a + b.weight, 0)), icon: <Truck className="h-6 w-6 text-amber-600" />, color: 'bg-amber-50' },
          { label: 'Total Box Qty', value: records.reduce((a, b) => a + b.boxes, 0).toLocaleString(), icon: <Package className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50' },
          { label: 'Revenue Potential', value: `₹${(records.reduce((a, b) => a + b.amount, 0) / 1000).toFixed(1)}k`, icon: <IndianRupee className="h-6 w-6 text-purple-600" />, color: 'bg-purple-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm flex items-center gap-6 transition-all hover:shadow-md group">
            <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110", stat.color)}>{stat.icon}</div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Table */}
      <Card className="rounded-[40px] border-slate-100 shadow-sm bg-white overflow-hidden flex flex-col">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-30 bg-white/95 backdrop-blur-md shadow-sm">
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">LR No</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Dealer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Consignee / Customer</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Product Description</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Quantity</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Weight (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedRecords.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-6 text-xs font-bold text-slate-600">{format(new Date(r.date), 'dd MMM yyyy')}</td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900 group-hover:text-brand-900 transition-colors">
                    {r.lrNo || '-'}
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-700">{r.dealerName}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-700">{r.consigneeName}</td>
                  <td className="px-8 py-6 text-xs font-bold text-slate-700">{r.productDescription}</td>
                  <td className="px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                      (r.loadType === 'PALLET' || r.loadType === 'Pallet') ? "bg-indigo-50 text-indigo-600" : 
                      (r.loadType === 'PALLET_RETURN' || r.loadType === 'Pallet Return') ? "bg-amber-50 text-amber-600" :
                      "bg-blue-50 text-blue-600"
                    )}>{r.loadType === 'PALLET_RETURN' ? 'PALLET RETURN' : (r.loadType === 'Pallet Return' ? 'PALLET RETURN' : r.loadType)}</span>
                  </td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900 text-center">{r.boxes}</td>
                  <td className="px-8 py-6 text-xs font-black text-slate-900 text-right">{formatWeight(r.weight)}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-24 text-center">
                    <div className="h-16 w-16 rounded-full bg-slate-50 mx-auto flex items-center justify-center mb-4">
                      <FileText className="h-8 w-8 text-slate-200" />
                    </div>
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No entry data found for selection</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {records.length > itemsPerPage && (
          <div className="px-10 py-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
              Showing <span className="text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="text-slate-900">{Math.min(currentPage * itemsPerPage, records.length)}</span> of {records.length} Entries
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-12 w-12 rounded-xl border-slate-200 bg-white shadow-sm flex items-center justify-center p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, i) => {
                  const page = i + 1;
                  // Only show 5 pages around current page
                  if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "h-12 w-12 rounded-xl font-black text-xs transition-all",
                          currentPage === page ? "bg-brand-900 text-white shadow-lg shadow-brand-900/20" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        )}
                      >
                        {page}
                      </Button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 text-slate-300 font-bold">...</span>;
                  }
                  return null;
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-12 w-12 rounded-xl border-slate-200 bg-white shadow-sm flex items-center justify-center p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
