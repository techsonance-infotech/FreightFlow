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
    const search = searchParams.get('search') || '';

    // Fetch all outward and return records for the company
    const records = await prisma.orderPallet.findMany({
      where: {
        tenantId: user.tenantId,
        companyId: user.companyId!,
        deletedAt: null,
      },
      include: {
        dealer: { select: { name: true } },
        palletDetails: true,
        consigneeDetails: true,
      },
    });

    // Map to store balances per party (Dealer/Consignee)
    const partyBalances: Record<string, {
      partyName: string;
      sent: number;
      returned: number;
      balance: number;
      lastActivity: Date;
    }> = {};

    records.forEach((record) => {
      const type = record.type; // OUTWARD or RETURN
      
      // Determine the party name. 
      // Usually, it's the Dealer name or companyName from the record.
      // But a single record might have multiple consignees in details.
      
      // For reconciliation, we often track at the Dealer level (the main entity responsible for the pallets).
      const partyKey = record.dealerId || record.companyName || 'Unknown';
      const partyName = record.dealer?.name || record.companyName || 'Unknown Party';

      if (!partyBalances[partyKey]) {
        partyBalances[partyKey] = {
          partyName,
          sent: 0,
          returned: 0,
          balance: 0,
          lastActivity: record.date,
        };
      }

      // Calculate total qty in this record
      const qty = (record.palletDetails?.length > 0 ? record.palletDetails : (record.consigneeDetails || [])).reduce(
        (sum, d) => sum + (d.qty || 0), 
        0
      );

      if (type === 'OUTWARD') {
        partyBalances[partyKey].sent += qty;
        partyBalances[partyKey].balance += qty;
      } else if (type === 'RETURN') {
        partyBalances[partyKey].returned += qty;
        partyBalances[partyKey].balance -= qty;
      }

      if (new Date(record.date) > new Date(partyBalances[partyKey].lastActivity)) {
        partyBalances[partyKey].lastActivity = record.date;
      }
    });

    let result = Object.values(partyBalances);

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.partyName.toLowerCase().includes(q));
    }

    // Sort by balance (highest first)
    result.sort((a, b) => b.balance - a.balance);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[PALLETS_RECONCILIATION_GET]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
