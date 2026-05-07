import React from 'react';
import { 
  Activity, Zap, ShieldCheck, History,
  Server, Globe, RefreshCw
} from 'lucide-react';
import { 
  getSystemTelemetry, 
  getClusterHealth, 
  getTenantLoadAnalytics 
} from '@/app/actions/admin/system-activity';
import { ActivityMetrics } from '@/components/admin/performance/activity-metrics';
import { ClusterGrid } from '@/components/admin/performance/cluster-grid';
import { TenantLoadGrid } from '@/components/admin/performance/tenant-load-grid';
import { IngressPulse } from '@/components/admin/performance/ingress-pulse';

export default async function AdminPerformancePage() {
  const telemetry = await getSystemTelemetry();
  const clusters = await getClusterHealth();
  const tenantLoad = await getTenantLoadAnalytics();

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-10 lg:p-20 space-y-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-white rounded-[2rem] border border-slate-100 flex items-center justify-center shadow-sm">
              <Activity className="h-10 w-10 text-slate-900" />
            </div>
            <div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter">System Activity</h1>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-600 mt-2">Real-time Platform Telemetry Hub</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-white px-8 py-4 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
            <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Telemetry Streaming</span>
          </div>
          <button className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white hover:bg-black transition-all shadow-xl shadow-slate-200">
            <RefreshCw className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Global Metrics Section */}
      <ActivityMetrics telemetry={telemetry} />

      {/* Infrastructure Monitoring Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-16">
        <div className="xl:col-span-2 space-y-12">
          <div className="flex items-center justify-between px-2">
            <div>
               <h3 className="text-2xl font-black text-slate-900 tracking-tight">Compute Infrastructure</h3>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Multi-Region Cluster Observability</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">5 Active Nodes</span>
          </div>
          <ClusterGrid clusters={clusters} />
        </div>

        <div className="xl:col-span-1">
          <TenantLoadGrid data={tenantLoad} />
        </div>
      </div>

      {/* Global Pulse Section */}
      <IngressPulse />

      {/* Footer Advisory */}
      <div className="bg-indigo-600 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32" />
         <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
               <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                  <ShieldCheck className="h-8 w-8 text-white" />
               </div>
               <h4 className="text-4xl font-black tracking-tighter mb-6">Operational Sovereignty</h4>
               <p className="text-indigo-100 font-bold leading-relaxed opacity-80 max-w-xl">
                  This hub provides an absolute overview of platform health. Telemetry data is cryptographically verified to ensure mission-critical operational decisions are based on immutable infrastructure protocols.
               </p>
            </div>
            <div className="grid grid-cols-2 gap-8">
               <div className="bg-white/10 p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Protocol Health</p>
                  <p className="text-2xl font-black tracking-tight text-white">99.998%</p>
               </div>
               <div className="bg-white/10 p-8 rounded-[2rem] border border-white/10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200 mb-2">Edge Nodes</p>
                  <p className="text-2xl font-black tracking-tight text-emerald-400">OPTIMIZED</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
