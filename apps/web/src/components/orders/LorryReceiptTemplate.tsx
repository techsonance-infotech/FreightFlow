'use client';

import React from 'react';
import { formatUtcDate } from '@/lib/utils';
import { Download, X, Package, Truck, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface LorryReceiptTemplateProps {
  order?: any;
  orders?: any[];
  company?: any;
  copyType?: string;
  onClose: () => void;
}

export function LorryReceiptTemplate({ order, orders, company, copyType, onClose }: LorryReceiptTemplateProps) {
  const items = orders || (order ? [order] : []);
  

  const handleDownload = () => {
    const doc = new jsPDF() as any;
    
    items.forEach((item, index) => {
      if (index > 0) doc.addPage();
      
      // Header
      doc.setFontSize(22);
      doc.text('FREIGHTFLOW LOGISTICS', 14, 20);
      doc.setFontSize(10);
      doc.text('Lorry Receipt No: #' + item.lrNo, 140, 20);
      doc.text('Date: ' + formatUtcDate(item.date, 'dd/MM/yyyy'), 140, 25);
      
      doc.line(14, 30, 196, 30);
      
      // Parties
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('CONSIGNOR:', 14, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(item.dealer?.name || 'N/A', 14, 45);
      doc.text(item.fromAddress || '', 14, 50, { maxWidth: 80 });
      
      doc.setFont('helvetica', 'bold');
      doc.text('CONSIGNEE:', 110, 40);
      doc.setFont('helvetica', 'normal');
      doc.text(item.consignee?.name || 'N/A', 110, 45);
      doc.text(item.toAddress || '', 110, 50, { maxWidth: 80 });
      
      // Vehicle
      doc.autoTable({
        startY: 70,
        head: [['Vehicle No', 'From', 'To']],
        body: [[item.vehicle?.plateNumber || 'N/A', item.fromLocation, item.toLocation]],
        theme: 'grid',
        headStyles: { fillStyle: [30, 41, 59] }
      });
      
      // Items
      doc.autoTable({
        startY: doc.lastAutoTable.finalY + 10,
        head: [['Description', 'Packing', 'Units', 'Weight (KG)']],
        body: (item.details || []).map((detail: any) => [
          detail.productName,
          detail.packingType,
          detail.boxCount,
          detail.weight.toFixed(2)
        ]),
        theme: 'striped',
        headStyles: { fillStyle: [30, 41, 59] }
      });
    });
    
    doc.save(items.length > 1 ? `LR_Batch_${items.length}.pdf` : `LR_${items[0].lrNo}.pdf`);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-8">
      <div className="bg-white w-full max-w-4xl h-full max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header */}
        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {items.length > 1 ? `Print Batch (${items.length} LRs)` : 'Print Lorry Receipt'}
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Official Document Preview</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={handleDownload}
              className="rounded-2xl h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-blue-200"
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
            <button onClick={onClose} className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all ml-2">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Document Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-12 bg-slate-50/50" id="printable-lr">
          <div className="space-y-12">
            {items.map((item, idx) => (
              <div key={idx} className="bg-white border border-slate-100 shadow-sm p-16 rounded-[2rem]">
                {/* Template Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-10 mb-10">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2 uppercase">FreightFlow <span className="text-blue-600">Logistics</span></h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pan-India Freight & Logistics Services</p>
                    <div className="mt-6 space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Head Office</p>
                      <p className="text-sm font-medium text-slate-600 max-w-[300px]">123, Logistics Park, NH-8, Gurugram, Haryana - 122001</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {copyType && (
                      <div className="mb-2">
                        <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-blue-100/50">
                          {copyType}
                        </span>
                      </div>
                    )}
                    <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl inline-block mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Lorry Receipt No.</p>
                      <p className="text-2xl font-black tracking-tighter">#{item.lrNo}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Date</p>
                      <p className="text-sm font-black text-slate-900 uppercase tracking-tighter">{formatUtcDate(item.date, 'dd MMMM yyyy')}</p>
                    </div>
                  </div>
                </div>

                {/* Parties Section */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consignor / Dealer</h3>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.dealer?.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">{item.fromAddress}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-emerald-600" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consignee</h3>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{item.consignee?.name}</p>
                      <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">{item.toAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Vehicle & Route */}
                <div className="grid grid-cols-3 gap-6 mb-12 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle No</p>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-blue-600" />
                      <p className="font-black text-slate-900 uppercase tracking-tighter">{item.vehicle?.plateNumber || item.vehicle?.regNo || 'N/A'}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">From</p>
                    <p className="font-black text-slate-900 uppercase tracking-tighter truncate">{item.fromLocation}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">To</p>
                    <p className="font-black text-slate-900 uppercase tracking-tighter truncate">{item.toLocation}</p>
                  </div>
                </div>

                {/* Item Details */}
                <div className="mb-12">
                  <table className="w-full text-left">
                    <thead className="border-b-2 border-slate-900">
                      <tr>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900">Description of Goods</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Packing</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">Units</th>
                        <th className="py-4 text-[10px] font-black uppercase tracking-widest text-slate-900 text-right">Weight (KG)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(item.details || []).map((detail: any, i: number) => (
                        <tr key={i}>
                          <td className="py-5 text-sm font-bold text-slate-700 uppercase">{detail.productName}</td>
                          <td className="py-5 text-sm font-medium text-slate-500 text-center">{detail.packingType}</td>
                          <td className="py-5 text-sm font-black text-slate-900 text-center">{detail.boxCount}</td>
                          <td className="py-5 text-sm font-black text-slate-900 text-right">{detail.weight.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer Signatures */}
                <div className="mt-24 grid grid-cols-2 gap-24">
                  <div className="border-t border-slate-200 pt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Consignor Signature</p>
                  </div>
                  <div className="border-t border-slate-900 pt-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 text-center">For FreightFlow Logistics</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
