import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const vehicles = await prisma.vehicle.findMany({
      where: {
        tenantId: session.user.tenantId,
        companyId: session.user.companyId,
        deletedAt: null,
      },
      select: {
        id: true,
        regNo: true,
        make: true,
        model: true,
        rcUrl: true,
        insuranceExpiry: true,
        insuranceUrl: true,
        fitnessExpiry: true,
        status: true,
      },
      orderBy: { regNo: 'asc' }
    });

    // Map each vehicle to its compliance issues
    const now = new Date();

    const complianceData = vehicles.map(v => {
      const issues: any[] = [];
      let overallStatus = 'safe'; // 'safe', 'warning', 'critical'

      const checkExpiry = (date: Date | null, docType: string, url: string | null) => {
        if (!date) {
          if (!url) {
             issues.push({ type: docType, status: 'missing', message: `Missing ${docType} data` });
             overallStatus = 'critical';
          }
          return;
        }
        
        const expiryDate = new Date(date);
        const daysLeft = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysLeft < 0) {
          issues.push({ type: docType, status: 'expired', message: `${docType} expired ${Math.abs(daysLeft)} days ago`, daysLeft, expiryDate });
          overallStatus = 'critical';
        } else if (daysLeft <= 30) {
          issues.push({ type: docType, status: 'expiring', message: `${docType} expiring in ${daysLeft} days`, daysLeft, expiryDate });
          if (overallStatus !== 'critical') overallStatus = 'warning';
        } else {
          issues.push({ type: docType, status: 'safe', message: `Valid for ${daysLeft} days`, daysLeft, expiryDate });
        }
      };

      checkExpiry(v.insuranceExpiry, 'Insurance', v.insuranceUrl);
      checkExpiry(v.fitnessExpiry, 'Fitness', null);

      if (!v.rcUrl) {
         issues.push({ type: 'RC', status: 'missing', message: 'Missing RC Document' });
         if (overallStatus !== 'critical') overallStatus = 'warning';
      } else {
         issues.push({ type: 'RC', status: 'safe', message: 'RC Uploaded' });
      }

      return {
        ...v,
        issues,
        overallStatus
      };
    });

    // Calculate Summary
    const summary = {
      total: complianceData.length,
      safe: complianceData.filter(v => v.overallStatus === 'safe').length,
      warning: complianceData.filter(v => v.overallStatus === 'warning').length,
      critical: complianceData.filter(v => v.overallStatus === 'critical').length,
    };

    return NextResponse.json({ data: complianceData, summary });

  } catch (error: any) {
    console.error('Compliance API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
