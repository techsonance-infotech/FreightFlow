'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getDealerEntryRecords(
  dealerId: string | 'ALL',
  startDate: Date,
  endDate: Date,
  loadType: 'BOX' | 'PALLET' | 'EMPTY' | 'BOTH' = 'BOTH'
) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return [];

    const where: any = {
      companyId,
      date: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        not: 'deleted',
      },
    };

    if (dealerId !== 'ALL') {
      where.dealerId = dealerId;
    }

    let standardRecords: any[] = [];
    let palletRecords: any[] = [];

    // Fetch Standard Box Records
    if (loadType === 'BOX' || loadType === 'BOTH') {
      standardRecords = await prisma.order.findMany({
        where,
        include: {
          dealer: true,
          consignee: true,
          details: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    }

    // Fetch Pallet Records
    if (loadType === 'PALLET' || loadType === 'BOTH' || loadType === 'EMPTY') {
      palletRecords = await prisma.orderPallet.findMany({
        where: {
          ...where,
          type: loadType === 'EMPTY' ? 'RETURN' : 'OUTWARD',
        },
        include: {
          dealer: true,
          consignee: true,
          palletDetails: true,
        },
        orderBy: {
          date: 'asc',
        },
      });
    }

    const unifiedStandard = standardRecords.map(r => ({
      id: r.id,
      date: r.date,
      lrNo: r.lrNo,
      billNo: r.gstBillNo || '-',
      dealerName: r.dealer?.name || 'Walk-in',
      consigneeName: r.consignee?.name || 'Direct Customer',
      loadType: 'BOX',
      weight: Number(r.totalWeight || 0),
      boxes: r.totalBoxes || 0,
      pallets: 0,
      amount: Number(r.totalAmount || 0) / 100, // paise to rupees
      details: (r.details || []).map((d: any) => ({
        product: d.productName,
        qty: d.boxCount,
        weight: Number(d.weight || 0),
        type: d.packingType,
      })),
    }));

    const unifiedPallet = palletRecords.map(r => ({
      id: r.id,
      date: r.date,
      lrNo: r.lrNo || '-',
      billNo: (r.metadata as any)?.invoiceNo || '-',
      dealerName: r.dealer?.name || 'Walk-in',
      consigneeName: r.consignee?.name || 'Direct Customer',
      loadType: r.type === 'RETURN' ? 'PALLET_RETURN' : 'PALLET',
      weight: Number(r.totalWeight || 0),
      boxes: r.totalBoxes || 0,
      pallets: r.palletDetails?.length || 0,
      amount: Number(r.totalAmount || 0) / 100,
      details: (r.palletDetails || []).map((d: any) => ({
        product: d.palletDisplayId || (r.type === 'RETURN' ? 'Empty Pallet Return' : 'Pallet'),
        qty: d.boxQty || d.qty || 0,
        weight: Number(d.weight || 0),
        type: r.type === 'RETURN' ? 'Pallet Return' : 'Pallet',
      })),
    }));

    const allRecords = [...unifiedStandard, ...unifiedPallet].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return JSON.parse(JSON.stringify(allRecords));
  } catch (error) {
    console.error('Error fetching dealer entry records:', error);
    return [];
  }
}
