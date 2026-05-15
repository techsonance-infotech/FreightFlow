'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { CompanySetupWizard } from '@/components/dashboard/company-setup-wizard';
import { toast } from 'sonner';

export function NewOrganizationForm({ id, mode }: { id?: string, mode?: string }) {
  const router = useRouter();

  const handleComplete = () => {
    toast.success(mode === 'edit' ? 'Organization updated!' : 'Organization established!');
    router.push('/dashboard/settings/organizations');
    router.refresh();
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <CompanySetupWizard 
      initialId={id}
      mode={mode}
      onComplete={handleComplete}
      onClose={handleClose}
    />
  );
}
