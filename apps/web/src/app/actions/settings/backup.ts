'use server';

import { getSession } from '@/lib/auth-utils';
import { requestBackupOTP, verifyBackupOTP, BackupOtpPurpose, validateBackupAuthToken } from '@/lib/backup-otp';
import { createBackup, restoreBackup, deleteBackup, generateBackupDownloadUrl } from '@/lib/backup-service';
import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';

export async function requestBackupOtp(purpose: BackupOtpPurpose) {
  try {
    return await requestBackupOTP(purpose);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function verifyBackupOtp(purpose: BackupOtpPurpose, otp: string) {
  try {
    return await verifyBackupOTP(purpose, otp);
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function createBackupAction(authToken: string, name?: string) {
  const session = await getSession();
  if (!session?.user?.tenantId || !session?.user?.companyId) {
    throw new Error('Unauthorized');
  }

  const auth = await validateBackupAuthToken(authToken, 'BACKUP_CREATE');
  if (!auth || auth.tenantId !== session.user.tenantId) {
    throw new Error('Invalid or expired OTP authorization');
  }

  const jobId = await createBackup({
    tenantId: session.user.tenantId,
    companyId: session.user.companyId,
    userId: session.user.id,
    type: 'manual',
    name,
  });

  revalidatePath('/dashboard/settings/backup');
  return { success: true, jobId };
}

export async function deleteBackupAction(backupId: string, authToken: string) {
  const session = await getSession();
  if (!session?.user?.tenantId) {
    throw new Error('Unauthorized');
  }

  const auth = await validateBackupAuthToken(authToken, 'BACKUP_DELETE');
  if (!auth || auth.tenantId !== session.user.tenantId) {
    throw new Error('Invalid or expired OTP authorization');
  }

  await deleteBackup(backupId, session.user.tenantId);

  // Log to audit log
  await prisma.auditLog.create({
    data: {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId || '',
      userId: session.user.id,
      action: 'settings.updated',
      entityType: 'BackupJob',
      entityId: backupId,
      changes: { action: 'deleted' },
    },
  });

  revalidatePath('/dashboard/settings/backup');
  return { success: true };
}

export async function updateBackupScheduleAction(
  authToken: string,
  schedule: {
    enabled: boolean;
    frequency: string;
    retentionDays: number;
    backupType: string;
  }
) {
  const session = await getSession();
  if (!session?.user?.tenantId || !session?.user?.companyId) {
    throw new Error('Unauthorized');
  }

  const auth = await validateBackupAuthToken(authToken, 'BACKUP_SCHEDULE_CHANGE');
  if (!auth || auth.tenantId !== session.user.tenantId) {
    throw new Error('Invalid or expired OTP authorization');
  }

  const result = await prisma.backupSchedule.upsert({
    where: {
      tenantId_companyId: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
      },
    },
    update: {
      enabled: schedule.enabled,
      frequency: schedule.frequency,
      retentionDays: schedule.retentionDays,
      backupType: schedule.backupType,
      updatedBy: session.user.id,
    },
    create: {
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
      enabled: schedule.enabled,
      frequency: schedule.frequency,
      retentionDays: schedule.retentionDays,
      backupType: schedule.backupType,
      updatedBy: session.user.id,
    },
  });

  revalidatePath('/dashboard/settings/backup');
  return { success: true, schedule: result };
}
