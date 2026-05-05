'use client';

import React from 'react';
import { LorryReceiptTemplate } from './LorryReceiptTemplate';

interface OrderPrintHubProps {
  order: any;
  company: any;
}

export const OrderPrintHub: React.FC<OrderPrintHubProps> = ({ order, company }) => {
  if (!order) return null;

  return (
    <div className="space-y-12 p-8 bg-slate-50 min-h-screen print:bg-white print:p-0 print:space-y-0">
      {/* Action Bar (Hidden in print) */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-8 print:hidden">
        <div>
          <h2 className="text-2xl font-black text-slate-900">Print Preview</h2>
          <p className="text-sm font-medium text-slate-500">LR #{order.lrNo} - {order.dealer?.name}</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => window.print()}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all"
          >
            🖨️ Print Now
          </button>
        </div>
      </div>

      {/* Main Document Area */}
      <div className="max-w-4xl mx-auto space-y-8 print:space-y-0">
        
        {/* Copy 1: Consignee */}
        <div className="shadow-2xl print:shadow-none print:break-after-page">
          <LorryReceiptTemplate 
            order={order} 
            company={company} 
            copyType="CONSIGNEE COPY" 
            onClose={() => {}}
          />
        </div>

        {/* Copy 2: Office/Driver */}
        <div className="shadow-2xl print:shadow-none">
          <LorryReceiptTemplate 
            order={order} 
            company={company} 
            copyType="OFFICE/DRIVER COPY" 
            onClose={() => {}}
          />
        </div>

      </div>
    </div>
  );
};
