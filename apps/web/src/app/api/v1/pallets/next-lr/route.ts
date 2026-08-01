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
    
    const month = today.getMonth(); 
    const currentYear = today.getFullYear();
    
    let fyStart, fyEnd;
    if (month >= 3) {
      fyStart = currentYear;
      fyEnd = (currentYear + 1) % 100;
    } else {
      fyStart = currentYear - 1;
      fyEnd = currentYear % 100;
    }
    const fyString = `${fyStart}-${fyEnd.toString().padStart(2, '0')}`;
    const type = searchParams.get('type') || 'OUTWARD';
    const isReturn = type === 'RETURN';
    const prefix = `PL/${fyString}/`;

    const lastRecord = await prisma.orderPallet.findFirst({
      where: {
        companyId: session.user.companyId,
        lrNo: isReturn
          ? { startsWith: prefix, endsWith: '/PR' }
          : { startsWith: prefix, not: { endsWith: '/PR' } }
      },
      orderBy: {
        lrNo: 'desc',
      },
      select: {
        lrNo: true,
      },
    });

    let nextSequence = isReturn ? 1 : 5001;
    if (lastRecord && lastRecord.lrNo) {
      if (isReturn) {
        const match = lastRecord.lrNo.match(/^PL\/\d{2,4}-\d{2}\/(\d+)\/PR$/);
        if (match) {
          nextSequence = parseInt(match[1]) + 1;
        }
      } else {
        const parts = lastRecord.lrNo.split('/');
        const lastSeq = parseInt(parts[parts.length - 1]);
        if (!isNaN(lastSeq) && lastSeq >= 5001) {
          nextSequence = lastSeq + 1;
        }
      }
    }

    const nextLr = isReturn 
      ? `${prefix}${nextSequence}/PR`
      : `${prefix}${nextSequence}`;

    return NextResponse.json({ nextLr });
  } catch (error) {
    console.error('[PALLET_NEXT_LR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
