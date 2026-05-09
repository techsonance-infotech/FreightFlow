'use client';

import React from 'react';
import { 
  CheckCircle2, Image as ImageIcon, 
  ExternalLink, CreditCard, QrCode, ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function PaymentProofCard({ msg, isMounted, isAdminView }: any) {
  return (
    <div className={cn(
      "flex flex-col w-full my-6 animate-in fade-in duration-500",
      isAdminView ? "items-center" : (!!msg.admin ? "items-start" : "items-end")
    )}>
      <div className={cn(
        "max-w-sm bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all group",
        isAdminView ? "border-blue-200 shadow-blue-50" : ""
      )}>
        <div className="relative aspect-video bg-slate-900 group-hover:scale-[1.02] transition-transform duration-500">
          {msg.attachmentUrl ? (
            <img src={msg.attachmentUrl} alt="Payment Proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
          ) : (
            <div className="w-full h-full flex items-center justify-center flex-col gap-3">
              <ImageIcon className="h-10 w-10 text-slate-700" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">Proof Not Attached</span>
            </div>
          )}
          <div className="absolute top-4 left-4">
             <div className="bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                <CheckCircle2 className="h-3 w-3" />
                Proof Submitted
             </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Transaction Proof</p>
               <h5 className="text-sm font-black text-slate-900 tracking-tight">
                  {msg.payload?.transactionId || 'Payment Evidence'}
               </h5>
            </div>
            <button className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
               <ExternalLink className="h-4 w-4" />
            </button>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50">
             <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                {isMounted ? new Date(msg.createdAt).toLocaleString() : 'Syncing...'}
             </span>
             {!isAdminView && !msg.admin && (
               <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Sent to Admin</span>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
