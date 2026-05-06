import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getComplianceStats } from '@/app/actions/fleet/compliance';
import { ComplianceManager } from '@/components/fleet/compliance-manager';

export default async function FleetCompliancePage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const { stats, vehicles } = await getComplianceStats();

  return (
    <div className="bg-white min-h-screen">
      <ComplianceManager stats={stats} vehicles={vehicles} />
    </div>
  );
}
