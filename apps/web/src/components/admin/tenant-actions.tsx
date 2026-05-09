'use client';

import React, { useState } from 'react';
import { Ban, CheckCircle2, History, MoreHorizontal, Loader2, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toggleTenantStatus } from '@/app/actions/admin/tenants';
import { impersonateTenant } from '@/app/actions/admin/impersonate';
import { toast } from 'sonner';
import Link from 'next/link';

interface TenantActionsProps {
  tenantId: string;
  status: string;
}

export function TenantActions({ tenantId, status }: TenantActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isShadowLoading, setIsShadowLoading] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const res = await toggleTenantStatus(tenantId, status);
      toast.success(`Tenant ${res.status === 'active' ? 'reactivated' : 'suspended'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShadow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShadowLoading(true);
    try {
      const result = await impersonateTenant(tenantId);
      if (result.success) {
        toast.success('Shadowing session initialized.');
        window.location.href = result.redirectUrl;
      }
    } catch (err: any) {
      toast.error(err.message || 'Shadow mode failed');
    } finally {
      setIsShadowLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity relative z-50">
      <Link href={`/admin/tenants/${tenantId}`}>
        <Button variant="ghost" className="h-10 w-10 p-0 hover:bg-blue-500/10 hover:text-blue-500 rounded-xl">
          <Eye className="h-4 w-4" />
        </Button>
      </Link>
      
      <Button 
        variant="ghost" 
        onClick={handleShadow}
        disabled={isShadowLoading}
        className="h-10 w-10 p-0 hover:bg-slate-900 hover:text-white rounded-xl transition-all"
      >
        {isShadowLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Zap className="h-4 w-4" />
        )}
      </Button>

      <Button 
        variant="ghost" 
        onClick={handleToggle}
        disabled={isLoading}
        className={`h-10 w-10 p-0 rounded-xl transition-all ${
          status === 'active' 
            ? 'hover:bg-red-500/10 hover:text-red-500' 
            : 'hover:bg-emerald-500/10 hover:text-emerald-500'
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : status === 'active' ? (
          <Ban className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
