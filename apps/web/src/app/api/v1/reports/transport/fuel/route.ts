import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { FleetService } from '@/services/fleet-service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');
    const vehicleId = searchParams.get('vehicleId');

    const startDate = startDateStr ? new Date(startDateStr) : undefined;
    const endDate = endDateStr ? new Date(endDateStr) : undefined;

    const data = await FleetService.getFuelReport(
      session.user.tenantId,
      session.user.companyId!,
      startDate,
      endDate,
      vehicleId || undefined
    );

    const transactions = data.entries.map((e: any) => ({
      ...e,
      vehicleNumber: e.vehicle?.regNo || 'Unknown',
      pumpName: e.vendor || 'Commercial Pump'
    }));

    return NextResponse.json({
      totalLitres: data.totalLitres,
      totalCost: data.totalCost,
      avgKmpl: data.avgKmpl,
      transactions
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
