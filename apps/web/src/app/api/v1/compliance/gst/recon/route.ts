import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { GSTReconService, GSTR2AEntry } from '@/services/gst-recon-service';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tenantId, companyId } = session.user;
    const body = await request.json();
    const { period, portalData } = body;

    if (!period) {
      return NextResponse.json({ error: 'Period (YYYY-MM) is required' }, { status: 400 });
    }

    // If no portal data provided, simulate some for demonstration
    let entries: GSTR2AEntry[] = portalData || [];
    
    if (entries.length === 0) {
      // Simulation logic for a better demo experience
      entries = [
        {
          vendorGstin: "27AAACR1234A1Z1",
          vendorName: "Bharat Petroleum",
          invoiceNo: "BP-00123",
          date: new Date(),
          taxableValue: 500000, // 5000 Rs
          cgst: 12500, // 125 Rs
          sgst: 12500, // 125 Rs
          igst: 0
        },
        {
          vendorGstin: "27BBBCR5678B1Z2",
          vendorName: "MRF Tyres Ltd",
          invoiceNo: "MRF-INV-99",
          date: new Date(),
          taxableValue: 12000000, // 1.2 Lakh Rs
          cgst: 0,
          sgst: 0,
          igst: 1440000 // 12% IGST = 14400 Rs
        }
      ];
    }

    const report = await GSTReconService.reconcile(tenantId, companyId, period, entries);

    return NextResponse.json({ data: report });
  } catch (error: any) {
    console.error('[GST Recon API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
