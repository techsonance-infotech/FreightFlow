'use server';

import { prisma } from '@freightflow/db';
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
  loadType: 'BOX' | 'PALLET' | 'BOTH' = 'BOTH',
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
      },
      orderBy: {
        date: 'asc',
      },
    };

    let standardRecords: any[] = [];
    let palletRecords: any[] = [];

    if (loadType === 'BOX' || loadType === 'BOTH') {
      standardRecords = await prisma.order.findMany({
        ...query,
        include: {
          ...query.include,
          details: true,
        }
      });
    }

    if (loadType === 'PALLET' || loadType === 'BOTH') {
      palletRecords = await prisma.orderPallet.findMany({
        ...query,
        include: {
          ...query.include,
          palletDetails: true,
        }
      });
    }

    const unifiedStandard = standardRecords.map(r => ({
      ...r,
      loadType: 'BOX' as const,
      cgstPct: Number(r.cgstPct || 0),
      sgstPct: Number(r.sgstPct || 0),
      igstPct: Number(r.igstPct || 0),
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
      loadType: 'PALLET' as const,
      cgstPct: Number(r.cgstPct || 0),
      sgstPct: Number(r.sgstPct || 0),
      igstPct: Number(r.igstPct || 0),
      totalWeight: Number(r.totalWeight || 0),
      rate: Number(r.rate || 0) / 100, // Convert paise to rupees
      gstPct: Number(r.gstPct || 0),
      details: (r.palletDetails || []).map((d: any) => ({
        productName: d.palletDisplayId || 'Pallet',
        weight: Number(d.weight || d.qty || 0), 
        boxCount: d.qty,
        packingType: 'Pallet',
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
    let fyStart = month >= 3 ? currentYear : currentYear - 1;
    let fyEnd = fyStart + 1;
    const fyString = `${fyStart.toString().slice(-2)}-${fyEnd.toString().slice(-2)}`;
    const prefix = `INV/${fyString}/`;

    // Search in Orders (gstBillNo)
    const lastOrder = await prisma.order.findFirst({
      where: {
        companyId,
        gstBillNo: { startsWith: prefix }
      },
      orderBy: { gstBillNo: 'desc' },
      select: { gstBillNo: true }
    });

    let nextSeq = 1;
    if (lastOrder?.gstBillNo) {
      const parts = lastOrder.gstBillNo.split('/');
      const seq = parseInt(parts[parts.length - 1]);
      if (!isNaN(seq)) nextSeq = seq + 1;
    }

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
