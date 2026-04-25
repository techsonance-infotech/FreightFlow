import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const schedules = await prisma.scheduledReport.findMany({
      where: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(schedules);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    
    const schedule = await prisma.scheduledReport.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
        reportType: data.reportType,
        schedule: data.schedule,
        recipientEmails: data.recipients,
        nextRunAt: new Date(data.nextRun),
      }
    });

    return NextResponse.json(schedule);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
