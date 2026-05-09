'use client';

import React, { useState } from 'react';
import { 
  Globe, Plus, ShieldCheck, 
  Trash2, Zap, Activity,
  Server, Lock, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createWebhook } from '@/app/actions/admin/integrations';
import { cn } from '@/lib/utils';

export function WebhookManager({ tenantId, webhooks }: { tenantId: string, webhooks: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleCreateWebhook = async () => {
    setLoading(true);
    try {
      await createWebhook(tenantId, 'https://api.external-system.com/webhooks/ff-events', ['trip.created', 'trip.completed', 'invoice.paid']);
      toast.success('Webhook Node Initialized');
    } catch (error) {
      toast.error('Failed to initialize webhook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-emerald-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-6">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Event Sovereignty</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Webhook Configuration & Event Pipelines</p>
          </div>
        </div>
        <Button 
          onClick={handleCreateWebhook}
          disabled={loading}
          className="h-16 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl transition-all active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Initialize Endpoint
        </Button>
      </div>

      <div className="space-y-6 relative z-10">
        {webhooks.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <Activity className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active Webhook Endpoints Configured</p>
          </div>
        ) : webhooks.map((hook) => (
          <div key={hook.id} className="group flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-emerald-500 group-hover:border-emerald-200 transition-all">
                <Server className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{hook.url}</h4>
                <div className="flex items-center gap-4 mt-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Zap className="h-3 w-3 text-amber-500" /> {hook.events.length} Events Synced
                   </p>
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-emerald-100">
                     STATUS: {hook.status.toUpperCase()}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">SIGNING SECRET</p>
                  <code className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-500 border border-slate-200">
                    whsec_{hook.secret.slice(0, 8)}...
                  </code>
               </div>
               <div className="h-12 w-px bg-slate-100" />
               <button className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 transition-all">
                  <ArrowRight className="h-5 w-5" />
               </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-emerald-50 border border-emerald-100 rounded-[2rem]">
         <ShieldCheck className="h-6 w-6 text-emerald-600" />
         <p className="text-[10px] font-black text-emerald-900 uppercase tracking-widest leading-relaxed">
           Webhook endpoints enable real-time platform extensibility. Every event payload is signed with the endpoint secret to ensure immutable data integrity during transit.
         </p>
      </div>
    </div>
  );
}
