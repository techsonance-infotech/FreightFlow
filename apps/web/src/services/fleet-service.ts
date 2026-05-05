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
      include: {
        vehicle: {
          select: { regNo: true, model: true }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    // Aggregate by vehicle
    const vehicleStats: Record<string, { 
      regNo: string; 
      model: string;
      totalCost: number; 
      jobCount: number;
      scheduledCount: number;
      breakdownCount: number;
    }> = {};
    
    jobs.forEach(job => {
      if (!vehicleStats[job.vehicleId]) {
        vehicleStats[job.vehicleId] = { 
          regNo: job.vehicle.regNo, 
          model: job.vehicle.model || '',
          totalCost: 0, 
          jobCount: 0,
          scheduledCount: 0,
          breakdownCount: 0
        };
      }
      vehicleStats[job.vehicleId].totalCost += job.actualCost || 0;
      vehicleStats[job.vehicleId].jobCount += 1;
      if (job.jobType === 'scheduled') vehicleStats[job.vehicleId].scheduledCount += 1;
      if (job.jobType === 'breakdown') vehicleStats[job.vehicleId].breakdownCount += 1;
    });

    return {
      summary: Object.values(vehicleStats),
      allJobs: jobs
    };
  }

  /**
   * Fleet-wide fuel consumption report with trends.
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
    const validKmplEntries = entries.filter(e => e.kmpl && Number(e.kmpl) > 0);
    const avgKmpl = validKmplEntries.length > 0 
      ? validKmplEntries.reduce((acc, curr) => acc + Number(curr.kmpl || 0), 0) / validKmplEntries.length 
      : 0;

    return {
      totalLitres,
      totalCost,
      avgKmpl: parseFloat(avgKmpl.toFixed(2)),
      entries
    };
  }
}
