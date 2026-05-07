'use client';

import React from 'react';
import { FileText, AlertTriangle, ArrowRight, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ExpiryRegistry({ documents }: { documents: any[] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-rose-500/20 rotate-3">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Expiry Watchdog</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Sovereign Compliance Risk Identification</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            {documents.length} Critical Nodes
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
        {documents.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <Shield className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Critical Compliance Breaches Detected</p>
          </div>
        ) : documents.map((doc) => (
          <div key={doc.id} className="group flex items-center justify-between p-6 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-rose-600 group-hover:border-rose-200 transition-all">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{doc.type}</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{doc.tenantName}</p>
                <div className="flex items-center gap-4 mt-3">
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <Clock className="h-3 w-3 text-rose-500" /> {new Date(doc.expiryDate).toLocaleDateString()}
                   </p>
                   <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-rose-100">
                     {doc.risk} RISK
                   </span>
                </div>
              </div>
            </div>

            <button className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 hover:text-rose-600 hover:border-rose-200 hover:shadow-lg transition-all group/btn">
              <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-rose-50 border border-rose-100 rounded-[2rem]">
         <Shield className="h-6 w-6 text-rose-600" />
         <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest leading-relaxed">
           Compliance advisories are automatically dispatched to tenant gateways when document validity falls below the 30-day sovereignty threshold.
         </p>
      </div>
    </div>
  );
}
