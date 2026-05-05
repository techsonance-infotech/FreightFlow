import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);
    const dealerId = searchParams.get('dealerId');
    const consigneeId = searchParams.get('consigneeId');

    if (!dealerId || !consigneeId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const lastOrder = await prisma.order.findFirst({
      where: {
        companyId: user.companyId,
        dealerId,
        consigneeId,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        fromLocation: true,
        toLocation: true,
      },
    });

    return NextResponse.json({ route: lastOrder });
  } catch (error) {
    console.error('[LAST_ROUTE_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
