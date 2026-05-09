'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { approveLicenseRequest } from '@/app/actions/admin/licenses';
import { toast } from 'sonner';

export function LicenseApproveButton({ requestId }: { requestId: string }) {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      const res = await approveLicenseRequest(requestId);
      if (res.success) {
        toast.success('License request approved and key dispatched.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Approval failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={loading}
      className="h-10 px-4 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
      {loading ? 'Processing...' : 'Approve'}
    </button>
  );
}
