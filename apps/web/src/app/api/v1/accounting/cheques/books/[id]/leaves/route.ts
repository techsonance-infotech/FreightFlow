import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const leaves = await prisma.chequeLeaf.findMany({
      where: {
        chequeBookId: id,
        chequeBook: { companyId: session.user.companyId }
      },
      include: {
        journalEntry: {
          select: { voucherNo: true, date: true }
        }
      },
      orderBy: { leafNo: 'asc' }
    });

    return NextResponse.json({ data: leaves });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
