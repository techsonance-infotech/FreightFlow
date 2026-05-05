import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { user } = session;

    // Check if employee already exists
    const existingEmployee = await prisma.employee.findFirst({
      where: { 
        email: user.email,
        companyId: user.companyId 
      }
    });

    if (existingEmployee) {
      return NextResponse.json({ error: 'Employee profile already exists' }, { status: 400 });
    }

    // Create Employee record for the current user
    const employee = await prisma.employee.create({
      data: {
        tenantId: user.tenantId,
        companyId: user.companyId,
        userId: user.id, // This is now available as per the error message
        name: user.name || 'Admin',
        email: user.email,
        role: user.role || 'Admin',
        status: 'active',
        designation: 'Business Owner',
        joiningDate: new Date(),
      }
    });

    return NextResponse.json({ data: employee });
  } catch (error: any) {
    console.error('Auto-link profile error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
