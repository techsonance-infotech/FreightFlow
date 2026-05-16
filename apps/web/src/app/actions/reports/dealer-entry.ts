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
        where,
        include: {
          dealer: true,
          palletDetails: true,
        },
        orderBy: {
          date: 'asc',
        },
      });

      // Filter for empty pallets if requested
      if (loadType === 'EMPTY') {
        palletRecords = palletRecords.filter(r => 
          r.totalBoxes === 0 || 
          (r.metadata as any)?.isEmpty === true ||
          r.palletDetails?.every((d: any) => d.boxQty === 0)
        );
      }
    }

    const unifiedStandard = standardRecords.map(r => ({
      id: r.id,
      date: r.date,
      lrNo: r.lrNo,
      billNo: r.gstBillNo || '-',
      dealerName: r.dealer?.name || 'Walk-in',
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
      loadType: 'PALLET',
      weight: Number(r.totalWeight || 0),
      boxes: r.totalBoxes || 0,
      pallets: r.palletDetails?.length || 0,
      amount: Number(r.totalAmount || 0) / 100,
      details: (r.palletDetails || []).map((d: any) => ({
        product: d.palletDisplayId || 'Pallet',
        qty: d.boxQty || 0,
        weight: Number(d.weight || 0),
        type: 'Pallet',
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
