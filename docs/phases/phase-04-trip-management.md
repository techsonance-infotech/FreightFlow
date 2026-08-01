# Phase 4 — Trip Management & Driver Operations

> **Duration**: 7-10 days | **Goal**: Full trip lifecycle with advance, expense recording, and settlement

---

## Overview

Complete trip management: create trips, assign LRs, disburse driver advances, record expenses, settle trips, and generate trip P&L.

---

## Database Tasks

### D4.1 — Trip Tables
```sql
-- trips
id UUID PK, company_id UUID FK, vehicle_id UUID FK,
driver_id UUID FK, co_driver_id UUID FK,
from_location, to_location, departure_at TIMESTAMPTZ,
expected_delivery_at TIMESTAMPTZ, actual_delivery_at TIMESTAMPTZ,
advance_amount INTEGER DEFAULT 0,  -- paise
status VARCHAR(20) DEFAULT 'created',
created_by UUID, created_at, updated_at

-- trip_orders (many-to-many: trip ↔ orders)
id UUID PK, trip_id UUID FK, order_id UUID FK

-- trip_expenses
id UUID PK, trip_id UUID FK,
type VARCHAR(50), -- toll|fuel|repair|driver_allowance|night_halt|loading|police_rto|other
amount INTEGER NOT NULL, -- paise
description TEXT, receipt_url TEXT, location TEXT,
geo_lat DECIMAL(10,7), geo_lng DECIMAL(10,7),
recorded_by UUID, recorded_at TIMESTAMPTZ

-- trip_settlements
id UUID PK, trip_id UUID FK, advance_amount INTEGER,
total_expenses INTEGER, balance INTEGER, -- positive = driver owes, negative = company owes
settlement_type VARCHAR(20), -- refund|additional_payment
settled_by UUID, settled_at TIMESTAMPTZ, journal_entry_id UUID FK

-- driver_advances
id UUID PK, company_id UUID FK, driver_id UUID FK, trip_id UUID FK,
amount INTEGER, mode VARCHAR(20), -- cash|bank
date DATE, purpose TEXT,
recovery_amount INTEGER DEFAULT 0, recovered_amount INTEGER DEFAULT 0,
status VARCHAR(20) DEFAULT 'pending', -- pending|partially_recovered|recovered
created_at, updated_at
```

### D4.2 — Indexes
- `trips(company_id, status)`, `trips(vehicle_id)`, `trips(driver_id)`
- `trip_expenses(trip_id)`, `driver_advances(driver_id, status)`

---

## Frontend Tasks

### F4.1 — Trip Creation (`/dashboard/trips/create`)
- Vehicle (dropdown), Driver (dropdown), Co-Driver (optional dropdown)
- From/To locations, Departure date/time, Expected delivery date
- Assign LRs: multi-select from unassigned LRs (checkbox list)
- Advance amount (₹), Mode (Cash/Bank), Denomination breakdown (for cash)

### F4.2 — Trip List (`/dashboard/trips`)
- Columns: Trip ID, Vehicle, Driver, Route, Departure, Status, Advance, Actions
- Status badges: Created (gray), Loaded (blue), In-Transit (blue), Delivered (green), Settled (green)
- Filter by status, vehicle, driver, date range

### F4.3 — Trip Detail Page (`/dashboard/trips/:id`)
- **Summary card**: Vehicle, driver, route, dates, status, advance given
- **Assigned LRs tab**: Table of linked LRs with status
- **Expenses tab**: List of expenses with running total, add expense form
- **Settlement tab**: Settlement summary, settle button
- **P&L tab**: Trip profit & loss statement

### F4.4 — Trip Expense Recording
- Expense type dropdown (Toll, Fuel, Repair, etc.)
- Amount (₹), Description, Receipt photo upload
- Running balance: `Advance Given − Total Expenses = Balance with Driver`
- Real-time balance display

### F4.5 — Trip Settlement Screen
- Summary: advance amount, total expenses, balance
- If balance > 0: "Driver Refund" entry form
- If balance < 0: "Additional Payment to Driver" form
- Settle button → creates GL entries + closes trip

### F4.6 — Driver Advance Ledger (`/dashboard/trips/advances`)
- Per-driver ledger: opening balance, advances, recoveries, closing balance
- Over-advance alert: red warning when balance > 2× monthly salary
- Recovery schedule linked to payroll

### F4.7 — Trip P&L Display
- Revenue: Sum of freight from assigned LRs
- Costs: Fuel + Toll + Repair + Driver Wages + Misc expenses
- Net Contribution = Revenue − Total Costs
- Margin % display

---

## Backend Tasks

### B4.1 — Trip Routes
```
GET/POST /v1/trips                → List/Create trips
GET      /v1/trips/:id            → Trip detail with expenses
PUT      /v1/trips/:id            → Update trip
POST     /v1/trips/:id/assign-lrs → Assign LRs to trip
POST     /v1/trips/:id/advance    → Disburse advance
GET/POST /v1/trips/:id/expenses   → List/Add expenses
POST     /v1/trips/:id/settle     → Settle trip
GET      /v1/trips/:id/pnl        → Trip P&L
GET      /v1/driver-advances      → Driver advance ledger
GET      /v1/driver-advances/:did → Per-driver ledger
```

### B4.2 — Trip Engine Service
- Status flow: Created → Loaded → In-Transit → Delivered → Settled
- Advance disbursement with GL entry (DR: Driver Advance, CR: Cash/Bank)
- Expense recording with running balance
- Settlement with automatic GL entries
- Trip P&L calculation

### B4.3 — Settlement GL Entries
```
Trip Settlement creates:
  If driver refund:
    DR: Cash/Bank    CR: Driver Advance Account
  If additional payment:
    DR: Trip Expense  CR: Cash/Bank
  
  Trip expense allocation:
    DR: Fuel Expense      CR: Driver Advance (portion)
    DR: Toll Expense      CR: Driver Advance (portion)
    DR: Repair Expense    CR: Driver Advance (portion)
```

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Trip full lifecycle | Created → Dispatched → Settled without errors |
| Trip P&L is accurate | Revenue − All costs = Correct net contribution |
| Advance settled correctly | GL entries balance (DR/CR = 0) |
| Driver advance ledger | Running balance updates in real-time |
| LR assignment | Multiple LRs assignable to one trip |
| Expense recording | All types with receipt upload |
