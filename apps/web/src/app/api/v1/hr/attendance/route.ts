import { NextRequest, NextResponse } from 'next/server';
import { HRService } from '@/services/hr-service';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get('date');
    const mode = searchParams.get('mode'); // 'daily' or 'monthly'
    const employeeId = searchParams.get('employeeId');
    const date = dateStr ? new Date(dateStr) : new Date();

    let whereClause: any = {
      companyId: session.user.companyId,
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (mode === 'monthly') {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      whereClause.date = {
        gte: start,
        lte: end
      };
    } else {
      whereClause.date = date;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        employee: { select: { name: true, empCode: true } }
      }
    });

    return NextResponse.json({ data: attendances });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { date, entries } = body;

    const result = await HRService.markBulkAttendance(
      session.user.tenantId,
      session.user.companyId,
      new Date(date),
      entries,
      session.user.id
    );

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
