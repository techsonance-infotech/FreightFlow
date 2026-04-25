import { prisma } from '@freightflow/db';

export class TDSEngine {
  /**
   * Calculates TDS based on section and vendor type
   * @param baseAmount The amount to calculate TDS on (in paise)
   * @param section The TDS section (e.g., '194C', '194I', '194J')
   * @param vendorType Type of vendor ('individual' | 'company')
   */
  static calculateTDS(baseAmount: number, section: string, vendorType: 'individual' | 'company' = 'company') {
    let rate = 0;

    switch (section) {
      case '194C': // Transport/Contractors
        rate = vendorType === 'individual' ? 1.0 : 2.0;
        break;
      case '194I': // Rent
        rate = 10.0;
        break;
      case '194J': // Professional/Technical Services
        rate = 10.0;
        break;
      default:
        rate = 0;
    }

    const tdsAmount = Math.round(baseAmount * (rate / 100));

    return {
      baseAmount,
      rate,
      tdsAmount,
      netAmount: baseAmount - tdsAmount
    };
  }

  /**
   * Generates Form 26Q quarterly data for a specific quarter.
   * @param tenantId The tenant ID
   * @param companyId The company ID
   * @param quarter String representing the quarter (e.g., "Q1-2026")
   */
  static async generateForm26Q(tenantId: string, companyId: string, quarter: string) {
    const entries = await prisma.tdsEntry.findMany({
      where: {
        tenantId,
        companyId,
        quarter
      },
      // In a real app we'd join with Vendor details to get PAN, Name, etc.
    });

    const summary = {
      totalBaseAmount: 0,
      totalTDS: 0,
      totalDeposited: 0,
      sections: {} as Record<string, number>,
      entries
    };

    entries.forEach(entry => {
      summary.totalBaseAmount += entry.baseAmount;
      summary.totalTDS += entry.tdsAmount;
      if (entry.deposited) summary.totalDeposited += entry.tdsAmount;

      if (!summary.sections[entry.section]) {
        summary.sections[entry.section] = 0;
      }
      summary.sections[entry.section] += entry.tdsAmount;
    });

    return summary;
  }
}
