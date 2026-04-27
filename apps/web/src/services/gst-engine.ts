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
        date: {
          gte: startDate,
          lte: endDate
        },
        status: { in: ['sent', 'paid', 'partial', 'overdue'] }
      },
      include: {
        // In a real system, we'd include Customer with GSTIN to split into B2B and B2C
        // For now, we simulate everything as B2B if it has tax
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

      // Simplistic B2B assumption for demonstration
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

    return payload;
  }
}
