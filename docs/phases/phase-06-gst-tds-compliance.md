# Phase 6 — GST, TDS & Compliance

> **Duration**: 7-10 days | **Goal**: Automated GST computation, e-Invoice, GSTR preparation

---

## Overview

Indian tax compliance: GST engine (CGST/SGST/IGST auto-selection), e-Invoice IRN generation, GSTR-1 JSON preparation, TDS management, and compliance calendar.

---

## Database Tasks

### D6.1 — Compliance Tables
```sql
-- gst_returns
id UUID PK, company_id UUID FK, return_type VARCHAR(10), -- GSTR1|GSTR3B|GSTR9
period VARCHAR(10), -- 2026-04
arn VARCHAR(50), status VARCHAR(20), filed_at TIMESTAMPTZ,
json_payload JSONB, created_at, updated_at

-- tds_entries
id UUID PK, company_id UUID FK, vendor_id UUID FK, invoice_id UUID FK,
section VARCHAR(10), -- 194C|194I|194J
base_amount INTEGER, rate DECIMAL(5,2), tds_amount INTEGER,
deposited BOOLEAN DEFAULT false, challan_no VARCHAR(50),
quarter VARCHAR(10), created_at

-- einvoice_log
id UUID PK, invoice_id UUID FK, irn VARCHAR(64),
ack_no VARCHAR(50), ack_date TIMESTAMPTZ,
signed_invoice TEXT, qr_code TEXT,
status VARCHAR(20), error_message TEXT, created_at

-- compliance_deadlines
id UUID PK, company_id UUID FK, deadline_type VARCHAR(50),
description TEXT, due_date DATE, status VARCHAR(20),
alert_sent BOOLEAN DEFAULT false
```

---

## Frontend Tasks

### F6.1 — GST Configuration (`/dashboard/compliance/gst/settings`)
- Company ITC position flag (regular/composition)
- Default GST rate (5% or 12%)
- SAC code defaults: 9965 (freight), 9967 (supporting services)
- State code mapping for auto CGST/SGST vs IGST determination

### F6.2 — GSTR-1 Preparation (`/dashboard/compliance/gst/gstr1`)
- Auto-classify invoices: B2B (GSTIN customer), B2C (no GSTIN), Exports
- CDNR section from credit notes
- Review screen with error highlighting (missing GSTIN, invalid HSN, etc.)
- JSON download in GSTN-specified format
- Summary: total invoices, taxable value, CGST, SGST, IGST totals

### F6.3 — e-Invoice Management (`/dashboard/compliance/gst/einvoice`)
- Auto-trigger IRN when invoice above threshold (configurable, default ₹5 Cr)
- IRN status: Pending, Generated, Cancelled
- QR code display on invoice PDF
- IRN cancellation within 24 hours

### F6.4 — TDS Management (`/dashboard/compliance/tds`)
- TDS register: vendor, section, base amount, rate, TDS amount, net payment
- Auto-deduction on vendor payment based on TDS applicability flag
- Quarterly Form 26Q data extraction
- Form 16A PDF generation per vendor
- TDS sections: 194C (freight 1%/2%), 194I (rent 10%), 194J (professional 10%)

### F6.5 — Compliance Calendar Widget
- Dashboard widget: upcoming deadlines in next 30 days
- GSTR-1 (11th), GSTR-3B (20th), TDS payment (7th), advance tax dates
- Vehicle document renewals
- Color-coded: red (overdue), amber (< 7 days), green (> 7 days)

---

## Backend Tasks

### B6.1 — GST Engine Service
```ts
class GSTEngine {
  calculateGST(amount, originState, destState, gstRate): GSTBreakdown
  // → Intra-state: CGST = SGST = rate/2
  // → Inter-state: IGST = rate

  classifyInvoice(invoice): 'B2B' | 'B2C' | 'EXPORT'
  // → B2B if customer has GSTIN, B2C otherwise

  generateGSTR1JSON(companyId, period): GSTR1Payload
  // → Aggregate all invoices/credit notes for period
  // → Format per GSTN specification

  checkRCM(vendorInvoice): boolean
  // → RCM applicable for unregistered GTA payments
}
```

### B6.2 — e-Invoice Service
- IRP API integration (sandbox → production)
- Generate IRN request payload from invoice data
- Store IRN, acknowledgement, signed invoice, QR code
- Cancellation API within 24-hour window

### B6.3 — TDS Service
- Auto-calculate TDS on vendor payment based on section
- Track TDS deposits with challan numbers
- Generate Form 26Q quarterly data
- Generate Form 16A PDF per vendor

### B6.4 — Compliance Alerts (BullMQ Job)
- Daily cron: check upcoming deadlines
- Send email + in-app notification 7 days and 1 day before deadline

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| GST auto-selection | Intra-state → CGST+SGST, Inter-state → IGST |
| GSTR-1 JSON valid | JSON passes GSTN format validation |
| TDS deduction correct | 194C at 1%/2% applied correctly on vendor payments |
| Compliance calendar | Shows correct deadlines with proper color coding |
| RCM detection | Flags unregistered vendor invoices for RCM |
