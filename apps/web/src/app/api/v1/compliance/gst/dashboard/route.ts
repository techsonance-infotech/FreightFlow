import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { GSTEngine } from '@/services/gst-engine';
import { prisma } from '@freightflow/db';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;
    const period = format(new Date(), 'yyyy-MM');

    // 1. Get GSTR-3B data for current period
    const gstr3b = await GSTEngine.generateGSTR3B(tenantId, companyId, period);

    // 2. Get e-Invoice Status
    const totalInvoices = await prisma.freightInvoice.count({
      where: {
        tenantId,
        companyId,
        date: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date())
        }
      }
    });

    const eInvoicesGenerated = await prisma.freightInvoice.count({
      where: {
        tenantId,
        companyId,
        date: {
          gte: startOfMonth(new Date()),
          lte: endOfMonth(new Date())
        },
        eInvoiceLogs: {
          some: {
            status: 'generated'
          }
        }
      }
    });

    // 3. Filing Deadlines
    const deadlines = [
      { form: 'GSTR-1', dueDate: '11th ' + format(new Date(), 'MMM'), status: 'Upcoming' },
      { form: 'GSTR-3B', dueDate: '20th ' + format(new Date(), 'MMM'), status: 'Upcoming' },
    ];

    return NextResponse.json({
      data: {
        summary: {
          outputTax: gstr3b.outward.totalTax,
          inputTax: gstr3b.inward.total,
          netPayable: gstr3b.netPayable.total,
          taxableValue: gstr3b.outward.taxableValue
        },
        einvoice: {
          total: totalInvoices,
          generated: eInvoicesGenerated,
          percentage: totalInvoices > 0 ? Math.round((eInvoicesGenerated / totalInvoices) * 100) : 0
        },
        deadlines,
        periodName: format(new Date(), 'MMMM yyyy')
      }
    });
  } catch (error: any) {
    console.error('GST Dashboard API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch GST metrics' }, { status: 500 });
  }
}
