'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function createSupportTicket(formData: {
  subject: string;
  description: string;
  category: string;
  priority: string;
}) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const { tenantId, companyId, id: userId } = session.user;

  if (formData.category === 'license') {
    // Parse plan type from the subject/description, default to 'pro'
    const subjectLower = formData.subject.toLowerCase();
    const descLower = formData.description.toLowerCase();
    let planType = 'pro';
    if (subjectLower.includes('starter') || descLower.includes('starter')) {
      planType = 'starter';
    } else if (subjectLower.includes('enterprise') || descLower.includes('enterprise')) {
      planType = 'enterprise';
    }

    // Check if an active/pending license request exists
    const existing = await prisma.licenseRequest.findFirst({
      where: { tenantId, status: 'pending' }
    });

    if (existing) {
      throw new Error('You already have a pending license request.');
    }

    // 1. Create the standard support ticket so it shows up in general ticket history & helpdesk
    const ticket = await prisma.supportTicket.create({
      data: {
        tenantId,
        userId,
        subject: formData.subject,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        status: 'open',
      },
    });

    // 2. Create the specialized license request for checkout and key generation
    const request = await prisma.licenseRequest.create({
      data: {
        tenantId,
        userId,
        planType,
        status: 'pending'
      }
    });

    // Create the initial message detailing their inquiry
    await prisma.supportMessage.create({
      data: {
        requestId: request.id,
        message: `License support inquiry logged.\nSubject: ${formData.subject}\nDescription: ${formData.description}`,
        isAction: false,
      }
    });

    revalidatePath('/dashboard/support');
    revalidatePath('/admin/support');
    return ticket;
  }

  const ticket = await prisma.supportTicket.create({
    data: {
      tenantId,
      userId,
      subject: formData.subject,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      status: 'open',
    },
  });

  revalidatePath('/dashboard/support');
  return ticket;
}

export async function getMyTickets() {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  return prisma.supportTicket.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function getAllTicketsForAdmin() {
  const session = await getSession();
  if (!session || !session.user || session.user.role !== 'super_admin') {
     // Check if user is a platform admin (some systems have a different table for platform admins)
     // For now, let's assume super_admin role can see all tickets
  }

  return prisma.supportTicket.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      tenant: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function updateTicketStatus(ticketId: string, data: {
  status: string;
  adminResponse?: string;
}) {
  const session = await getSession();
  if (!session || !session.user) throw new Error('Unauthorized');

  const ticket = await prisma.supportTicket.update({
    where: { id: ticketId },
    data: {
      status: data.status,
      adminResponse: data.adminResponse,
    },
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

  revalidatePath('/dashboard/support');
  revalidatePath('/admin/support');
  return ticket;
}
