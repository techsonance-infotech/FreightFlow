import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const payrollLines = await prisma.payrollLine.findMany({
      where: {
        employeeId: id,
        companyId: session.user.companyId,
        run: { status: 'approved' }
      },
      include: {
        run: true
      },
      orderBy: {
        run: {
          createdAt: 'desc'
        }
      }
    });

    return NextResponse.json({ data: payrollLines });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
