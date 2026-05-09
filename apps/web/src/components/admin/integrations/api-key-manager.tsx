'use client';

import React, { useState } from 'react';
import { 
  Key, Plus, ShieldCheck, 
  Trash2, Copy, Zap, 
  Clock, Globe, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createApiKey, revokeApiKey } from '@/app/actions/admin/integrations';
import { cn } from '@/lib/utils';

export function ApiKeyManager({ tenantId, apiKeys }: { tenantId: string, apiKeys: any[] }) {
  const [loading, setLoading] = useState(false);

  const handleCreateKey = async () => {
    setLoading(true);
    try {
      await createApiKey(tenantId, 'Production Node Key');
      toast.success('New API Key Generated');
    } catch (error) {
      toast.error('Failed to generate API Key');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await revokeApiKey(id);
      toast.success('API Key Revoked');
    } catch (error) {
      toast.error('Failed to revoke key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Key copied to clipboard');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">API Sovereignty</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Managed Authentication Nodes</p>
          </div>
        </div>
        <Button 
          onClick={handleCreateKey}
          disabled={loading}
          className="h-16 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl transition-all active:scale-[0.98]"
        >
          <Plus className="h-5 w-5" />
          Generate Access Token
        </Button>
      </div>

      <div className="space-y-6 relative z-10">
        {apiKeys.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <Key className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Active API Tokens Defined</p>
          </div>
        ) : apiKeys.map((key) => (
          <div key={key.id} className="group flex items-center justify-between p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight">{key.name}</h4>
                <div className="flex items-center gap-4 mt-1">
                   <code className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-mono text-slate-500 border border-slate-200">
                     {key.key.slice(0, 12)}****************{key.key.slice(-4)}
                   </code>
                   <span className={cn(
                     "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                     key.status === 'active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                   )}>
                     {key.status.toUpperCase()}
                   </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                onClick={() => copyToClipboard(key.key)}
                className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-blue-600 transition-all"
               >
                  <Copy className="h-5 w-5" />
               </button>
               {key.status === 'active' && (
                 <button 
                  onClick={() => handleRevoke(key.id)}
                  className="h-12 w-12 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 hover:text-rose-600 hover:border-rose-100 transition-all"
                 >
                    <Trash2 className="h-5 w-5" />
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 flex items-center gap-4 p-8 bg-blue-50 border border-blue-100 rounded-[2rem]">
         <Zap className="h-6 w-6 text-blue-600" />
         <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest leading-relaxed">
           API tokens are cryptographically secured and assigned to specific workspace environments. Revocation is immediate and irreversible across the global edge network.
         </p>
      </div>
    </div>
  );
}
