# FreightFlow Pro — Database Design Document

> **Version**: 1.0 | **Database**: Supabase PostgreSQL | **ORM**: Prisma

---

## 1. Database Architecture

- **Engine**: PostgreSQL 15+ (via Supabase)
- **Region**: ap-south-1 (Mumbai)
- **Multi-Tenancy**: Row-Level Security (RLS) with `tenant_id` on every table
- **Currency**: All amounts stored as **INTEGER (paise)** — never float
- **Dates**: ISO 8601 UTC — displayed in IST (Asia/Kolkata)
- **Soft Delete**: `deleted_at` timestamp column, filtered via RLS
- **Audit**: `created_at`, `updated_at`, `created_by`, `updated_by` on all tables

---

## 2. Schema Groups

### 2.1 Platform-Level Tables (Super Admin)

These tables are **NOT tenant-scoped** — they manage the platform itself.

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `tenants` | id, name, slug, plan, status, license_key, license_expires_at, created_at | All tenant accounts |
| `tenant_modules` | id, tenant_id, module_key, is_enabled, enabled_by, enabled_at | Module toggle per tenant |
| `license_keys` | id, tenant_id, key_hash, plan, max_users, max_vehicles, expires_at, issued_at | License registry |
| `platform_admins` | id, email, password_hash, role, last_login | Super admin users |
| `tenant_usage` | id, tenant_id, metric_name, metric_value, recorded_at | Usage metering data |
| `audit_log_platform` | id, admin_id, action, target_tenant_id, payload, created_at | Super admin actions |

### 2.2 Tenant Core Tables

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `companies` | id, tenant_id, name, gstin, pan, address, logo_url, fiscal_year_start | Company master |
| `branches` | id, company_id, name, address, state_code, manager_id | Branch/depot master |
| `users` | id, tenant_id, company_id, auth_uid, name, role, branch_id, is_active | Staff users |
| `dealers` | id, company_id, name, short_name, person_name, address, pincode, area, phone, email, pan, gstin, service_tax_no, dealer_type | Dealer/Consignor master |
| `consignors` | id, company_id, name, company_name, address, email, gstin, phone, image_url | Consignor master |
| `consignees` | id, company_id, name, company_name, address, email, phone, gstin, pan, image_url | Consignee master |
| `vehicles` | id, company_id, reg_no, make, model, type, ownership, chassis_no, engine_no, odometer, status | Vehicle/Tempo master |
| `labours` | id, company_id, name, phone, address, salary, is_active | Labour/loader master |
| `drivers` | id, company_id, employee_id, dl_number, dl_expiry, dl_category, badge_no, is_vendor_driver | Driver extension |

### 2.3 LR & Order Tables

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `orders` | id, company_id, lr_no, gst_bill_no, dealer_id, consignee_id, eway_bill_no, vehicle_id, date, from_location, to_location, freight, hamali, rate_on, rate, cgst_pct, sgst_pct, status | Main LR/Order table |
| `order_details` | id, order_id, product_name, box_count, packing_type, weight, dcpi_no | Line items per LR |
| `order_pallets` | id, company_id, lr_no, dealer_id, vehicle_id, date, company_name, party_code, gst_pct, status | Pallet management |
| `pallet_details` | id, pallet_id, qty, rate | Pallet line items |
| `pallet_consignee_details` | id, pallet_id, consignee_name, qty, rate | Per-consignee pallet breakdown |
| `lr_status_log` | id, order_id, status, notes, updated_by, updated_at, geo_lat, geo_lng | LR status history |
| `pod_records` | id, order_id, photo_url, signature_url, receiver_name, delivered_at, geo_lat, geo_lng | Proof of delivery |

### 2.4 Trip Tables

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `trips` | id, company_id, vehicle_id, driver_id, co_driver_id, from_location, to_location, departure_at, expected_delivery_at, status | Trip master |
| `trip_orders` | id, trip_id, order_id | LRs assigned to trip |
| `trip_expenses` | id, trip_id, type, amount, description, receipt_url, location, recorded_at | Trip expense entries |
| `trip_settlements` | id, trip_id, advance_amount, total_expenses, balance, settled_by, settled_at | Trip settlement |

### 2.5 Accounting Tables

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `chart_of_accounts` | id, company_id, code, name, type, parent_id, is_system | GL structure |
| `journal_entries` | id, company_id, branch_id, voucher_type, voucher_no, date, narration, ref_id, ref_type, posted_by, is_posted | Voucher header |
| `journal_lines` | id, entry_id, account_id, debit, credit, cost_centre_id, sub_ledger_type, sub_ledger_id | Double-entry lines |
| `freight_invoices` | id, company_id, invoice_no, customer_id, order_ids[], date, subtotal, cgst, sgst, igst, total, irn, status, paid_amount | AR invoices |
| `payments_received` | id, company_id, customer_id, invoice_ids[], amount, mode, utr_no, date, bank_account_id | Customer payments |
| `vendor_invoices` | id, company_id, vendor_id, invoice_no, date, amount, tds_amount, net_payable, status | AP invoices |
| `payments_made` | id, company_id, vendor_id, vendor_invoice_ids[], amount, mode, utr_no, date | Vendor payments |
| `bank_accounts` | id, company_id, bank_name, account_no, ifsc, branch_name, current_balance, last_synced_at | Bank master |
| `bank_transactions` | id, bank_account_id, date, description, debit, credit, balance, matched_entry_id, is_reconciled | Bank statement lines |

### 2.6 HR, Fleet & Compliance Tables

| Table | Key Columns | Purpose |
|-------|------------|---------|
| `employees` | id, company_id, emp_code, name, phone, email, address, designation, branch_id, joining_date, status, bank_account, pan, aadhar_encrypted | Employee master |
| `salary_structures` | id, employee_id, basic, hra, conveyance, driver_allowance, other_allowances, pf_applicable, esi_applicable, effective_from | Salary config |
| `payroll_runs` | id, company_id, month, year, status, total_gross, total_deductions, total_net, processed_by, processed_at | Monthly payroll batch |
| `payroll_lines` | id, run_id, employee_id, gross, pf_deduction, esi_deduction, pt_deduction, tds_deduction, advance_deduction, net_pay | Individual payslip |
| `driver_advances` | id, company_id, driver_id, trip_id, amount, mode, date, purpose, recovery_amount, recovered_amount, status | Driver advance ledger |
| `vehicle_documents` | id, vehicle_id, doc_type, doc_no, issue_date, expiry_date, file_url, alert_sent | Vehicle document tracker |
| `maintenance_jobs` | id, vehicle_id, job_type, description, odometer, started_at, completed_at, cost, status | Maintenance job cards |
| `fuel_entries` | id, vehicle_id, date, quantity, rate, amount, vendor, odometer, kmpl, is_anomaly | Fuel fill-up register |
| `gst_returns` | id, company_id, return_type, period, arn, status, filed_at, json_payload | GST filing tracker |
| `tds_entries` | id, company_id, vendor_id, invoice_id, section, base_amount, rate, tds_amount, deposited, challan_no | TDS deduction register |

---

## 3. RLS Policy Patterns

```sql
-- SELECT: User can only see their tenant's data
CREATE POLICY "tenant_select" ON orders FOR SELECT
USING (
  company_id IN (
    SELECT id FROM companies
    WHERE tenant_id = (
      SELECT tenant_id FROM users WHERE auth_uid = auth.uid()
    )
  )
);

-- INSERT: User can only create in their tenant
CREATE POLICY "tenant_insert" ON orders FOR INSERT
WITH CHECK (
  company_id IN (
    SELECT id FROM companies
    WHERE tenant_id = (
      SELECT tenant_id FROM users WHERE auth_uid = auth.uid()
    )
  )
);

-- UPDATE: Same tenant check
CREATE POLICY "tenant_update" ON orders FOR UPDATE
USING (company_id IN (...))
WITH CHECK (company_id IN (...));

-- DELETE: Tenant check + must record who deleted
CREATE POLICY "tenant_delete" ON orders FOR DELETE
USING (
  company_id IN (...) AND deleted_by = auth.uid()
);
```

---

## 4. Key Relationships (ER Summary)

```
tenants ──1:N──> companies ──1:N──> branches
                     │
                     ├──1:N──> users
                     ├──1:N──> dealers
                     ├──1:N──> consignors
                     ├──1:N──> consignees
                     ├──1:N──> vehicles ──1:N──> vehicle_documents
                     │                   ──1:N──> maintenance_jobs
                     │                   ──1:N──> fuel_entries
                     ├──1:N──> employees ──1:1──> drivers
                     │                   ──1:N──> salary_structures
                     ├──1:N──> orders ──1:N──> order_details
                     │              ──1:N──> lr_status_log
                     │              ──1:1──> pod_records
                     ├──1:N──> trips ──N:M──> orders (via trip_orders)
                     │             ──1:N──> trip_expenses
                     ├──1:N──> freight_invoices
                     ├──1:N──> journal_entries ──1:N──> journal_lines
                     └──1:N──> chart_of_accounts
```

---

## 5. Indexing Strategy

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| `orders` | `(company_id, date)` | B-tree | Dashboard queries |
| `orders` | `(company_id, lr_no)` | Unique | LR lookup |
| `orders` | `(company_id, status)` | B-tree | Status filtering |
| `orders` | `(dealer_id)` | B-tree | Dealer-wise reports |
| `orders` | `(consignee_id)` | B-tree | Consignee-wise reports |
| `freight_invoices` | `(company_id, status)` | B-tree | Outstanding queries |
| `journal_entries` | `(company_id, date)` | B-tree | Ledger queries |
| `journal_lines` | `(account_id)` | B-tree | Account drill-down |
| `employees` | `(company_id, status)` | B-tree | Active employee list |
| `vehicle_documents` | `(expiry_date)` | B-tree | Expiry alert queries |
| `fuel_entries` | `(vehicle_id, date)` | B-tree | KMPL calculations |

---

## 6. Supabase Storage Buckets

| Bucket | Access | Max File Size | Contents |
|--------|--------|--------------|----------|
| `documents` | Private | 10 MB | Vehicle docs, employee docs |
| `pod-photos` | Private | 5 MB | Proof of delivery photos |
| `invoice-pdfs` | Private | 5 MB | Generated invoice PDFs |
| `profile-images` | Private | 2 MB | User, company logos |
| `receipts` | Private | 5 MB | Trip expense receipts |
