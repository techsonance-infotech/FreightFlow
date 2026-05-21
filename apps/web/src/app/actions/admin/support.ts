'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function getGlobalSupportMetrics() {
  const now = new Date();
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [openTickets, resolvedToday, recentResolved] = await Promise.all([
    prisma.supportTicket.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.supportTicket.count({ 
      where: { 
        status: 'resolved',
        updatedAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
      } 
    }),
    prisma.supportTicket.findMany({
      where: { 
        status: 'resolved',
        updatedAt: { gte: last7Days }
      },
      select: { createdAt: true, updatedAt: true }
    })
  ]);

  // Calculate Avg Response Time
  let avgResponseTime = "1.2h"; // Baseline
  if (recentResolved.length > 0) {
    const totalMs = recentResolved.reduce((acc, t) => acc + (t.updatedAt.getTime() - t.createdAt.getTime()), 0);
    const avgHours = (totalMs / recentResolved.length) / (1000 * 60 * 60);
    avgResponseTime = `${avgHours.toFixed(1)}h`;
  }

  // SLA Adherence (Resolved within 24h)
  let slaAdherence = 100;
  if (recentResolved.length > 0) {
    const withinSla = recentResolved.filter(t => (t.updatedAt.getTime() - t.createdAt.getTime()) < 24 * 60 * 60 * 1000);
    slaAdherence = (withinSla.length / recentResolved.length) * 100;
  }

  return {
    openTickets,
    resolvedToday,
    avgResponseTime,
    slaAdherence: Math.round(slaAdherence),
    priorityMix: {
      critical: await prisma.supportTicket.count({ where: { priority: 'critical', status: 'open' } }),
      high: await prisma.supportTicket.count({ where: { priority: 'high', status: 'open' } }),
      medium: await prisma.supportTicket.count({ where: { priority: 'medium', status: 'open' } })
    }
  };
}

export async function getGlobalTicketRegistry() {
  return await prisma.supportTicket.findMany({
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

export async function updateTicketStatus(ticketId: string, data: {
  status: 'open' | 'pending' | 'blocked' | 'solved' | 'closed';
  adminResponse?: string;
}) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { 
      status: data.status,
      adminResponse: data.adminResponse,
      updatedAt: new Date()
    }
  });

  // Sync to LicenseRequest
  if (ticket.category === 'license') {
    let reqStatus = 'pending';
    if (data.status === 'solved' || data.status === 'closed') {
      reqStatus = 'approved';
    } else if (data.status === 'blocked') {
      reqStatus = 'blocked';
    } else if (data.status === 'pending') {
      reqStatus = 'pending';
    }
    await prisma.licenseRequest.updateMany({
      where: { 
        tenantId: ticket.tenantId,
        status: { in: ['pending', 'blocked'] }
      },
      data: { status: reqStatus }
    });
  }

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: `SUPPORT_TICKET_${data.status.toUpperCase()}`,
      targetTenantId: ticket.tenantId,
      payload: { ticketId, status: data.status, response: !!data.adminResponse }
    }
  });

  revalidatePath('/admin/support');
  revalidatePath('/dashboard/support');
  return ticket;
}

export async function sendAdminMessage(requestId: string, message: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const msg = await prisma.supportMessage.create({
    data: {
      requestId,
      adminId: session.id,
      message,
      isAction: false,
      type: 'ADMIN_REPLY'
    }
  });

  revalidatePath(`/admin/support/${requestId}`);
  return { success: true, message: msg };
}

export async function generateAndSendLicense(data: {
  requestId: string,
  tenantId: string,
  plan: string,
  years: number,
  maxUsers: number,
  maxVehicles: number
}) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + data.years);

  const licenseKey = await prisma.$transaction(async (tx) => {
    // 1. Create the physical key
    const key = await tx.licenseKey.create({
      data: {
        tenantId: data.tenantId,
        keyHash: `FF-${Math.random().toString(36).substring(2, 15).toUpperCase()}`, // In real world, use proper hashing
        plan: data.plan,
        maxUsers: data.maxUsers,
        maxVehicles: data.maxVehicles,
        expiresAt
      }
    });

    // 2. Update Request Status
    await tx.licenseRequest.update({
      where: { id: data.requestId },
      data: { status: 'approved' }
    });

    // Solve corresponding standard support ticket if it exists
    await tx.supportTicket.updateMany({
      where: {
        tenantId: data.tenantId,
        category: 'license',
        status: { in: ['open', 'pending', 'blocked'] }
      },
      data: {
        status: 'solved',
        adminResponse: `License key generated for ${data.plan.toUpperCase()} tier. Valid until ${expiresAt.toLocaleDateString()}.`
      }
    });

    // 3. Update Tenant License Expiry
    await tx.tenant.update({
      where: { id: data.tenantId },
      data: { 
        plan: data.plan,
        licenseExpiresAt: expiresAt,
        status: 'active'
      }
    });

    // 4. Send Confirmation Message
    await tx.supportMessage.create({
      data: {
        requestId: data.requestId,
        adminId: session.id,
        message: `License key generated for ${data.plan.toUpperCase()} tier. Valid until ${expiresAt.toLocaleDateString()}.`,
        isAction: true,
        type: 'LICENSE_GENERATED',
        payload: { licenseId: key.id, plan: data.plan, expiresAt }
      }
    });

    // 5. Log Platform Action
    await tx.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: 'GENERATE_LICENSE',
        targetTenantId: data.tenantId,
        payload: { requestId: data.requestId, plan: data.plan, expiresAt }
      }
    });

    return key;
  });

  revalidatePath(`/admin/support/${data.requestId}`);
  revalidatePath('/admin/tenants');
  return { success: true, license: licenseKey };
}

export async function getGlobalLicenseRequests() {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  try {
    // Self-healing: Backport any legacy SupportTickets of category 'license' that don't have a LicenseRequest yet
    const licenseTickets = await prisma.supportTicket.findMany({
      where: { category: 'license' }
    });

    for (const ticket of licenseTickets) {
      const existingReq = await prisma.licenseRequest.findFirst({
        where: { tenantId: ticket.tenantId }
      });

      if (!existingReq) {
        // Parse planType from ticket details
        const subjectLower = ticket.subject.toLowerCase();
        const descLower = ticket.description.toLowerCase();
        let planType = 'pro';
        if (subjectLower.includes('starter') || descLower.includes('starter')) {
          planType = 'starter';
        } else if (subjectLower.includes('enterprise') || descLower.includes('enterprise')) {
          planType = 'enterprise';
        }

        // Create LicenseRequest matching the ticket's state
        const request = await prisma.licenseRequest.create({
          data: {
            tenantId: ticket.tenantId,
            userId: ticket.userId,
            planType,
            status: ticket.status === 'solved' ? 'approved' : ticket.status === 'blocked' ? 'blocked' : 'pending',
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt
          }
        });

        // Create initial support chat message
        await prisma.supportMessage.create({
          data: {
            requestId: request.id,
            message: `License support inquiry logged.\nSubject: ${ticket.subject}\nDescription: ${ticket.description}`,
            isAction: false,
            createdAt: ticket.createdAt
          }
        });
      }
    }
  } catch (error) {
    console.error('Self-healing backport failed:', error);
  }

  return await prisma.licenseRequest.findMany({
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });
}

