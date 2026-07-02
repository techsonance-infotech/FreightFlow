'use server';

import { prisma, Prisma } from '@freightflow/db';
import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/auth-utils';

export async function getSessionData() {
  const session = await getSession();
  return session?.user || null;
}

export async function getDealers(companyId?: string) {
  try {
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const session = await getSession();
      targetCompanyId = session?.user?.companyId;
    }

    if (!targetCompanyId) return [];

    return await prisma.dealer.findMany({
      where: {
        companyId: targetCompanyId,
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  } catch (error) {
    console.error('Error fetching dealers:', error);
    return [];
  }
}

export async function getDealerRecords(
  dealerId: string,
  startDate?: Date,
  endDate?: Date,
  loadType: 'BOX' | 'PALLET' | 'BOTH' | 'PALLET_RETURN' = 'BOTH',
  companyId?: string
) {
  try {
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const session = await getSession();
      targetCompanyId = session?.user?.companyId;
    }

    if (!targetCompanyId) return [];

    const query: any = {
      where: {
        companyId: targetCompanyId,
        dealerId,
        date: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'deleted',
        },
      },
      include: {
        dealer: true,
        consignee: true,
      },
      orderBy: {
        date: 'asc',
      },
    };

    const [standardRecords, palletRecords] = (await Promise.all([
      (loadType === 'BOX' || loadType === 'BOTH')
        ? prisma.order.findMany({
            ...query,
            include: {
              ...query.include,
              details: true,
            }
          })
        : Promise.resolve([]),
      (loadType === 'PALLET' || loadType === 'BOTH' || loadType === 'PALLET_RETURN')
        ? prisma.orderPallet.findMany({
            ...query,
            where: {
              ...query.where,
              type: loadType === 'PALLET_RETURN' ? 'RETURN' : 'OUTWARD'
            },
            include: {
              ...query.include,
              palletDetails: true,
            }
          })
        : Promise.resolve([])
    ])) as [any[], any[]];

    const unifiedStandard = standardRecords.map(r => ({
      ...r,
      loadType: 'BOX' as const,
      cgstPct: Number(r.cgstPct || 0),
      sgstPct: Number(r.sgstPct || 0),
      igstPct: Number(r.igstPct || 0),
      cgstAmount: Number(r.cgstAmount || 0) / 100,
      sgstAmount: Number(r.sgstAmount || 0) / 100,
      igstAmount: Number(r.igstAmount || 0) / 100,
      subtotal: Number(r.subtotal || 0) / 100,
      totalAmount: Number(r.totalAmount || 0) / 100,
      freight: Number(r.freight || 0) / 100,
      hamali: Number(r.hamali || 0) / 100,
      totalWeight: Number(r.totalWeight || 0),
      rate: Number(r.rate || 0) / 100, // Convert paise to rupees
      details: (r.details || []).map((d: any) => ({
        productName: d.productName,
        weight: Number(d.weight || 0),
        boxCount: d.boxCount,
        packingType: d.packingType,
      })),
    }));

    const unifiedPallet = palletRecords.map(r => ({
      ...r,
      loadType: r.type === 'RETURN' ? ('PALLET_RETURN' as const) : ('PALLET' as const),
      cgstPct: Number(r.cgstPct || 0),
      sgstPct: Number(r.sgstPct || 0),
      igstPct: Number(r.igstPct || 0),
      cgstAmount: Number(r.cgstAmount || 0) / 100,
      sgstAmount: Number(r.sgstAmount || 0) / 100,
      igstAmount: Number(r.igstAmount || 0) / 100,
      subtotal: Number(r.subtotal || 0) / 100,
      totalAmount: Number(r.totalAmount || 0) / 100,
      freight: Number(r.freight || 0) / 100,
      hamali: Number(r.hamali || 0) / 100,
      totalWeight: Number(r.totalWeight || 0),
      rate: Number(r.rate || 0) / 100, // Convert paise to rupees
      gstPct: Number(r.gstPct || 0),
      details: (r.palletDetails || []).map((d: any) => ({
        productName: d.palletDisplayId || (r.type === 'RETURN' ? 'Empty Pallet Return' : 'Pallet'),
        weight: Number(d.weight || d.qty || 0), 
        boxCount: d.qty,
        packingType: r.type === 'RETURN' ? 'Pallet Return' : 'Pallet',
      })),
    }));

    return JSON.parse(JSON.stringify([...unifiedStandard, ...unifiedPallet].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )));
  } catch (error) {
    console.error('Error fetching dealer records:', error);
    return [];
  }
}

export async function getCompanyBillingDetails(companyId?: string) {
  try {
    let targetCompanyId = companyId;
    if (!targetCompanyId) {
      const session = await getSession();
      targetCompanyId = session?.user?.companyId;
    }

    if (!targetCompanyId) return null;

    return await prisma.company.findUnique({
      where: { id: targetCompanyId },
      select: {
        name: true,
        address: true,
        city: true,
        state: true,
        gstin: true,
        pan: true,
        bankName: true,
        accountNo: true,
        ifscCode: true,
        branchName: true,
        printHeader: true,
        printFooter: true,
        printTerms: true,
        logoUrl: true,
        phone: true,
        signatureUrl: true,
      },
    });
  } catch (error) {
    console.error('Error fetching company billing details:', error);
    return null;
  }
}

export async function getNextInvoiceNumber() {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return null;

    const today = new Date();
    const month = today.getMonth();
    const currentYear = today.getFullYear();
    const fyStart = month >= 3 ? currentYear : currentYear - 1;
    const fyEnd = fyStart + 1;
    const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
    const prefix = `INV/${fyString}/`;

    const startOfFy = new Date(fyStart, 3, 1);

    // Parallel execution and date-range filtering for pallets
    const [lastOrder, palletRecords] = await Promise.all([
      prisma.order.findFirst({
        where: {
          companyId,
          gstBillNo: { startsWith: prefix }
        },
        orderBy: { gstBillNo: 'desc' },
        select: { gstBillNo: true }
      }),
      prisma.orderPallet.findMany({
        where: {
          companyId,
          date: {
            gte: startOfFy
          },
          metadata: {
            not: Prisma.DbNull
          }
        },
        select: { metadata: true }
      })
    ]);

    let maxSeq = 0;

    if (lastOrder?.gstBillNo) {
      const parts = lastOrder.gstBillNo.split('/');
      const seq = parseInt(parts[parts.length - 1]);
      if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
    }

    for (const p of palletRecords) {
      const meta = p.metadata as any;
      if (meta && typeof meta === 'object' && meta.invoiceNo && typeof meta.invoiceNo === 'string' && meta.invoiceNo.startsWith(prefix)) {
        const parts = meta.invoiceNo.split('/');
        const seq = parseInt(parts[parts.length - 1]);
        if (!isNaN(seq) && seq > maxSeq) maxSeq = seq;
      }
    }

    const nextSeq = maxSeq + 1;
    return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
  } catch (e) {
    console.error('Error fetching next invoice number:', e);
    return null;
  }
}

export async function markRecordsAsInvoiced(records: { id: string, type: 'BOX' | 'PALLET' }[], invoiceNo: string) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return { success: false };

    const boxIds = records.filter(r => r.type === 'BOX').map(r => r.id);
    const palletIds = records.filter(r => r.type === 'PALLET').map(r => r.id);

    if (boxIds.length > 0) {
      await prisma.order.updateMany({
        where: { id: { in: boxIds }, companyId },
        data: { gstBillNo: invoiceNo }
      });
    }

    if (palletIds.length > 0) {
      for (const id of palletIds) {
        const pallet = await prisma.orderPallet.findUnique({ where: { id } });
        const metadata = (pallet?.metadata as any) || {};
        await prisma.orderPallet.update({
          where: { id },
          data: { 
            metadata: { ...metadata, invoiceNo }
          }
        });
      }
    }

    return { success: true };
  } catch (e) {
    console.error('Error marking records as invoiced:', e);
    return { success: false };
  }
}
