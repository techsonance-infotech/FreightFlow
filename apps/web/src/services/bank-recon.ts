import { prisma } from '@freightflow/db';

export class BankReconService {
  /**
   * Processes an uploaded bank statement and attempts to auto-match transactions.
   * @param tenantId The tenant ID
   * @param companyId The company ID
   * @param accountId The bank account ID (GL Account)
   * @param statementRows Array of objects parsed from CSV { date, amount, type, reference }
   */
  static async processStatement(tenantId: string, companyId: string, accountId: string, statementRows: any[]) {
    // Fetch system transactions for this bank account that are NOT yet reconciled.
    // Assuming `Transaction` model is used for recording receipts/payments, 
    // or `JournalLine` if doing direct GL recon. Let's use JournalLine for this bank account.
    const systemLines = await prisma.journalLine.findMany({
      where: {
        companyId,
        accountId,
        // In a real system, we'd have an `isReconciled` flag on JournalLine.
        // Since we don't, we'll just fetch recent ones for demonstration.
      },
      include: {
        journalEntry: true
      },
      orderBy: { journalEntry: { date: 'desc' } },
      take: 500
    });

    const results = {
      matched: [] as any[],
      unmatchedSystem: [] as any[],
      unmatchedBank: [] as any[],
    };

    // Very basic auto-matching algorithm
    // Matches if Amount is exactly same AND date is within 3 days
    
    let availableSystemLines = [...systemLines];

    for (const bankRow of statementRows) {
      const bankDate = new Date(bankRow.date);
      const bankAmount = Math.abs(bankRow.amount); // Assume paise

      // Find best match
      const matchIndex = availableSystemLines.findIndex(sysLine => {
        const sysAmount = sysLine.debit > 0 ? sysLine.debit : sysLine.credit;
        if (sysAmount !== bankAmount) return false;

        const sysDate = new Date(sysLine.journalEntry.date);
        const diffTime = Math.abs(sysDate.getTime() - bankDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        return diffDays <= 3;
      });

      if (matchIndex >= 0) {
        const matchedSysLine = availableSystemLines.splice(matchIndex, 1)[0];
        results.matched.push({
          bankTransaction: bankRow,
          systemTransaction: matchedSysLine,
          matchScore: 'High (Amount + Date Proximity)'
        });
      } else {
        results.unmatchedBank.push(bankRow);
      }
    }

    results.unmatchedSystem = availableSystemLines;

    return results;
  }
}
