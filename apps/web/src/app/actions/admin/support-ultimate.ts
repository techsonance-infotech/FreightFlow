'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function dispatchPaymentInfo(requestId: string, paymentData: any) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.supportMessage.create({
    data: {
      requestId,
      adminId: session.id,
      message: 'Payment information dispatched.',
      isAction: true,
      type: 'PAYMENT_INFO',
      payload: paymentData as any
    }
  });

  revalidatePath(`/admin/support/${requestId}`);
  return { success: true };
}

export async function updateTicketStatus(requestId: string, status: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.$transaction([
    prisma.licenseRequest.update({
      where: { id: requestId },
      data: { status }
    }),
    prisma.supportMessage.create({
      data: {
        requestId,
        adminId: session.id,
        message: `Ticket status updated to ${status.toUpperCase()}.`,
        isAction: true,
        type: 'STATUS_CHANGE',
        payload: { status }
      }
    }),
    prisma.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: 'SUPPORT_STATUS_CHANGE',
        payload: { requestId, newStatus: status }
      }
    })
  ]);

  revalidatePath(`/admin/support/${requestId}`);
  revalidatePath('/admin/support');
  return { success: true };
}

export async function sendInternalNote(requestId: string, message: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.supportMessage.create({
    data: {
      requestId,
      adminId: session.id,
      message,
      isAction: false,
      type: 'INTERNAL_NOTE'
    }
  });

  revalidatePath(`/admin/support/${requestId}`);
  return { success: true };
}

export async function claimTicket(requestId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  await prisma.supportMessage.create({
    data: {
      requestId,
      adminId: session.id,
      message: `Ticket claimed by Lead Admin (${session.email}).`,
      isAction: true,
      type: 'TICKET_CLAIM'
    }
  });

  revalidatePath(`/admin/support/${requestId}`);
  return { success: true };
}
