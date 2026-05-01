import { NextResponse } from 'next/server';
import { HRService } from '@/services/hr-service';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { startOfMonth } from 'date-fns';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');

    const isAdmin = ['admin', 'owner', 'super_admin', 'business_owner', 'business owner', 'business-owner', 'tenant_owner', 'tenant-owner'].includes(session.user.role?.toLowerCase());

    const where: any = {
      companyId: session.user.companyId,
      ...(isAdmin ? {} : { employee: { userId: session.user.id } })
    };

    if (status && status !== 'all') where.status = status;
    if (type && type !== 'all') where.leaveType = type;
    if (search) {
      where.OR = [
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { employee: { empCode: { contains: search, mode: 'insensitive' } } },
        { reason: { contains: search, mode: 'insensitive' } }
      ];
    }

    const monthStart = startOfMonth(new Date());

    const [leaves, total, pendingCount, approvedMTD, totalVolume] = await Promise.all([
      prisma.leave.findMany({
        where,
        include: {
          employee: { select: { name: true, empCode: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.leave.count({ where }),
      prisma.leave.count({ where: { ...where, status: 'pending' } }),
      prisma.leave.count({ where: { ...where, status: 'approved', fromDate: { gte: monthStart } } }),
      prisma.leave.count({ where: { companyId: session.user.companyId } })
    ]);

    return NextResponse.json({ 
      data: leaves,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        pendingCount,
        approvedMTD,
        totalVolume
      }
    });
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
