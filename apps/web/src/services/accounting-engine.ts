import { prisma } from '@freightflow/db';
import { 
  JournalEntry, 
  ChartOfAccount, 
  FreightInvoice,
  Payment 
} from '@freightflow/shared';

export class AccountingEngine {
  /**
   * Retrieves the Chart of Accounts for a company, formatted as a tree.
   */
  static async getChartOfAccounts(tenantId: string, companyId: string) {
    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, companyId, isActive: true },
      orderBy: { code: 'asc' },
    });

    // Build hierarchy
    const accountMap = new Map<string, any>();
    const roots: any[] = [];

    accounts.forEach(acc => {
      accountMap.set(acc.id, { ...acc, children: [] });
    });

    accounts.forEach(acc => {
      if (acc.parentId) {
        const parent = accountMap.get(acc.parentId);
        if (parent) {
          parent.children.push(accountMap.get(acc.id));
        }
      } else {
        roots.push(accountMap.get(acc.id));
      }
    });

    return roots;
  }

  /**
   * Creates a new account in the Chart of Accounts.
   */
  static async createAccount(tenantId: string, companyId: string, data: ChartOfAccount) {
    return prisma.chartOfAccount.create({
      data: {
        tenantId,
        companyId,
        code: data.code,
        name: data.name,
        type: data.type,
        parentId: data.parentId || null,
        isSystem: data.isSystem,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Posts a Journal Entry (Voucher) ensuring Double-Entry balance.
   */
  static async createJournalEntry(tenantId: string, companyId: string, data: JournalEntry, userId?: string) {
    // 1. Validate DR = CR
    let totalDebit = 0;
    let totalCredit = 0;

    data.lines.forEach(line => {
      totalDebit += line.debit;
      totalCredit += line.credit;
    });

    if (totalDebit !== totalCredit) {
      throw new Error(`Unbalanced journal entry: Debits (${totalDebit}) do not equal Credits (${totalCredit}).`);
    }

    if (totalDebit === 0) {
      throw new Error('Journal entry must have a non-zero value.');
    }

    // 2. Generate Voucher No if not provided
    let voucherNo = data.voucherNo;
    if (!voucherNo) {
      // Auto-generate based on type (simple implementation)
      const prefix = data.voucherType.substring(0, 2).toUpperCase();
      const count = await prisma.journalEntry.count({
        where: { tenantId, companyId, voucherType: data.voucherType }
      });
      voucherNo = `${prefix}-${Date.now().toString().slice(-6)}-${count + 1}`;
    }

    // 3. Create Transaction
    return prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({
        data: {
          tenantId,
          companyId,
          date: new Date(data.date),
          voucherType: data.voucherType,
          voucherNo: voucherNo as string,
          narration: data.narration,
          totalAmount: totalDebit,
          createdBy: userId,
          lines: {
            create: data.lines.map(line => ({
              companyId,
              accountId: line.accountId,
              description: line.description,
              debit: line.debit,
              credit: line.credit,
            }))
          }
        },
        include: {
          lines: true,
        }
      });

      return entry;
    });
  }

  /**
   * Generates a Freight Invoice for completed orders.
   */
  static async generateFreightInvoice(tenantId: string, companyId: string, data: FreightInvoice) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the Invoice record
      const invoice = await tx.freightInvoice.create({
        data: {
          tenantId,
          companyId,
          invoiceNo: data.invoiceNo || `INV-${Date.now()}`,
          date: new Date(data.date),
          customerId: data.customerId,
          subtotal: data.subtotal,
          cgst: data.cgst,
          sgst: data.sgst,
          igst: data.igst,
          totalAmount: data.totalAmount,
          notes: data.notes,
          status: 'sent',
          orders: {
            connect: data.orderIds.map(id => ({ id }))
          }
        }
      });

      // 2. Auto GL Entry Rules
      // We need to find the appropriate system accounts. In a real app, these are configured in settings.
      // For now, we will look them up by type and common names/codes.
      const arAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'asset', name: { contains: 'Receivable', mode: 'insensitive' } }
      });
      const revenueAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'revenue', name: { contains: 'Freight', mode: 'insensitive' } }
      });
      const cgstAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'liability', name: { contains: 'CGST', mode: 'insensitive' } }
      });
      const sgstAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'liability', name: { contains: 'SGST', mode: 'insensitive' } }
      });

      if (arAccount && revenueAccount) {
        const lines = [
          { companyId, accountId: arAccount.id, description: `Invoice ${invoice.invoiceNo}`, debit: invoice.totalAmount, credit: 0 },
          { companyId, accountId: revenueAccount.id, description: `Freight Revenue`, debit: 0, credit: invoice.subtotal }
        ];

        if (invoice.cgst > 0 && cgstAccount) {
          lines.push({ companyId, accountId: cgstAccount.id, description: `CGST Output`, debit: 0, credit: invoice.cgst });
        }
        if (invoice.sgst > 0 && sgstAccount) {
          lines.push({ companyId, accountId: sgstAccount.id, description: `SGST Output`, debit: 0, credit: invoice.sgst });
        }

        await tx.journalEntry.create({
          data: {
            tenantId,
            companyId,
            date: new Date(data.date),
            voucherType: 'sales',
            voucherNo: `SV-${invoice.invoiceNo}`,
            narration: `Auto-generated voucher for Freight Invoice ${invoice.invoiceNo}`,
            totalAmount: invoice.totalAmount,
            lines: {
              create: lines
            }
          }
        });
      }

      return invoice;
    });
  }

  /**
   * Records a payment against an invoice or as an advance.
   */
  static async recordPayment(tenantId: string, companyId: string, data: Payment) {
    // Note: Transaction model is mapped to accounting_transactions
    return (prisma as any).transaction.create({
      data: {
        tenantId,
        companyId,
        date: new Date(data.date),
        amount: data.amount,
        type: 'receipt',
        mode: data.mode,
        referenceNo: data.referenceNo,
        partyId: data.partyId,
        accountId: data.accountId,
        notes: data.notes,
      },
    });
  }

  /**
   * Generates a Trial Balance report aggregating all ledger lines.
   */
  static async getTrialBalance(tenantId: string, companyId: string) {
    const lines = await prisma.journalLine.groupBy({
      by: ['accountId'],
      where: {
        journalEntry: {
          tenantId,
          companyId,
        },
      },
      _sum: {
        debit: true,
        credit: true,
      }
    });

    const accountIds = lines.map(l => l.accountId);
    const accounts = await prisma.chartOfAccount.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, code: true, name: true, type: true }
    });

    const accountMap = new Map(accounts.map(a => [a.id, a]));

    const report = lines.map(l => {
      const acc = accountMap.get(l.accountId);
      const debit = l._sum.debit || 0;
      const credit = l._sum.credit || 0;
      
      // Calculate closing balance based on normal balances (Asset/Expense = DR, Liab/Equity/Rev = CR)
      let closingBalance = 0;
      let balanceType = 'DR';
      
      if (acc?.type === 'asset' || acc?.type === 'expense') {
        closingBalance = debit - credit;
      } else {
        closingBalance = credit - debit;
        balanceType = 'CR';
      }

      // If balance goes negative, it flips normal balance type
      if (closingBalance < 0) {
        closingBalance = Math.abs(closingBalance);
        balanceType = balanceType === 'DR' ? 'CR' : 'DR';
      }

      return {
        account: acc,
        totalDebit: debit,
        totalCredit: credit,
        closingBalance,
        balanceType,
      };
    });

    return report;
  }

  /**
   * Generates an Ageing Report for AR (Accounts Receivable) or AP (Accounts Payable).
   */
  static async getAgeingReport(tenantId: string, companyId: string, type: 'AR' | 'AP') {
    // In a full implementation, we'd query unpaid invoices and bucket them by (Current Date - Invoice Date).
    // For this demonstration, we'll fetch freight invoices for AR.
    if (type === 'AR') {
      const unpaidInvoices = await prisma.freightInvoice.findMany({
        where: { tenantId, companyId, status: { in: ['sent', 'partial', 'overdue'] } }
      });

      const now = new Date();
      const buckets = {
        '0_30': 0,
        '31_60': 0,
        '61_90': 0,
        '90_plus': 0,
        total: 0
      };

      const items = unpaidInvoices.map(inv => {
        const days = Math.floor((now.getTime() - inv.date.getTime()) / (1000 * 3600 * 24));
        const amount = inv.totalAmount; // Assuming no partial payments for simplicity here
        
        let bucket = '0_30';
        if (days > 90) bucket = '90_plus';
        else if (days > 60) bucket = '61_90';
        else if (days > 30) bucket = '31_60';

        buckets[bucket as keyof typeof buckets] += amount;
        buckets.total += amount;

        return { ...inv, daysOverdue: days, bucket };
      });

      return { buckets, items };
    }

    return { buckets: {}, items: [] }; // AP not implemented fully in schema yet
  }
}
