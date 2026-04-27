import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { AccountingEngine } from '@/services/accounting-engine';
import { FreightInvoiceSchema } from '@freightflow/shared';

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

    const invoices = await prisma.freightInvoice.findMany({
      where: { tenantId, companyId },
      include: {
        orders: {
          select: { lrNo: true, date: true, status: true }
        }
      },
      orderBy: { date: 'desc' },
      skip,
      take: limit,
    });

    const total = await prisma.freightInvoice.count({
      where: { tenantId, companyId },
    });
    
    return NextResponse.json({ 
      data: invoices,
      meta: { total, page, limit }
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    const companyId = request.headers.get('x-company-id');

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = FreightInvoiceSchema.parse(body);

    const invoice = await AccountingEngine.generateFreightInvoice(tenantId, companyId, validatedData);
    
    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
