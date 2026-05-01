import { prisma } from '@freightflow/db';

export class GSTEngine {
  /**
   * Calculates GST breakdown (CGST+SGST for intra-state, IGST for inter-state)
   * @param amount The base amount in paise
   * @param originState Code of the origin state (e.g., 'MH')
   * @param destState Code of the destination state (e.g., 'MH')
   * @param gstRate The total GST rate (e.g., 5 for 5%)
   */
  static calculateGST(amount: number, originState: string, destState: string, gstRate: number = 5) {
    if (originState === destState) {
      // Intra-state
      const halfRate = gstRate / 2;
      return {
        cgst: Math.round(amount * (halfRate / 100)),
        sgst: Math.round(amount * (halfRate / 100)),
        igst: 0,
        totalTax: Math.round(amount * (gstRate / 100))
      };
    } else {
      // Inter-state
      return {
        cgst: 0,
        sgst: 0,
        igst: Math.round(amount * (gstRate / 100)),
        totalTax: Math.round(amount * (gstRate / 100))
      };
    }
  }

  /**
   * Generates a local simulated IRN (Invoice Reference Number) for e-Invoicing.
   * This operates entirely locally without external API calls to avoid costs.
   * Returns a 64-character hash and a simulated signed QR code string.
   */
  static generateLocalIRN(invoiceNo: string, amount: number, customerGstIn: string) {
    // Generate a pseudo-random 64-character hex string simulating an IRN
    const timestamp = Date.now().toString(16);
    const randomHex = Array(56).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const irn = `${timestamp}${randomHex}`.substring(0, 64);
    
    // Simulate a signed QR code payload
    const qrData = JSON.stringify({
      SellerGstin: "27AAAAA0000A1Z5", // Mock seller GSTIN
      BuyerGstin: customerGstIn || "URP",
      DocNo: invoiceNo,
      DocTyp: "INV",
      DocDt: new Date().toISOString().split('T')[0],
      TotInvVal: amount / 100, // Rupee format for QR
      ItemCnt: 1,
      MainHsnCode: "9965", // Freight transport
      Irn: irn
    });
    
    const signedQrCode = Buffer.from(qrData).toString('base64');
    
    return { irn, signedQrCode, ackNo: Date.now().toString(), ackDate: new Date() };
  }

  /**
   * Prepares the GSTR-1 payload aggregating B2B and B2C invoices for a given period.
   * @param tenantId The tenant ID
   * @param companyId The company ID
   * @param period The period in YYYY-MM format
   */
  static async generateGSTR1(tenantId: string, companyId: string, period: string) {
    // Parse period to find date range
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    const invoices = await prisma.freightInvoice.findMany({
      where: {
        tenantId,
        companyId,
        date: { gte: startDate, lte: endDate },
        status: { in: ['sent', 'paid', 'partial', 'overdue'] }
      }
    });

    const salesVouchers = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        companyId,
        date: { gte: startDate, lte: endDate },
        voucherType: 'sales',
        status: 'posted'
      }
    });

    const payload = {
      b2b: [] as any[],
      b2cs: [] as any[],
      totalTaxableValue: 0,
      totalCGST: 0,
      totalSGST: 0,
      totalIGST: 0,
    };

    invoices.forEach(inv => {
      payload.totalTaxableValue += inv.subtotal;
      payload.totalCGST += inv.cgst;
      payload.totalSGST += inv.sgst;
      payload.totalIGST += inv.igst;

      payload.b2b.push({
        invoiceNo: inv.invoiceNo,
        date: inv.date.toISOString().split('T')[0],
        taxableValue: inv.subtotal,
        cgst: inv.cgst,
        sgst: inv.sgst,
        igst: inv.igst,
        total: inv.totalAmount
      });
    });

    salesVouchers.forEach(v => {
      const taxableValue = (v.metadata as any)?.baseAmount || v.totalAmount;
      const totalTax = v.totalAmount - taxableValue;
      
      // Rough split if not in metadata
      const cgst = (v.metadata as any)?.cgst || (totalTax > 0 ? Math.round(totalTax / 2) : 0);
      const sgst = (v.metadata as any)?.sgst || (totalTax > 0 ? Math.round(totalTax / 2) : 0);
      const igst = (v.metadata as any)?.igst || 0;

      payload.totalTaxableValue += taxableValue;
      payload.totalCGST += cgst;
      payload.totalSGST += sgst;
      payload.totalIGST += igst;

      payload.b2b.push({
        invoiceNo: v.voucherNo,
        date: v.date.toISOString().split('T')[0],
        taxableValue,
        cgst,
        sgst,
        igst,
        total: v.totalAmount,
        isManual: true
      });
    });

    return payload;
  }

  /**
   * Generates a GSTR-3B summary comparing Output Tax (Sales) vs Input Tax Credit (ITC from Purchases).
   */
  static async generateGSTR3B(tenantId: string, companyId: string, period: string) {
    // 1. Get GSTR-1 Data (Output Liability)
    const outward = await this.generateGSTR1(tenantId, companyId, period);

    // 2. Calculate Date Range for Purchases
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // 3. Fetch Purchase Vouchers (ITC)
    const purchaseVouchers = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        companyId,
        status: 'posted',
        voucherType: { in: ['purchase', 'expense'] },
        date: { gte: startDate, lte: endDate }
      },
      include: {
        lines: {
          include: {
            account: true
          }
        }
      }
    });

    const itc = {
      cgst: 0,
      sgst: 0,
      igst: 0,
      total: 0,
      details: [] as any[]
    };

    purchaseVouchers.forEach(v => {
      let vCgst = 0, vSgst = 0, vIgst = 0;
      v.lines.forEach(line => {
        const accName = line.account.name.toUpperCase();
        if (accName.includes('GST') && (accName.includes('INPUT') || accName.includes('PURCHASE'))) {
          if (accName.includes('CGST')) vCgst += line.debit;
          else if (accName.includes('SGST')) vSgst += line.debit;
          else if (accName.includes('IGST')) vIgst += line.debit;
        }
      });
      
      const vTax = vCgst + vSgst + vIgst;
      if (vTax > 0) {
        itc.cgst += vCgst;
        itc.sgst += vSgst;
        itc.igst += vIgst;
        itc.details.push({
          date: v.date,
          voucherNo: v.voucherNo,
          partyName: (v.metadata as any)?.vendorName || 'General Expense',
          taxAmount: vTax
        });
      }
    });

    itc.total = itc.cgst + itc.sgst + itc.igst;

    return {
      period,
      outward: {
        taxableValue: outward.totalTaxableValue,
        cgst: outward.totalCGST,
        sgst: outward.totalSGST,
        igst: outward.totalIGST,
        totalTax: outward.totalCGST + outward.totalSGST + outward.totalIGST
      },
      inward: itc,
      netPayable: {
        cgst: Math.max(0, outward.totalCGST - itc.cgst),
        sgst: Math.max(0, outward.totalSGST - itc.sgst),
        igst: Math.max(0, outward.totalIGST - itc.igst),
        total: Math.max(0, (outward.totalCGST + outward.totalSGST + outward.totalIGST) - itc.total)
      }
    };
  }
}
