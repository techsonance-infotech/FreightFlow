import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { LabourAttendanceSchema } from '@freightflow/shared';
import { z } from 'zod';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const labourId = searchParams.get('labourId');
    const month = searchParams.get('month'); // YYYY-MM

    if (!labourId) return NextResponse.json({ error: 'Labour ID required' }, { status: 400 });

    const where: any = {
      labourId,
      tenantId: session.user.tenantId,
      companyId: session.user.companyId,
    };

    if (month) {
      const startOfMonth = new Date(`${month}-01`);
      const endOfMonth = new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + 1, 0);
      where.date = { gte: startOfMonth, lte: endOfMonth };
    }

    const attendance = await prisma.labourAttendance.findMany({
      where,
      orderBy: { date: 'asc' },
    });

    return NextResponse.json(attendance);
  } catch (error) {
    console.error('Attendance GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    
    // Support single or bulk updates
    const items = Array.isArray(body) ? body : [body];
    
    const results = await Promise.all(items.map(async (item) => {
      const validated = LabourAttendanceSchema.parse(item);
      
      return prisma.labourAttendance.upsert({
        where: {
          labourId_date: {
            labourId: validated.labourId,
            date: new Date(validated.date),
          },
        },
        update: {
          status: validated.status,
          overtime: validated.overtime,
          remarks: validated.remarks,
        },
        create: {
          ...validated,
          date: new Date(validated.date),
          tenantId: session.user.tenantId,
          companyId: session.user.companyId!,
        },
      });
    }));

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error('Attendance POST Error:', error);
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
