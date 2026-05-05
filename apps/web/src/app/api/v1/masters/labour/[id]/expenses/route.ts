import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { LabourExpenseSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const search = searchParams.get('search') || '';

    const where: any = {
      labourId: id,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    };

    if (fromDate || toDate) {
      where.date = {};
      if (fromDate) where.date.gte = new Date(fromDate);
      if (toDate) where.date.lte = new Date(toDate);
    }

    if (search) {
      where.message = { contains: search, mode: 'insensitive' };
    }

    const expenses = await prisma.labourExpense.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Labour Expenses GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    // Ensure the ID from the URL is used
    body.labourId = id;
    
    const validatedData = LabourExpenseSchema.parse(body);

    const expense = await prisma.labourExpense.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Labour Expenses POST Error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
