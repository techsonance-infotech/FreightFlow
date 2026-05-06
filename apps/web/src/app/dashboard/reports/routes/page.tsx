import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getRouteProfitability } from '@/app/actions/reports/profitability';
import { ProfitabilityManager } from '@/components/reports/profitability-manager';

export default async function RouteProfitabilityPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const stats = await getRouteProfitability();

  return (
    <div className="bg-white min-h-screen">
      <ProfitabilityManager stats={stats} />
    </div>
  );
}
