import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getMaintenanceSchedules } from '@/app/actions/fleet/maintenance';
import { MaintenanceScheduleManager } from '@/components/fleet/maintenance-schedule-manager';

export default async function MaintenanceSchedulesPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const schedules = await getMaintenanceSchedules();

  return (
    <div className="bg-white min-h-screen">
      <MaintenanceScheduleManager schedules={schedules} />
    </div>
  );
}
