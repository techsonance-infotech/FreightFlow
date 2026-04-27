import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    // 1. Monthly Expense Trend (Last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyExpenses = await prisma.labourExpense.groupBy({
      by: ['type', 'date'],
      where: {
        tenantId,
        companyId,
        date: { gte: sixMonthsAgo },
      },
      _sum: { amount: true },
    });

    // 2. Skill Category Distribution
    const skillDistribution = await prisma.labour.groupBy({
      by: ['skillCategory'],
      where: { tenantId, companyId, isActive: true },
      _count: { id: true },
    });

    // 3. Top Workers by Advances
    const topAdvances = await prisma.labourExpense.groupBy({
      by: ['labourId'],
      where: {
        tenantId,
        companyId,
        type: 'Advance',
      },
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
      take: 5,
    });

    const labourNames = await prisma.labour.findMany({
      where: { id: { in: topAdvances.map(a => a.labourId) } },
      select: { id: true, name: true },
    });

    const enrichedAdvances = topAdvances.map(a => ({
      name: labourNames.find(l => l.id === a.labourId)?.name || 'Unknown',
      amount: a._sum.amount || 0,
    }));

    return NextResponse.json({
      monthlyExpenses,
      skillDistribution,
      topAdvances: enrichedAdvances,
    });
  } catch (error) {
    console.error('Analytics GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
