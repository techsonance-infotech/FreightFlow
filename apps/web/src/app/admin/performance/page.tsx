import React from 'react';
import { 
  Activity, Zap, Server, 
  Database, Globe, Shield,
  TrendingUp, ArrowUpRight
} from 'lucide-react';

export default function AdminPerformancePage() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-white tracking-tighter">System Vitality</h1>
        <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Real-time Infrastructure Monitoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Uptime" value="99.99%" sub="Last 30 days" icon={<Shield className="h-5 w-5" />} color="emerald" />
        <MetricCard label="Avg Response" value="124ms" sub="Global latency" icon={<Zap className="h-5 w-5" />} color="blue" />
        <MetricCard label="Error Rate" value="0.02%" sub="Within SLIs" icon={<Activity className="h-5 w-5" />} color="indigo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Node Traffic */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-[3rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-xl font-black text-white">Compute Clusters</h3>
            <span className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
            </span>
          </div>
          
          <div className="space-y-8">
            <ClusterItem name="FF-WEB-PRIMARY (AWS-AP-SOUTH-1)" load={42} status="Healthy" />
            <ClusterItem name="FF-WEB-SECONDARY (AWS-US-EAST-1)" load={12} status="Healthy" />
            <ClusterItem name="FF-DB-PRIMARY (SUPABASE-IO)" load={65} status="Scaling" />
            <ClusterItem name="FF-REDIS-CACHE" load={8} status="Healthy" />
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-slate-900/30 border border-slate-900 rounded-[3rem] p-10 flex flex-col justify-center items-center text-center">
          <Globe className="h-20 w-20 text-slate-800 mb-6" />
          <h3 className="text-xl font-black text-white">Global Traffic</h3>
          <p className="text-slate-500 font-bold text-sm mt-2 max-w-xs">
            Most traffic currently originating from <span className="text-blue-500">Mumbai</span>, <span className="text-blue-500">Singapore</span>, and <span className="text-blue-500">London</span> nodes.
          </p>
          <div className="mt-8 flex items-center gap-6">
            <div className="text-center">
              <p className="text-2xl font-black text-white">1.2M</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Req/Hour</p>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">42ms</p>
              <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Edge Latency</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon, color }: any) {
  const colors: any = {
    emerald: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    indigo: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  };

  return (
    <div className="bg-slate-900/30 border border-slate-900 rounded-[2rem] p-8">
      <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-6 border ${colors[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-black text-white">{value}</h3>
        <span className="text-[10px] font-bold text-slate-600">{sub}</span>
      </div>
    </div>
  );
}

function ClusterItem({ name, load, status }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-400">{name}</span>
        <span className={cn(
          "font-bold",
          status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'
        )}>{status} &bull; {load}% Load</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div className={cn(
          "h-full rounded-full transition-all duration-1000",
          load > 80 ? "bg-red-500" : load > 50 ? "bg-amber-500" : "bg-blue-600"
        )} style={{ width: `${load}%` }} />
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
