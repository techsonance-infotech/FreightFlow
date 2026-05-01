import { NextResponse } from 'next/server';
import { AccountingEngine } from '@/services/accounting-engine';
import { ChartOfAccountSchema } from '@freightflow/shared';
import { getSession } from '@/lib/auth-utils';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);

    if (searchParams.get('nextCode') === 'true') {
      const nextCode = await AccountingEngine.getNextAccountCode(tenantId, companyId);
      return NextResponse.json({ data: nextCode });
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
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;

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

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const account = await AccountingEngine.updateAccount(tenantId, companyId, id, body);
    
    return NextResponse.json({ data: account });
  } catch (error: any) {
    console.error('Error updating account:', error);
    return NextResponse.json({ error: error.message || 'Failed to update account' }, { status: 500 });
  }
}
