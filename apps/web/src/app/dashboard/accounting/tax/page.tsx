import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getTaxSummary } from '@/app/actions/accounting/tax';
import { TaxCenter } from '@/components/accounting/tax-center';

export default async function TaxCenterPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const summary = await getTaxSummary();

  return (
    <div className="bg-white min-h-screen">
      <TaxCenter summary={JSON.parse(JSON.stringify(summary))} />
    </div>
  );
}
