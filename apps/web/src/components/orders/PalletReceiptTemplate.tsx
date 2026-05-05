'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { QrCode, Building2 } from 'lucide-react';

interface PalletReceiptTemplateProps {
  data: any;
  company: any;
  copyType: 'CONSIGNEE COPY' | 'OFFICE/DRIVER COPY';
}

export const PalletReceiptTemplate: React.FC<PalletReceiptTemplateProps> = ({ data, company, copyType }) => {
  const primaryColor = company?.primaryColor || '#3b82f6';

  return (
    <div className="bg-white p-8 border-2 border-slate-900 text-slate-900 font-sans leading-tight print:border-none print:p-0 min-h-[500px] flex flex-col relative overflow-hidden">
      
      {/* Watermark */}
      {company?.enableWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none rotate-[-45deg] z-0">
          <span className="text-[150px] font-black uppercase whitespace-nowrap">{company.watermarkText || 'ORIGINAL'}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex justify-between items-start border-b-4 pb-6 mb-6 relative z-10" style={{ borderColor: primaryColor }}>
        <div className="flex gap-6 items-center">
          <div className="h-24 w-24 bg-slate-50 rounded-3xl flex items-center justify-center border-2 border-slate-100 overflow-hidden shrink-0 shadow-inner">
            {company?.logoUrl ? (
              <img src={company.logoUrl} alt="Company Logo" className="h-full w-full object-contain p-2" />
            ) : (
              <Building2 className="h-12 w-12 text-slate-200" />
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter" style={{ color: primaryColor }}>
              {company?.name || 'Company Name'}
            </h1>
            <p className="text-xs font-black uppercase tracking-[0.3em] opacity-60 mb-2 italic">{company?.printHeader || 'Specialists in Palletized Logistics'}</p>
            <p className="text-[10px] font-bold text-slate-500 max-w-[450px] leading-relaxed">
              {company?.address || 'Registered Office Address'}
            </p>
            <div className="flex gap-6 mt-3">
              <p className="text-[11px] font-black uppercase">GSTIN: <span style={{ color: primaryColor }}>{company?.gstin || '-'}</span></p>
              {company?.whatsappNo && (
                <p className="text-[11px] font-black uppercase">Support: {company.whatsappNo}</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="text-right flex flex-col items-end">
          <div className="bg-slate-900 text-white px-4 py-2 rounded-xl mb-4 text-[10px] font-black uppercase tracking-widest">
            {copyType}
          </div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Pallet Manifest #</p>
          <p className="text-2xl font-black tracking-tighter" style={{ color: primaryColor }}>LR-{data.lrNo || '0000'}</p>
          <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase">{new Date(data.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Consignment Mapping */}
      <div className="grid grid-cols-3 gap-6 mb-8 relative z-10">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Dealer / Party Info</p>
          <p className="text-xs font-black uppercase text-slate-900">{data.dealer?.name || data.companyName}</p>
          <p className="text-[9px] font-bold text-slate-500 mt-1">{data.dealer?.address || 'Address not registered'}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Vehicle / Assets</p>
          <p className="text-xs font-black uppercase text-slate-900">{data.vehicle?.plateNumber || 'TBA'}</p>
          <p className="text-[9px] font-bold text-slate-500 mt-1">Ref Code: {data.partyCode || '-'}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-right">
          <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mb-2">Tax Compliance</p>
          <p className="text-xs font-black text-slate-900">GST {data.gstPct || 0}% Applicable</p>
          <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase">SAC: 996511 (Logistics)</p>
        </div>
      </div>

      {/* The Master Pallet Table (Landscape Style) */}
      <table className="w-full text-left border-collapse mb-8 relative z-10">
        <thead>
          <tr className="bg-slate-900 text-white">
            <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/10 w-12 text-center">Sr.</th>
            <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/10">Pallet Identifier</th>
            <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/10 text-center">Box Qty</th>
            <th className="p-3 text-[10px] font-black uppercase tracking-widest border-r border-white/10 text-center">Weight (KG)</th>
            <th className="p-3 text-[10px] font-black uppercase tracking-widest">Consignee Destination</th>
          </tr>
        </thead>
        <tbody className="border-b-2 border-slate-900">
          {data.palletDetails?.map((item: any, i: number) => (
            <tr key={i} className="border-b border-slate-100 font-bold text-xs">
              <td className="p-3 border-r border-slate-100 text-center text-slate-400">{i + 1}</td>
              <td className="p-3 border-r border-slate-100 uppercase tracking-wider">{item.palletDisplayId || `PALLET-${i+1}`}</td>
              <td className="p-3 border-r border-slate-100 text-center">{item.boxQty}</td>
              <td className="p-3 border-r border-slate-100 text-center">{item.weight}</td>
              <td className="p-3 uppercase">{item.consigneeName || 'Self'}</td>
            </tr>
          ))}
          {/* Pad with empty rows to fill page */}
          {Array(Math.max(0, 8 - (data.palletDetails?.length || 0))).fill(0).map((_, i) => (
            <tr key={`empty-${i}`} className="h-8 border-b border-slate-50">
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
      <div className="flex-1 flex flex-col justify-end relative z-10">
        <div className="grid grid-cols-12 gap-8 mb-10 items-end">
          {/* T&C and Financials */}
          <div className="col-span-8 space-y-6">
            <div className="grid grid-cols-2 gap-6">
               {/* Bank Block */}
               {(company?.bankName || company?.accountNo) && (
                 <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-[8px] font-black uppercase tracking-widest mb-2" style={{ color: primaryColor }}>Settlement Account</p>
                    <p className="text-[10px] font-black text-slate-900 uppercase">{company.bankName}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase mt-1">A/C: {company.accountNo}</p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase">IFSC: {company.ifscCode}</p>
                 </div>
               )}
               {/* QR Block */}
               {company?.enableQrCode && (
                 <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="h-16 w-16 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                      <QrCode className="h-10 w-10 text-slate-100" />
                    </div>
                    <div>
                      <p className="text-[8px] font-black uppercase tracking-widest text-slate-900">Smart Manifest</p>
                      <p className="text-[7px] font-bold text-slate-400 uppercase leading-tight mt-1">Scan for digital tracking & proof of delivery</p>
                    </div>
                 </div>
               )}
            </div>
            
            <div className="space-y-2">
               <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">Operational Terms</p>
               <p className="text-[8px] font-bold text-slate-500 leading-tight italic line-clamp-3">
                 {company?.printTerms || 'Standard logistics terms and conditions apply for palletized cargo handling...'}
               </p>
            </div>
          </div>

          {/* Totals & Signature */}
          <div className="col-span-4 space-y-8 text-right">
            <div className="space-y-1">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Manifest Weight</p>
               <p className="text-3xl font-black tracking-tighter" style={{ color: primaryColor }}>
                 {data.palletDetails?.reduce((acc: number, curr: any) => acc + (parseFloat(curr.weight) || 0), 0).toFixed(2)} <span className="text-sm">KG</span>
               </p>
               <p className="text-[9px] font-black text-slate-400">Total Boxes: {data.palletDetails?.reduce((acc: number, curr: any) => acc + (parseInt(curr.boxQty) || 0), 0)}</p>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Authorized Manifest Verification</p>
              <div className="h-20 flex flex-col items-end justify-center relative">
                {company?.signatureUrl && (
                  <img src={company.signatureUrl} alt="Signature" className="h-14 w-32 object-contain absolute bottom-4 right-0 z-10" />
                )}
                <div className="w-full border-t-2 border-slate-900 pt-2 text-[9px] font-black uppercase tracking-widest text-center">For {company?.name || 'Company Name'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Footer Tag */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center opacity-30">
          <p className="text-[8px] font-black uppercase tracking-[0.4em]">FreightFlow Pro Logistics Engine</p>
          <p className="text-[8px] font-black uppercase">System Generated Manifest - {new Date().toISOString()}</p>
        </div>
      </div>
    </div>
  );
};
