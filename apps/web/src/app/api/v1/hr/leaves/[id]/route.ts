import { NextResponse } from 'next/server';
import { HRService } from '@/services/hr-service';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { status } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Verify the leave request belongs to the same company
    const leave = await prisma.leave.findUnique({
      where: { id },
      select: { companyId: true }
    });

    if (!leave || leave.companyId !== session.user.companyId) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 });
    }

    const result = await HRService.handleLeaveAction(
      id,
      status,
      session.user.id
    );

    return NextResponse.json({ data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
