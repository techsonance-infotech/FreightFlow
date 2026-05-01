import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only accountants and tenant owners can approve vouchers
    if (!['accountant', 'tenant_owner', 'super_admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Permission denied. Only accountants can approve vouchers.' }, { status: 403 });
    }

    const voucherId = id;
    const tenantId = session.user.tenantId;

    const voucher = await prisma.journalEntry.update({
      where: { 
        id: voucherId,
        tenantId // Security: ensure it belongs to the tenant
      },
      data: {
        status: 'posted'
      }
    });

    return NextResponse.json({ success: true, data: voucher });
  } catch (error: any) {
    console.error('[Voucher Approval Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
