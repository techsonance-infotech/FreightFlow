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
    const date = dateStr ? new Date(dateStr) : new Date();

    const attendances = await prisma.attendance.findMany({
      where: {
        companyId: session.user.companyId,
        date: date
      },
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
