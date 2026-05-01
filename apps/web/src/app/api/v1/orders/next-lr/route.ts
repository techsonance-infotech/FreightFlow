import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user || !session.user.companyId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    let today = new Date();
    
    if (dateStr && dateStr !== 'undefined' && dateStr !== 'null') {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        today = parsed;
      }
    }
    
    const month = today.getMonth(); // 0-indexed, 0 = Jan
    const currentYear = today.getFullYear();
    
    // FY starts in April (3)
    let fyStart, fyEnd;
    if (month >= 3) {
      fyStart = currentYear;
      fyEnd = (currentYear + 1) % 100;
    } else {
      fyStart = currentYear - 1;
      fyEnd = currentYear % 100;
    }
    const fyString = `${fyStart}-${fyEnd.toString().padStart(2, '0')}`;
    const prefix = `LR/${fyString}/`;

    // Get the max sequence for this company and this FY
    const lastOrder = await prisma.order.findFirst({
      where: {
        companyId: session.user.companyId,
        lrNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        lrNo: true,
      },
    });

    let nextSequence = 1001; // Default starting sequence
    if (lastOrder && lastOrder.lrNo) {
      const parts = lastOrder.lrNo.split('/');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const nextLr = `${prefix}${nextSequence}`;

    return NextResponse.json({ nextLr });
  } catch (error) {
    console.error('[NEXT_LR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
