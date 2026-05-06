'use server';

import { prisma } from '@freightflow/db';
import { getSession } from '@/lib/auth-utils';

export async function getTaxSummary() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) throw new Error('Unauthorized');

  const companyId = session.user.companyId;

  // 1. GST Output (from Sales/Invoices)
  const gstOutput = await prisma.freightInvoice.aggregate({
    where: { companyId, status: { not: 'cancelled' } },
    _sum: { cgst: true, sgst: true, igst: true, totalAmount: true }
  });

  // 2. GST Input (from Expenses - simplistic for now as we don't have separate GST in expenses yet, but we can query it if added)
  // For now, let's assume input GST is 0 or query specific expense types if they have GST recorded in metadata
  
  // 3. TDS Payable (Deducted from Vendors)
  const tdsPayable = await prisma.tdsEntry.aggregate({
    where: { companyId },
    _sum: { tdsAmount: true }
  });

  // 4. TDS Receivable (Deducted by Customers - can be tracked in invoices or separate table)
  
  return {
    gst: {
      output: {
        cgst: gstOutput._sum.cgst || 0,
        sgst: gstOutput._sum.sgst || 0,
        igst: gstOutput._sum.igst || 0,
        total: (gstOutput._sum.cgst || 0) + (gstOutput._sum.sgst || 0) + (gstOutput._sum.igst || 0)
      }
    },
    tds: {
      payable: tdsPayable._sum.tdsAmount || 0,
      receivable: 0 // Placeholder
    }
  };
}
