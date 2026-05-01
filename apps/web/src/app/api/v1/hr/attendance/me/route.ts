import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const employee = await prisma.employee.findFirst({
      where: { 
        email: session.user.email,
        companyId: session.user.companyId 
      }
    });

    if (!employee) return NextResponse.json({ data: null });

    const attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: today
      }
    });

    return NextResponse.json({ 
      data: {
        employee,
        attendance
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { action } = body; // 'check-in' or 'check-out'

    const employee = await prisma.employee.findFirst({
      where: { 
        email: session.user.email,
        companyId: session.user.companyId 
      }
    });

    if (!employee) return NextResponse.json({ error: 'Employee profile not found' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let attendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        date: today
      }
    });

    if (action === 'check-in') {
      if (attendance) return NextResponse.json({ error: 'Already checked in' }, { status: 400 });
      
      attendance = await prisma.attendance.create({
        data: {
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          employeeId: employee.id,
          date: today,
          status: 'present',
          checkIn: new Date(),
          markedBy: session.user.id
        }
      });
    } else if (action === 'check-out') {
      if (!attendance) return NextResponse.json({ error: 'Not checked in yet' }, { status: 400 });
      if (attendance.checkOut) return NextResponse.json({ error: 'Already checked out' }, { status: 400 });

      attendance = await prisma.attendance.update({
        where: { id: attendance.id },
        data: {
          checkOut: new Date()
        }
      });
    }

    return NextResponse.json({ data: attendance });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
