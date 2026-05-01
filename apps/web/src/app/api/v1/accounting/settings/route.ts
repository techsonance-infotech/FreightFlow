import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;

    let settings = await prisma.accountingSetting.findUnique({
      where: { tenantId_companyId: { tenantId, companyId } }
    });

    if (!settings) {
      // Initialize default settings
      settings = await prisma.accountingSetting.create({
        data: {
          tenantId,
          companyId,
          fiscalYearStart: 4,
          gstEnabled: true,
          defaultGstRate: 5.00,
          voucherPrefixes: {
            payment: 'PAY',
            receipt: 'REC',
            journal: 'JV',
            contra: 'CON',
            sales: 'SL',
            purchase: 'PUR'
          }
        }
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error('Settings Fetch Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const body = await request.json();

    const updated = await prisma.accountingSetting.upsert({
      where: { tenantId_companyId: { tenantId, companyId } },
      create: {
        tenantId,
        companyId,
        ...body
      },
      update: body
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error('Settings Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
