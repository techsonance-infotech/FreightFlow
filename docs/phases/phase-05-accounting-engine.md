# Phase 5 — Core Accounting Engine

> **Duration**: 10-14 days | **Goal**: Double-entry GL, AR, AP, bank reconciliation

---

## Overview

Complete double-entry accounting engine: chart of accounts, voucher entry, accounts receivable, accounts payable, bank reconciliation, and financial statements.

---

## Database Tasks

### D5.1 — Accounting Tables
All tables as defined in database-design.md Section 2.5: `chart_of_accounts`, `journal_entries`, `journal_lines`, `freight_invoices`, `payments_received`, `vendor_invoices`, `payments_made`, `bank_accounts`, `bank_transactions`.

### D5.2 — Chart of Accounts Seed (Transport-Specific)
```
Revenue
├── Freight Income
├── Detention Charges
├── Other Income
Direct Costs
├── Fuel Expenses
├── Toll Expenses
├── Driver Wages
├── Hamali/Loading Charges
├── Vehicle Repair & Maintenance
Indirect Costs
├── Office Rent
├── Staff Salary
├── Insurance Premium
├── Depreciation
Assets
├── Cash in Hand
├── Bank Accounts (per bank)
├── Accounts Receivable (per customer sub-ledger)
├── Vehicles (fixed asset)
├── Driver Advances
Liabilities
├── Accounts Payable (per vendor sub-ledger)
├── CGST Payable
├── SGST Payable
├── IGST Payable
├── TDS Payable
├── PF Payable / ESI Payable
Capital
├── Owner's Capital
├── Retained Earnings
```

### D5.3 — PII Encryption
Encrypt bank account numbers using AES-256 before DB storage. Decrypt on read with tenant-specific key.

---

## Frontend Tasks

### F5.1 — Chart of Accounts (`/dashboard/accounting/coa`)
- Tree view with expand/collapse, type icons
- Add sub-account, edit name/code, deactivate (no delete for system accounts)
- Account types enforce DR/CR nature display

### F5.2 — Voucher Entry (`/dashboard/accounting/vouchers`)
- Voucher types: Payment, Receipt, Journal, Contra, Purchase, Sales, Debit/Credit Note
- Form: Date, voucher no (auto), narration, line items grid (Account, DR, CR, Cost Centre)
- **Real-time DR/CR balance check** — "Save" disabled until DR = CR
- Approval workflow for vouchers above configurable threshold

### F5.3 — Freight Invoice (`/dashboard/accounting/invoices`)
- Create invoice from selected LRs (multi-select)
- Auto-calculate: subtotal, CGST, SGST/IGST, total
- Invoice PDF with IRN QR code placeholder
- Invoice list with status badges (Draft, Sent, Paid, Partial, Overdue)

### F5.4 — Accounts Receivable (`/dashboard/accounting/ar`)
- Customer ledger: all invoices, receipts, credit notes
- Outstanding statement with ageing (0-30, 31-60, 61-90, 90+)
- Record payment: amount, mode, UTR no, date, bank account
- PDC management: record, track clearance/bounce

### F5.5 — Accounts Payable (`/dashboard/accounting/ap`)
- Vendor ledger: purchase invoices, payments, TDS deductions
- Payment scheduling: mark invoices for due-date payment
- TDS auto-deduction based on vendor flags

### F5.6 — Bank Reconciliation (`/dashboard/accounting/bank`)
- Bank statement import (CSV/Excel)
- Auto-match: system matches by amount + date proximity
- Manual match for unmatched items
- Reconciliation report: matched, unmatched (bank), unmatched (GL)

---

## Backend Tasks

### B5.1 — Accounting Engine Service
- `createVoucher()` — validates DR=CR, creates journal_entry + journal_lines
- `postInvoice()` — creates freight_invoice + auto-generates GL entries
- `recordPayment()` — creates payment + GL entries, updates invoice status
- `getTrialBalance()` — aggregates all journal_lines by account
- `getLedger(accountId)` — chronological entries for an account
- `getAgeingReport()` — AR/AP ageing buckets

### B5.2 — Auto GL Entry Rules
```
Invoice Created:
  DR: Accounts Receivable (customer)
  CR: Freight Income
  CR: CGST Payable
  CR: SGST/IGST Payable

Payment Received:
  DR: Bank Account
  CR: Accounts Receivable (customer)

Vendor Invoice:
  DR: Expense Account
  DR: Input CGST
  DR: Input SGST
  CR: Accounts Payable (vendor)
  CR: TDS Payable (if applicable)

Vendor Payment:
  DR: Accounts Payable
  CR: Bank Account
```

### B5.3 — Bank Reconciliation Service
- Parse uploaded CSV/Excel bank statement
- Auto-match algorithm: exact amount match within ±3 day window
- Match score: 100% (exact amount + date) → 80% (exact amount) → manual
- Reconciliation report generation

### B5.4 — Audit Log
- Append-only `audit_log` table for all financial mutations
- Insert-only RLS policy (no update/delete allowed)

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Trial Balance always balances | Sum DR = Sum CR across all vouchers |
| AR ageing correct | Buckets (0-30, 31-60, 61-90, 90+) accurate |
| Bank reconciliation works | Auto-match > 80% of test transactions |
| Freight invoice posts to GL | Invoice creates correct GL entries automatically |
| DR = CR enforced | Cannot save voucher where DR ≠ CR |
| PII encrypted | Bank account numbers encrypted at rest |
