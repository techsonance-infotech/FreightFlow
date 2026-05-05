import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { FleetService } from '@/services/fleet-service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await FleetService.getFuelReport(
      session.user.tenantId,
      session.user.companyId!
    );

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
