import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { AccountingEngine } from '@/services/accounting-engine';
import { JournalEntrySchema } from '@freightflow/shared';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    // Filtering & Search
    const search = searchParams.get('search');
    const type = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const partyId = searchParams.get('partyId');

    const where: any = { tenantId, companyId };
    
    if (type && type !== 'all') {
      where.voucherType = type;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (search) {
      where.OR = [
        { voucherNo: { contains: search, mode: 'insensitive' } },
        { narration: { contains: search, mode: 'insensitive' } }
      ];
    }

    const vouchers = await prisma.journalEntry.findMany({
      where,
      include: {
        lines: {
          include: {
            account: {
              select: { name: true, code: true }
            }
          }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.journalEntry.count({ where });
    
    return NextResponse.json({ 
      data: vouchers,
      meta: { total, page, limit }
    });
  } catch (error: any) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch vouchers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId, id: userId } = session.user;

    const body = await request.json();
    const validatedData = JournalEntrySchema.parse(body);

    const voucher = await AccountingEngine.createJournalEntry(tenantId, companyId, validatedData, userId);
    
    return NextResponse.json({ data: voucher }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating voucher:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create voucher' }, { status: 500 });
  }
}
