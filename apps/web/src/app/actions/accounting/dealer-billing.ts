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
    let targetTenantId = '';
    const session = await getSession();
    if (!targetCompanyId) {
      targetCompanyId = session?.user?.companyId;
    }
    targetTenantId = session?.user?.tenantId || '';

    if (!targetCompanyId) return [];

    let settings: any = {};
    if (targetTenantId) {
      const tenant = await prisma.tenant.findUnique({
        where: { id: targetTenantId },
        select: { settings: true }
      });
      settings = (tenant?.settings as any) || {};
    }

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
        deletedAt: null,
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

    const isSeparateBilling = settings.enableSeparateReturnBilling === true;
    const unifiedPallet = palletRecords.map(r => {
      let rate = Number(r.rate || 0) / 100;
      let subtotal = Number(r.subtotal || 0) / 100;
      let cgstAmount = Number(r.cgstAmount || 0) / 100;
      let sgstAmount = Number(r.sgstAmount || 0) / 100;
      let igstAmount = Number(r.igstAmount || 0) / 100;
      let totalAmount = Number(r.totalAmount || 0) / 100;

      if (isSeparateBilling && r.type === 'RETURN') {
        const totalQty = (r.palletDetails || []).reduce((acc: number, d: any) => acc + (d.qty || 0), 0);
        const totalReturnChargesPaise = (r.palletDetails || []).reduce((acc: number, d: any) => acc + ((d.qty || 0) * (d.returnRate || 0)), 0);
        rate = totalQty > 0 ? (totalReturnChargesPaise / totalQty) / 100 : 0;
        
        subtotal = totalReturnChargesPaise / 100;
        const cgstPct = Number(r.cgstPct || 0);
        const sgstPct = Number(r.sgstPct || 0);
        const igstPct = Number(r.igstPct || 0);
        
        cgstAmount = (subtotal * cgstPct) / 100;
        sgstAmount = (subtotal * sgstPct) / 100;
        igstAmount = (subtotal * igstPct) / 100;
        totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;
      }

      let computedConsigneeName = r.consignee?.name;
      if (!computedConsigneeName && r.type === 'RETURN' && r.palletDetails?.length > 0) {
        computedConsigneeName = Array.from(new Set(r.palletDetails.map((d: any) => d.consigneeName).filter(Boolean))).join(', ');
      }

      return {
        ...r,
        consignee: computedConsigneeName ? { name: computedConsigneeName } : r.consignee,
        loadType: r.type === 'RETURN' ? ('PALLET_RETURN' as const) : ('PALLET' as const),
        cgstPct: Number(r.cgstPct || 0),
        sgstPct: Number(r.sgstPct || 0),
        igstPct: Number(r.igstPct || 0),
        cgstAmount,
        sgstAmount,
        igstAmount,
        subtotal,
        totalAmount,
        freight: Number(r.freight || 0) / 100,
        hamali: Number(r.hamali || 0) / 100,
        totalWeight: Number(r.totalWeight || 0),
        rate,
        gstPct: Number(r.gstPct || 0),
        details: (r.palletDetails || []).map((d: any) => ({
          productName: d.palletDisplayId || (r.type === 'RETURN' ? 'Empty Pallet Return' : 'Pallet'),
          weight: Number(d.weight || d.qty || 0), 
          boxCount: d.qty,
          packingType: r.type === 'RETURN' ? 'Pallet Return' : 'Pallet',
        })),
      };
    });

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

export async function getNextInvoiceNumber(loadType?: 'BOX' | 'PALLET' | 'BOTH' | 'PALLET_RETURN') {
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

    const isPalletReturn = loadType === 'PALLET_RETURN';

    // Fetch all active invoice numbers for this company in the current FY
    const invoices = await prisma.freightInvoice.findMany({
      where: {
        companyId,
        invoiceNo: isPalletReturn
          ? { startsWith: prefix, endsWith: '/PR' }
          : { startsWith: prefix, not: { endsWith: '/PR' } }
      },
      select: { invoiceNo: true }
    });

    const activeSeqs = invoices.map(inv => {
      if (isPalletReturn) {
        const match = inv.invoiceNo.match(/^INV\/\d{2,4}-\d{2}\/(\d+)\/PR$/);
        return match ? parseInt(match[1]) : NaN;
      } else {
        const parts = inv.invoiceNo.split('/');
        return parseInt(parts[parts.length - 1]);
      }
    }).filter(seq => !isNaN(seq));

    let nextSeq = 1;
    while (activeSeqs.includes(nextSeq)) {
      nextSeq++;
    }

    return isPalletReturn
      ? `${prefix}${nextSeq.toString().padStart(3, '0')}/PR`
      : `${prefix}${nextSeq.toString().padStart(3, '0')}`;
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
      const params = [invoiceNo, companyId, ...palletIds];
      const idPlaceholders = palletIds.map((_, i) => `$${i + 3}::uuid`).join(', ');
      await prisma.$executeRawUnsafe(
        `UPDATE "order_pallets"
         SET "metadata" = jsonb_set(coalesce("metadata", '{}'::jsonb), '{invoiceNo}', to_jsonb($1::text))
         WHERE "id" IN (${idPlaceholders}) AND "company_id" = $2::uuid`,
        ...params
      );
    }

    return { success: true };
  } catch (e) {
    console.error('Error marking records as invoiced:', e);
    return { success: false };
  }
}

async function validateInvoiceNumber(tx: any, companyId: string, invoiceNo: string, excludeInvoiceId?: string) {
  const trimmed = invoiceNo.trim();
  if (!trimmed) {
    return { valid: false, error: 'Invoice number cannot be empty.' };
  }

  // 1. Check duplicate
  const existing = await tx.freightInvoice.findFirst({
    where: {
      companyId,
      invoiceNo: trimmed,
      id: excludeInvoiceId ? { not: excludeInvoiceId } : undefined
    }
  });

  if (existing) {
    return { valid: false, error: `Invoice number "${trimmed}" already exists.` };
  }

  // 2. Format sequence check: INV/YY-YY/SEQ or INV/YY-YY/SEQ/PR
  const isPalletReturn = trimmed.endsWith('/PR');
  const match = isPalletReturn
    ? trimmed.match(/^INV\/\d{2,4}-\d{2}\/(\d+)\/PR$/)
    : trimmed.match(/^INV\/\d{2,4}-\d{2}\/(\d+)$/);

  if (match) {
    const seq = parseInt(match[1], 10);
    const prefixMatch = trimmed.match(/^INV\/\d{2,4}-\d{2}\//);
    const prefix = prefixMatch ? prefixMatch[0] : '';

    // Fetch all active sequences under this prefix
    const invoices = await tx.freightInvoice.findMany({
      where: {
        companyId,
        invoiceNo: isPalletReturn
          ? { startsWith: prefix, endsWith: '/PR' }
          : { startsWith: prefix, not: { endsWith: '/PR' } },
        id: excludeInvoiceId ? { not: excludeInvoiceId } : undefined
      },
      select: { invoiceNo: true }
    });

    const seqs = invoices.map((inv: any) => {
      const m = isPalletReturn
        ? inv.invoiceNo.trim().match(/^INV\/\d{2,4}-\d{2}\/(\d+)\/PR$/)
        : inv.invoiceNo.trim().match(/^INV\/\d{2,4}-\d{2}\/(\d+)$/);
      return m ? parseInt(m[1], 10) : null;
    }).filter((s: any) => s !== null && !isNaN(s));

    if (seqs.includes(seq)) {
      const formattedSeq = isPalletReturn
        ? `${prefix}${seq.toString().padStart(3, '0')}/PR`
        : `${prefix}${seq.toString().padStart(3, '0')}`;
      return {
        valid: false,
        error: `Invoice number "${formattedSeq}" is already in use.`
      };
    }
  }

  return { valid: true };
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

    const trimmedInvoiceNo = data.invoiceNo.trim();
    if (!trimmedInvoiceNo) {
      return { success: false, error: 'Invoice number is required.' };
    }

    const invoice = await prisma.$transaction(async (tx) => {
      // Acquire transaction-level advisory lock to serialize generation for this company
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${companyId}::text))`;

      const validation = await validateInvoiceNumber(tx, companyId, trimmedInvoiceNo);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 1. Create the FreightInvoice record
      const inv = await tx.freightInvoice.create({
        data: {
          tenantId,
          companyId,
          invoiceNo: trimmedInvoiceNo,
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
            gstBillNo: trimmedInvoiceNo,
            freightInvoiceId: inv.id
          }
        });
      }

      if (palletIds.length > 0) {
        const params = [inv.id, trimmedInvoiceNo, companyId, ...palletIds];
        const idPlaceholders = palletIds.map((_, i) => `$${i + 4}::uuid`).join(', ');
        await tx.$executeRawUnsafe(
          `UPDATE "order_pallets"
           SET "freight_invoice_id" = $1::uuid,
               "metadata" = jsonb_set(coalesce("metadata", '{}'::jsonb), '{invoiceNo}', to_jsonb($2::text))
           WHERE "id" IN (${idPlaceholders}) AND "company_id" = $3::uuid`,
          ...params
        );
      }

      return inv;
    }, {
      maxWait: 10000,
      timeout: 30000,
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
          where: { deletedAt: null },
          include: { consignee: true, details: true }
        },
        pallets: {
          where: { deletedAt: null },
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

    const enriched = [];
    for (const inv of invoices) {
      let activeSubtotalPaise = 0;
      let activeCgstPaise = 0;
      let activeSgstPaise = 0;
      let activeIgstPaise = 0;
      let activeTotalAmountPaise = 0;

      for (const r of inv.orders) {
        activeSubtotalPaise += Number(r.subtotal || 0);
        activeCgstPaise += Number(r.cgstAmount || 0);
        activeSgstPaise += Number(r.sgstAmount || 0);
        activeIgstPaise += Number(r.igstAmount || 0);
        activeTotalAmountPaise += Number(r.totalAmount || 0);
      }

      for (const r of inv.pallets) {
        activeSubtotalPaise += Number(r.subtotal || 0);
        activeCgstPaise += Number(r.cgstAmount || 0);
        activeSgstPaise += Number(r.sgstAmount || 0);
        activeIgstPaise += Number(r.igstAmount || 0);
        activeTotalAmountPaise += Number(r.totalAmount || 0);
      }

      // Auto-heal if totals are out of sync due to soft-deleted records (only if invoice has linked records)
      if (
        (inv.orders.length > 0 || inv.pallets.length > 0) &&
        (activeSubtotalPaise !== inv.subtotal ||
        activeCgstPaise !== inv.cgst ||
        activeSgstPaise !== inv.sgst ||
        activeIgstPaise !== inv.igst ||
        activeTotalAmountPaise !== inv.totalAmount)
      ) {
        await prisma.freightInvoice.update({
          where: { id: inv.id },
          data: {
            subtotal: activeSubtotalPaise,
            cgst: activeCgstPaise,
            sgst: activeSgstPaise,
            igst: activeIgstPaise,
            totalAmount: activeTotalAmountPaise
          }
        });
        inv.subtotal = activeSubtotalPaise;
        inv.cgst = activeCgstPaise;
        inv.sgst = activeSgstPaise;
        inv.igst = activeIgstPaise;
        inv.totalAmount = activeTotalAmountPaise;
      }

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
        gstType: (r as any).gstType || 'intra',
        consignee: r.consignee,
        companyName: r.companyName,
        details: r.details.map(d => ({
          productName: d.productName,
          packingType: d.packingType,
        }))
      }));

      const unifiedPallets = inv.pallets.map(r => {
        let computedConsigneeName = r.consignee?.name;
        if (!computedConsigneeName && r.type === 'RETURN' && r.palletDetails?.length > 0) {
          computedConsigneeName = Array.from(new Set(r.palletDetails.map((d: any) => d.consigneeName).filter(Boolean))).join(', ');
        }
        return {
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
          gstType: (r as any).gstType || 'intra',
          consignee: computedConsigneeName ? { name: computedConsigneeName } : r.consignee,
          companyName: r.companyName,
          details: r.palletDetails.map(d => ({
            productName: d.palletDisplayId || (r.type === 'RETURN' ? 'Empty Pallet Return' : 'Pallet'),
            packingType: r.type === 'RETURN' ? 'Pallet Return' : 'Pallet',
          }))
        };
      });

      enriched.push({
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
      });
    }

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

    // 1. Fetch invoice to verify ownership
    const inv = await prisma.freightInvoice.findFirst({
      where: { id: invoiceId, companyId },
      include: { orders: true, pallets: true }
    });

    if (!inv) return { success: false, error: 'Invoice not found' };

    const batchOps: any[] = [];

    // 2. Disconnect orders
    if (inv.orders.length > 0) {
      batchOps.push(
        prisma.order.updateMany({
          where: { freightInvoiceId: invoiceId, companyId },
          data: {
            freightInvoiceId: null,
            gstBillNo: null
          }
        })
      );
    }

    // 3. Delete the invoice itself safely
    batchOps.push(
      prisma.freightInvoice.deleteMany({
        where: { id: invoiceId, companyId }
      })
    );

    // Run batch transaction safely without interactive transaction timeouts
    await prisma.$transaction(batchOps);

    // 4. Disconnect pallets metadata via raw query
    if (inv.pallets.length > 0) {
      const palletIds = inv.pallets.map(p => p.id);
      const params = [companyId, ...palletIds];
      const idPlaceholders = palletIds.map((_, i) => `$${i + 2}::uuid`).join(', ');
      await prisma.$executeRawUnsafe(
        `UPDATE "order_pallets"
         SET "freight_invoice_id" = NULL,
             "metadata" = coalesce("metadata", '{}'::jsonb) - 'invoiceNo'
         WHERE "id" IN (${idPlaceholders}) AND "company_id" = $1::uuid`,
        ...params
      );
    }

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
  }[],
  invoiceNo?: string
) {
  try {
    const session = await getSession();
    const companyId = session?.user?.companyId;
    if (!companyId) return { success: false, error: 'Unauthorized' };

    // Fetch current invoice first to verify ownership and check if invoiceNo changed
    const currentInvoice = await prisma.freightInvoice.findFirst({
      where: { id: invoiceId, companyId },
      select: {
        id: true,
        invoiceNo: true,
        subtotal: true,
        cgst: true,
        sgst: true,
        igst: true,
        totalAmount: true,
      }
    });
    if (!currentInvoice) {
      return { success: false, error: 'Invoice not found' };
    }

    const trimmedInvoiceNo = invoiceNo?.trim();
    if (invoiceNo !== undefined && !trimmedInvoiceNo) {
      return { success: false, error: 'Invoice number cannot be empty.' };
    }

    const isInvoiceNoChanged = trimmedInvoiceNo && trimmedInvoiceNo !== currentInvoice.invoiceNo;
    if (isInvoiceNoChanged) {
      const validation = await validateInvoiceNumber(prisma, companyId, trimmedInvoiceNo, invoiceId);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
    }

    let subtotalPaise = 0;
    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;
    let totalAmountPaise = 0;

    const transactionOperations: any[] = [];

    for (const rec of updatedRecords) {
      if (!rec.id) continue;

      const rateNum = isNaN(Number(rec.rate)) ? 0 : Number(rec.rate);
      const weightNum = isNaN(Number(rec.totalWeight)) ? 0 : Number(rec.totalWeight);
      const boxesNum = isNaN(Number(rec.totalBoxes)) ? 0 : Math.round(Number(rec.totalBoxes));
      const gstRateNum = isNaN(Number(rec.gstRate)) ? 0 : Number(rec.gstRate);

      const ratePaise = Math.round(rateNum * 100);
      const multiplier = rec.loadType === 'BOX'
        ? (rec.rateOn === 'box' ? boxesNum : weightNum)
        : (rec.rateOn === 'weight' ? weightNum : boxesNum);
      
      const rowSubtotal = Math.round(multiplier * ratePaise);
      
      let rowCgst = 0;
      let rowSgst = 0;
      let rowIgst = 0;

      if (gstRateNum > 0) {
        if (rec.gstType === 'intra') {
          const halfRate = gstRateNum / 2;
          rowCgst = Math.round((rowSubtotal * halfRate) / 100);
          rowSgst = Math.round((rowSubtotal * halfRate) / 100);
        } else {
          rowIgst = Math.round((rowSubtotal * gstRateNum) / 100);
        }
      }

      const rowTotal = rowSubtotal + rowCgst + rowSgst + rowIgst;

      subtotalPaise += rowSubtotal;
      cgstPaise += rowCgst;
      sgstPaise += rowSgst;
      igstPaise += rowIgst;
      totalAmountPaise += rowTotal;

      const updateFields = {
        totalWeight: weightNum,
        totalBoxes: boxesNum,
        rate: ratePaise,
        rateOn: rec.rateOn || 'weight',
        subtotal: rowSubtotal,
        cgstPct: rec.gstType === 'intra' ? gstRateNum / 2 : 0,
        sgstPct: rec.gstType === 'intra' ? gstRateNum / 2 : 0,
        igstPct: rec.gstType !== 'intra' ? gstRateNum : 0,
        cgstAmount: rowCgst,
        sgstAmount: rowSgst,
        igstAmount: rowIgst,
        totalAmount: rowTotal,
        gstType: rec.gstType || 'intra',
      };

      if (rec.loadType === 'BOX') {
        transactionOperations.push(
          prisma.order.updateMany({
            where: { id: rec.id, companyId },
            data: updateFields
          })
        );
      } else {
        transactionOperations.push(
          prisma.orderPallet.updateMany({
            where: { id: rec.id, companyId },
            data: updateFields
          })
        );
      }
    }

    const updateData: any = {
      date: new Date(date),
      notes: notes || '',
    };

    // Only update totals if updatedRecords were provided; otherwise preserve existing totals for old standalone invoices
    if (updatedRecords.length > 0) {
      updateData.subtotal = subtotalPaise;
      updateData.cgst = cgstPaise;
      updateData.sgst = sgstPaise;
      updateData.igst = igstPaise;
      updateData.totalAmount = totalAmountPaise;
    }

    if (isInvoiceNoChanged && trimmedInvoiceNo) {
      updateData.invoiceNo = trimmedInvoiceNo;
    }

    transactionOperations.push(
      prisma.freightInvoice.updateMany({
        where: { id: invoiceId, companyId },
        data: updateData
      })
    );

    if (isInvoiceNoChanged && trimmedInvoiceNo) {
      transactionOperations.push(
        prisma.order.updateMany({
          where: { freightInvoiceId: invoiceId, companyId },
          data: { gstBillNo: trimmedInvoiceNo }
        })
      );
    }

    // Execute atomic sequential transaction batch without interactive session timeout issues
    if (transactionOperations.length > 0) {
      await prisma.$transaction(transactionOperations);
    }

    if (isInvoiceNoChanged && trimmedInvoiceNo) {
      await prisma.$executeRawUnsafe(
        `UPDATE "order_pallets"
         SET "metadata" = jsonb_set(coalesce("metadata", '{}'::jsonb), '{invoiceNo}', to_jsonb($1::text))
         WHERE "freight_invoice_id" = $2::uuid AND "company_id" = $3::uuid`,
        trimmedInvoiceNo,
        invoiceId,
        companyId
      );
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating invoice records:', error);
    return { success: false, error: error?.message || 'Failed to update invoice' };
  }
}

export async function recalculateInvoiceTotals(invoiceId: string) {
  try {
    const inv = await prisma.freightInvoice.findUnique({
      where: { id: invoiceId },
      include: {
        orders: {
          where: { deletedAt: null }
        },
        pallets: {
          where: { deletedAt: null }
        }
      }
    });

    if (!inv) return;

    // Do not recalculate or zero out if no linked records exist
    if (inv.orders.length === 0 && inv.pallets.length === 0) return;

    let subtotalPaise = 0;
    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;
    let totalAmountPaise = 0;

    for (const r of inv.orders) {
      subtotalPaise += Number(r.subtotal || 0);
      cgstPaise += Number(r.cgstAmount || 0);
      sgstPaise += Number(r.sgstAmount || 0);
      igstPaise += Number(r.igstAmount || 0);
      totalAmountPaise += Number(r.totalAmount || 0);
    }

    for (const r of inv.pallets) {
      subtotalPaise += Number(r.subtotal || 0);
      cgstPaise += Number(r.cgstAmount || 0);
      sgstPaise += Number(r.sgstAmount || 0);
      igstPaise += Number(r.igstAmount || 0);
      totalAmountPaise += Number(r.totalAmount || 0);
    }

    await prisma.freightInvoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: subtotalPaise,
        cgst: cgstPaise,
        sgst: sgstPaise,
        igst: igstPaise,
        totalAmount: totalAmountPaise
      }
    });
  } catch (error) {
    console.error('Error recalculating invoice totals:', error);
  }
}

