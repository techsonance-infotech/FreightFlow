# Phase 9 — Reporting, Dashboard & MIS

> **Duration**: 7-8 days | **Goal**: All financial and operational reports, executive dashboard

---

## Overview

Executive dashboard with KPI cards and charts, financial reports (P&L, Balance Sheet, Trial Balance), transport MIS reports, and a report engine with scheduling.

---

## Database Tasks

### D9.1 — Report Tables
```sql
-- scheduled_reports
id UUID PK, company_id UUID FK, report_type VARCHAR(50),
schedule VARCHAR(20), -- daily|weekly|monthly
parameters JSONB, -- filters, date range, etc.
recipient_emails TEXT[], last_run_at TIMESTAMPTZ,
next_run_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT true

-- report_cache
id UUID PK, report_type VARCHAR(50), company_id UUID FK,
parameters_hash VARCHAR(64), data JSONB,
generated_at TIMESTAMPTZ, expires_at TIMESTAMPTZ
```

---

## Frontend Tasks

### F9.1 — Executive Dashboard (`/dashboard`)
**KPI Cards (top row):**
- Today's LRs (count, +/- vs yesterday)
- Today's Revenue (₹, trend)
- Outstanding Receivables (₹, overdue count)
- Vehicles On Trip (count / total, idle count)
- Vehicles Idle (count)
- Documents Expiring (within 30 days)

**Charts:**
- Revenue trend: bar chart, last 12 months
- Top 5 customers by revenue: pie/donut chart
- LR volume: daily/weekly trend line chart
- Vehicle utilization: percentage bar chart

**Widgets:**
- Today's LR list (quick table from Phase 3)
- Today's Pallet list
- Compliance calendar (upcoming deadlines)
- Recent activity feed

### F9.2 — Financial Reports (`/dashboard/reports/financial`)

| Report | Description | Filters |
|--------|------------|---------|
| **Profit & Loss** | Revenue − Expenses by category | Date range, company, branch |
| **Balance Sheet** | Assets = Liabilities + Equity as on date | As-on date, company |
| **Trial Balance** | All accounts with DR/CR totals | Date range, drill-down to vouchers |
| **Cash Flow Statement** | Operating, investing, financing | Date range, company |
| **Debtors Ageing** | Customers by overdue buckets (0-30, 31-60, 61-90, 90+) | As-on date, company |
| **Creditors Ageing** | Vendors by overdue buckets | As-on date, company |
| **Bank Reconciliation** | Matched/unmatched items | Bank account, date range |

### F9.3 — Transport MIS Reports (`/dashboard/reports/transport`)

| Report | Description |
|--------|------------|
| **Vehicle-wise P&L** | Per vehicle: freight earned, expenses, net for date range |
| **Route-wise Profitability** | Origin-destination pairs ranked by margin |
| **Customer-wise Revenue** | Revenue + outstanding per customer |
| **LR Register** | All LRs in date range with full details |
| **Driver Advance Register** | Advances given, recovered, outstanding per driver |
| **Fuel Consumption** | Per vehicle, fleet total, KMPL trends |
| **Pending POD** | LRs delivered but POD not uploaded |
| **Freight Rate History** | Rate trends per route/customer over time |

### F9.4 — Report Viewer Component
- Date range picker with presets: Today, This Week, This Month, This Quarter, This Year, Custom
- Company/branch filter (for multi-company tenants)
- Export buttons: Excel, PDF
- Print button
- Drill-down: click any line → navigate to source voucher/LR/invoice
- Chart + table toggle view

### F9.5 — Scheduled Reports
- Configure: report type, schedule (daily/weekly/monthly), email recipients
- History of generated reports with download links

---

## Backend Tasks

### B9.1 — Report Engine Service
```ts
class ReportEngine {
  async generateProfitLoss(companyId, dateRange): ProfitLossData
  async generateBalanceSheet(companyId, asOnDate): BalanceSheetData
  async generateTrialBalance(companyId, dateRange): TrialBalanceData
  async generateAgeingReport(companyId, type, asOnDate): AgeingData
  async generateVehiclePnL(companyId, dateRange): VehiclePnLData[]
  async generateLRRegister(companyId, filters): LRRegisterData[]
  async generateFuelReport(companyId, dateRange): FuelReportData
}
```

### B9.2 — Report Routes
```
GET /v1/reports/dashboard-kpis     → KPI card data
GET /v1/reports/profit-loss        → P&L statement
GET /v1/reports/balance-sheet      → Balance sheet
GET /v1/reports/trial-balance      → Trial balance
GET /v1/reports/ageing/:type       → AR/AP ageing (type: debtors|creditors)
GET /v1/reports/vehicle-pnl        → Vehicle-wise P&L
GET /v1/reports/route-profitability → Route-wise margins
GET /v1/reports/lr-register        → LR register
GET /v1/reports/fuel               → Fuel consumption
GET /v1/reports/pending-pod        → Pending POD list
GET /v1/reports/export/:type       → Export as Excel/PDF
```

### B9.3 — Report Cache
- Cache frequently accessed reports (dashboard KPIs) in Redis
- TTL: 5 minutes for dashboard, 1 hour for historical reports
- Invalidate on relevant data mutations

### B9.4 — Scheduled Report Job (BullMQ)
- Cron-based: daily at 8 AM, weekly on Monday, monthly on 1st
- Generate PDF report → email to configured recipients via Resend

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Dashboard KPIs accurate | All numbers match manual database query |
| P&L Statement correct | Revenue − Expenses matches trial balance |
| Balance Sheet balances | Assets = Liabilities + Equity |
| Ageing buckets correct | Invoices in correct 0-30/31-60/61-90/90+ buckets |
| Export works | Excel and PDF downloads contain correct data |
| Drill-down works | Click line → navigates to source record |
| Scheduled reports | Email received on configured schedule |
