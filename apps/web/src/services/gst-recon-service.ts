import { prisma } from '@freightflow/db';
import { startOfMonth, endOfMonth } from 'date-fns';

export interface GSTR2AEntry {
  vendorGstin: string;
  vendorName: string;
  invoiceNo: string;
  date: Date;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
}

export interface ReconResult {
  matchStatus: 'matched' | 'mismatch' | 'missing_in_portal' | 'missing_in_ledger';
  ledgerEntry?: any;
  portalEntry?: GSTR2AEntry;
  discrepancies: string[];
}

export class GSTReconService {
  /**
   * Reconciles ledger entries with portal entries.
   */
  static async reconcile(tenantId: string, companyId: string, period: string, portalEntries: GSTR2AEntry[]) {
    const [year, month] = period.split('-');
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

    // 1. Fetch Ledger entries (Purchase/Expense Vouchers with GST)
    const ledgerVouchers = await prisma.journalEntry.findMany({
      where: {
        tenantId,
        companyId,
        status: 'posted',
        voucherType: { in: ['purchase', 'expense'] },
        date: { gte: startDate, lte: endDate }
      },
      include: {
        lines: { include: { account: true } }
      }
    });

    const ledgerEntries = ledgerVouchers.map(v => {
      let cgst = 0, sgst = 0, igst = 0;
      v.lines.forEach(l => {
        const name = l.account.name.toUpperCase();
        if (name.includes('GST') && (name.includes('INPUT') || name.includes('PURCHASE'))) {
          if (name.includes('CGST')) cgst += l.debit;
          else if (name.includes('SGST')) sgst += l.debit;
          else if (name.includes('IGST')) igst += l.debit;
        }
      });

      return {
        id: v.id,
        invoiceNo: v.voucherNo,
        date: v.date,
        cgst,
        sgst,
        igst,
        totalTax: cgst + sgst + igst,
        narration: v.narration
      };
    });

    const results: ReconResult[] = [];
    const matchedLedgerIds = new Set<string>();
    const matchedPortalIndices = new Set<number>();

    // 2. Match Logic
    ledgerEntries.forEach(ledger => {
      const portalIndex = portalEntries.findIndex((p, idx) => 
        !matchedPortalIndices.has(idx) && 
        (p.invoiceNo.toLowerCase() === ledger.invoiceNo.toLowerCase() || 
         p.invoiceNo.replace(/[^a-zA-Z0-9]/g, '') === ledger.invoiceNo.replace(/[^a-zA-Z0-9]/g, ''))
      );

      if (portalIndex !== -1) {
        const portal = portalEntries[portalIndex];
        const discrepancies: string[] = [];
        
        const taxDiff = Math.abs((portal.cgst + portal.sgst + portal.igst) - ledger.totalTax);
        if (taxDiff > 100) { // Tolerance of 1 Rupee (100 paise)
          discrepancies.push(`Tax mismatch: Ledger ${ledger.totalTax / 100} vs Portal ${(portal.cgst + portal.sgst + portal.igst) / 100}`);
        }

        results.push({
          matchStatus: discrepancies.length > 0 ? 'mismatch' : 'matched',
          ledgerEntry: ledger,
          portalEntry: portal,
          discrepancies
        });
        
        matchedLedgerIds.add(ledger.id);
        matchedPortalIndices.add(portalIndex);
      } else {
        results.push({
          matchStatus: 'missing_in_portal',
          ledgerEntry: ledger,
          discrepancies: ['Invoice not found in GSTR-2A data']
        });
      }
    });

    // 3. Find entries in Portal missing in Ledger
    portalEntries.forEach((portal, idx) => {
      if (!matchedPortalIndices.has(idx)) {
        results.push({
          matchStatus: 'missing_in_ledger',
          portalEntry: portal,
          discrepancies: ['Invoice found in GSTR-2A but missing in your accounting ledger']
        });
      }
    });

    return {
      summary: {
        totalMatched: results.filter(r => r.matchStatus === 'matched').length,
        totalMismatched: results.filter(r => r.matchStatus === 'mismatch').length,
        missingInPortal: results.filter(r => r.matchStatus === 'missing_in_portal').length,
        missingInLedger: results.filter(r => r.matchStatus === 'missing_in_ledger').length,
        totalPortalTax: portalEntries.reduce((acc, curr) => acc + (curr.cgst + curr.sgst + curr.igst), 0),
        totalLedgerTax: ledgerEntries.reduce((acc, curr) => acc + curr.totalTax, 0)
      },
      results
    };
  }
}
