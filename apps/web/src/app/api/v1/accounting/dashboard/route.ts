import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenant or company context' }, { status: 400 });
    }

    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    
    // 1. Fetch P&L Data (Revenue vs Expenses) for last 6 months
    const sixMonthsAgo = startOfMonth(subMonths(now, 5));
    const journalEntries = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        companyId,
        status: 'posted',
        date: { gte: sixMonthsAgo }
      },
      select: {
        date: true,
        voucherType: true,
        totalAmount: true
      }
    });

    const monthlyData: Record<string, { revenue: number, expense: number }> = {};
    for (let i = 0; i < 6; i++) {
      const d = subMonths(now, i);
      const key = format(d, 'MMM yy');
      monthlyData[key] = { revenue: 0, expense: 0 };
    }

    journalEntries.forEach(entry => {
      const key = format(entry.date, 'MMM yy');
      if (!monthlyData[key]) return;
      
      if (['sales', 'receipt'].includes(entry.voucherType)) {
        monthlyData[key].revenue += entry.totalAmount;
      } else if (['purchase', 'payment', 'expense'].includes(entry.voucherType)) {
        monthlyData[key].expense += entry.totalAmount;
      }
    });

    const cashFlowChart = Object.entries(monthlyData)
      .map(([name, data]) => ({ name, revenue: data.revenue / 100, expense: data.expense / 100 }))
      .reverse();

    // 2. Bank & Cash Balances
    const bankAccounts = await prisma.bankAccount.findMany({
      where: { tenantId, companyId, isActive: true },
      include: {
        chartOfAccount: {
          include: {
            journalLines: {
              select: { debit: true, credit: true }
            }
          }
        }
      }
    });

    const accountBalances = bankAccounts.map(ba => {
      const debit = ba.chartOfAccount.journalLines.reduce((sum, l) => sum + l.debit, 0);
      const credit = ba.chartOfAccount.journalLines.reduce((sum, l) => sum + l.credit, 0);
      return {
        id: ba.id,
        name: ba.accountName,
        bank: ba.bankName,
        balance: (debit - credit)
      };
    });

    // 3. AR/AP Overview (Buckets)
    // We'll do a quick aggregation here instead of calling the heavy ageing report
    const arInvoices = await prisma.freightInvoice.findMany({
      where: { tenantId, companyId, status: { not: 'paid' } },
      select: { totalAmount: true, date: true }
    });

    const apBills = await prisma.journalEntry.findMany({
      where: { 
        tenantId, 
        companyId, 
        status: 'posted',
        voucherType: { in: ['purchase', 'expense'] }
      },
      select: { totalAmount: true, date: true }
    });

    const arTotal = arInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const apTotal = apBills.reduce((sum, i) => sum + i.totalAmount, 0);

    // 4. Compliance Alerts
    const deadlines = await prisma.complianceDeadline.findMany({
      where: { 
        tenantId, 
        companyId, 
        status: 'pending',
        dueDate: { gte: now }
      },
      orderBy: { dueDate: 'asc' },
      take: 3
    });

    // 5. Pending Approvals Count
    const pendingApprovals = await prisma.journalEntry.count({
      where: { tenantId, companyId, status: { in: ['pending', 'draft'] } }
    });

    return NextResponse.json({
      data: {
        cashFlowChart,
        balances: accountBalances,
        receivables: {
          total: arTotal,
          count: arInvoices.length
        },
        payables: {
          total: apTotal,
          count: apBills.length
        },
        deadlines: deadlines.map(d => ({
          type: d.deadlineType,
          due: format(d.dueDate, 'dd MMM'),
          daysLeft: Math.ceil((d.dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24))
        })),
        pendingApprovals,
        mtdStats: {
          revenue: monthlyData[format(now, 'MMM yy')]?.revenue || 0,
          expense: monthlyData[format(now, 'MMM yy')]?.expense || 0
        }
      }
    });
  } catch (error: any) {
    console.error('Accounting Dashboard Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
