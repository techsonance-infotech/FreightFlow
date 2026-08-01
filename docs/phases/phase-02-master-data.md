# Phase 2 — Master Data Management

> **Duration**: 5-7 days | **Goal**: All master data CRUD — mirrors the reference screenshots

---

## Overview

Build all master data entities with consistent CRUD patterns: table lists with search/filter/export, modal-based create/edit forms, quick-add from other forms, and CSV import/export.

---

## Database Tasks

### D2.1 — Master Tables Migration

```sql
-- dealers
id UUID PK, company_id UUID FK, name, short_name, person_name,
address TEXT, pincode, area, phone, email, pan, gstin, service_tax_no,
dealer_type VARCHAR(50), is_active BOOLEAN DEFAULT true,
created_at, updated_at, deleted_at

-- consignors
id UUID PK, company_id UUID FK, name, company_name, address,
email, gstin, phone, image_url, is_active, created_at, updated_at, deleted_at

-- consignees
id UUID PK, company_id UUID FK, name, company_name, address,
email, phone, gstin, pan, image_url, is_active, created_at, updated_at, deleted_at

-- vehicles
id UUID PK, company_id UUID FK, reg_no UNIQUE, make, model,
type VARCHAR(50), ownership VARCHAR(50), chassis_no, engine_no,
odometer INTEGER DEFAULT 0, status VARCHAR(20) DEFAULT 'active',
created_at, updated_at, deleted_at

-- labours
id UUID PK, company_id UUID FK, name, phone, address,
salary INTEGER (paise), is_active BOOLEAN DEFAULT true,
created_at, updated_at, deleted_at

-- products
id UUID PK, company_id UUID FK, name, hsn_code, default_packing,
is_active, created_at, updated_at, deleted_at
```

### D2.2 — RLS Policies
Apply standard tenant isolation RLS on all 6 master tables.

### D2.3 — Indexes
- `dealers(company_id, name)` — search
- `dealers(company_id, gstin)` — unique check
- `consignees(company_id, name)` — search
- `vehicles(company_id, reg_no)` — unique lookup
- `vehicles(company_id, status)` — filter

### D2.4 — Seed Data
Seed 5-10 records per master for demo tenant (realistic Indian transport data).

---

## Frontend Tasks

### F2.1 — Master List UI Pattern (Reusable)

Create a reusable `MasterListPage` component used by ALL masters:

```tsx
<MasterListPage
  title="Dealers"
  columns={dealerColumns}
  queryKey={queryKeys.dealers.all}
  fetchFn={dealerApi.list}
  FormComponent={DealerForm}
  exportFormats={['copy', 'excel', 'csv', 'pdf']}
  searchFields={['name', 'person_name', 'gstin', 'phone']}
/>
```

Features:
- **Table**: ID column, data columns, Action column (Edit pencil, Delete trash)
- **Export buttons**: Copy, Excel, CSV, PDF — top-right of table
- **Search bar**: Real-time filter across all visible columns
- **Pagination**: "Showing X to Y of Z entries" with Previous/Next, page size selector (10/25/50/100)
- **Add New button**: Opens modal form (not separate page)
- **Soft delete**: Confirmation dialog before delete

### F2.2 — Dealer Master Page (`/dashboard/masters/dealers`)
- **List columns**: Name, Short Name, Person Name, Area, Phone, GSTIN, Actions
- **Form fields**: Name*, Short Name, Person Name*, Address, Pincode, Area, Phone*, Email, PAN, GSTIN, Service Tax No, Dealer Type (dropdown)
- **Validation**: GSTIN format (15 chars), PAN format (10 chars), phone (10 digits)
- **Quick-add**: "+Add Dealer" button accessible from Order form

### F2.3 — Consignor Master Page (`/dashboard/masters/consignors`)
- **List columns**: Name, Company Name, Email, GSTIN, Phone, Image, Actions
- **Form fields**: Name*, Company Name, Address, Email, GSTIN, Phone*, Image upload
- **Image upload**: Preview thumbnail, max 2MB, JPEG/PNG

### F2.4 — Consignee Master Page (`/dashboard/masters/consignees`)
- **List columns**: Name, Company Name, Email, Phone, GSTIN, PAN, Actions
- **Form fields**: Name*, Company Name, Address, Email, Phone*, GSTIN, PAN, Image upload
- **Duplicate detection**: Warn if GSTIN or name+phone already exists
- **PAN field**: Required for TDS computation in Phase 6

### F2.5 — Vehicle (Tempo) Master Page (`/dashboard/masters/vehicles`)
- **List columns**: Reg No, Make, Model, Type, Ownership, Status, Actions
- **Form fields**: Reg No* (unique), Make, Model, Type (dropdown: Truck/Trailer/Tempo/Container), Ownership (Own/Hired), Chassis No, Engine No, Odometer
- **Status badge**: Active (green), Under Maintenance (amber), Inactive (gray)

### F2.6 — Labour Master Page (`/dashboard/masters/labour`)
- **List columns**: Name, Phone, Address, Salary (₹), Payment History (₹ icon), Actions
- **Form fields**: Name*, Phone*, Address, Salary* (INR input)
- **Payment history**: Click ₹ icon → shows payment history in side drawer
- **Salary display**: Formatted as ₹XX,XXX using `Intl.NumberFormat('en-IN')`

### F2.7 — Driver Master Page (`/dashboard/masters/drivers`)
- **List columns**: Name, Employee Code, DL Number, DL Expiry, DL Category, Badge No, Actions
- **Form fields**: Links to employee record + DL No*, DL Expiry* (date picker), DL Category (dropdown), Badge No, Is Vendor Driver (toggle)
- **Expiry alert**: Red badge if DL expired, amber if < 30 days

### F2.8 — Products/Goods Master Page (`/dashboard/masters/products`)
- **List columns**: Name, HSN Code, Default Packing, Actions
- **Form fields**: Name*, HSN Code, Default Packing (dropdown: Box/Bag/Pallet/Loose)
- **Used in**: Autocomplete in Order form line items

### F2.9 — Quick-Add Modal Component
Reusable component for adding master data inline from other forms:
```tsx
<QuickAddModal
  entity="dealer"
  FormComponent={DealerForm}
  onSuccess={(newDealer) => setSelectedDealer(newDealer)}
  trigger={<Button variant="outline" size="sm">+ Add</Button>}
/>
```

### F2.10 — CSV Import Component
- Upload CSV/Excel file
- Column mapping UI (map file columns to entity fields)
- Validation preview (show errors per row)
- Import with progress bar
- Error report download

---

## Backend Tasks

### B2.1 — Generic CRUD Route Pattern
Create a reusable route factory for consistent CRUD:

```ts
// Each master follows this exact pattern:
GET    /v1/masters/{entity}         → List (paginated, searchable, filterable)
POST   /v1/masters/{entity}         → Create (Zod validated)
GET    /v1/masters/{entity}/:id     → Get by ID
PUT    /v1/masters/{entity}/:id     → Update (partial)
DELETE /v1/masters/{entity}/:id     → Soft delete
POST   /v1/masters/{entity}/import  → CSV bulk import
GET    /v1/masters/{entity}/export  → Export (CSV/Excel/PDF)
```

### B2.2 — Dealer Routes & Service
- Zod schema: `DealerCreateSchema`, `DealerUpdateSchema`
- GSTIN uniqueness check per company
- PAN format validation (if provided)
- Search: name, person_name, gstin, phone, area

### B2.3 — Consignee Routes & Service
- Duplicate detection: same GSTIN or (name + phone) within company
- Image upload to Supabase Storage `profile-images` bucket
- PAN validation for TDS readiness

### B2.4 — Vehicle Routes & Service
- Registration number uniqueness (global, not per-company)
- Status transitions: Active ↔ Under Maintenance ↔ Inactive
- Odometer validation: new reading must be ≥ previous

### B2.5 — Labour Routes & Service
- Salary stored as INTEGER (paise)
- Payment history aggregation endpoint

### B2.6 — Driver Routes & Service
- Must be linked to an employee record
- DL expiry validation and alert flag

### B2.7 — Export Service
- Generate CSV: use `csv-stringify`
- Generate Excel: use `exceljs`
- Generate PDF: use `pdfkit` or Puppeteer for formatted tables

### B2.8 — Import Service
- Parse CSV/Excel with `xlsx` package
- Validate each row against Zod schema
- Batch insert with transaction
- Return error report for failed rows

### B2.9 — File Upload Middleware
- MIME type validation (image/jpeg, image/png, application/pdf)
- Max file size: 10 MB
- Upload to Supabase Storage
- Return signed URL

---

## Testing Tasks

### T2.1 — Unit Tests
- Zod schema validation for all 8 entities
- GSTIN format validator
- PAN format validator
- Currency formatting (paise → ₹)

### T2.2 — Integration Tests
- CRUD for each master entity (create, list, get, update, delete)
- Search across multiple fields
- Pagination: correct total count, page boundaries
- Duplicate detection (GSTIN, reg_no)
- RLS: Company A's dealers not visible to Company B
- Export: CSV/Excel download returns correct data
- Import: valid CSV imports successfully, invalid rows reported
- Quick-add: create entity and verify auto-select

### T2.3 — E2E Tests
- Create dealer → appears in list → edit → verify changes
- Import CSV → verify records created
- Quick-add from Order form → verify inline creation

---

## Acceptance Criteria

| Criteria | Pass Condition |
|----------|---------------|
| All 8 master entities CRUD working | Create, Read, Update, Delete with validation |
| Quick-add from Order form | +Add button opens inline modal, saves, auto-selects |
| Export works | Excel/CSV/PDF export with actual data |
| Search works | Real-time filter across all visible columns |
| RLS enforced | Company A's consignees not visible to Company B |
| Import works | CSV import with validation and error report |
| Pagination works | Correct counts, page navigation |
| Image upload works | Profile images display correctly |
