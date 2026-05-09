'use client';

import React, { useState } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import { impersonateTenant } from '@/app/actions/admin/impersonate';
import { toast } from 'sonner';

export function ShadowModeButton({ tenantId }: { tenantId: string }) {
  const [loading, setLoading] = useState(false);

  const handleLaunch = async () => {
    try {
      setLoading(true);
      const result = await impersonateTenant(tenantId);
      
      if (result.success) {
        toast.success('Shadowing session initialized. Redirecting...');
        window.location.href = result.redirectUrl;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize shadow mode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleLaunch}
      disabled={loading}
      className="h-14 px-8 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
      {loading ? 'Initializing...' : 'Launch Shadow Mode'}
    </button>
  );
}
