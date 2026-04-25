import { prisma } from '@freightflow/db';


export class LREngine {
  /**
   * Generates the next LR number for a company.
   * If no LRs exist, starts from 1001 or as configured.
   */
  static async getNextLRNo(companyId: string): Promise<number> {
    const lastOrder = await prisma.order.findFirst({
      where: { companyId },
      orderBy: { lrNo: 'desc' },
      select: { lrNo: true },
    });

    return lastOrder ? lastOrder.lrNo + 1 : 1001;
  }

  /**
   * Calculates totals for an order based on details and rates.
   */
  static calculateOrderTotals(params: {
    details: { weight: number; boxCount: number }[];
    freight: number; // in paise
    hamali: number;  // in paise
    cgstPct: number;
    sgstPct: number;
    rateOn: 'weight' | 'box';
    rate: number;    // in paise
  }) {
    const totalWeight = params.details.reduce((sum, d) => sum + d.weight, 0);
    const totalBoxes = params.details.reduce((sum, d) => sum + d.boxCount, 0);

    let subtotal = 0;
    if (params.rateOn === 'weight') {
      subtotal = Math.round(totalWeight * params.rate);
    } else {
      subtotal = totalBoxes * params.rate;
    }

    // Add fixed components
    subtotal += params.freight + params.hamali;

    const cgstAmount = Math.round((subtotal * params.cgstPct) / 100);
    const sgstAmount = Math.round((subtotal * params.sgstPct) / 100);
    const totalAmount = subtotal + cgstAmount + sgstAmount;

    return {
      totalWeight,
      totalBoxes,
      subtotal,
      cgstAmount,
      sgstAmount,
      totalAmount,
    };
  }
}
