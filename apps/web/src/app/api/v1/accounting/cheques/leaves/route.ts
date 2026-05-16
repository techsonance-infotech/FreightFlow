import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const bankAccountId = searchParams.get('bankAccountId');

    if (!bankAccountId) {
      return NextResponse.json({ error: 'Bank Account ID is required' }, { status: 400 });
    }

    // Find active cheque books for this bank account
    const leaves = await prisma.chequeLeaf.findMany({
      where: {
        chequeBook: {
          bankAccountId,
          companyId: session.user.companyId,
          isActive: true
        },
        status: 'available'
      },
      orderBy: { leafNo: 'asc' },
      take: 50
    });

    return NextResponse.json({ data: leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
