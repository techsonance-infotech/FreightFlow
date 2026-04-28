import { NextResponse } from 'next/server';
import { HRService } from '@/services/hr-service';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const allocations = await HRService.getLeaveAllocations(
      session.user.companyId,
      employeeId,
      year
    );

    return NextResponse.json({ data: allocations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only admins can allocate leaves
    const isAdmin = ['admin', 'owner', 'super_admin', 'business_owner', 'business owner', 'business-owner', 'tenant_owner', 'tenant-owner'].includes(session.user.role?.toLowerCase());
    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { employeeId, year, leaveType, totalDays } = body;

    const allocation = await prisma.leaveAllocation.upsert({
      where: {
        employeeId_year_leaveType: {
          employeeId,
          year: parseInt(year),
          leaveType
        }
      },
      update: { totalDays: parseInt(totalDays) },
      create: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        employeeId,
        year: parseInt(year),
        leaveType,
        totalDays: parseInt(totalDays)
      }
    });

    return NextResponse.json({ data: allocation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
