'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getCentralAccountingSettings() {
  try {
    const session = await getSession();
    if (!session || !session.user) return null;
    const { tenantId, companyId } = session.user;
    if (!tenantId || !companyId) return null;

    let settings = await prisma.accountingSetting.findUnique({
      where: { tenantId_companyId: { tenantId, companyId } }
    });

    if (!settings) {
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

    return {
      ...settings,
      defaultGstRate: Number(settings.defaultGstRate ?? 5.0)
    };
  } catch (error) {
    console.error('Error fetching central accounting settings:', error);
    return null;
  }
}
