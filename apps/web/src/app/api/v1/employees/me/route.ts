import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employee = await prisma.employee.findFirst({
      where: {
        userId: session.user.id,
        tenantId: session.user.tenantId
      },
      select: {
        id: true,
        name: true,
        empCode: true,
        designation: true
      }
    });

    if (!employee) {
      return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });
    }

    return NextResponse.json(employee);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
