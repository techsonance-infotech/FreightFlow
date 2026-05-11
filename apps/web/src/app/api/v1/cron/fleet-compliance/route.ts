import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    // Basic API Key protection for cron endpoints (Vercel Cron automatically sends a secure header)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // Unauthorized
    }

    // 1. Check Core Vehicle Expiries
    const vehicles = await prisma.vehicle.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        regNo: true,
        tenantId: true,
        companyId: true,
        insuranceExpiry: true,
        fitnessExpiry: true,
      }
    });

    const now = new Date();
    const alertsToSend: any[] = [];

    vehicles.forEach(v => {
      const checkAlert = (expiry: Date | null, type: string) => {
        if (!expiry) return;
        const daysLeft = Math.ceil((new Date(expiry).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft === 30 || daysLeft === 7 || daysLeft === 0) {
          alertsToSend.push({ vehicleId: v.id, regNo: v.regNo, tenantId: v.tenantId, type, daysLeft });
        }
      };
      checkAlert(v.insuranceExpiry, 'Insurance (Core)');
      checkAlert(v.fitnessExpiry, 'Fitness (Core)');
    });

    // 2. Check Archive Documents (Manual Docs Archive)
    const archivedDocs = await prisma.vehicleDocument.findMany({
      where: {
        expiryDate: {
          lte: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Within 30 days
        }
      },
      include: {
        vehicle: { select: { regNo: true } }
      }
    });

    archivedDocs.forEach(doc => {
      const daysLeft = Math.ceil((new Date(doc.expiryDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft === 30 || daysLeft === 7 || daysLeft === 0) {
        alertsToSend.push({
          vehicleId: doc.vehicleId,
          regNo: doc.vehicle.regNo,
          tenantId: doc.tenantId,
          type: `${doc.docType.toUpperCase()} (${doc.docNo})`,
          daysLeft
        });
      }
    });

    // TODO: Integrate Email / SMS Provider (e.g. Resend, Twilio)
    if (alertsToSend.length > 0) {
      // Alerts to process
    }

    return NextResponse.json({ success: true, alertsGenerated: alertsToSend.length, details: alertsToSend });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
