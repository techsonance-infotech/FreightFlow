import { NextResponse } from 'next/server';
import { prisma } from '@freightflow/db';
import { GSTEngine } from '@/services/gst-engine';
import { getSession } from '@/lib/auth-utils';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { invoiceIds } = body;

    if (!Array.isArray(invoiceIds) || invoiceIds.length === 0) {
      return NextResponse.json({ error: 'No invoice IDs provided' }, { status: 400 });
    }

    const invoices = await prisma.freightInvoice.findMany({
      where: {
        id: { in: invoiceIds },
        tenantId: session.user.tenantId,
        companyId: session.user.companyId
      }
    });

    const results = [];
    const errors = [];

    for (const inv of invoices) {
      try {
        // Check if already generated
        const existing = await prisma.eInvoiceLog.findFirst({
          where: { invoiceId: inv.id, status: 'generated' }
        });

        if (existing) continue;

        // Generate
        const irnResult = GSTEngine.generateLocalIRN(inv.invoiceNo, inv.totalAmount, '');
        
        await prisma.eInvoiceLog.create({
          data: {
            invoiceId: inv.id,
            irn: irnResult.irn,
            ackNo: irnResult.ackNo,
            ackDate: irnResult.ackDate,
            signedInvoice: irnResult.signedQrCode,
            qrCode: irnResult.signedQrCode,
            status: 'generated',
          }
        });
        results.push(inv.id);
      } catch (err: any) {
        errors.push({ id: inv.id, error: err.message });
      }
    }

    return NextResponse.json({ 
      data: { successCount: results.length, errors },
      status: 'completed'
    });
  } catch (error: any) {
    console.error('Error in bulk IRN generation:', error);
    return NextResponse.json({ error: error.message || 'Failed to process bulk IRN' }, { status: 500 });
  }
}
