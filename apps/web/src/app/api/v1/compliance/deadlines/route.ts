import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId in session' }, { status: 400 });
    }

    // Fetch deadlines for the next 30 days that are pending
    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const deadlines = await prisma.complianceDeadline.findMany({
      where: {
        tenantId,
        companyId,
        status: 'pending',
        dueDate: {
          gte: today,
          lte: nextMonth
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    return NextResponse.json({ data: deadlines });
  } catch (error: any) {
    console.error('Error fetching compliance deadlines:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch compliance deadlines' }, { status: 500 });
  }
}
