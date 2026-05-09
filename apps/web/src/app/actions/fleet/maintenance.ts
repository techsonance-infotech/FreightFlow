'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getMaintenanceSchedules() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const schedules = await prisma.maintenanceSchedule.findMany({
    where: { companyId: session.user.companyId },
    include: {
      vehicle: {
        select: { regNo: true, odometer: true }
      }
    },
    orderBy: { nextDueDate: 'asc' }
  });

  return JSON.parse(JSON.stringify(schedules));
}

export async function createSchedule(data: any) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const nextDueKm = data.intervalKm ? parseInt(data.lastServiceKm) + parseInt(data.intervalKm) : null;
  
  let nextDueDate = null;
  if (data.intervalDays) {
    nextDueDate = new Date(data.lastServiceDate);
    nextDueDate.setDate(nextDueDate.getDate() + parseInt(data.intervalDays));
  }

  await prisma.maintenanceSchedule.create({
    data: {
      ...data,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      lastServiceKm: parseInt(data.lastServiceKm),
      lastServiceDate: new Date(data.lastServiceDate),
      intervalKm: data.intervalKm ? parseInt(data.intervalKm) : null,
      intervalDays: data.intervalDays ? parseInt(data.intervalDays) : null,
      nextDueKm,
      nextDueDate,
    }
  });

  revalidatePath('/dashboard/maintenance/schedules');
  return { success: true };
}

export async function updateScheduleStatus(id: string, status: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.maintenanceSchedule.update({
    where: { id, companyId: session.user.companyId },
    data: { status }
  });

  revalidatePath('/dashboard/maintenance/schedules');
  return { success: true };
}
