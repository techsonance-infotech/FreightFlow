'use client';

import React, { useState } from 'react';
import { 
  Zap, ToggleLeft, ToggleRight, 
  ShieldCheck, AlertCircle, RefreshCw,
  Box, Terminal, Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { toggleFeatureFlag, updateFlagStatus } from '@/app/actions/admin/feature-flags';
import { cn } from '@/lib/utils';

export function FlagMatrix({ flags }: { flags: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (flagId: string, current: boolean) => {
    setLoading(flagId);
    try {
      await toggleFeatureFlag(flagId, !current);
      toast.success('Feature flag state updated');
    } catch (error) {
      toast.error('Failed to update flag state');
    } finally {
      setLoading(null);
    }
  };

  const handleStatusChange = async (flagId: string, status: any) => {
    setLoading(flagId);
    try {
      await updateFlagStatus(flagId, status);
      toast.success(`Flag status moved to ${status.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to update flag status');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-500/20 rotate-3 group-hover:rotate-0 transition-transform">
            <Zap className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Feature Matrix</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Global Module & Flag Governance Engine</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-[9px] font-black uppercase tracking-widest">
            {flags.filter(f => f.globalEnabled).length} Nodes Active
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {flags.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <Box className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Feature Flags Defined in Platform Node</p>
          </div>
        ) : flags.map((flag) => (
          <div key={flag.id} className="group flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-200 transition-all">
                <Terminal className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{flag.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                   <span className={cn(
                     "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                     flag.status === 'ga' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                     flag.status === 'beta' ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-100 text-slate-500 border-slate-200"
                   )}>
                     STATUS: {flag.status.toUpperCase()}
                   </span>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                     Target: {flag.tenantIds.length} Beta Nodes
                   </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-8">
               <div className="flex bg-white p-1.5 rounded-xl border border-slate-100">
                  <StatusButton active={flag.status === 'disabled'} onClick={() => handleStatusChange(flag.id, 'disabled')}>OFF</StatusButton>
                  <StatusButton active={flag.status === 'beta'} onClick={() => handleStatusChange(flag.id, 'beta')}>BETA</StatusButton>
                  <StatusButton active={flag.status === 'ga'} onClick={() => handleStatusChange(flag.id, 'ga')}>GA</StatusButton>
               </div>
               
               <div className="h-12 w-px bg-slate-100" />
               
               <button 
                onClick={() => handleToggle(flag.id, flag.globalEnabled)}
                disabled={!!loading}
                className={cn(
                  "h-14 w-24 rounded-2xl flex items-center px-2 transition-all shadow-inner border",
                  flag.globalEnabled ? "bg-indigo-600 border-indigo-700 justify-end shadow-indigo-900/20" : "bg-slate-200 border-slate-300 justify-start"
                )}
               >
                  <div className="h-10 w-10 bg-white rounded-xl shadow-xl flex items-center justify-center">
                    {flag.globalEnabled ? <Zap className="h-5 w-5 text-indigo-600" /> : <RefreshCw className="h-5 w-5 text-slate-300" />}
                  </div>
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem]">
         <ShieldCheck className="h-6 w-6 text-indigo-600" />
         <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest leading-relaxed">
           Feature flags provide granular control over module accessibility. 'GA' (General Availability) flags override tenant-level toggles for platform-wide enforcement.
         </p>
      </div>
    </div>
  );
}

function StatusButton({ active, children, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-10 px-6 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
        active ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}
