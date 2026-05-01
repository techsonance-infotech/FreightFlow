import { prisma } from '@freightflow/db';

export class PayrollEngine {
  /**
   * Processes payroll for a given month and year.
   */
  static async processPayroll(tenantId: string, companyId: string, month: number, year: number) {
    // 1. Fetch all active employees with salary structures
    const employees = await prisma.employee.findMany({
      where: {
        tenantId,
        companyId,
        status: 'active'
      },
      include: {
        salaryStructure: true,
        driver: {
          include: {
            tripsAsDriver: {
              where: {
                status: 'settled',
                actualDeliveryAt: {
                  gte: new Date(year, month - 1, 1),
                  lt: new Date(year, month, 1)
                }
              }
            }
          }
        }
      }
    });

    // 2. Fetch attendance for the period
    const workingDays = new Date(year, month, 0).getDate(); // Total days in month
    
    interface PayrollLineData {
      employeeId: string;
      workingDays: number;
      presentDays: number;
      basic: number;
      hra: number;
      conveyance: number;
      driverAllowance: number;
      otherAllowances: number;
      tripIncentive: number;
      gross: number;
      pfEmployee: number;
      pfEmployer: number;
      esiEmployee: number;
      esiEmployer: number;
      ptDeduction: number;
      tdsDeduction: number;
      advanceDeduction: number;
      otherDeductions: number;
      totalDeductions: number;
      netPay: number;
    }

    const results: PayrollLineData[] = [];
    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;

    for (const emp of employees) {
      if (!emp.salaryStructure) continue;

      const attendance = await prisma.attendance.findMany({
        where: {
          employeeId: emp.id,
          date: {
            gte: new Date(year, month - 1, 1),
            lt: new Date(year, month, 1)
          }
        }
      });

      const presentDays = attendance.filter(a => a.status === 'present').length + 
                          (attendance.filter(a => a.status === 'half_day').length * 0.5) +
                          attendance.filter(a => a.status === 'leave').length; // Leave is usually paid

      // 3. Pro-rata Calculations
      const ratio = presentDays / workingDays;
      
      const line: PayrollLineData = {
        employeeId: emp.id,
        workingDays,
        presentDays: Math.ceil(presentDays),
        basic: Math.round(emp.salaryStructure.basic * ratio),
        hra: Math.round(emp.salaryStructure.hra * ratio),
        conveyance: Math.round(emp.salaryStructure.conveyance * ratio),
        driverAllowance: Math.round(emp.salaryStructure.driverAllowance * ratio),
        otherAllowances: Math.round(emp.salaryStructure.otherAllowances * ratio),
        tripIncentive: 0,
        gross: 0,
        pfEmployee: 0,
        pfEmployer: 0,
        esiEmployee: 0,
        esiEmployer: 0,
        ptDeduction: 0,
        tdsDeduction: 0,
        advanceDeduction: 0,
        otherDeductions: 0,
        totalDeductions: 0,
        netPay: 0
      };

      // 4. Driver Incentives (Example: ₹500 per settled trip)
      if (emp.driver) {
        line.tripIncentive = emp.driver.tripsAsDriver.length * 50000; // ₹500 in paise
      }

      line.gross = line.basic + line.hra + line.conveyance + line.driverAllowance + line.otherAllowances + line.tripIncentive;

      // 5. Statutory Deductions
      // PF: 12% of basic (capped at 15000)
      if (emp.salaryStructure.pfApplicable) {
        const pfBasis = Math.min(line.basic, 1500000); // ₹15,000 cap
        line.pfEmployee = Math.round(pfBasis * 0.12);
        line.pfEmployer = Math.round(pfBasis * 0.12);
      }

      // ESI: 0.75% / 3.25% if gross <= 21000
      if (emp.salaryStructure.esiApplicable && line.gross <= 2100000) {
        line.esiEmployee = Math.round(line.gross * 0.0075);
        line.esiEmployer = Math.round(line.gross * 0.0325);
      }

      // PT (Gujarat Example): ₹200 for gross > 12000
      if (line.gross > 1200000) {
        line.ptDeduction = 20000; // ₹200
      }

      // 6. Advance Recovery (Deduct ₹2000 if active advances exist)
      const activeAdvances = await prisma.driverAdvance.findMany({
        where: { driverId: emp.driver?.id, status: { in: ['pending', 'partially_recovered'] } }
      });
      if (activeAdvances.length > 0) {
        line.advanceDeduction = Math.min(200000, line.gross - 1000000); // Don't leave less than 10k
      }

      line.totalDeductions = line.pfEmployee + line.esiEmployee + line.ptDeduction + line.tdsDeduction + line.advanceDeduction + line.otherDeductions;
      line.netPay = line.gross - line.totalDeductions;

      totalGross += line.gross;
      totalDeductions += line.totalDeductions;
      totalNet += line.netPay;

      results.push(line);
    }

    // 7. Save Payroll Run
    return await prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          tenantId,
          companyId,
          month,
          year,
          status: 'draft',
          totalGross,
          totalDeductions,
          totalNet
        }
      });

      await tx.payrollLine.createMany({
        data: results.map(r => ({
          ...r,
          tenantId,
          companyId,
          runId: run.id
        }))
      });

      return await tx.payrollRun.findUnique({
        where: { id: run.id },
        include: { 
          payrollLines: {
            include: { employee: true }
          }
        }
      });
    });
  }

  /**
   * Finalizes a payroll run, marking it as approved and processing disbursements.
   */
  static async finalizePayroll(tenantId: string, companyId: string, runId: string) {
    return await prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.findUnique({
        where: { id: runId, tenantId, companyId }
      });

      if (!run) throw new Error('Payroll run not found');
      if (run.status === 'approved') throw new Error('Payroll already finalized');

      // Update status to approved
      const updatedRun = await tx.payrollRun.update({
        where: { id: runId },
        data: { 
          status: 'approved',
          processedAt: new Date()
        }
      });

      // Update all associated lines to settled (if we had a status on lines)
      // For now, the run status is enough to signal that pay slips can be generated.

      return updatedRun;
    });
  }
}
