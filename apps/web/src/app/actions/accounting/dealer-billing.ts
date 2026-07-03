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

    // Fetch all active invoice numbers for this company in the current FY
    const invoices = await prisma.freightInvoice.findMany({
      where: {
        companyId,
        invoiceNo: { startsWith: prefix }
      },
      select: { invoiceNo: true }
    });

    const activeSeqs = invoices.map(inv => {
      const parts = inv.invoiceNo.split('/');
      return parseInt(parts[parts.length - 1]);
    }).filter(seq => !isNaN(seq));

    let nextSeq = 1;
    while (activeSeqs.includes(nextSeq)) {
      nextSeq++;
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

export async function createFreightInvoice(data: {
  invoiceNo: string;
  date: string;
  dealerId: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalAmount: number;
  notes?: string;
  records: { id: string, type: 'BOX' | 'PALLET' }[];
}) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    const tenantId = session?.user?.tenantId;
    if (!companyId || !tenantId) return { success: false, error: 'Unauthorized' };

    const invoice = await prisma.$transaction(async (tx) => {
      // 1. Create the FreightInvoice record
      const inv = await tx.freightInvoice.create({
        data: {
          tenantId,
          companyId,
          invoiceNo: data.invoiceNo,
          date: new Date(data.date),
          customerId: data.dealerId,
          subtotal: Math.round(data.subtotal * 100), // Convert to paise
          cgst: Math.round(data.cgst * 100),
          sgst: Math.round(data.sgst * 100),
          igst: Math.round(data.igst * 100),
          totalAmount: Math.round(data.totalAmount * 100),
          notes: data.notes || '',
          status: 'sent',
        }
      });

      // 2. Link records
      const boxIds = data.records.filter(r => r.type === 'BOX').map(r => r.id);
      const palletIds = data.records.filter(r => r.type === 'PALLET').map(r => r.id);

      if (boxIds.length > 0) {
        await tx.order.updateMany({
          where: { id: { in: boxIds }, companyId },
          data: { 
            gstBillNo: data.invoiceNo,
            freightInvoiceId: inv.id
          }
        });
      }

      if (palletIds.length > 0) {
        for (const id of palletIds) {
          const pallet = await tx.orderPallet.findUnique({ where: { id } });
          const metadata = (pallet?.metadata as any) || {};
          await tx.orderPallet.update({
            where: { id },
            data: { 
              freightInvoiceId: inv.id,
              metadata: { ...metadata, invoiceNo: data.invoiceNo }
            }
          });
        }
      }

      return inv;
    });

    return { success: true, invoice };
  } catch (error: any) {
    console.error('Error creating freight invoice:', error);
    return { success: false, error: error?.message || 'Failed to generate invoice' };
  }
}

export async function getSavedInvoices() {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return [];

    const invoices = await prisma.freightInvoice.findMany({
      where: { companyId },
      include: {
        orders: {
          include: { consignee: true, details: true }
        },
        pallets: {
          include: { consignee: true, palletDetails: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    // Resolve customer/dealer details manually
    const dealerIds = Array.from(new Set(invoices.map(i => i.customerId)));
    const dealers = await prisma.dealer.findMany({
      where: { id: { in: dealerIds } },
      select: { id: true, name: true, pan: true, gstin: true, address: true }
    });
    const dealerMap = new Map(dealers.map(d => [d.id, d]));

    const enriched = invoices.map(inv => {
      // Map standard and pallet orders to a unified format
      const unifiedOrders = inv.orders.map(r => ({
        id: r.id,
        date: r.date,
        lrNo: r.lrNo,
        loadType: 'BOX' as const,
        totalWeight: Number(r.totalWeight || 0),
        totalBoxes: r.totalBoxes,
        rateOn: r.rateOn,
        rate: Number(r.rate || 0) / 100,
        subtotal: Number(r.subtotal || 0) / 100,
        cgstPct: Number(r.cgstPct || 0),
        sgstPct: Number(r.sgstPct || 0),
        igstPct: Number(r.igstPct || 0),
        cgstAmount: Number(r.cgstAmount || 0) / 100,
        sgstAmount: Number(r.sgstAmount || 0) / 100,
        igstAmount: Number(r.igstAmount || 0) / 100,
        totalAmount: Number(r.totalAmount || 0) / 100,
        consignee: r.consignee,
        companyName: r.companyName,
        details: r.details.map(d => ({
          productName: d.productName,
          packingType: d.packingType,
        }))
      }));

      const unifiedPallets = inv.pallets.map(r => ({
        id: r.id,
        date: r.date,
        lrNo: r.lrNo || '',
        loadType: r.type === 'RETURN' ? ('PALLET_RETURN' as const) : ('PALLET' as const),
        totalWeight: Number(r.totalWeight || 0),
        totalBoxes: r.totalBoxes,
        rateOn: r.rateOn,
        rate: Number(r.rate || 0) / 100,
        subtotal: Number(r.subtotal || 0) / 100,
        cgstPct: Number(r.cgstPct || 0),
        sgstPct: Number(r.sgstPct || 0),
        igstPct: Number(r.igstPct || 0),
        cgstAmount: Number(r.cgstAmount || 0) / 100,
        sgstAmount: Number(r.sgstAmount || 0) / 100,
        igstAmount: Number(r.igstAmount || 0) / 100,
        totalAmount: Number(r.totalAmount || 0) / 100,
        consignee: r.consignee,
        companyName: r.companyName,
        details: r.palletDetails.map(d => ({
          productName: d.palletDisplayId || (r.type === 'RETURN' ? 'Empty Pallet Return' : 'Pallet'),
          packingType: r.type === 'RETURN' ? 'Pallet Return' : 'Pallet',
        }))
      }));

      return {
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        date: inv.date,
        customerId: inv.customerId,
        subtotal: Number(inv.subtotal || 0) / 100,
        cgst: Number(inv.cgst || 0) / 100,
        sgst: Number(inv.sgst || 0) / 100,
        igst: Number(inv.igst || 0) / 100,
        totalAmount: Number(inv.totalAmount || 0) / 100,
        notes: inv.notes,
        status: inv.status,
        dealer: dealerMap.get(inv.customerId) || { name: 'Unknown Customer' },
        records: [...unifiedOrders, ...unifiedPallets].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      };
    });

    return JSON.parse(JSON.stringify(enriched));
  } catch (error) {
    console.error('Error fetching saved invoices:', error);
    return [];
  }
}

export async function deleteFreightInvoice(invoiceId: string) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return { success: false, error: 'Unauthorized' };

    await prisma.$transaction(async (tx) => {
      // 1. Fetch invoice to get its invoiceNo and verify ownership
      const inv = await tx.freightInvoice.findUnique({
        where: { id: invoiceId, companyId },
        include: { orders: true, pallets: true }
      });

      if (!inv) throw new Error('Invoice not found');

      // 2. Disconnect orders
      if (inv.orders.length > 0) {
        await tx.order.updateMany({
          where: { freightInvoiceId: invoiceId, companyId },
          data: {
            freightInvoiceId: null,
            gstBillNo: null
          }
        });
      }

      // 3. Disconnect pallets
      if (inv.pallets.length > 0) {
        for (const pallet of inv.pallets) {
          const metadata = (pallet.metadata as any) || {};
          delete metadata.invoiceNo;
          await tx.orderPallet.update({
            where: { id: pallet.id },
            data: {
              freightInvoiceId: null,
              metadata: metadata
            }
          });
        }
      }

      // 4. Delete the invoice itself
      await tx.freightInvoice.delete({
        where: { id: invoiceId }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting freight invoice:', error);
    return { success: false, error: error?.message || 'Failed to delete invoice' };
  }
}

export async function updateInvoiceRecords(
  invoiceId: string, 
  date: string, 
  notes: string | null, 
  updatedRecords: {
    id: string;
    loadType: 'BOX' | 'PALLET' | 'PALLET_RETURN';
    totalWeight: number;
    totalBoxes: number;
    rate: number;
    rateOn: string;
    gstType: string;
    gstRate: number;
  }[]
) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return { success: false, error: 'Unauthorized' };

    await prisma.$transaction(async (tx) => {
      let subtotalPaise = 0;
      let cgstPaise = 0;
      let sgstPaise = 0;
      let igstPaise = 0;
      let totalAmountPaise = 0;

      for (const rec of updatedRecords) {
        const ratePaise = Math.round(rec.rate * 100);
        const multiplier = rec.loadType === 'BOX'
          ? (rec.rateOn === 'box' ? rec.totalBoxes : rec.totalWeight)
          : (rec.rateOn === 'weight' ? rec.totalWeight : rec.totalBoxes);
        
        const rowSubtotal = Math.round(multiplier * ratePaise);
        
        let rowCgst = 0;
        let rowSgst = 0;
        let rowIgst = 0;

        if (rec.gstRate > 0) {
          if (rec.gstType === 'intra') {
            const halfRate = rec.gstRate / 2;
            rowCgst = Math.round((rowSubtotal * halfRate) / 100);
            rowSgst = Math.round((rowSubtotal * halfRate) / 100);
          } else {
            rowIgst = Math.round((rowSubtotal * rec.gstRate) / 100);
          }
        }

        const rowTotal = rowSubtotal + rowCgst + rowSgst + rowIgst;

        subtotalPaise += rowSubtotal;
        cgstPaise += rowCgst;
        sgstPaise += rowSgst;
        igstPaise += rowIgst;
        totalAmountPaise += rowTotal;

        if (rec.loadType === 'BOX') {
          await tx.order.update({
            where: { id: rec.id, companyId },
            data: {
              totalWeight: rec.totalWeight,
              totalBoxes: rec.totalBoxes,
              rate: ratePaise,
              rateOn: rec.rateOn,
              subtotal: rowSubtotal,
              cgstPct: rec.gstType === 'intra' ? rec.gstRate / 2 : 0,
              sgstPct: rec.gstType === 'intra' ? rec.gstRate / 2 : 0,
              igstPct: rec.gstType !== 'intra' ? rec.gstRate : 0,
              cgstAmount: rowCgst,
              sgstAmount: rowSgst,
              igstAmount: rowIgst,
              totalAmount: rowTotal,
              gstType: rec.gstType,
            }
          });
        } else {
          await tx.orderPallet.update({
            where: { id: rec.id, companyId },
            data: {
              totalWeight: rec.totalWeight,
              totalBoxes: rec.totalBoxes,
              rate: ratePaise,
              rateOn: rec.rateOn,
              subtotal: rowSubtotal,
              cgstPct: rec.gstType === 'intra' ? rec.gstRate / 2 : 0,
              sgstPct: rec.gstType === 'intra' ? rec.gstRate / 2 : 0,
              igstPct: rec.gstType !== 'intra' ? rec.gstRate : 0,
              cgstAmount: rowCgst,
              sgstAmount: rowSgst,
              igstAmount: rowIgst,
              totalAmount: rowTotal,
              gstType: rec.gstType,
            }
          });
        }
      }

      await tx.freightInvoice.update({
        where: { id: invoiceId, companyId },
        data: {
          date: new Date(date),
          notes: notes || '',
          subtotal: subtotalPaise,
          cgst: cgstPaise,
          sgst: sgstPaise,
          igst: igstPaise,
          totalAmount: totalAmountPaise,
        }
      });
    });

    return { success: true };
  } catch (error: any) {
    console.error('Error updating invoice records:', error);
    return { success: false, error: error?.message || 'Failed to update invoice' };
  }
}
