import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const where: any = {
      vehicleId: id,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    };

    if (fromDate || toDate) {
      where.assignedAt = {};
      if (fromDate) where.assignedAt.gte = new Date(fromDate);
      if (toDate) where.assignedAt.lte = new Date(toDate);
    }

    if (search) {
      where.labour = {
        name: { contains: search, mode: 'insensitive' }
      };
    }

    if (!(prisma as any).driverAssignment) {
      console.error('Prisma model "driverAssignment" is missing. Available models:', Object.keys(prisma).filter(k => !k.startsWith('_')));
      return NextResponse.json({ error: 'Database model synchronization issue. Please restart the dev server.' }, { status: 500 });
    }

    const assignments = await (prisma as any).driverAssignment.findMany({
      where,
      include: {
        labour: {
          select: { name: true, phone: true }
        }
      },
      orderBy: {
        assignedAt: 'desc'
      }
    });

    return NextResponse.json({ data: assignments });
  } catch (error: any) {
    console.error('Assignments GET Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
