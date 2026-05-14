import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { ShieldCheck, CheckCircle2, Clock, Zap, Target, Rocket, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function EliteRoadmapPage() {
  const session = await getSession();
  if (!session?.user) redirect('/auth/login');

  return (
    <div className="space-y-12 p-10 animate-in fade-in duration-700 max-w-6xl mx-auto">
      {/* Hero Header */}
      <div className="relative p-12 rounded-[3rem] bg-slate-900 text-white overflow-hidden shadow-2xl">
         <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="space-y-6 text-center md:text-left">
               <div className="inline-flex px-5 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">
                  System Intelligence
               </div>
               <h1 className="text-5xl font-black tracking-tight leading-tight uppercase">
                  Elite Logistics <br/> <span className="text-blue-500">Suite Roadmap</span>
               </h1>
               <p className="text-slate-400 font-medium max-w-lg leading-relaxed text-lg">
                  Monitoring the successful deployment and operational integration of the 4-phase advanced logistics engine.
               </p>
            </div>
            <div className="h-48 w-48 bg-blue-600 rounded-[2.5rem] rotate-12 flex items-center justify-center shadow-2xl shadow-blue-500/20 shrink-0">
               <Award className="h-24 w-24 text-white -rotate-12" />
            </div>
         </div>
         {/* Background Accents */}
         <div className="absolute right-0 top-0 h-96 w-96 bg-blue-600/10 rounded-full blur-[120px]" />
         <div className="absolute left-1/4 bottom-0 h-64 w-64 bg-emerald-600/10 rounded-full blur-[100px]" />
      </div>

      {/* Roadmap Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <PhaseDetail 
          step="01" 
          title="Pallet Transparency" 
          status="completed"
          features={[
            "Live Pallet Reconciliation",
            "Outward vs Return Audit",
            "Digital Pallet Receipt Printing",
            "Inventory Leakage Prevention"
          ]}
          icon={<Box className="h-6 w-6 text-emerald-500" />}
        />
        <PhaseDetail 
          step="02" 
          title="Mission Settlement" 
          status="completed"
          features={[
            "Dynamic Trip P&L Engine",
            "Automated Driver Advances",
            "Fuel Expense Reconciliation",
            "Route-based Margin Analysis"
          ]}
          icon={<IndianRupee className="h-6 w-6 text-blue-500" />}
        />
        <PhaseDetail 
          step="03" 
          title="Bulk Evidence" 
          status="completed"
          features={[
            "Batch POD Audit Hub",
            "Digital Signature Capture",
            "Geo-tagged Delivery Verification",
            "Evidence Packaging & Export"
          ]}
          icon={<ShieldCheck className="h-6 w-6 text-amber-500" />}
        />
        <PhaseDetail 
          step="04" 
          title="Operational Intelligence" 
          status="completed"
          features={[
            "SVG Mission Control Map",
            "Live Vehicle Telemetry Feed",
            "Unit Intelligence Snapshots",
            "Global Ops Command Center"
          ]}
          icon={<Zap className="h-6 w-6 text-purple-500" />}
        />
      </div>

      <div className="p-10 rounded-[2.5rem] bg-blue-50 border border-blue-100 flex items-center justify-between gap-10">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-sm">
               <Rocket className="h-8 w-8 text-blue-600" />
            </div>
            <div>
               <h3 className="text-xl font-black text-slate-900 uppercase">System at Full Capacity</h3>
               <p className="text-sm font-bold text-slate-500 uppercase tracking-tighter">All 4 Elite modules are currently operating in high-performance mode.</p>
            </div>
         </div>
         <div className="px-8 py-3 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest">
            Audit Ready
         </div>
      </div>
    </div>
  );
}

function PhaseDetail({ step, title, status, features, icon }: any) {
  return (
    <div className="p-10 rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-100/50 hover:shadow-2xl hover:shadow-blue-500/5 transition-all relative group">
       <div className="absolute top-8 right-8 text-4xl font-black text-slate-50 group-hover:text-blue-50 transition-colors">
          {step}
       </div>
       <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center">
             {icon}
          </div>
          <div>
             <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{title}</h3>
             <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Deployed & Active</span>
             </div>
          </div>
       </div>
       <ul className="space-y-4">
          {features.map((f: string, i: number) => (
            <li key={i} className="flex items-center gap-3 text-slate-500 font-bold text-xs uppercase tracking-tight">
               <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
               {f}
            </li>
          ))}
       </ul>
    </div>
  );
}

import { Box, IndianRupee } from 'lucide-react';
