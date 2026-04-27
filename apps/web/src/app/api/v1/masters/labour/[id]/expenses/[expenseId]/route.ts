import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { LabourExpenseSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const validatedData = LabourExpenseSchema.partial().parse(body);

    const updated = await prisma.labourExpense.update({
      where: { 
        id: expenseId,
        labourId: id,
        tenantId: session.user.tenantId,
        companyId: session.user.companyId 
      },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Labour Expense PATCH Error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; expenseId: string }> }
) {
  try {
    const { id, expenseId } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.labourExpense.delete({
      where: { 
        id: expenseId,
        labourId: id,
        tenantId: session.user.tenantId,
        companyId: session.user.companyId 
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Labour Expense DELETE Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
