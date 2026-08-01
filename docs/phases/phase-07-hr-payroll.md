# Phase 7 — HR, Payroll & Labour Management

> **Duration**: 7-10 days | **Goal**: Employee management, attendance, salary processing, driver payroll

---

## Overview

Complete HR module: employee/labour master, attendance tracking, leave management, monthly payroll processing with PF/ESI/PT/TDS deductions, payslip generation, and driver-specific incentives.

---

## Database Tasks

### D7.1 — HR Tables
```sql
-- employees (already created in Phase 2)
-- Add columns: designation, joining_date, bank_account (encrypted),
-- pan, aadhar_encrypted, status (active|inactive|terminated)

-- salary_structures
id UUID PK, employee_id UUID FK,
basic INTEGER, hra INTEGER, conveyance INTEGER,
driver_allowance INTEGER, other_allowances INTEGER,
pf_applicable BOOLEAN DEFAULT true,
esi_applicable BOOLEAN DEFAULT false,
effective_from DATE, created_at

-- attendance
id UUID PK, employee_id UUID FK, date DATE,
status VARCHAR(10), -- present|absent|half_day|leave|holiday
check_in TIMESTAMPTZ, check_out TIMESTAMPTZ,
notes TEXT, marked_by UUID, created_at
UNIQUE(employee_id, date)

-- leave_requests
id UUID PK, employee_id UUID FK,
leave_type VARCHAR(20), -- casual|sick|earned|unpaid
from_date DATE, to_date DATE, days INTEGER,
reason TEXT, status VARCHAR(20), -- pending|approved|rejected
approved_by UUID, approved_at TIMESTAMPTZ, created_at

-- payroll_runs
id UUID PK, company_id UUID FK, month INTEGER, year INTEGER,
status VARCHAR(20), -- draft|processing|completed|paid
total_gross INTEGER, total_deductions INTEGER, total_net INTEGER,
processed_by UUID, processed_at TIMESTAMPTZ, created_at

-- payroll_lines
id UUID PK, run_id UUID FK, employee_id UUID FK,
working_days INTEGER, present_days INTEGER,
basic INTEGER, hra INTEGER, conveyance INTEGER,
driver_allowance INTEGER, other_allowances INTEGER,
trip_incentive INTEGER DEFAULT 0,
gross INTEGER,
pf_employee INTEGER, pf_employer INTEGER,
esi_employee INTEGER, esi_employer INTEGER,
pt_deduction INTEGER, tds_deduction INTEGER,
advance_deduction INTEGER, other_deductions INTEGER,
total_deductions INTEGER, net_pay INTEGER,
bank_account_encrypted TEXT, payment_status VARCHAR(20)
```

---

## Frontend Tasks

### F7.1 — Employee Master (extends Phase 2)
- Full profile page: personal details, salary structure, attendance summary
- Document uploads: PAN card, Aadhaar, bank passbook
- Salary structure form: basic, HRA, conveyance, allowances, PF/ESI flags

### F7.2 — Labour Management
- Simple list: Name, Phone, Address, Salary
- Payment history: click ₹ icon → side drawer with payment records
- Quick payment entry

### F7.3 — Attendance (`/dashboard/hr/attendance`)
- **Daily view**: Employee list with present/absent/half-day/leave radio buttons
- **Monthly sheet**: Calendar grid showing attendance per employee
- Bulk mark: select multiple employees, mark as present
- Leave integration: auto-populate approved leaves

### F7.4 — Leave Management (`/dashboard/hr/leaves`)
- Apply leave form: type, dates, reason
- Approval queue for managers
- Leave balance display per employee
- Leave policy configuration

### F7.5 — Payroll Processing (`/dashboard/hr/payroll`)
- **Step 1**: Select month/year → show employee list with attendance summary
- **Step 2**: Review calculations — gross, deductions, net per employee
- **Step 3**: Approve and process → generate payslips
- **Step 4**: Bank payment file generation (NEFT bulk format)

**Deduction calculations:**
- PF: 12% of basic (employee) + 12% (employer), capped at ₹15,000 basic
- ESI: 0.75% (employee) + 3.25% (employer), if gross ≤ ₹21,000
- PT: State-based (Gujarat: ₹200/month for salary > ₹12,000)
- TDS: Based on annual salary projection
- Advance recovery: from driver_advances table

### F7.6 — Payslip View & Download
- Individual payslip: month, gross breakdown, deductions, net pay
- PDF generation with company branding
- WhatsApp share button
- Bulk download: all payslips for a month as ZIP

### F7.7 — PF/ESI Challan
- PF ECR (Electronic Challan cum Return) data generation
- ESI challan data preparation
- Download in required format

---

## Backend Tasks

### B7.1 — HR Routes
```
-- Attendance
GET/POST /v1/hr/attendance          → Daily attendance
GET      /v1/hr/attendance/monthly  → Monthly sheet
-- Leaves
GET/POST /v1/hr/leaves              → Leave requests
PUT      /v1/hr/leaves/:id/approve  → Approve/reject
-- Payroll
POST     /v1/hr/payroll/process     → Process monthly payroll
GET      /v1/hr/payroll/:runId      → Payroll run details
GET      /v1/hr/payroll/:runId/payslip/:empId → Individual payslip
GET      /v1/hr/payroll/:runId/bank-file → NEFT bulk file
GET      /v1/hr/payroll/:runId/pf-ecr   → PF ECR data
```

### B7.2 — Payroll Engine Service
```ts
class PayrollEngine {
  async processPayroll(companyId, month, year): PayrollRun
  // 1. Fetch all active employees with salary structures
  // 2. Fetch attendance for the month
  // 3. Calculate: present_days, working_days
  // 4. Pro-rate salary based on attendance
  // 5. Calculate PF, ESI, PT, TDS deductions
  // 6. Calculate driver trip incentives
  // 7. Deduct advance recovery amounts
  // 8. Generate payroll_lines records
  // 9. Create GL entries for salary expense
  // 10. Return payroll summary

  calculatePF(basic): { employee: number, employer: number }
  calculateESI(gross): { employee: number, employer: number }
  calculatePT(gross, state): number
}
```

### B7.3 — Payslip PDF Service
- Generate formatted payslip PDF per employee
- Company header, employee details, earnings table, deductions table, net pay
- Bulk generation as BullMQ job

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Payroll calculations correct | PF, ESI, PT deductions match manual calculation |
| Attendance reflects in payroll | Pro-rated salary for partial attendance |
| Driver incentives calculated | Trip-based incentives added to gross |
| Advance recovery works | Driver advance deducted from salary |
| Payslip PDF generates | Correct data, professional formatting |
| Bank file format correct | NEFT bulk file accepted by bank portal |
