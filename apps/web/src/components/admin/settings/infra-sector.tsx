'use client';

import React, { useState, useEffect } from 'react';
import { Database, Zap, RefreshCw, Server, Activity, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSystemHealth } from '@/app/actions/admin/platform-config';

export function InfraSector() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    const res = await getSystemHealth();
    setHealth(res);
    setLoading(false);
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <HealthCard 
          icon={<Database className="h-6 w-6" />}
          label="Database Cluster"
          status={health?.database || 'Pending'}
          latency="< 5ms"
          color="blue"
        />
        <HealthCard 
          icon={<Server className="h-6 w-6" />}
          label="API Edge Nodes"
          status={health?.api || 'Pending'}
          latency="12ms"
          color="emerald"
        />
        <HealthCard 
          icon={<Zap className="h-6 w-6" />}
          label="Cache Invalidation"
          status="Operational"
          latency="0.4ms"
          color="amber"
        />
        <HealthCard 
          icon={<ShieldCheck className="h-6 w-6" />}
          label="Firewall Layer 7"
          status="Locked"
          latency="N/A"
          color="slate"
        />
      </div>

      <div className="bg-indigo-600 rounded-[3.5rem] p-16 text-white relative overflow-hidden shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 rounded-full blur-[120px] -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div>
            <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
              <Activity className="h-8 w-8 text-white animate-pulse" />
            </div>
            <h4 className="text-4xl font-black tracking-tighter mb-4">Infrastructure Synchronicity</h4>
            <p className="text-indigo-100 font-bold leading-relaxed opacity-80 max-w-xl">
              The platform infrastructure is monitored in real-time across multiple geographic nodes. Any protocol drift is automatically corrected by the governance engine.
            </p>
          </div>
          <Button 
            onClick={fetchHealth}
            disabled={loading}
            className="h-16 px-10 bg-white text-indigo-600 hover:bg-indigo-50 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-4 transition-all active:scale-[0.98]"
          >
            {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
            Refresh Node Status
          </Button>
        </div>
      </div>
    </div>
  );
}

function HealthCard({ icon, label, status, latency, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-600 shadow-blue-200',
    emerald: 'bg-emerald-500 shadow-emerald-200',
    amber: 'bg-amber-500 shadow-amber-200',
    slate: 'bg-slate-900 shadow-slate-200'
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className={`h-14 w-14 ${colorMap[color]} rounded-2xl flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform duration-500`}>
          {icon}
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Node</span>
        </div>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-baseline gap-3">
        <h5 className="text-2xl font-black text-slate-900 tracking-tight">{status}</h5>
        <span className="text-xs font-bold text-slate-400">({latency})</span>
      </div>
    </div>
  );
}
