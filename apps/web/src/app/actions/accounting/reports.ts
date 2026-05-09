'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getFinancialReports() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const companyId = session.user.companyId;

  // 1. Get all accounts with their balances (sum of journal lines)
  const accounts = await prisma.chartOfAccount.findMany({
    where: { companyId },
    include: {
      journalLines: {
        select: { debit: true, credit: true }
      }
    }
  });

  const trialBalance = accounts.map(acc => {
    const totalDebit = acc.journalLines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = acc.journalLines.reduce((sum, l) => sum + l.credit, 0);
    return {
      id: acc.id,
      code: acc.code,
      name: acc.name,
      type: acc.type,
      debit: totalDebit,
      credit: totalCredit,
      balance: totalDebit - totalCredit
    };
  });

  // 2. Calculate P&L
  // Revenue: Income accounts
  // Expenses: Expense accounts
  const pnl = {
    revenue: trialBalance.filter(a => a.type === 'income' || a.type === 'revenue'),
    expenses: trialBalance.filter(a => a.type === 'expense'),
  };

  const totalRevenue = pnl.revenue.reduce((sum, r) => sum + Math.abs(r.balance), 0);
  const totalExpenses = pnl.expenses.reduce((sum, e) => sum + Math.abs(e.balance), 0);

  return {
    trialBalance,
    pnl: {
      items: pnl,
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses
    }
  };
}
