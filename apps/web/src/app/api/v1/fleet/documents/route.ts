import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';
import { FleetService } from '@/services/fleet-service';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode'); // 'all' or 'expiring'
    const withinDays = parseInt(searchParams.get('days') || '30');

    if (mode === 'expiring') {
      const expiring = await FleetService.getExpiringDocuments(
        session.user.tenantId, 
        session.user.companyId!, 
        withinDays
      );
      return NextResponse.json(expiring);
    }

    const docs = await prisma.vehicleDocument.findMany({
      where: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
      },
      include: {
        vehicle: {
          select: { regNo: true }
        }
      },
      orderBy: { expiryDate: 'asc' }
    });

    return NextResponse.json(docs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await request.json();
    if (!data.vehicleId) return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    
    const doc = await prisma.vehicleDocument.create({
      data: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId!,
        vehicleId: data.vehicleId,
        docType: data.docType,
        docNo: data.docNo,
        issueDate: new Date(data.issueDate),
        expiryDate: new Date(data.expiryDate),
        fileUrl: data.fileUrl,
      }
    });

    return NextResponse.json(doc);
  } catch (error: any) {
    console.error('Fleet Document POST Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
