import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { AccountingEngine } from '@/services/accounting-engine';
import { JournalEntrySchema } from '@freightflow/shared';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || request.headers.get('x-tenant-id');
    const companyId = searchParams.get('companyId') || request.headers.get('x-company-id');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

    const vouchers = await prisma.journalEntry.findMany({
      where: { tenantId, companyId },
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

    const total = await prisma.journalEntry.count({
      where: { tenantId, companyId },
    });
    
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
    const tenantId = request.headers.get('x-tenant-id');
    const companyId = request.headers.get('x-company-id');
    // Assuming we have auth middleware setting this
    const userId = request.headers.get('x-user-id') || undefined;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

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
