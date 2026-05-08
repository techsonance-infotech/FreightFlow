'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getLRInvoiceData(orderId: string) {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) {
    throw new Error('Unauthorized');
  }

  const [order, company] = await Promise.all([
    prisma.order.findUnique({
      where: { 
        id: orderId,
        tenantId: session.user.tenantId
      },
      include: {
        dealer: true,
        consignee: true,
        vehicle: true,
        details: true,
      }
    }),
    prisma.company.findUnique({
      where: { id: session.user.companyId }
    })
  ]);

  if (!order) {
    throw new Error('Lorry Receipt record not found');
  }

  // Serialize Decimals and Dates for Client Component compatibility
  const serializedOrder = {
    ...order,
    cgstPct: order.cgstPct ? Number(order.cgstPct) : 0,
    sgstPct: order.sgstPct ? Number(order.sgstPct) : 0,
    igstPct: order.igstPct ? Number(order.igstPct) : 0,
    totalWeight: order.totalWeight ? Number(order.totalWeight) : 0,
    date: order.date.toISOString(),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    deletedAt: order.deletedAt?.toISOString() || null,
    dealer: order.dealer ? {
      ...order.dealer,
      // @ts-expect-error: Prisma model type mismatch
      geoLat: order.dealer.geoLat ? Number(order.dealer.geoLat) : null,
      // @ts-expect-error: Prisma model type mismatch
      geoLng: order.dealer.geoLng ? Number(order.dealer.geoLng) : null,
    } : null,
    consignee: order.consignee ? {
      ...order.consignee,
      // @ts-expect-error: Prisma model type mismatch
      geoLat: order.consignee.geoLat ? Number(order.consignee.geoLat) : null,
      // @ts-expect-error: Prisma model type mismatch
      geoLng: order.consignee.geoLng ? Number(order.consignee.geoLng) : null,
    } : null,
    details: order.details.map(detail => ({
      ...detail,
      weight: detail.weight ? Number(detail.weight) : 0
    })),
  };

  return { order: serializedOrder, company };
}
