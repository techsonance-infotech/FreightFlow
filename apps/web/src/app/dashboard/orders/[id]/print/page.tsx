'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Download, ArrowLeft, Loader2, Building2, User, MapPin, Truck } from 'lucide-react';
import { generateLRPrintPDF } from '@/lib/pdf/lr-print';
import { toast } from 'sonner';
import Link from 'next/link';
import { formatWeight, formatUtcDate } from '@/lib/utils';

interface LorryReceiptPrintTemplateProps {
  order: any;
  company: any;
  copyType: string;
}

export function LorryReceiptPrintTemplate({ order, company, copyType }: LorryReceiptPrintTemplateProps) {
  const primaryColor = company?.primaryColor || '#1e3a8a';

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const hasGst = Number(order.cgstPct) > 0 || Number(order.sgstPct) > 0 || Number(order.igstPct) > 0;
  const items = order.details || [];
  const itemCount = items.length;

  // Totals computed from item rows
  const totalPackages = items.reduce((sum: number, item: any) => sum + (Number(item.boxCount) || 0), 0);
  const totalWeight = items.reduce((sum: number, item: any) => sum + (parseFloat(item.weight) || 0), 0);
  const isHighItemCount = itemCount >= 4;

  // Dynamic spacing classes
  const containerPadding = isHighItemCount ? 'p-4 print:p-2' : 'p-6 md:p-8 print:p-4';
  const headerSpacing = isHighItemCount ? 'pb-2 mb-2 print:pb-1 print:mb-1' : 'pb-4 mb-4 print:pb-2 print:mb-2';
  const sectionSpacing = isHighItemCount ? 'mb-2 print:mb-1' : 'mb-4 print:mb-2';
  const tableCellPadding = isHighItemCount ? 'p-1 print:p-0.5 text-[10px] print:text-[9px]' : 'p-1.5 md:p-2';
  const rowHeight = isHighItemCount ? 'h-5 print:h-4' : 'h-6 print:h-5';
  const footerSpacing = isHighItemCount ? 'mb-2 print:mb-1' : 'mb-4 print:mb-2';

  return (
    <div className={`bg-white border border-slate-300 text-slate-900 font-sans leading-tight min-h-[480px] print:min-h-[48.5vh] print:max-h-[48.5vh] ${containerPadding} print:border-none print:shadow-none print:rounded-none flex flex-col relative overflow-hidden`}>
      {/* Watermark */}
      {company?.enableWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-45deg] z-0">
          <span className="text-[120px] print:text-[80px] font-black uppercase whitespace-nowrap">{company.watermarkText || 'ORIGINAL'}</span>
        </div>
      )}

      {/* Header Section */}
      <div className={`flex justify-between items-start border-b border-slate-300 ${headerSpacing} relative z-10`}>
        <div className="flex gap-4 items-center">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-white rounded-2xl flex items-center justify-center border border-slate-300 overflow-hidden shrink-0 shadow-inner print:h-14 print:w-14 print:rounded-xl">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt="Company Logo" className="h-full w-full object-contain p-1" />
            ) : (
              <Building2 className="h-8 w-8 text-slate-500" />
            )}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl print:text-4xl font-black uppercase tracking-tight text-slate-900">
              {company?.name || 'Company Name'}
            </h1>
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] mb-1 italic text-slate-600 print:text-slate-600">{company?.printHeader || 'Specialists in Road Logistics'}</p>
            <p className="text-[10px] md:text-[11px] font-semibold text-slate-700 max-w-[450px] leading-tight">
              {company?.address || 'Registered Office Address'}
            </p>
            <div className="flex gap-4 mt-2">
              <p className="text-[11px] font-bold uppercase text-slate-700">GSTIN: <span className="font-bold text-slate-950">{company?.gstin || '-'}</span></p>
              {company?.whatsappNo && (
                <p className="text-[11px] font-bold uppercase text-slate-700 print:text-slate-700">Support: {company.whatsappNo}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1.5 rounded-lg mb-2 text-[10px] font-extrabold uppercase tracking-widest print:py-1">
            {copyType}
          </div>
          <p className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-0.5">Lorry Receipt #</p>
          <p className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">LR-{order.lrNo || '0000'}</p>
          <p className="text-[10.5px] font-bold text-slate-600 mt-0.5 uppercase">{formatUtcDate(order.date, 'dd MMMM yyyy')}</p>
        </div>
      </div>

      {/* Consignment Mapping */}
      <div className={`grid grid-cols-2 gap-4 ${sectionSpacing} relative z-10`}>
        <div className="p-3 bg-white rounded-xl border border-slate-300 print:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <User className="h-4 w-4 text-slate-500 print:h-3.5 print:w-3.5 shrink-0" />
            <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Consignor (Dealer)</p>
          </div>
          <p className="text-[12px] md:text-sm font-bold uppercase text-slate-900 line-clamp-1">{order.dealer?.name || order.companyName}</p>
          <p className="text-[10px] font-medium text-slate-600 mt-1 leading-tight line-clamp-2">{order.dealer?.address || 'Address not registered'}</p>
          <p className="text-[10px] font-bold text-slate-800 mt-1.5 uppercase">GSTIN: {order.dealer?.gstin || 'URD'}</p>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-300 print:p-2.5">
          <div className="flex items-center gap-1.5 mb-1">
            <MapPin className="h-4 w-4 text-slate-500 print:h-3.5 print:w-3.5 shrink-0" />
            <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest">Consignee (Shipping Address)</p>
          </div>
          <p className="text-[12px] md:text-sm font-bold uppercase text-slate-900 line-clamp-1">{order.consignee?.name || order.companyName}</p>
          <p className="text-[10px] font-medium text-slate-600 mt-1 leading-tight line-clamp-2">{order.consignee?.address || order.toAddress || 'Address not registered'}</p>
          <p className="text-[10px] font-bold text-slate-800 mt-1.5 uppercase">GSTIN: {order.consignee?.gstin || 'URD'}</p>
        </div>
      </div>

      {/* Logistics Meta (Route & Vehicle) */}
      <div className={`grid grid-cols-3 gap-4 ${sectionSpacing} bg-white rounded-xl border border-slate-300 p-2.5 print:p-2.5 relative z-10`}>
        <div>
          <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Route / Path</p>
          <p className="text-[11px] font-bold text-slate-800 uppercase truncate">{order.fromLocation} to {order.toLocation}</p>
        </div>
        <div>
          <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Vehicle Fleet No</p>
          <div className="flex items-center gap-1">
            <Truck className="h-3.5 w-3.5 text-slate-500 shrink-0" />
            <p className="text-[11px] font-bold text-slate-800 uppercase truncate">{order.vehicle?.regNo || order.vehicle?.plateNumber || 'Direct'}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[8.5px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">E-Way Bill Details</p>
          <p className="text-[11px] font-bold text-slate-800 truncate">{order.ewayBillNo || '-'}</p>
        </div>
      </div>

      {/* The Master Items Table */}
      <table className={`w-full text-left border-collapse ${sectionSpacing} relative z-10 border border-slate-300`}>
        <thead>
          <tr className="bg-slate-50 text-slate-800 border-b border-slate-300">
            <th className="p-2 text-[10px] font-bold uppercase tracking-widest border-r border-slate-300 w-10 text-center">Sr.</th>
            <th className="p-2 text-[10px] font-bold uppercase tracking-widest border-r border-slate-300">Description of Goods</th>
            <th className="p-2 text-[10px] font-bold uppercase tracking-widest border-r border-slate-300 text-center">Packages</th>
            <th className="p-2 text-[10px] font-bold uppercase tracking-widest border-r border-slate-300 text-center">Packing</th>
            <th className="p-2 text-[10px] font-bold uppercase tracking-widest text-right">Weight (KG)</th>
          </tr>
        </thead>
        <tbody className="border-b border-slate-300">
          {items.map((item: any, i: number) => (
            <tr key={i} className={`border-b border-slate-200 font-semibold text-slate-800 ${rowHeight}`}>
              <td className={`border-r border-slate-200 text-center text-slate-700 ${tableCellPadding}`}>{i + 1}</td>
              <td className={`border-r border-slate-200 uppercase tracking-wider text-slate-800 ${tableCellPadding}`}>{item.productName || 'GOODS'}</td>
              <td className={`border-r border-slate-200 text-center text-slate-800 ${tableCellPadding}`}>{item.boxCount}</td>
              <td className={`border-r border-slate-200 text-center uppercase text-slate-800 ${tableCellPadding}`}>{item.packingType || '-'}</td>
              <td className={`text-right text-slate-800 ${tableCellPadding}`}>{item.weight}</td>
            </tr>
          ))}
          {/* Pad with empty rows to fill page, reduced height and count for high items count */}
          {Array(Math.max(0, 4 - itemCount)).fill(0).map((_, i) => (
            <tr key={`empty-${i}`} className={`border-b border-slate-100 ${rowHeight}`}>
               <td className="border-r border-slate-100"></td>
               <td className="border-r border-slate-100"></td>
               <td className="border-r border-slate-100"></td>
               <td className="border-r border-slate-100"></td>
               <td></td>
            </tr>
          ))}
          {/* TOTAL ROW */}
          <tr className="bg-slate-50 text-slate-900 border-t border-slate-300">
            <td className={`border-r border-slate-300 text-center font-bold ${tableCellPadding}`} colSpan={2}>
              TOTAL
            </td>
            <td className={`border-r border-slate-300 text-center font-bold ${tableCellPadding}`}>
              {totalPackages}
            </td>
            <td className={`border-r border-slate-300 text-center font-bold ${tableCellPadding}`}>—</td>
            <td className={`text-right font-bold ${tableCellPadding}`}>
              {formatWeight(totalWeight)} KG
            </td>
          </tr>
        </tbody>
      </table>

      {/* Manifest Summary Footer */}
      <div className="flex-1 flex flex-col justify-end relative z-10 print:mt-auto">
        <div className={`grid grid-cols-12 gap-6 items-end ${footerSpacing}`}>
          {/* T&C / Details */}
          <div className="col-span-6 space-y-3 print:space-y-1.5">
            <div className="space-y-1">
               <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Logistics & Service Terms</p>
               <ol className="text-[8px] print:text-[8px] font-medium text-slate-600 leading-normal italic pl-2.5 list-decimal space-y-0.5">
                 <li>Goods carried at owner's absolute risk.</li>
                 <li>Subject to Mumbai jurisdiction only.</li>
                 <li>Not liable for minor leaks/breakages in transit.</li>
               </ol>
            </div>
            {order.gstBillNo && (
              <p className="text-[10px] font-bold text-slate-700 uppercase">GST Bill Ref: {order.gstBillNo}</p>
            )}
          </div>

          {/* Billing & Grand Settlement */}
          <div className="col-span-6 space-y-2 border-l border-slate-200 pl-4 print:pl-3">
            <div className="space-y-1 text-right text-[11px] print:text-[10px]">
              <div className="flex justify-between font-semibold text-slate-700">
                <span className="text-slate-500 uppercase tracking-wider text-[9px] font-semibold">Base Freight</span>
                <span>₹ {formatCurrency(order.freight)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-700">
                <span className="text-slate-500 uppercase tracking-wider text-[9px] font-semibold">Hamali</span>
                <span>₹ {formatCurrency(order.hamali)}</span>
              </div>
              {hasGst && (
                <>
                  <div className="flex justify-between font-bold border-t border-slate-200 pt-1 mt-1 text-slate-800">
                    <span className="text-slate-600 uppercase tracking-wider text-[9px] font-semibold">Subtotal</span>
                    <span>₹ {formatCurrency(order.subtotal)}</span>
                  </div>
                  {order.gstType === 'intra' ? (
                    <>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span className="text-slate-500 uppercase tracking-wider text-[9px] font-semibold">CGST ({order.cgstPct}%)</span>
                        <span>₹ {formatCurrency(order.cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 font-semibold">
                        <span className="text-slate-500 uppercase tracking-wider text-[9px] font-semibold">SGST ({order.sgstPct}%)</span>
                        <span>₹ {formatCurrency(order.sgstAmount)}</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex justify-between text-slate-700 font-semibold">
                      <span className="text-slate-500 uppercase tracking-wider text-[9px] font-semibold">IGST ({order.igstPct}%)</span>
                      <span>₹ {formatCurrency(order.igstAmount)}</span>
                    </div>
                  )}
                </>
              )}
              <div className="flex justify-between items-center bg-slate-100 border border-slate-300 text-slate-900 px-2 py-1 rounded-md font-bold mt-2 print:mt-1">
                <span className="uppercase text-[9px] tracking-wider font-bold">Grand Total</span>
                <span className="text-sm print:text-sm font-extrabold text-slate-950">₹ {formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footnotes & Signatures */}
        <div className="border-t border-slate-200 pt-3 print:pt-1.5 flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400">FreightFlow Logistics Engine</p>
            <p className="text-[8px] font-medium text-slate-500">Carrier not liable for transit damages.</p>
          </div>
          
          <div className="flex gap-8 print:gap-4 text-right">
            <div className="border-t border-slate-200 pt-1 w-20 text-center">
              <p className="text-[8.5px] font-bold uppercase text-slate-600">Consignor Sig</p>
            </div>
            <div className="border-t border-slate-200 pt-1 w-20 text-center">
              <p className="text-[8.5px] font-bold uppercase text-slate-600">Receiver Sig</p>
            </div>
            <div className="border-t border-slate-200 pt-1 w-32 text-center relative">
              {company?.signatureUrl && (
                <img src={company.signatureUrl} alt="Signature" className="h-6 w-20 object-contain absolute bottom-3 right-6 z-10 print:h-5 print:w-16" />
              )}
              <p className="text-[8.5px] font-bold text-slate-600 uppercase">Auth Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LRPrintPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const doc = await generateLRPrintPDF(order, company);
      doc.save(`LR_${order.lrNo}_${format(new Date(), 'yyyyMMdd')}.pdf`);
      toast.success('LR PDF Generated');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderRes, companyRes] = await Promise.all([
          fetch(`/api/v1/orders/${id}`),
          fetch('/api/v1/companies/branding')
        ]);
        
        if (!orderRes.ok) throw new Error('Order not found');
        const orderData = await orderRes.json();
        const companyData = await companyRes.json();
        
        setOrder(orderData);
        setCompany(companyData?.data || null);
      } catch (error) {
        console.error('Failed to fetch data for print', error);
        toast.error('Failed to load document');
        router.push('/dashboard/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse font-black text-slate-400">LOADING LORRY RECEIPT...</div>;
  if (!order) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      {/* Control Bar - Hidden during print */}
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-8 no-print">
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard/orders"
            className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all border border-slate-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">LR Document Preview</h1>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">LR #{order.lrNo} - {order.dealer?.name}</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="h-14 px-8 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-3 border-none disabled:opacity-50 cursor-pointer"
          >
            {downloading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download Professional PDF
          </button>
        </div>
      </div>

      {/* Main Print Container */}
      <div className="max-w-5xl mx-auto space-y-12 print:space-y-0 print:max-w-none print:p-0">
        <div className="shadow-2xl bg-white print:shadow-none print:bg-transparent">
          <LorryReceiptPrintTemplate 
            order={order} 
            company={company} 
            copyType="CONSIGNEE COPY" 
          />
        </div>
        
        <div className="border-t-2 border-dashed border-slate-200 my-12 print:my-0 print:border-slate-400 print:h-0" />
        
        <div className="shadow-2xl bg-white print:shadow-none print:bg-transparent">
          <LorryReceiptPrintTemplate 
            order={order} 
            company={company} 
            copyType="OFFICE/DRIVER COPY" 
          />
        </div>
      </div>
    </div>
  );
}
