import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import bcrypt from 'bcryptjs';
import { sendEmail, getEmployeeWelcomeEmailTemplate } from '@/lib/email';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const employees = await prisma.employee.findMany({
      where: { companyId: session.user.companyId },
      include: { salaryStructure: true, user: true },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ data: employees });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { salaryStructure, ...employeeData } = body;

    // 1. Generate Temporary Password
    const tempPassword = Math.random().toString(36).slice(-10) + '!';
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      // 2. Create User Record if Role is assigned
      let userId = null;
      if (employeeData.role && employeeData.email) {
        const existingUser = await tx.user.findUnique({ where: { email: employeeData.email } });
        if (!existingUser) {
          const user = await tx.user.create({
            data: {
              email: employeeData.email,
              name: employeeData.name,
              passwordHash: hashedPassword,
              role: employeeData.role,
              tenantId: session.user.tenantId,
              companyId: session.user.companyId,
              isActive: employeeData.status === 'active' || !employeeData.status,
            }
          });
          userId = user.id;
        } else {
          userId = existingUser.id;
        }
      }

      // 3. Create Employee Record
      const employee = await tx.employee.create({
        data: {
          ...employeeData,
          tenantId: session.user.tenantId,
          companyId: session.user.companyId,
          userId: userId,
          joiningDate: employeeData.joiningDate ? new Date(employeeData.joiningDate) : null,
          // New compliance and bank fields
          bankAccountName: employeeData.bankAccountName || null,
          bankPassbookUrl: employeeData.bankPassbookUrl || null,
          gender: employeeData.gender || 'male',
        }
      });

      // 4. Create Salary Structure
      if (salaryStructure) {
        await tx.salaryStructure.create({
          data: {
            ...salaryStructure,
            tenantId: session.user.tenantId,
            companyId: session.user.companyId,
            employeeId: employee.id,
            effectiveFrom: salaryStructure.effectiveFrom ? new Date(salaryStructure.effectiveFrom) : new Date()
          }
        });
      }

      return { employee, tempPassword };
    });

    // 5. Send Welcome Email
    if (employeeData.email) {
      try {
        const html = getEmployeeWelcomeEmailTemplate({
          name: employeeData.name,
          email: employeeData.email,
          password: result.tempPassword,
          role: employeeData.role
        });

        await sendEmail({
          to: employeeData.email,
          subject: 'Welcome to FreightFlow - Your Account Credentials',
          html
        });
      } catch (emailError) {
        console.error('[Email Notification Error]:', emailError);
        // We don't fail the whole request if email fails, but log it
      }
    }

    return NextResponse.json({ data: result.employee });
  } catch (error: any) {
    console.error('[Employee Registration Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
