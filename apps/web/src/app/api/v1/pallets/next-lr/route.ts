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
    const prefix = `PL/${fyString}/`; // Using PL for Pallets

    const lastRecord = await prisma.orderPallet.findFirst({
      where: {
        companyId: session.user.companyId,
        lrNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        date: 'desc', // Use date instead of createdAt to match FY
      },
      select: {
        lrNo: true,
      },
    });

    let nextSequence = 1001; 
    if (lastRecord && lastRecord.lrNo) {
      const parts = lastRecord.lrNo.split('/');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    const nextLr = `${prefix}${nextSequence}`;

    return NextResponse.json({ nextLr });
  } catch (error) {
    console.error('[PALLET_NEXT_LR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
