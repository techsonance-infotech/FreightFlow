'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getScheduledReports() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const reports = await prisma.scheduledReport.findMany({
    where: { companyId: session.user.companyId },
    orderBy: { createdAt: 'desc' }
  });

  return JSON.parse(JSON.stringify(reports));
}

export async function createScheduledReport(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const nextRunAt = new Date();
  if (data.schedule === 'daily') nextRunAt.setDate(nextRunAt.getDate() + 1);
  else if (data.schedule === 'weekly') nextRunAt.setDate(nextRunAt.getDate() + 7);
  else if (data.schedule === 'monthly') nextRunAt.setMonth(nextRunAt.getMonth() + 1);

  await prisma.scheduledReport.create({
    data: {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      reportType: data.reportType,
      schedule: data.schedule,
      recipientEmails: data.recipientEmails,
      parameters: data.parameters || {},
      nextRunAt,
      isActive: true,
    }
  });

  revalidatePath('/dashboard/reports/scheduler');
  return { success: true };
}

export async function toggleReportSchedule(id: string, isActive: boolean) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.scheduledReport.update({
    where: { id, companyId: session.user.companyId },
    data: { isActive }
  });

  revalidatePath('/dashboard/reports/scheduler');
  return { success: true };
}
