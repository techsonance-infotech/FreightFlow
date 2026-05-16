import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const isCurrent = searchParams.get('current') === 'true';

    const companies = await prisma.company.findMany({
      where: {
        tenantId: session.user.tenantId,
        isActive: true,
        ...(isCurrent ? { id: session.user.companyId } : {}),
      },
      select: {
        id: true,
        name: true,
        logoUrl: true,
        gstin: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ data: companies });
  } catch (error) {
    console.error('Failed to fetch companies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
