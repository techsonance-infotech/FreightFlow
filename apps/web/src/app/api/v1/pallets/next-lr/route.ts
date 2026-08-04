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
    const prefix = isReturn ? `PR/${fyString}/` : `PL/${fyString}/`;

    // Fetch all active order pallets of matching type for the company to avoid string sorting bugs
    const records = await prisma.orderPallet.findMany({
      where: {
        companyId: session.user.companyId,
        type: isReturn ? 'RETURN' : 'OUTWARD',
        deletedAt: null,
      },
      select: {
        lrNo: true,
        date: true,
      },
    });

    const getFinancialYear = (d: Date | string): string => {
      const dateObj = typeof d === 'string' ? new Date(d) : d;
      const m = dateObj.getMonth();
      const y = dateObj.getFullYear();
      let start, end;
      if (m >= 3) {
        start = y;
        end = (y + 1) % 100;
      } else {
        start = y - 1;
        end = y % 100;
      }
      return `${start}-${end.toString().padStart(2, '0')}`;
    };

    // Filter records belonging to the current financial year
    const currentFyRecords = records.filter((r) => {
      if (!r.date) return false;
      return getFinancialYear(r.date) === fyString;
    });

    // Extract numerical sequences supporting old/new return formats and outward formats
    const activeSeqs = currentFyRecords
      .map((r) => {
        if (!r.lrNo) return NaN;
        const parts = r.lrNo.split('/');
        if (parts.length >= 3) {
          const seq = parseInt(parts[2], 10);
          return isNaN(seq) ? NaN : seq;
        }
        return NaN;
      })
      .filter((seq) => !isNaN(seq));

    let nextSequence = isReturn ? 1 : 5001;
    if (activeSeqs.length > 0) {
      const maxSeq = Math.max(...activeSeqs);
      if (maxSeq >= nextSequence) {
        nextSequence = maxSeq + 1;
      }
    }

    const nextLr = `${prefix}${nextSequence}`;

    return NextResponse.json({ nextLr });
  } catch (error) {
    console.error('[PALLET_NEXT_LR_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
