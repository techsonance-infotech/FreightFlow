import { NextResponse } from 'next/server';
import { PayrollEngine } from '@/services/payroll-engine';
import { getSession } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { month, year } = body;

    if (!month || !year) {
      return NextResponse.json({ error: 'Month and Year are required' }, { status: 400 });
    }

    const result = await PayrollEngine.processPayroll(
      session.user.tenantId,
      session.user.companyId,
      parseInt(month),
      parseInt(year)
    );

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('Payroll processing error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
