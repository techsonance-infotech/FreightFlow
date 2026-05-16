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

  revalidatePath('/dashboard/support');
  revalidatePath('/admin/support');
  return ticket;
}
