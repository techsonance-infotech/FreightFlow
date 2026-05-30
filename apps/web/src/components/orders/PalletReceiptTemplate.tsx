'use client';

import React from 'react';
import { cn, formatUtcDate } from '@/lib/utils';
import { QrCode, Building2 } from 'lucide-react';

interface PalletReceiptTemplateProps {
  data: any;
  company: any;
  copyType: 'CONSIGNEE COPY' | 'OFFICE/DRIVER COPY';
}

export const PalletReceiptTemplate: React.FC<PalletReceiptTemplateProps> = ({ data, company, copyType }) => {
  const primaryColor = company?.primaryColor || '#3b82f6';
  const items = data.palletDetails || [];
  const itemCount = items.length;
  const isHighItemCount = itemCount >= 4;

  // Dynamic spacing classes
  const containerPadding = isHighItemCount ? 'p-4 print:p-2' : 'p-6 md:p-8 print:p-4';
  const headerSpacing = isHighItemCount ? 'pb-2 mb-2 print:pb-1 print:mb-1' : 'pb-4 mb-4 print:pb-2 print:mb-2';
  const sectionSpacing = isHighItemCount ? 'mb-2 print:mb-1' : 'mb-4 print:mb-2';
  const tableCellPadding = isHighItemCount ? 'p-1 print:p-0.5 text-[10px] print:text-[9px]' : 'p-1.5 md:p-2';
  const rowHeight = isHighItemCount ? 'h-5 print:h-4' : 'h-6 print:h-5';

  return (
    <div className={`bg-white border-2 border-slate-900 text-slate-900 font-sans leading-tight min-h-[480px] print:min-h-[48.5vh] print:max-h-[48.5vh] ${containerPadding} print:border-none print:shadow-none print:rounded-none flex flex-col relative overflow-hidden`}>
      
      {/* Watermark */}
      {company?.enableWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-45deg] z-0">
          <span className="text-[120px] print:text-[80px] font-black uppercase whitespace-nowrap">{company.watermarkText || 'ORIGINAL'}</span>
        </div>
      )}

      {/* Header Section */}
      <div className={`flex justify-between items-start border-b-4 ${headerSpacing} relative z-10`} style={{ borderColor: primaryColor }}>
        <div className="flex gap-4 items-center">
          <div className="h-16 w-16 md:h-20 md:w-20 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden shrink-0 shadow-inner print:h-12 print:w-12 print:rounded-xl">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt="Company Logo" className="h-full w-full object-contain p-1.5" />
            ) : (
              <Building2 className="h-8 w-8 text-slate-200" />
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter print:text-xl" style={{ color: primaryColor }}>
              {company?.name || 'Company Name'}
            </h1>
            <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.2em] opacity-60 mb-1 italic print:hidden">{company?.printHeader || 'Specialists in Palletized Logistics'}</p>
            <p className="text-[9px] md:text-[10px] font-bold text-slate-500 max-w-[450px] leading-tight print:hidden">
              {company?.address || 'Registered Office Address'}
            </p>
            <div className="flex gap-4 mt-1.5">
              <p className="text-[10px] font-black uppercase">GSTIN: <span style={{ color: primaryColor }}>{company?.gstin || '-'}</span></p>
              {company?.whatsappNo && (
                <p className="text-[10px] font-black uppercase print:hidden">Support: {company.whatsappNo}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="bg-slate-900 text-white px-3 py-1.5 rounded-lg mb-2 text-[9px] font-black uppercase tracking-widest print:py-1">
            {copyType}
          </div>
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-0.5">Pallet Manifest #</p>
          <p className="text-xl md:text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>LR-{data.lrNo || '0000'}</p>
          <p className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase">{formatUtcDate(data.date, 'dd MMMM yyyy')}</p>
        </div>
      </div>

      {/* Consignment Mapping */}
      <div className={`grid grid-cols-3 gap-4 ${sectionSpacing} relative z-10`}>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 print:p-2.5">
          <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-widest mb-1">Dealer / Party Info</p>
          <p className="text-[10px] md:text-xs font-black uppercase text-slate-900 line-clamp-1">{data.dealer?.name || data.companyName}</p>
          <p className="text-[8.5px] font-bold text-slate-500 mt-0.5 leading-tight line-clamp-2">{data.dealer?.address || 'Address not registered'}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 print:p-2.5">
          <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-widest mb-1">Vehicle / Assets</p>
          <p className="text-[10px] md:text-xs font-black uppercase text-slate-900">{data.vehicle?.plateNumber || 'TBA'}</p>
          <p className="text-[8.5px] font-bold text-slate-500 mt-0.5">Ref Code: {data.partyCode || '-'}</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/50 text-right print:p-2.5">
          <p className="text-[7.5px] font-black uppercase text-slate-400 tracking-widest mb-1">Movement Type</p>
          <p className="text-[10px] md:text-xs font-black text-slate-900">DELIVERY CHALLAN ONLY</p>
          <p className="text-[8.5px] font-bold text-slate-500 mt-0.5 uppercase">SAC: 996511 (Logistics)</p>
        </div>
      </div>

      {/* The Master Pallet Table (Landscape Style) */}
      <table className={`w-full text-left border-collapse ${sectionSpacing} relative z-10`}>
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="p-2 text-[9px] font-black uppercase tracking-widest border-r border-white/10 w-10 text-center">Sr.</th>
            <th className="p-2 text-[9px] font-black uppercase tracking-widest border-r border-white/10">Pallet Identifier</th>
            <th className="p-2 text-[9px] font-black uppercase tracking-widest border-r border-white/10 text-center">Box Qty</th>
            <th className="p-2 text-[9px] font-black uppercase tracking-widest border-r border-white/10 text-center">Weight (KG)</th>
            <th className="p-2 text-[9px] font-black uppercase tracking-widest">Consignee Destination</th>
          </tr>
        </thead>
        <tbody className="border-b-2 border-slate-900">
          {items.map((item: any, i: number) => (
            <tr key={i} className={`border-b border-slate-100 font-bold ${rowHeight}`}>
              <td className={`border-r border-slate-100 text-center text-slate-400 ${tableCellPadding}`}>{i + 1}</td>
              <td className={`border-r border-slate-100 uppercase tracking-wider ${tableCellPadding}`}>{item.palletDisplayId || `PALLET-${i+1}`}</td>
              <td className={`border-r border-slate-100 text-center ${tableCellPadding}`}>{item.boxQty}</td>
              <td className={`border-r border-slate-100 text-center ${tableCellPadding}`}>{item.weight}</td>
              <td className={`uppercase truncate max-w-[120px] ${tableCellPadding}`}>{item.consigneeName || 'Self'}</td>
            </tr>
          ))}
          {/* Pad with empty rows to fill page, reduced height and count for high items count */}
          {Array(Math.max(0, 4 - itemCount)).fill(0).map((_, i) => (
            <tr key={`empty-${i}`} className={`border-b border-slate-50 ${rowHeight}`}>
               <td className="border-r border-slate-50"></td>
               <td className="border-r border-slate-50"></td>
               <td className="border-r border-slate-50"></td>
               <td className="border-r border-slate-50"></td>
               <td></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Manifest Summary Footer */}
      <div className="flex-1 flex flex-col justify-end relative z-10 print:mt-auto">
        <div className="grid grid-cols-12 gap-6 items-end mb-4 print:mb-2">
          {/* T&C and Info */}
          <div className="col-span-8 space-y-4 print:space-y-2">
            <div className="grid grid-cols-2 gap-4 print:hidden">
               {/* Bank Block */}
               {(company?.bankName || company?.accountNo) && (
                 <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-[7.5px] font-black uppercase tracking-widest mb-1" style={{ color: primaryColor }}>Settlement Account</p>
                    <p className="text-[9px] font-black text-slate-900 uppercase truncate">{company.bankName}</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase mt-0.5">A/C: {company.accountNo}</p>
                 </div>
               )}
               {/* QR Block */}
               {company?.enableQrCode && (
                 <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="h-10 w-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0">
                      <QrCode className="h-6 w-6 text-slate-200" />
                    </div>
                    <div>
                      <p className="text-[7.5px] font-black uppercase tracking-widest text-slate-900 leading-tight">Smart Manifest</p>
                      <p className="text-[6.5px] font-bold text-slate-400 uppercase leading-none mt-0.5">Digital Proof</p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="space-y-1">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 print:text-slate-400">Challan Terms</p>
               <p className="text-[7.5px] font-medium text-slate-500 leading-normal italic line-clamp-2">
                 {company?.printTerms || 'Standard logistics terms and conditions apply for palletized cargo handling. Subject to jurisdiction.'}
               </p>
            </div>
          </div>

          {/* Totals & Signature */}
          <div className="col-span-4 space-y-4 text-right print:space-y-3">
            <div className="space-y-0.5">
               <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Total Net Tonnage</p>
               <p className="text-xl md:text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>
                 {Number(data.palletDetails?.reduce((acc: number, curr: any) => acc + (parseFloat(curr.weight) || 0), 0).toFixed(4)).toString()} <span className="text-xs">KG</span>
               </p>
               <p className="text-[8px] font-black text-slate-400">Total Units: {data.palletDetails?.reduce((acc: number, curr: any) => acc + (parseInt(curr.boxQty) || 0), 0)} Boxes</p>
            </div>

            <div className="space-y-2">
              <div className="h-10 flex flex-col items-end justify-center relative">
                {company?.signatureUrl && (
                  <img src={company.signatureUrl} alt="Signature" className="h-8 w-24 object-contain absolute bottom-2 right-0 z-10 print:h-6 print:w-20" />
                )}
                <div className="w-full border-t border-slate-900 pt-1 text-[8px] font-black uppercase tracking-widest text-center">For {company?.name || 'Company Name'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Tag */}
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center opacity-30 print:pt-1.5 print:opacity-40">
          <p className="text-[7px] font-black uppercase tracking-[0.3em]">FreightFlow Logistics Engine</p>
          <p className="text-[7px] font-black uppercase">System Generated - {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};
