'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { Printer, Download, ArrowLeft } from 'lucide-react';

export default function LRPrintPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/v1/orders/${id}`);
        const data = await res.json();
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order for print', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className="p-20 text-center">Loading LR Details...</div>;
  if (!order) return <div className="p-20 text-center">Order not found.</div>;

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-muted/50 p-8 print:p-0 print:bg-white">
      {/* Control Bar - Hidden during print */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-medium hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </button>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-white hover:bg-muted transition-all text-sm font-medium">
            <Download className="h-4 w-4" /> Download PDF
          </button>
          <button 
            onClick={() => window.print()}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20"
          >
            <Printer className="h-4 w-4" /> Print LR
          </button>
        </div>
      </div>

      {/* LR Document */}
      <div className="max-w-4xl mx-auto bg-white border border-black shadow-2xl print:shadow-none print:border-none p-8 font-serif text-black">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-black pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Shree Shivay Roadlines</h1>
            <p className="text-sm font-bold">Transport Nagar, Mumbai, Maharashtra - 400001</p>
            <p className="text-xs">GSTIN: 27AADCS1234A1Z5 | Phone: +91 98765 43210</p>
            <p className="text-xs">Email: billing@shreeshivay.com</p>
          </div>
          <div className="text-right">
            <div className="inline-block border-2 border-black px-4 py-2 mb-2">
              <h2 className="text-xl font-black">LORRY RECEIPT</h2>
            </div>
            <p className="text-lg font-bold">LR No: <span className="text-red-600">#{order.lrNo}</span></p>
            <p className="text-sm">Date: {format(new Date(order.date), 'dd-MM-yyyy')}</p>
          </div>
        </div>

        {/* Party Details */}
        <div className="grid grid-cols-2 border-b-2 border-black">
          <div className="border-r-2 border-black p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase text-gray-500">Consignor (From)</p>
            <p className="text-base font-black">{order.dealer?.name}</p>
            <p className="text-xs whitespace-pre-wrap">{order.dealer?.address || 'N/A'}</p>
            <p className="text-xs font-bold">GSTIN: {order.dealer?.gstin || 'URD'}</p>
          </div>
          <div className="p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase text-gray-500">Consignee (To)</p>
            <p className="text-base font-black">{order.consignee?.name}</p>
            <p className="text-xs whitespace-pre-wrap">{order.consignee?.address || 'N/A'}</p>
            <p className="text-xs font-bold">GSTIN: {order.consignee?.gstin || 'URD'}</p>
          </div>
        </div>

        {/* Route & Vehicle */}
        <div className="grid grid-cols-3 border-b-2 border-black divide-x-2 divide-black text-sm">
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500">FROM</p>
            <p className="font-bold">{order.fromLocation}</p>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500">TO</p>
            <p className="font-bold">{order.toLocation}</p>
          </div>
          <div className="p-3">
            <p className="text-[10px] font-bold text-gray-500">VEHICLE NO</p>
            <p className="font-bold">{order.vehicle?.regNo || 'Direct'}</p>
          </div>
        </div>

        {/* Items Table */}
        <div className="min-h-[300px] border-b-2 border-black">
          <table className="w-full text-sm">
            <thead className="border-b-2 border-black font-bold text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left border-r-2 border-black w-12">Sr.</th>
                <th className="px-3 py-2 text-left border-r-2 border-black">Description of Goods</th>
                <th className="px-3 py-2 text-center border-r-2 border-black w-24">No. of Pkgs</th>
                <th className="px-3 py-2 text-center border-r-2 border-black w-24">Packing</th>
                <th className="px-3 py-2 text-right w-32">Weight (KG)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10">
              {order.details?.map((item: any, idx: number) => (
                <tr key={item.id} className="h-10">
                  <td className="px-3 py-2 border-r-2 border-black text-center">{idx + 1}</td>
                  <td className="px-3 py-2 border-r-2 border-black font-medium">{item.productName}</td>
                  <td className="px-3 py-2 border-r-2 border-black text-center">{item.boxCount}</td>
                  <td className="px-3 py-2 border-r-2 border-black text-center">{item.packingType || '-'}</td>
                  <td className="px-3 py-2 text-right font-bold">{item.weight}</td>
                </tr>
              ))}
              {/* Fill remaining space */}
              {Array.from({ length: Math.max(0, 8 - (order.details?.length || 0)) }).map((_, i) => (
                <tr key={`empty-${i}`} className="h-10">
                  <td className="px-3 py-2 border-r-2 border-black"></td>
                  <td className="px-3 py-2 border-r-2 border-black"></td>
                  <td className="px-3 py-2 border-r-2 border-black"></td>
                  <td className="px-3 py-2 border-r-2 border-black"></td>
                  <td className="px-3 py-2"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Billing & Footer */}
        <div className="grid grid-cols-2">
          <div className="p-4 space-y-4 border-r-2 border-black">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase">E-Way Bill Details</p>
              <p className="text-xs font-bold">{order.ewayBillNo || 'NO E-WAY BILL PROVIDED'}</p>
            </div>
            <div className="pt-4 space-y-1">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Terms & Conditions</p>
              <ol className="text-[9px] list-decimal pl-3 space-y-1">
                <li>Goods carried at owner's risk.</li>
                <li>Not responsible for leakage/damage during transit.</li>
                <li>Subject to Mumbai Jurisdiction.</li>
                <li>Consignment must be collected within 7 days.</li>
              </ol>
            </div>
          </div>
          
          <div className="divide-y-2 divide-black">
            <div className="p-3 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span>Freight Charges</span>
                <span>{formatCurrency(order.freight)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Hamali Charges</span>
                <span>{formatCurrency(order.hamali)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span>Sub-Total</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
            </div>
            <div className="p-3 space-y-2 bg-gray-50">
              <div className="flex justify-between text-xs">
                <span>CGST ({order.cgstPct}%)</span>
                <span>{formatCurrency(order.cgstAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>SGST ({order.sgstPct}%)</span>
                <span>{formatCurrency(order.sgstAmount)}</span>
              </div>
            </div>
            <div className="p-3 flex justify-between items-center bg-black text-white">
              <span className="text-sm font-black uppercase">Grand Total</span>
              <span className="text-lg font-black">₹ {formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-3 mt-12 pt-8 text-center text-[10px] font-bold uppercase">
          <div className="space-y-12">
            <div className="border-t border-black pt-2 mx-4">Consignor Signature</div>
          </div>
          <div className="space-y-12">
            <div className="border-t border-black pt-2 mx-4">Receiver Signature</div>
          </div>
          <div className="space-y-12">
            <div className="border-t border-black pt-2 mx-4">For Shree Shivay Roadlines</div>
          </div>
        </div>
      </div>
    </div>
  );
}
