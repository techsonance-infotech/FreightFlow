import { prisma } from '@freightflow/db';

export class HRService {
  /**
   * Bulk marks attendance for a list of employees for a specific date.
   */
  static async markBulkAttendance(
    tenantId: string, 
    companyId: string, 
    date: Date, 
    entries: { employeeId: string, status: string, checkIn?: string, checkOut?: string, notes?: string }[],
    markedBy?: string
  ) {
    const transactions = entries.map(entry => {
      return prisma.attendance.upsert({
        where: {
          employeeId_date: {
            employeeId: entry.employeeId,
            date: date
          }
        },
        update: {
          status: entry.status,
          checkIn: entry.checkIn ? new Date(entry.checkIn) : null,
          checkOut: entry.checkOut ? new Date(entry.checkOut) : null,
          notes: entry.notes,
          markedBy
        },
        create: {
          tenantId,
          companyId,
          employeeId: entry.employeeId,
          date,
          status: entry.status,
          checkIn: entry.checkIn ? new Date(entry.checkIn) : null,
          checkOut: entry.checkOut ? new Date(entry.checkOut) : null,
          notes: entry.notes,
          markedBy
        }
      });
    });

    return await prisma.$transaction(transactions);
  }

  /**
   * Fetches leave allocations for an employee.
   */
  static async getLeaveAllocations(companyId: string, employeeId: string, year: number) {
    return await prisma.leaveAllocation.findMany({
      where: { companyId, employeeId, year }
    });
  }

  /**
   * Submits a leave request with balance verification.
   */
  static async applyLeave(
    tenantId: string,
    companyId: string,
    employeeId: string,
    leaveData: { leaveType: string, fromDate: Date, toDate: Date, reason: string }
  ) {
    const diffTime = Math.abs(leaveData.toDate.getTime() - leaveData.fromDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const year = leaveData.fromDate.getFullYear();

    // Verify balance if leave is not 'unpaid'
    if (leaveData.leaveType !== 'unpaid') {
      const allocation = await prisma.leaveAllocation.findUnique({
        where: {
          employeeId_year_leaveType: {
            employeeId,
            year,
            leaveType: leaveData.leaveType
          }
        }
      });

      if (!allocation) {
        throw new Error(`No leave allocation found for ${leaveData.leaveType} in ${year}. Please contact HR.`);
      }

      if (allocation.totalDays - allocation.usedDays < days) {
        throw new Error(`Insufficient balance for ${leaveData.leaveType}. Available: ${allocation.totalDays - allocation.usedDays} days.`);
      }
    }

    return await prisma.leave.create({
      data: {
        tenantId,
        companyId,
        employeeId,
        leaveType: leaveData.leaveType,
        fromDate: leaveData.fromDate,
        toDate: leaveData.toDate,
        days,
        reason: leaveData.reason,
        status: 'pending'
      }
    });
  }

  /**
   * Approves or Rejects a leave request and updates balances.
   */
  static async handleLeaveAction(
    leaveId: string,
    status: 'approved' | 'rejected',
    approvedBy: string
  ) {
    return await prisma.$transaction(async (tx) => {
      const leave = await tx.leave.findUnique({
        where: { id: leaveId }
      });

      if (!leave) throw new Error('Leave request not found');
      if (leave.status !== 'pending') throw new Error('Leave request already processed');

      const updatedLeave = await tx.leave.update({
        where: { id: leaveId },
        data: {
          status,
          approvedBy,
          approvedAt: new Date()
        }
      });

      // If approved and not unpaid, deduct from allocation
      if (status === 'approved' && leave.leaveType !== 'unpaid') {
        const year = leave.fromDate.getFullYear();
        await tx.leaveAllocation.update({
          where: {
            employeeId_year_leaveType: {
              employeeId: leave.employeeId,
              year,
              leaveType: leave.leaveType
            }
          },
          data: {
            usedDays: { increment: leave.days }
          }
        });
      }

      return updatedLeave;
    });
  }
}
