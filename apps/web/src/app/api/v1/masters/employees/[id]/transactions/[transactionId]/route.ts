import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { EmployeeTransactionSchema } from '@freightflow/shared';
import { getSession } from '@/lib/auth-utils';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  try {
    const { id, transactionId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validated = EmployeeTransactionSchema.partial().parse(body);

    const transaction = await prisma.employeeTransaction.update({
      where: { 
        id: transactionId,
        tenantId: session.user.tenantId 
      },
      data: {
        ...validated,
        date: validated.date ? new Date(validated.date) : undefined,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; transactionId: string }> }
) {
  try {
    const { id, transactionId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await prisma.employeeTransaction.delete({
      where: { 
        id: transactionId,
        tenantId: session.user.tenantId 
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
