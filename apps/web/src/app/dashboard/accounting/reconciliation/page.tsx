import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { ReconciliationManager } from '@/components/accounting/reconciliation-manager';

export default async function ReconciliationPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const bankAccounts = await prisma.bankAccount.findMany({
    where: { companyId: session.user.companyId, isActive: true },
  });

  const unreconciledLines = await prisma.journalLine.findMany({
    where: { 
      companyId: session.user.companyId,
      reconciledAt: null,
      account: {
        bankAccounts: {
          some: { companyId: session.user.companyId }
        }
      }
    },
    include: {
      journalEntry: true,
      account: true,
    },
    orderBy: { journalEntry: { date: 'desc' } }
  });

  const reconciledLines = await prisma.journalLine.findMany({
    where: { 
      companyId: session.user.companyId,
      reconciledAt: { not: null },
      account: {
        bankAccounts: {
          some: { companyId: session.user.companyId }
        }
      }
    },
    include: {
      journalEntry: true,
      account: true,
    },
    orderBy: { reconciledAt: 'desc' },
    take: 50
  });

  return (
    <div className="bg-white min-h-screen">
      <ReconciliationManager 
        bankAccounts={JSON.parse(JSON.stringify(bankAccounts))} 
        unreconciledLines={JSON.parse(JSON.stringify(unreconciledLines))}
        reconciledLines={JSON.parse(JSON.stringify(reconciledLines))}
      />
    </div>
  );
}
