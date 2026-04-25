import { NextResponse } from 'next/server';
import { HRService } from '@/services/hr-service';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const leaves = await prisma.leave.findMany({
      where: {
        companyId: session.user.companyId
      },
      include: {
        employee: { select: { name: true, empCode: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ data: leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const result = await HRService.applyLeave(
      session.user.tenantId,
      session.user.companyId,
      body.employeeId,
      {
        leaveType: body.leaveType,
        fromDate: new Date(body.fromDate),
        toDate: new Date(body.toDate),
        reason: body.reason
      }
    );

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
