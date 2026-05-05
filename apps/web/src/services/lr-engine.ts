import { prisma } from '@freightflow/db';


export class LREngine {
  /**
   * Generates the next LR number for a company, factoring in Financial Year.
   * Format: LR/YYYY-YY/SEQUENCE (e.g. LR/2026-27/1001)
   */
  static async getNextLRNo(companyId: string, dateStr?: string | null): Promise<string> {
    let today = new Date();
    if (dateStr && dateStr !== 'undefined' && dateStr !== 'null') {
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        today = parsed;
      }
    }
    
    const month = today.getMonth(); // 0-indexed, 0 = Jan
    const currentYear = today.getFullYear();
    
    // FY starts in April (3)
    let fyStart, fyEnd;
    if (month >= 3) {
      fyStart = currentYear;
      fyEnd = (currentYear + 1) % 100;
    } else {
      fyStart = currentYear - 1;
      fyEnd = currentYear % 100;
    }
    const fyString = `${fyStart}-${fyEnd.toString().padStart(2, '0')}`;
    const prefix = `LR/${fyString}/`;

    // Get the max sequence for this company and this FY
    const lastOrder = await prisma.order.findFirst({
      where: {
        companyId,
        lrNo: {
          startsWith: prefix,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        lrNo: true,
      },
    });

    let nextSequence = 1001; // Default starting sequence
    if (lastOrder && lastOrder.lrNo) {
      const parts = lastOrder.lrNo.split('/');
      const lastSeq = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastSeq)) {
        nextSequence = lastSeq + 1;
      }
    }

    return `${prefix}${nextSequence}`;
  }

  /**
   * Calculates totals for an order based on details and rates.
   * Rates and amounts are handled in Paise (integers).
   */
  static calculateOrderTotals(params: {
    details: { weight: number; boxCount: number }[];
    freight: number; // in paise
    hamali: number;  // in paise
    cgstPct: number;
    sgstPct: number;
    igstPct: number;
    gstType: 'intra' | 'inter';
    rateOn: 'weight' | 'box';
    rate: number;    // in paise
  }) {
    const totalWeight = params.details.reduce((sum, d) => sum + Number(d.weight || 0), 0);
    const totalBoxes = params.details.reduce((sum, d) => sum + Number(d.boxCount || 0), 0);

    let subtotal = 0;
    if (params.rateOn === 'weight') {
      subtotal = Math.round(totalWeight * params.rate);
    } else {
      subtotal = totalBoxes * params.rate;
    }

    // Add fixed components
    subtotal += params.freight + params.hamali;

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (params.gstType === 'intra') {
      cgstAmount = Math.round((subtotal * params.cgstPct) / 100);
      sgstAmount = Math.round((subtotal * params.sgstPct) / 100);
    } else {
      igstAmount = Math.round((subtotal * params.igstPct) / 100);
    }

    const totalAmount = subtotal + cgstAmount + sgstAmount + igstAmount;

    return {
      totalWeight,
      totalBoxes,
      subtotal,
      cgstAmount,
      sgstAmount,
      igstAmount,
      totalAmount,
    };
  }
}
