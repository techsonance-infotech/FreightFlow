'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getPalletInvoiceData(palletId: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) {
    throw new Error('Unauthorized');
  }

  const [pallet, company] = await Promise.all([
    prisma.orderPallet.findUnique({
      where: { 
        id: palletId,
        tenantId: session.user.tenantId
      },
      include: {
        dealer: true,
        consignee: true,
        vehicle: true,
        palletDetails: true,
        consigneeDetails: true,
      }
    }),
    prisma.company.findUnique({
      where: { id: session.user.companyId }
    })
  ]);

  if (!pallet) {
    throw new Error('Pallet record not found');
  }

  // Serialize Decimals and Dates for Client Component compatibility
  const serializedPallet = {
    ...pallet,
    cgstPct: pallet.cgstPct ? Number(pallet.cgstPct) : 0,
    sgstPct: pallet.sgstPct ? Number(pallet.sgstPct) : 0,
    igstPct: pallet.igstPct ? Number(pallet.igstPct) : 0,
    gstPct: pallet.gstPct ? Number(pallet.gstPct) : 0,
    totalWeight: pallet.totalWeight ? Number(pallet.totalWeight) : 0,
    date: pallet.date.toISOString(),
    createdAt: pallet.createdAt.toISOString(),
    updatedAt: pallet.updatedAt.toISOString(),
    deletedAt: pallet.deletedAt?.toISOString() || null,
    dealer: pallet.dealer ? {
      ...pallet.dealer,
      // @ts-expect-error: Prisma model type mismatch
      geoLat: pallet.dealer.geoLat ? Number(pallet.dealer.geoLat) : null,
      // @ts-expect-error: Prisma model type mismatch
      geoLng: pallet.dealer.geoLng ? Number(pallet.dealer.geoLng) : null,
    } : null,
    consignee: pallet.consignee ? {
      ...pallet.consignee,
      // @ts-expect-error: Prisma model type mismatch
      geoLat: pallet.consignee.geoLat ? Number(pallet.consignee.geoLat) : null,
      // @ts-expect-error: Prisma model type mismatch
      geoLng: pallet.consignee.geoLng ? Number(pallet.consignee.geoLng) : null,
    } : null,
    palletDetails: pallet.palletDetails.map(detail => ({
      ...detail,
      weight: detail.weight ? Number(detail.weight) : 0
    })),
  };

  return { pallet: serializedPallet, company };
}
