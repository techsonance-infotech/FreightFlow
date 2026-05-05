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
   * Fetches the TDS Register with advanced filtering and vendor joins.
   */
  static async getTDSRegister(params: {
    tenantId: string;
    companyId: string;
    startDate?: string;
    endDate?: string;
    vendorId?: string;
    section?: string;
    deposited?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, companyId, startDate, endDate, vendorId, section, deposited, page = 1, limit = 50 } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      companyId
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (vendorId) where.vendorId = vendorId;
    if (section) where.section = section;
    if (deposited !== undefined) where.deposited = deposited;

    const entries = await prisma.tdsEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      // Note: We don't have a direct Vendor relation in the TdsEntry model currently, 
      // so we will fetch names separately or handle it in the API.
    });

    const total = await prisma.tdsEntry.count({ where });

    // Aggregations for the filtered set
    const aggregations = await prisma.tdsEntry.aggregate({
      where,
      _sum: {
        baseAmount: true,
        tdsAmount: true
      }
    });

    // Group by section for the filtered set
    const sectionsGroup = await prisma.tdsEntry.groupBy({
      by: ['section'],
      where,
      _sum: {
        tdsAmount: true
      }
    });

    return {
      entries,
      total,
      summary: {
        totalBaseAmount: aggregations._sum.baseAmount || 0,
        totalTDS: aggregations._sum.tdsAmount || 0,
        totalDeposited: (await prisma.tdsEntry.aggregate({
          where: { ...where, deposited: true },
          _sum: { tdsAmount: true }
        }))._sum.tdsAmount || 0,
        sections: sectionsGroup.reduce((acc, curr) => {
          acc[curr.section] = curr._sum.tdsAmount || 0;
          return acc;
        }, {} as Record<string, number>)
      }
    };
  }

  /**
   * Generates Form 26Q quarterly data for a specific quarter.
   * @param tenantId The tenant ID
   * @param companyId The company ID
   * @param quarter String representing the quarter (e.g., "Q1-2026")
   */
  static async generateForm26Q(tenantId: string, companyId: string, quarter: string) {
    return this.getTDSRegister({ tenantId, companyId }); // Fallback to basic fetch for now
  }
}
