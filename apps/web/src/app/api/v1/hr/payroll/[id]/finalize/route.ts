import { NextResponse } from 'next/server';
import { PayrollEngine } from '@/services/payroll-engine';
import { getSession } from '@/lib/auth-utils';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await PayrollEngine.finalizePayroll(
      session.user.tenantId,
      session.user.companyId,
      id
    );

    return NextResponse.json({ data: result });
  } catch (error: any) {
    console.error('Payroll finalization error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
