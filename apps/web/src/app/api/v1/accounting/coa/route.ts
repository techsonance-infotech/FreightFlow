import { NextResponse } from 'next/server';
import { AccountingEngine } from '@/services/accounting-engine';
import { ChartOfAccountSchema } from '@freightflow/shared';

export async function GET(request: Request) {
  try {
    // In a real app, extract these from JWT/session
    // For now, extract from headers or query params
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId') || request.headers.get('x-tenant-id');
    const companyId = searchParams.get('companyId') || request.headers.get('x-company-id');

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId' }, { status: 400 });
    }

    const coaTree = await AccountingEngine.getChartOfAccounts(tenantId, companyId);
    
    return NextResponse.json({ data: coaTree });
  } catch (error: any) {
    console.error('Error fetching COA:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch Chart of Accounts' }, { status: 500 });
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
    const validatedData = ChartOfAccountSchema.parse(body);

    const account = await AccountingEngine.createAccount(tenantId, companyId, validatedData);
    
    return NextResponse.json({ data: account }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create account' }, { status: 500 });
  }
}
