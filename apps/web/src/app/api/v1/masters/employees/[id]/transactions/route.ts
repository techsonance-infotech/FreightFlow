import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { EmployeeTransactionSchema } from '@freightflow/shared';
import { getSession } from '@/lib/auth-utils';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search');

    const where: any = {
      employeeId: id,
      tenantId: session.user.tenantId,
    };

    if (fromDate && toDate) {
      where.date = {
        gte: new Date(fromDate),
        lte: new Date(toDate),
      };
    }

    if (search) {
      where.message = { contains: search, mode: 'insensitive' };
    }

    const transactions = await prisma.employeeTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = EmployeeTransactionSchema.parse(body);

    const transaction = await prisma.employeeTransaction.create({
      data: {
        ...validated,
        employeeId: id,
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        date: new Date(validated.date),
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
