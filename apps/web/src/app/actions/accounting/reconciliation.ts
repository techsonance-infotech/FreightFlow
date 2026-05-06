'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

export async function reconcileTransaction(lineId: string, statementRef: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.journalLine.update({
    where: { 
      id: lineId,
      companyId: session.user.companyId 
    },
    data: {
      reconciledAt: new Date(),
      statementRef,
    },
  });

  revalidatePath('/dashboard/accounting/reconciliation');
  return { success: true };
}

export async function unreconcileTransaction(lineId: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  await prisma.journalLine.update({
    where: { 
      id: lineId,
      companyId: session.user.companyId 
    },
    data: {
      reconciledAt: null,
      statementRef: null,
    },
  });

  revalidatePath('/dashboard/accounting/reconciliation');
  return { success: true };
}
