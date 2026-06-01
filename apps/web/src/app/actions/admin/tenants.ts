'use server';

import { prisma } from '@freightflow/db';
import { getAdminSession } from './auth';
import { revalidatePath } from 'next/cache';

export async function toggleTenantStatus(tenantId: string, currentStatus: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  const newStatus = currentStatus === 'active' ? 'suspended' : 'active';

  await prisma.$transaction(async (tx) => {
    // 1. Update Tenant Status
    await tx.tenant.update({
      where: { id: tenantId },
      data: { status: newStatus }
    });

    // 2. Log Action
    await tx.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: newStatus === 'suspended' ? 'suspend_tenant' : 'reactivate_tenant',
        targetTenantId: tenantId,
        payload: { previousStatus: currentStatus, newStatus }
      }
    });
  });

  revalidatePath('/admin/tenants');
  revalidatePath('/admin/dashboard');
  return { success: true, status: newStatus };
}

export async function resetTenantTransactionalData(tenantId: string) {
  const session = await getAdminSession();
  if (!session) throw new Error('Unauthorized');

  // Verify tenant exists
  const tenantExists = await prisma.tenant.findUnique({
    where: { id: tenantId }
  });
  if (!tenantExists) throw new Error('Tenant not found');

  await prisma.$transaction(async (tx) => {
    // 1. Reset ChequeBook Leaves (sets back to available and clears voucher linkages)
    await tx.chequeLeaf.updateMany({
      where: { chequeBook: { tenantId } },
      data: { status: 'available', voucherId: null }
    });

    // 2. Delete Order details & transactional helpers
    await tx.orderDetail.deleteMany({ where: { company: { tenantId } } });
    await tx.lrStatusLog.deleteMany({ where: { company: { tenantId } } });
    await tx.podRecord.deleteMany({ where: { company: { tenantId } } });
    
    // 3. Delete Orders & OrderPallet dependents
    await tx.palletDetail.deleteMany({ where: { company: { tenantId } } });
    await tx.palletConsigneeDetail.deleteMany({ where: { company: { tenantId } } });

    // 4. Delete Orders and OrderPallets
    await tx.order.deleteMany({ where: { tenantId } });
    await tx.orderPallet.deleteMany({ where: { tenantId } });

    // 5. Delete Trip details
    await tx.tripExpense.deleteMany({ where: { tenantId } });
    await tx.tripSettlement.deleteMany({ where: { tenantId } });
    await tx.driverAdvance.deleteMany({ where: { tenantId } });
    await tx.trip.deleteMany({ where: { tenantId } });

    // 6. Delete Invoices & Accounting Vouchers
    await tx.eInvoiceLog.deleteMany({ where: { invoice: { tenantId } } });
    await tx.freightInvoice.deleteMany({ where: { tenantId } });
    
    await tx.journalLine.deleteMany({ where: { company: { tenantId } } });
    await tx.journalEntry.deleteMany({ where: { tenantId } });
    await tx.transaction.deleteMany({ where: { tenantId } });
    await tx.tdsEntry.deleteMany({ where: { tenantId } });
    await tx.gstReturn.deleteMany({ where: { tenantId } });
    await tx.complianceDeadline.deleteMany({ where: { tenantId } });

    // 7. Delete Fleet logs
    await tx.maintenanceJob.deleteMany({ where: { tenantId } });
    await tx.fuelEntry.deleteMany({ where: { tenantId } });

    // 8. Delete Workforce transactions & HR logs
    await tx.labourExpense.deleteMany({ where: { tenantId } });
    await tx.labourAttendance.deleteMany({ where: { tenantId } });
    await tx.attendance.deleteMany({ where: { tenantId } });
    await tx.leave.deleteMany({ where: { tenantId } });
    await tx.leaveAllocation.deleteMany({ where: { tenantId } });
    
    await tx.payrollLine.deleteMany({ where: { tenantId } });
    await tx.payrollRun.deleteMany({ where: { tenantId } });
    await tx.employeeTransaction.deleteMany({ where: { tenantId } });

    // 9. Clean log indices
    await tx.auditLog.deleteMany({ where: { tenantId } });
    await tx.reportCache.deleteMany({ where: { tenantId } });
    await tx.systemNotification.deleteMany({ where: { tenantId } });

    // 10. Platform Audit Log of super admin intervention
    await tx.auditLogPlatform.create({
      data: {
        adminId: session.id,
        action: 'TENANT_ECOSYSTEM_RESET',
        targetTenantId: tenantId,
        payload: { resetAt: new Date().toISOString() }
      }
    });
  });

  revalidatePath('/admin/tenants');
  revalidatePath(`/admin/tenants/${tenantId}`);
  revalidatePath('/admin/dashboard');

  return { success: true };
}

