import { prisma } from '@freightflow/db';

export class HRService {
  /**
   * Bulk marks attendance for a list of employees for a specific date.
   */
  static async markBulkAttendance(
    tenantId: string, 
    companyId: string, 
    date: Date, 
    entries: { employeeId: string, status: string, notes?: string }[],
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
          notes: entry.notes,
          markedBy
        },
        create: {
          tenantId,
          companyId,
          employeeId: entry.employeeId,
          date,
          status: entry.status,
          notes: entry.notes,
          markedBy
        }
      });
    });

    return await prisma.$transaction(transactions);
  }

  /**
   * Submits a leave request.
   */
  static async applyLeave(
    tenantId: string,
    companyId: string,
    employeeId: string,
    leaveData: { leaveType: string, fromDate: Date, toDate: Date, reason: string }
  ) {
    const diffTime = Math.abs(leaveData.toDate.getTime() - leaveData.fromDate.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

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
   * Approves or Rejects a leave request.
   */
  static async handleLeaveAction(
    leaveId: string,
    status: 'approved' | 'rejected',
    approvedBy: string
  ) {
    return await prisma.leave.update({
      where: { id: leaveId },
      data: {
        status,
        approvedBy,
        approvedAt: new Date()
      }
    });
  }
}
