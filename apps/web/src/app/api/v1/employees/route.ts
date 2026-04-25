import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employees = await prisma.employee.findMany({
      where: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
      },
      select: {
        id: true,
        name: true,
        empCode: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(employees);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
