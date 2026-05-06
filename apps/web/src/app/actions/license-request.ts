'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function getMyLicenseRequest() {
  const session = await getSession();
  if (!session || !session.user) return null;

  try {
    const request = await prisma.licenseRequest.findFirst({
      where: { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { name: true, role: true } }, admin: { select: { email: true, role: true } } }
        }
      }
    });

    return request;
  } catch (error) {
    console.error('Failed to get license request:', error);
    return null;
  }
}

export async function createLicenseRequest(planType: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error('Unauthorized');

    // Check if an active request exists
    const existing = await prisma.licenseRequest.findFirst({
      where: { tenantId: session.user.tenantId, status: 'pending' }
    });

    if (existing) {
      throw new Error('You already have a pending license request.');
    }

    const request = await prisma.licenseRequest.create({
      data: {
        tenantId: session.user.tenantId,
        userId: session.user.id,
        planType,
        status: 'pending'
      }
    });

    // Create an initial system message
    await prisma.supportMessage.create({
      data: {
        requestId: request.id,
        message: `License upgrade requested for ${planType.toUpperCase()} plan. An admin will connect with you shortly.`,
        isAction: true,
      }
    });

    revalidatePath('/dashboard/support');
    return { success: true, data: request };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to create request.' };
  }
}

export async function sendSupportMessage(requestId: string, text: string) {
  try {
    const session = await getSession();
    if (!session || !session.user) throw new Error('Unauthorized');

    await prisma.supportMessage.create({
      data: {
        requestId,
        senderId: session.user.id,
        message: text.trim(),
        isAction: false,
      }
    });

    revalidatePath('/dashboard/support');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Failed to send message.' };
  }
}
