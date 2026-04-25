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

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    if (!tenantId || !companyId) {
      return NextResponse.json({ error: 'Missing tenantId or companyId in session' }, { status: 400 });
    }

    const body = await request.json();
    const { invoiceId, invoiceNo, amount, customerGstIn } = body;

    if (!invoiceId || !invoiceNo || !amount) {
      return NextResponse.json({ error: 'Invalid payload. invoiceId, invoiceNo, and amount are required.' }, { status: 400 });
    }

    // 1. Check if IRN already generated
    const existingLog = await prisma.eInvoiceLog.findFirst({
      where: { invoiceId, status: 'generated' }
    });

    if (existingLog) {
      return NextResponse.json({ error: 'IRN already generated for this invoice' }, { status: 400 });
    }

    // 2. Generate Local IRN
    const result = GSTEngine.generateLocalIRN(invoiceNo, amount, customerGstIn || '');

    // 3. Log to database
    const log = await prisma.eInvoiceLog.create({
      data: {
        invoiceId,
        irn: result.irn,
        ackNo: result.ackNo,
        ackDate: result.ackDate,
        signedInvoice: result.signedQrCode,
        qrCode: result.signedQrCode, // Simplification
        status: 'generated',
      }
    });
    
    return NextResponse.json({ data: log }, { status: 200 });
  } catch (error: any) {
    console.error('Error generating IRN:', error);
    return NextResponse.json({ error: error.message || 'Failed to generate IRN' }, { status: 500 });
  }
}
