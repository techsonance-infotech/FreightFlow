import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { AccountingEngine } from '@/services/accounting-engine';
import { FreightInvoiceSchema } from '@freightflow/shared';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const customerId = searchParams.get('customerId') || undefined;
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;

    // Fetch Next Invoice Number if requested
    if (searchParams.get('nextNumber') === 'true') {
      const nextNo = await AccountingEngine.getNextInvoiceNumber(tenantId, companyId);
      return NextResponse.json({ data: nextNo });
    }

    // Fetch Summary if requested
    if (searchParams.get('summary') === 'true') {
      const summary = await AccountingEngine.getInvoiceSummary(tenantId, companyId);
      return NextResponse.json({ data: summary });
    }

    const report = await AccountingEngine.getFreightInvoices(tenantId, companyId, { 
      page, 
      limit, 
      search, 
      status, 
      customerId,
      startDate,
      endDate
    });
    
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;

    const body = await request.json();
    console.log('Creating freight invoice with body:', JSON.stringify(body, null, 2));
    const validatedData = FreightInvoiceSchema.parse(body);

    const invoice = await AccountingEngine.generateFreightInvoice(tenantId, companyId, validatedData);
    
    return NextResponse.json({ data: invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/v1/accounting/invoices:', error);
    if (error.name === 'ZodError') {
      console.error('Zod Validation Errors:', JSON.stringify(error.errors, null, 2));
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create invoice' }, { status: 500 });
  }
}
