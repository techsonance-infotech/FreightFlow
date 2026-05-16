import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getScheduledReports } from '@/app/actions/reports/scheduler';
import { ReportSchedulerManager } from '@/components/reports/report-scheduler-manager';

export default async function ReportSchedulerPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const reports = await getScheduledReports();

  return (
    <ReportSchedulerManager reports={reports} />
  );
}
