'use server';

import { prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getAdminSession } from './auth';

export async function getTenantInvoices(tenantId: string) {
  return await prisma.platformInvoice.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' }
  });
}

export async function generateInvoice(tenantId: string, amount: number, items: any[], dueDate: Date) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const invoiceCount = await prisma.platformInvoice.count();
  const invoiceNumber = `INV-${new Date().getFullYear()}-${(invoiceCount + 1).toString().padStart(5, '0')}`;

  const invoice = await prisma.platformInvoice.create({
    data: {
      tenantId,
      invoiceNumber,
      amount,
      items,
      dueDate,
      status: 'unpaid'
    }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: 'INVOICE_GENERATED',
      targetTenantId: tenantId,
      payload: { invoiceId: invoice.id, amount, invoiceNumber }
    }
  });

  revalidatePath(`/admin/tenants/${tenantId}`);
  return invoice;
}

export async function markInvoiceAsPaid(invoiceId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const invoice = await prisma.platformInvoice.update({
    where: { id: invoiceId },
    data: { 
      status: 'paid',
      paidAt: new Date()
    }
  });

  // Log the action
  await prisma.auditLogPlatform.create({
    data: {
      adminId: session.id,
      action: 'INVOICE_PAID',
      targetTenantId: invoice.tenantId,
      payload: { invoiceId: invoice.id, amount: invoice.amount }
    }
  });

  revalidatePath(`/admin/tenants/${invoice.tenantId}`);
  return invoice;
}
