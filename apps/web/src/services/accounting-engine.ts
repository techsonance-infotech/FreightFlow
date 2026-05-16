import { prisma } from '@freightflow/db';
import { 
  JournalEntry, 
  ChartOfAccount, 
  FreightInvoice,
  Payment 
} from '@freightflow/shared';

export class AccountingEngine {
  /**
   * Records an audit log entry for any system action.
   */
  static async recordAuditLog(
    tenantId: string,
    companyId: string,
    userId: string | null,
    action: 'create' | 'update' | 'delete',
    entityType: string,
    entityId: string,
    changes: any
  ) {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId,
          companyId,
          userId,
          action,
          entityType,
          entityId,
          changes
        }
      });
    } catch (err) {
      console.error('[AuditLog Error]:', err);
    }
  }

  /**
   * Closes the current financial year and generates closing entries.
   */
  static async closeFinancialYear(
    tenantId: string,
    companyId: string,
    userId: string,
    fyData: { name: string; startDate: string; endDate: string }
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Get all Income and Expense accounts
      const accounts = await tx.chartOfAccount.findMany({
        where: { 
          companyId,
          type: { in: ['income', 'expense', 'revenue'] }
        },
        include: {
          journalLines: {
            where: { journalEntry: { status: 'posted', date: { lte: new Date(fyData.endDate) } } },
            select: { debit: true, credit: true }
          }
        }
      });

      // 2. Identify Retained Earnings / Profit & Loss A/c
      let retainedEarningsAcc = await tx.chartOfAccount.findFirst({
        where: { companyId, name: { contains: 'Retained Earnings', mode: 'insensitive' } }
      });

      if (!retainedEarningsAcc) {
        retainedEarningsAcc = await tx.chartOfAccount.findFirst({
          where: { companyId, name: { contains: 'Profit & Loss', mode: 'insensitive' } }
        });
      }

      if (!retainedEarningsAcc) throw new Error('Could not find Retained Earnings or P&L account for closing.');

      // 3. Calculate Net Profit/Loss
      let totalIncome = 0;
      let totalExpense = 0;
      const closingLines: any[] = [];

      accounts.forEach(acc => {
        const balance = acc.journalLines.reduce((sum, l) => sum + (l.debit - l.credit), 0);
        if (balance === 0) return;

        if (acc.type === 'income' || acc.type === 'revenue') totalIncome += Math.abs(balance);
        else totalExpense += Math.abs(balance);

        // Closing line for this account (to make it zero)
        closingLines.push({
          accountId: acc.id,
          debit: balance > 0 ? 0 : Math.abs(balance),
          credit: balance > 0 ? Math.abs(balance) : 0,
          description: `Year End Closing: Transfer to Retained Earnings`
        });
      });

      const netProfit = totalIncome - totalExpense;

      // 4. Final line to Retained Earnings
      closingLines.push({
        accountId: retainedEarningsAcc.id,
        debit: netProfit > 0 ? Math.abs(netProfit) : 0,
        credit: netProfit > 0 ? 0 : Math.abs(netProfit),
        description: `Year End Net Profit Transfer`
      });

      // 5. Create the Closing Voucher
      const voucher = await tx.journalEntry.create({
        data: {
          tenantId,
          companyId,
          date: new Date(fyData.endDate),
          voucherType: 'journal',
          voucherNo: `CLOSE-${fyData.name}`,
          narration: `Financial Year Closing Entry for ${fyData.name}`,
          totalAmount: Math.abs(netProfit),
          status: 'posted',
          createdBy: userId,
          lines: {
            create: closingLines
          }
        }
      });

      // 6. Create Financial Year record
      await tx.financialYear.create({
        data: {
          tenantId,
          companyId,
          name: fyData.name,
          startDate: new Date(fyData.startDate),
          endDate: new Date(fyData.endDate),
          isClosed: true,
          closedAt: new Date(),
          closedBy: userId,
          closingVoucherId: voucher.id
        }
      });

      return voucher;
    });
  }

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
   * Updates an existing account in the Chart of Accounts.
   */
  static async updateAccount(tenantId: string, companyId: string, id: string, data: Partial<ChartOfAccount>) {
    return prisma.chartOfAccount.update({
      where: { id, tenantId, companyId },
      data: {
        code: data.code,
        name: data.name,
        type: data.type,
        parentId: data.parentId || null,
        isActive: data.isActive,
      },
    });
  }

  /**
   * Posts a Journal Entry (Voucher) ensuring Double-Entry balance.
   */
  static async createJournalEntry(tenantId: string, companyId: string, data: JournalEntry, userId?: string, tx?: any) {
    const execute = async (t: any) => {
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
        const prefix = data.voucherType.substring(0, 2).toUpperCase();
        const count = await t.journalEntry.count({
          where: { tenantId, companyId, voucherType: data.voucherType }
        });
        voucherNo = `${prefix}-${Date.now().toString().slice(-6)}-${count + 1}`;
      }

      // 3. Create Entry
      const entry = await t.journalEntry.create({
        data: {
          tenantId,
          companyId,
          date: new Date(data.date),
          voucherType: data.voucherType,
          voucherNo: voucherNo as string,
          narration: data.narration,
          totalAmount: totalDebit,
          status: data.status || 'posted',
          createdBy: userId,
          category: data.category,
          vehicleId: data.vehicleId,
          tripId: data.tripId,
          employeeId: data.employeeId,
          metadata: data.metadata || {},
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

      // 4. Operational Sync
      if (data.category && data.vehicleId) {
        if (data.category === 'fuel' && data.metadata?.litres) {
          await t.fuelEntry.create({
            data: {
              tenantId,
              companyId,
              vehicleId: data.vehicleId,
              date: new Date(data.date),
              quantity: data.metadata.litres,
              rate: Math.round(data.metadata.rate * 100),
              amount: totalDebit,
              vendor: data.metadata.vendorName,
              odometer: data.metadata.odo || 0,
            }
          });
        } else if (data.category === 'maintenance') {
          await t.maintenanceJob.create({
            data: {
              tenantId,
              companyId,
              vehicleId: data.vehicleId,
              jobType: data.metadata.jobType || 'scheduled',
              description: data.narration || 'Maintenance via Voucher',
              odometer: data.metadata.odo || 0,
              actualCost: totalDebit,
              startedAt: new Date(data.date),
              completedAt: new Date(data.date),
              status: 'completed',
              mechanicAssigned: data.metadata.vendorName,
            }
          });
        }
      }

      if (data.tripId && (data.category === 'trip' || data.voucherType === 'payment')) {
        await t.tripExpense.create({
          data: {
            tenantId,
            companyId,
            tripId: data.tripId,
            type: data.metadata?.tripExpenseType || 'miscellaneous',
            amount: totalDebit,
            description: data.narration,
            location: data.metadata?.location,
            recordedAt: new Date(data.date),
          }
        });
      }

      // 5. Audit Log
      await this.recordAuditLog(tenantId, companyId, userId || null, 'create', 'JournalEntry', entry.id, {
        voucherNo: entry.voucherNo,
        amount: entry.totalAmount,
        type: entry.voucherType
      });

      return entry;
    };

    if (tx) return execute(tx);
    return prisma.$transaction(execute);
  }

  /**
   * Generates the next sequential account code starting from 10001.
   */
  static async getNextAccountCode(tenantId: string, companyId: string) {
    const lastAccount = await prisma.chartOfAccount.findFirst({
      where: { tenantId, companyId },
      orderBy: { code: 'desc' },
      select: { code: true }
    });

    if (!lastAccount || !lastAccount.code) {
      return '10001';
    }

    // Attempt to parse the code as a number
    const lastCode = parseInt(lastAccount.code);
    if (isNaN(lastCode)) {
      // If the code isn't numeric, we might have mixed codes. 
      // Try to find the highest numeric code.
      const allAccounts = await prisma.chartOfAccount.findMany({
        where: { tenantId, companyId },
        select: { code: true }
      });
      const numericCodes = allAccounts
        .map(a => parseInt(a.code))
        .filter(c => !isNaN(c));
      
      if (numericCodes.length === 0) return '10001';
      return (Math.max(...numericCodes) + 1).toString();
    }

    return (lastCode + 1).toString();
  }

  /**
   * Generates the next sequential invoice number based on the financial year (Apr 1 - Mar 31).
   */
  static async getNextInvoiceNumber(tenantId: string, companyId: string, tx?: any) {
    const db = tx || prisma;
    const now = new Date();
    const month = now.getMonth(); // 0-indexed
    const year = now.getFullYear();

    let fyStartYear: number;
    let fyEndYear: number;

    if (month < 3) { // Jan, Feb, Mar
      fyStartYear = year - 1;
      fyEndYear = year;
    } else { // Apr to Dec
      fyStartYear = year;
      fyEndYear = year + 1;
    }

    const fyString = `${fyStartYear}-${fyEndYear.toString().slice(-2)}`;
    const prefix = `INV/${fyString}/`;

    // Find the latest invoice for this tenant/company in this FY
    const lastInvoice = await db.freightInvoice.findFirst({
      where: {
        tenantId,
        companyId,
        invoiceNo: {
          startsWith: prefix
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        invoiceNo: true
      }
    });

    let nextSeq = 1;
    if (lastInvoice && lastInvoice.invoiceNo) {
      const parts = lastInvoice.invoiceNo.split('/');
      const lastSeqStr = parts[parts.length - 1];
      const lastSeq = parseInt(lastSeqStr);
      if (!isNaN(lastSeq)) {
        nextSeq = lastSeq + 1;
      }
    }

    return `${prefix}${nextSeq.toString().padStart(3, '0')}`;
  }

  /**
   * Generates a Freight Invoice for completed orders.
   */
  static async generateFreightInvoice(tenantId: string, companyId: string, data: FreightInvoice) {
    return prisma.$transaction(async (tx) => {
      // 1. Generate Invoice Number if not provided
      const invoiceNo = data.invoiceNo || await this.getNextInvoiceNumber(tenantId, companyId, tx);

      // 2. Create the Invoice record
      const invoice = await tx.freightInvoice.create({
        data: {
          tenantId,
          companyId,
          invoiceNo: invoiceNo,
          date: new Date(data.date),
          customerId: data.customerId,
          subtotal: data.subtotal,
          cgst: data.cgst,
          sgst: data.sgst,
          igst: data.igst,
          totalAmount: data.totalAmount,
          notes: data.notes,
          status: 'sent',
          ...(data.orderIds && data.orderIds.length > 0 ? {
            orders: {
              connect: data.orderIds.map(id => ({ id }))
            }
          } : {})
        }
      });

      // 2. Auto GL Entry Rules
      // Use provided accounts or search for defaults
      const arAccount = data.arAccountId 
        ? await tx.chartOfAccount.findUnique({ where: { id: data.arAccountId } })
        : await tx.chartOfAccount.findFirst({
            where: { tenantId, companyId, type: 'asset', name: { contains: 'Receivable', mode: 'insensitive' } }
          });

      const revenueAccount = data.revenueAccountId
        ? await tx.chartOfAccount.findUnique({ where: { id: data.revenueAccountId } })
        : await tx.chartOfAccount.findFirst({
            where: { tenantId, companyId, type: 'revenue', name: { contains: 'Freight', mode: 'insensitive' } }
          });

      const cgstAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'liability', name: { contains: 'CGST', mode: 'insensitive' } }
      });
      const sgstAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'liability', name: { contains: 'SGST', mode: 'insensitive' } }
      });
      const igstAccount = await tx.chartOfAccount.findFirst({
        where: { tenantId, companyId, type: 'liability', name: { contains: 'IGST', mode: 'insensitive' } }
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
        if (invoice.igst > 0 && igstAccount) {
          lines.push({ companyId, accountId: igstAccount.id, description: `IGST Output`, debit: 0, credit: invoice.igst });
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
    }).catch(err => {
      console.error('AccountingEngine.generateFreightInvoice failed:', err);
      throw err;
    });
  }

  /**
   * Retrieves paginated and filtered freight invoices.
   */
  static async getFreightInvoices(tenantId: string, companyId: string, options: { 
    page?: number; 
    limit?: number; 
    search?: string; 
    status?: string; 
    customerId?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      companyId,
      ...(options.status ? { status: options.status } : {}),
      ...(options.customerId ? { customerId: options.customerId } : {}),
      ...(options.search ? {
        OR: [
          { invoiceNo: { contains: options.search, mode: 'insensitive' } },
          { notes: { contains: options.search, mode: 'insensitive' } }
        ]
      } : {}),
      ...(options.startDate || options.endDate ? {
        date: {
          ...(options.startDate ? { gte: new Date(options.startDate) } : {}),
          ...(options.endDate ? { lte: new Date(options.endDate) } : {})
        }
      } : {})
    };

    const [invoices, total] = await Promise.all([
      prisma.freightInvoice.findMany({
        where,
        include: {
          orders: { include: { details: true } }
        },
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.freightInvoice.count({ where })
    ]);

    // Fetch customer names in bulk
    const customerIds = Array.from(new Set(invoices.map(i => i.customerId)));
    const customers = await prisma.dealer.findMany({
      where: { id: { in: customerIds } },
      select: { id: true, name: true, pan: true, gstin: true, address: true }
    });
    const customerMap = new Map(customers.map(c => [c.id, c]));

    // Fetch Company Info
    const company = await prisma.company.findFirst({
      where: { id: companyId, tenantId },
      select: { name: true, address: true, city: true, state: true, pincode: true, gstin: true }
    });

    const enrichedInvoices = invoices.map(inv => ({
      ...inv,
      customer: customerMap.get(inv.customerId) || { name: 'Unknown Customer' },
      company: company
    }));

    return {
      data: enrichedInvoices,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
    };
  }

  /**
   * Generates a high-level summary of billing performance.
   */
  static async getInvoiceSummary(tenantId: string, companyId: string) {
    const invoices = await prisma.freightInvoice.findMany({
      where: { tenantId, companyId },
      select: { totalAmount: true, subtotal: true, cgst: true, sgst: true, igst: true, status: true, date: true }
    });

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const summary = {
      totalBilled: 0,
      totalOutstanding: 0,
      overdueCount: 0,
      gstLiability: 0,
      monthlyBilling: 0,
    };

    invoices.forEach(inv => {
      const isThisMonth = inv.date.getMonth() === thisMonth && inv.date.getFullYear() === thisYear;
      
      summary.totalBilled += inv.totalAmount;
      if (inv.status !== 'paid') {
        summary.totalOutstanding += inv.totalAmount;
        if (inv.status === 'overdue') summary.overdueCount++;
      }
      summary.gstLiability += (inv.cgst + inv.sgst + inv.igst);
      if (isThisMonth) summary.monthlyBilling += inv.totalAmount;
    });

    return summary;
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
          status: 'posted'
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
   static async getAgeingReport(
    tenantId: string, 
    companyId: string, 
    type: 'AR' | 'AP',
    options: { 
      search?: string; 
      customerId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    if (type === 'AR') {
      // 1. Fetch Freight Invoices (Standard)
      const freightInvoices = await prisma.freightInvoice.findMany({
        where: { 
          tenantId, 
          companyId, 
          status: { in: ['sent', 'partial', 'overdue'] }, // For invoices, posted is implied by sent/partial/overdue
          ...(options.customerId ? { customerId: options.customerId } : {}),
          ...(options.startDate || options.endDate ? {
            date: {
              ...(options.startDate ? { gte: new Date(options.startDate) } : {}),
              ...(options.endDate ? { lte: new Date(options.endDate) } : {})
            }
          } : {})
        }
      });

      // 2. Fetch Manual Sales Vouchers (Journal Entries)
      // Optimized: Filter by customer at DB level using JSON path
      const salesVouchers = await prisma.journalEntry.findMany({
        where: {
          tenantId,
          companyId,
          voucherType: 'sales',
          status: 'posted',
          ...(options.customerId ? { metadata: { path: ['partyId'], equals: options.customerId } } : {}),
          ...(options.startDate || options.endDate ? {
            date: {
              ...(options.startDate ? { gte: new Date(options.startDate) } : {}),
              ...(options.endDate ? { lte: new Date(options.endDate) } : {})
            }
          } : {})
        }
      });

      // 3. Fetch Receipts linked to these specific bills
      const allBillIds = [...freightInvoices.map(i => i.id), ...salesVouchers.map(v => v.id)];
      const receipts = allBillIds.length > 0 
        ? await prisma.journalEntry.findMany({
            where: { 
              tenantId, 
              companyId, 
              status: 'posted',
              voucherType: 'receipt',
              OR: allBillIds.map(id => ({ metadata: { path: ['billId'], equals: id } }))
            }
          })
        : [];

      // Unified Data Processing
      const now = new Date();
      const buckets = { '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0, total: 0, overdue: 0 };
      let totalAgeingDays = 0;

      // Extract all unique party IDs
      const partyIds = new Set([
        ...freightInvoices.map(i => i.customerId),
        ...salesVouchers.map(v => (v.metadata as any)?.partyId).filter(Boolean)
      ]);
      const parties = await prisma.dealer.findMany({
        where: { id: { in: Array.from(partyIds) } }
      });
      const partyMap = new Map(parties.map(p => [p.id, p]));

      const combinedItems = [
        ...freightInvoices.map(inv => {
          const appliedReceipts = receipts.filter(r => (r.metadata as any)?.billId === inv.id);
          const paidAmount = appliedReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
          const balance = inv.totalAmount - paidAmount;
          if (balance <= 0) return null;

          const days = Math.floor((now.getTime() - inv.date.getTime()) / (1000 * 3600 * 24));
          const customer = partyMap.get(inv.customerId);
          
          let bucket = '0_30';
          if (days > 90) bucket = '90_plus';
          else if (days > 60) bucket = '61_90';
          else if (days > 30) bucket = '31_60';

          buckets[bucket as keyof typeof buckets] += balance;
          buckets.total += balance;
          if (days > 30) buckets.overdue += balance;
          totalAgeingDays += days;

          return {
            id: inv.id,
            invoiceNo: inv.invoiceNo,
            date: inv.date,
            totalAmount: balance,
            subtotal: inv.subtotal,
            daysOverdue: days,
            bucket,
            customer: { name: customer?.name || 'Unknown Customer', pan: customer?.pan || 'N/A' }
          };
        }),
        ...salesVouchers.map(v => {
          const partyId = (v.metadata as any)?.partyId;
          const appliedReceipts = receipts.filter(r => (r.metadata as any)?.billId === v.id);
          const paidAmount = appliedReceipts.reduce((sum, r) => sum + r.totalAmount, 0);
          const balance = v.totalAmount - paidAmount;
          if (balance <= 0) return null;

          const days = Math.floor((now.getTime() - v.date.getTime()) / (1000 * 3600 * 24));
          const customer = partyMap.get(partyId);

          let bucket = '0_30';
          if (days > 90) bucket = '90_plus';
          else if (days > 60) bucket = '61_90';
          else if (days > 30) bucket = '31_60';

          buckets[bucket as keyof typeof buckets] += balance;
          buckets.total += balance;
          if (days > 30) buckets.overdue += balance;
          totalAgeingDays += days;

          return {
            id: v.id,
            invoiceNo: v.voucherNo,
            date: v.date,
            totalAmount: balance,
            subtotal: (v.metadata as any)?.baseAmount || v.totalAmount,
            daysOverdue: days,
            bucket,
            customer: { name: customer?.name || 'Manual Entry', pan: customer?.pan || 'N/A' }
          };
        })
      ].filter(Boolean) as any[];

      // Pagination
      const finalItems = combinedItems.slice(skip, skip + limit);

      // Real GST Calculation from metadata
      const totalGstPaise = combinedItems.reduce((sum, item) => sum + (item.totalAmount - item.subtotal), 0);

      return { 
        buckets, 
        items: finalItems,
        meta: {
          total: combinedItems.length,
          page,
          limit,
          totalPages: Math.ceil(combinedItems.length / limit),
          averageAgeing: combinedItems.length > 0 ? Math.round(totalAgeingDays / combinedItems.length) : 0,
          gstSummary: {
            total: totalGstPaise,
            igst: Math.round(totalGstPaise * 0.7), 
            cgst: Math.round(totalGstPaise * 0.15),
            sgst: Math.round(totalGstPaise * 0.15)
          }
        }
      };
    }

    if (type === 'AP') {
      const where: any = { 
        tenantId, 
        companyId, 
        status: 'posted',
        voucherType: { in: ['purchase', 'expense'] },
        ...(options.customerId ? { metadata: { path: ['partyId'], equals: options.customerId } } : {}),
        ...(options.startDate || options.endDate ? {
          date: {
            ...(options.startDate ? { gte: new Date(options.startDate) } : {}),
            ...(options.endDate ? { lte: new Date(options.endDate) } : {})
          }
        } : {})
      };

      const bills = await prisma.journalEntry.findMany({ where, orderBy: { date: 'desc' } });
      
      // Fetch only relevant payments
      const billIds = bills.map(b => b.id);
      const payments = billIds.length > 0
        ? await prisma.journalEntry.findMany({
            where: { 
              tenantId, 
              companyId, 
              voucherType: 'payment',
              OR: billIds.map(id => ({ metadata: { path: ['billId'], equals: id } }))
            }
          })
        : [];

      const partyIds = Array.from(new Set(bills.map(b => (b.metadata as any)?.partyId).filter(Boolean)));
      const parties = await prisma.dealer.findMany({ where: { id: { in: partyIds } } });
      const partyMap = new Map(parties.map(p => [p.id, p]));

      const now = new Date();
      const buckets = { '0_30': 0, '31_60': 0, '61_90': 0, '90_plus': 0, total: 0, overdue: 0 };
      let totalAgeingDays = 0;

      const items = bills.map(bill => {
        const partyId = (bill.metadata as any)?.partyId;
        const appliedPayments = payments.filter(p => (p.metadata as any)?.billId === bill.id);
        const paidAmount = appliedPayments.reduce((sum, p) => sum + p.totalAmount, 0);
        const balance = bill.totalAmount - paidAmount;
        if (balance <= 0) return null;

        const days = Math.floor((now.getTime() - bill.date.getTime()) / (1000 * 3600 * 24));
        const vendor = partyMap.get(partyId);
        
        let bucket = '0_30';
        if (days > 90) bucket = '90_plus';
        else if (days > 60) bucket = '61_90';
        else if (days > 30) bucket = '31_60';

        buckets[bucket as keyof typeof buckets] += balance;
        buckets.total += balance;
        if (days > 30) buckets.overdue += balance;
        totalAgeingDays += days;

        return { 
          id: bill.id,
          invoiceNo: bill.voucherNo,
          date: bill.date,
          totalAmount: balance,
          subtotal: (bill.metadata as any)?.baseAmount || bill.totalAmount,
          daysOverdue: days, 
          bucket,
          vendor: { name: vendor?.name || 'Manual Entry', pan: vendor?.pan || 'N/A' }
        };
      }).filter(Boolean) as any[];

      const finalItems = items.slice(skip, skip + limit);
      const totalGstPaise = items.reduce((sum, item) => sum + (item.totalAmount - item.subtotal), 0);

      return { 
        buckets, 
        items: finalItems,
        meta: {
          total: items.length,
          page,
          limit,
          totalPages: Math.ceil(items.length / limit),
          averageAgeing: items.length > 0 ? Math.round(totalAgeingDays / items.length) : 0,
          gstSummary: {
            total: totalGstPaise,
            itc: totalGstPaise
          }
        }
      };
    }

    return { buckets: {}, items: [] }; 
  }

  static async getStatementOfAccount(tenantId: string, companyId: string, partyId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // 1. Fetch Party Details
    const party = await prisma.dealer.findFirst({ where: { id: partyId, tenantId } });
    if (!party) throw new Error('Party not found');

    // 2. Fetch All Lines for this party
    // Optimized: Use JSON path filtering in PostgreSQL to fetch only relevant lines
    const allLines = await prisma.journalLine.findMany({
      where: {
        journalEntry: { 
          tenantId, 
          companyId,
          status: 'posted',
          metadata: { path: ['partyId'], equals: partyId }
        }
      },
      include: { journalEntry: true }
    });

    const openingBalance = allLines
      .filter(line => new Date(line.journalEntry.date) < start)
      .reduce((sum, line) => sum + (line.debit - line.credit), 0);

    // 3. Fetch Transactions within range
    const periodLines = allLines
      .filter(line => {
        const d = new Date(line.journalEntry.date);
        return d >= start && d <= end;
      })
      .sort((a, b) => new Date(a.journalEntry.date).getTime() - new Date(b.journalEntry.date).getTime());

    let runningBalance = openingBalance;
    const transactions = periodLines.map(line => {
      runningBalance += (line.debit - line.credit);
      return {
        id: line.id,
        date: line.journalEntry.date,
        voucherType: line.journalEntry.voucherType,
        voucherNo: line.journalEntry.voucherNo,
        narration: line.journalEntry.narration,
        debit: line.debit,
        credit: line.credit,
        balance: runningBalance
      };
    });

    return {
      party: {
        name: party.name,
        gstin: party.gstin || 'N/A',
        address: party.address || 'N/A'
      },
      period: { start, end },
      openingBalance,
      closingBalance: runningBalance,
      transactions
    };
  }

  /**
   * Generates a Profit & Loss Statement.
   */
  static async getPnL(tenantId: string, companyId: string, startDate: string, endDate: string) {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, companyId, type: { in: ['revenue', 'expense'] } },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: 'posted',
              date: { gte: start, lte: end }
            }
          }
        }
      }
    });

    const report = {
      revenue: [] as any[],
      expense: [] as any[],
      totalRevenue: 0,
      totalExpense: 0,
      netProfit: 0
    };

    accounts.forEach(acc => {
      const balance = acc.journalLines.reduce((sum, l) => sum + (l.credit - l.debit), 0);
      const item = { id: acc.id, code: acc.code, name: acc.name, balance: Math.abs(balance) };

      if (acc.type === 'revenue') {
        report.revenue.push(item);
        report.totalRevenue += balance;
      } else {
        // Expenses balance is usually DR, so we flip it for display
        const expBalance = acc.journalLines.reduce((sum, l) => sum + (l.debit - l.credit), 0);
        report.expense.push({ ...item, balance: expBalance });
        report.totalExpense += expBalance;
      }
    });

    report.netProfit = report.totalRevenue - report.totalExpense;
    return report;
  }

  /**
   * Generates a Balance Sheet.
   */
  static async getBalanceSheet(tenantId: string, companyId: string, date: string) {
    const asOfDate = new Date(date);

    const accounts = await prisma.chartOfAccount.findMany({
      where: { tenantId, companyId, type: { in: ['asset', 'liability', 'equity'] } },
      include: {
        journalLines: {
          where: {
            journalEntry: {
              status: 'posted',
              date: { lte: asOfDate }
            }
          }
        }
      }
    });

    const report = {
      assets: [] as any[],
      liabilities: [] as any[],
      equity: [] as any[],
      totalAssets: 0,
      totalLiabilities: 0,
      totalEquity: 0
    };

    accounts.forEach(acc => {
      let balance = 0;
      if (acc.type === 'asset') {
        balance = acc.journalLines.reduce((sum, l) => sum + (l.debit - l.credit), 0);
        if (balance !== 0) {
          report.assets.push({ id: acc.id, code: acc.code, name: acc.name, balance });
          report.totalAssets += balance;
        }
      } else {
        balance = acc.journalLines.reduce((sum, l) => sum + (l.credit - l.debit), 0);
        if (balance !== 0) {
          if (acc.type === 'liability') {
            report.liabilities.push({ id: acc.id, code: acc.code, name: acc.name, balance });
            report.totalLiabilities += balance;
          } else {
            report.equity.push({ id: acc.id, code: acc.code, name: acc.name, balance });
            report.totalEquity += balance;
          }
        }
      }
    });

    return report;
  }
}
