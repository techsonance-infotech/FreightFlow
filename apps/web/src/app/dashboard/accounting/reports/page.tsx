import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getFinancialReports } from '@/app/actions/accounting/reports';
import { FinancialStatements } from '@/components/accounting/financial-statements';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const reports = await getFinancialReports();

  return (
    <div className="bg-white min-h-screen">
      <FinancialStatements reports={JSON.parse(JSON.stringify(reports))} />
    </div>
  );
}
