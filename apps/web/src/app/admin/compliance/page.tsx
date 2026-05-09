import React from 'react';
import { 
  ShieldCheck, AlertTriangle, Clock, 
  Activity, RefreshCw, Trophy
} from 'lucide-react';
import { 
  getGlobalComplianceMetrics, 
  getTenantComplianceLeaderboard 
} from '@/app/actions/admin/compliance';
import { ComplianceMetrics } from '@/components/admin/compliance/compliance-metrics';
import { ExpiryRegistry } from '@/components/admin/compliance/expiry-registry';
import { ComplianceLeaderboard } from '@/components/admin/compliance/leaderboard';

export default async function AdminCompliancePage() {
  const metrics = await getGlobalComplianceMetrics();
  const leaderboard = await getTenantComplianceLeaderboard();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 space-y-12 animate-in fade-in duration-700 pb-24">
      {/* Header Deck */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2.5rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <ShieldCheck className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">Compliance Watchdog</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-600 mt-2 ml-1">Global Platform Regulatory Oversight</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Observatory Scanning Active</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Primary KPI Stream */}
      <ComplianceMetrics metrics={metrics} />

      {/* Governance Content Stack */}
      <div className="space-y-12">
        <ExpiryRegistry documents={metrics.expiringDocs} />
        <ComplianceLeaderboard data={leaderboard} />
      </div>

      {/* Advisory Ledger */}
      <div className="bg-slate-900 rounded-[3.5rem] p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
         <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-600/10 rounded-full blur-[120px] -mr-32 -mt-32" />
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
               <div className="h-20 w-20 bg-rose-600 rounded-3xl flex items-center justify-center border border-white/10 shadow-2xl rotate-3">
                  <Activity className="h-10 w-10 text-white" />
               </div>
               <div className="space-y-4">
                 <h4 className="text-4xl font-black tracking-tighter leading-tight">Regulatory Sovereignty <br/><span className="text-rose-500">Protocol 4.0</span></h4>
                 <p className="text-slate-400 font-bold leading-relaxed max-w-xl">
                    Document integrity is the bedrock of operational sovereignty. The Watchdog automates document verification workflows across all nodes, ensuring 100% compliance with global transport directives.
                 </p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:gap-10">
               <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 mb-2">Cluster Health</p>
                  <p className="text-4xl font-black tracking-tighter text-white">94.2%</p>
                  <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-600 w-[94%]" />
                  </div>
               </div>
               <div className="bg-white/5 backdrop-blur-md p-10 rounded-[2.5rem] border border-white/10 shadow-inner">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Risk Vector</p>
                  <p className="text-4xl font-black tracking-tighter text-emerald-400">STABLE</p>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-4 italic">Zero active breaches</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
