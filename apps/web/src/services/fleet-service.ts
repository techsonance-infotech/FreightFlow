import { prisma } from '@freightflow/db';

export class FleetService {
  /**
   * Calculates KMPL based on odometer readings and fuel quantity.
   */
  static calculateKMPL(currentOdometer: number, prevOdometer: number, litres: number): number {
    if (litres <= 0) return 0;
    const distance = currentOdometer - prevOdometer;
    if (distance <= 0) return 0;
    return parseFloat((distance / litres).toFixed(2));
  }

  /**
   * Detects if a KMPL reading is an anomaly (> 20% drop from average).
   */
  static detectAnomaly(kmpl: number, vehicleAvgKmpl: number): { isAnomaly: boolean; reason?: string } {
    if (!vehicleAvgKmpl || vehicleAvgKmpl <= 0) return { isAnomaly: false };
    
    const threshold = vehicleAvgKmpl * 0.8; // 20% drop
    if (kmpl < threshold) {
      return { 
        isAnomaly: true, 
        reason: `KMPL (${kmpl}) is more than 20% below vehicle average (${vehicleAvgKmpl})` 
      };
    }
    
    return { isAnomaly: false };
  }

  /**
   * Retrieves expiring documents for a company.
   */
  static async getExpiringDocuments(tenantId: string, companyId: string, withinDays: number = 30) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + withinDays);

    return prisma.vehicleDocument.findMany({
      where: {
        tenantId,
        companyId,
        expiryDate: {
          lte: thresholdDate,
          gte: new Date(), // Only upcoming expiries
        },
      },
      include: {
        vehicle: true,
      },
      orderBy: {
        expiryDate: 'asc',
      },
    });
  }

  /**
   * Generates a maintenance cost report for a vehicle.
   */
  static async getMaintenanceCost(tenantId: string, companyId: string, vehicleId?: string) {
    const where: any = { tenantId, companyId };
    if (vehicleId) where.vehicleId = vehicleId;

    const jobs = await prisma.maintenanceJob.findMany({
      where,
      select: {
        vehicleId: true,
        actualCost: true,
        vehicle: {
          select: { regNo: true }
        }
      }
    });

    // Aggregate by vehicle
    const report: Record<string, { regNo: string; totalCost: number; jobCount: number }> = {};
    
    jobs.forEach(job => {
      if (!report[job.vehicleId]) {
        report[job.vehicleId] = { regNo: job.vehicle.regNo, totalCost: 0, jobCount: 0 };
      }
      report[job.vehicleId].totalCost += job.actualCost || 0;
      report[job.vehicleId].jobCount += 1;
    });

    return Object.values(report);
  }

  /**
   * Fleet-wide fuel consumption report.
   */
  static async getFuelReport(tenantId: string, companyId: string) {
    const entries = await prisma.fuelEntry.findMany({
      where: { tenantId, companyId },
      include: {
        vehicle: {
          select: { regNo: true }
        }
      },
      orderBy: { date: 'desc' }
    });

    const totalLitres = entries.reduce((acc, curr) => acc + Number(curr.quantity), 0);
    const totalCost = entries.reduce((acc, curr) => acc + curr.amount, 0);
    const avgKmpl = entries.length > 0 
      ? entries.reduce((acc, curr) => acc + Number(curr.kmpl || 0), 0) / entries.length 
      : 0;

    return {
      totalLitres,
      totalCost,
      avgKmpl: parseFloat(avgKmpl.toFixed(2)),
      entries
    };
  }
}
