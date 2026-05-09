import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getTenantSettings } from '@/app/actions/settings/business';
import { BusinessConfigDashboard } from '@/components/dashboard/business-config-dashboard';

export default async function BusinessSettingsPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  // Must be owner or admin to access
  if (session.user.role !== 'tenant_owner' && session.user.role !== 'fleet_owner') {
    redirect('/dashboard/settings');
  }

  const settings = await getTenantSettings();

  return <BusinessConfigDashboard initialSettings={settings} />;
}
