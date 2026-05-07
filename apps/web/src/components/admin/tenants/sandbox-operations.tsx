'use client';

import React, { useState } from 'react';
import { 
  Copy, Rocket, ShieldCheck, 
  RefreshCw, AlertCircle, Zap,
  FlaskConical, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cloneTenant, promoteSandbox } from '@/app/actions/admin/sandbox';
import { cn } from '@/lib/utils';

export function SandboxOperations({ tenant }: { tenant: any }) {
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    setLoading(true);
    try {
      await cloneTenant(tenant.id, tenant.name);
      toast.success('Sandbox Environment Cloned Successfully');
    } catch (error) {
      toast.error('Failed to clone environment');
    } finally {
      setLoading(false);
    }
  };

  const handlePromote = async () => {
    setLoading(true);
    try {
      await promoteSandbox(tenant.id);
      toast.success('Promoted to Production Node');
    } catch (error) {
      toast.error('Promotion protocol failed');
    } finally {
      setLoading(false);
    }
  };

  const isSandbox = tenant.name.includes('(Sandbox)');

  return (
    <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-white/5 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <FlaskConical className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter">Advanced Multi-Tenancy</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-400 mt-2">Environment Cloning & Promotion Protocols</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-slate-400">
            {isSandbox ? 'SANDBOX NODE' : 'PRODUCTION NODE'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
        <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
           <div className="h-14 w-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Copy className="h-7 w-7" />
           </div>
           <h4 className="text-2xl font-black tracking-tight mb-4">Clone Workspace</h4>
           <p className="text-xs font-bold text-slate-400 leading-relaxed mb-10">
              Generate a deep copy of this environment's configuration, modules, and administrative schema into a new isolated sandbox.
           </p>
           <Button 
            onClick={handleClone}
            disabled={loading}
            className="w-full h-16 bg-white text-slate-900 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-[0.98]"
           >
              Initialize Cloning Node
              <ArrowRight className="h-5 w-5" />
           </Button>
        </div>

        <div className="p-10 bg-white/5 rounded-[2.5rem] border border-white/5 hover:bg-white/10 transition-all group">
           <div className="h-14 w-14 bg-emerald-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg">
              <Rocket className="h-7 w-7" />
           </div>
           <h4 className="text-2xl font-black tracking-tight mb-4">Promote Node</h4>
           <p className="text-xs font-bold text-slate-400 leading-relaxed mb-10">
              Migrate this sandbox's configuration into a verified production environment. Immutable verification protocols will be enforced.
           </p>
           <Button 
            onClick={handlePromote}
            disabled={loading || !isSandbox}
            className="w-full h-16 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-[0.98] disabled:opacity-30 disabled:hover:bg-emerald-500"
           >
              Execute Promotion
              <Zap className="h-5 w-5" />
           </Button>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-white/5 border border-white/5 rounded-[2rem]">
         <ShieldCheck className="h-6 w-6 text-blue-400" />
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
           Environmental isolation is maintained via strict tenant UUID segmentation. Promotion requires a multi-stage cryptographic handshake between nodes.
         </p>
      </div>
    </div>
  );
}
