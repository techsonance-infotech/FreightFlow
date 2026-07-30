# Phase 3 — LR / Order Management (Core Transport Module)

> **Duration**: 8-10 days | **Goal**: Complete LR lifecycle matching the reference software exactly

---

## Overview

The core transport module — Lorry Receipt (LR) creation, listing, printing, pallet management, and e-Way Bill integration. This is the heart of the product.

---

## Database Tasks

### D3.1 — Order Tables Migration

```sql
-- orders (LR)
id UUID PK, company_id UUID FK, lr_no INTEGER NOT NULL,
gst_bill_no VARCHAR(50), dealer_id UUID FK, consignee_id UUID FK,
eway_bill_no VARCHAR(20), vehicle_id UUID FK,
date DATE NOT NULL, from_location VARCHAR(255), to_location VARCHAR(255),
freight INTEGER NOT NULL DEFAULT 0,    -- paise
hamali INTEGER NOT NULL DEFAULT 0,     -- paise
rate_on VARCHAR(20) DEFAULT 'weight',  -- weight|box
rate INTEGER DEFAULT 0,                -- paise
cgst_pct DECIMAL(5,2) DEFAULT 0,
sgst_pct DECIMAL(5,2) DEFAULT 0,
total_weight DECIMAL(10,2) DEFAULT 0,
total_boxes INTEGER DEFAULT 0,
subtotal INTEGER DEFAULT 0,            -- paise
cgst_amount INTEGER DEFAULT 0,         -- paise
sgst_amount INTEGER DEFAULT 0,         -- paise
total_amount INTEGER DEFAULT 0,        -- paise
status VARCHAR(20) DEFAULT 'created',
created_by UUID, created_at, updated_at, deleted_at

-- order_details (line items per LR)
id UUID PK, order_id UUID FK, product_name VARCHAR(255),
box_count INTEGER DEFAULT 0, packing_type VARCHAR(50),
weight DECIMAL(10,2) DEFAULT 0, dcpi_no VARCHAR(50),
sort_order INTEGER DEFAULT 0

-- order_pallets
id UUID PK, company_id UUID FK, lr_no INTEGER,
dealer_id UUID FK, vehicle_id UUID FK, date DATE,
company_name VARCHAR(255), party_code VARCHAR(50),
gst_pct DECIMAL(5,2) DEFAULT 0, status VARCHAR(20),
created_at, updated_at, deleted_at

-- pallet_details
id UUID PK, pallet_id UUID FK, qty INTEGER, rate INTEGER -- paise

-- pallet_consignee_details
id UUID PK, pallet_id UUID FK, consignee_name VARCHAR(255),
qty INTEGER, rate INTEGER -- paise

-- lr_status_log
id UUID PK, order_id UUID FK, status VARCHAR(20),
notes TEXT, updated_by UUID, updated_at TIMESTAMPTZ,
geo_lat DECIMAL(10,7), geo_lng DECIMAL(10,7)

-- pod_records
id UUID PK, order_id UUID FK, photo_url TEXT,
signature_url TEXT, receiver_name VARCHAR(255),
delivered_at TIMESTAMPTZ, geo_lat DECIMAL(10,7), geo_lng DECIMAL(10,7)
```

### D3.2 — Indexes
- `orders(company_id, lr_no)` — UNIQUE
- `orders(company_id, date)` — today's LRs, date range queries
- `orders(company_id, status)` — status filtering
- `orders(dealer_id)` — dealer-wise reports
- `orders(consignee_id)` — consignee-wise reports
- `orders(vehicle_id)` — vehicle-wise reports

### D3.3 — LR Number Sequence
Create a function/trigger for auto-incrementing LR number per company:
```sql
CREATE OR REPLACE FUNCTION get_next_lr_no(p_company_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(MAX(lr_no), 0) + 1
  FROM orders WHERE company_id = p_company_id AND deleted_at IS NULL;
$$ LANGUAGE SQL;
```

### D3.4 — RLS Policies
Apply tenant isolation on all order-related tables.

---

## Frontend Tasks

### F3.1 — LR Creation Form (`/dashboard/orders/create`)

**Layout**: Full-page form matching reference screenshot

**Header Section:**
- Custom LR No (auto-filled, override allowed)
- GST Bill No (optional)
- Date (default: today, date picker)
- e-Way Bill No (optional text input)

**Party Section:**
- Dealer (searchable dropdown + Quick-Add button)
- Consignee (searchable dropdown + Quick-Add button)
- Address (auto-filled from consignee, editable)

**Transport Section:**
- Tempo No / Vehicle (searchable dropdown + Quick-Add)
- From Location (text, auto-suggest from history)
- To Location (text, auto-suggest from history)

**Billing Section:**
- Freight (₹ input)
- Hamali (₹ input)
- Rate On (dropdown: Weight / Box)
- Rate (₹ per unit)
- CGST % (number input, default from company settings)
- SGST % (number input, default from company settings)

**Line Items Table (Dynamic Rows):**
| Product Name | Box | Packing | Weight (kg) | DCPI No |
|---|---|---|---|---|
| (autocomplete) | (number) | (dropdown) | (number) | (text) |
| + Add Row button |

**Auto-Calculated Fields (read-only, updated in real-time):**
- Total Weight = sum of all line item weights
- Total Boxes = sum of all line item boxes
- Subtotal = Freight + Hamali
- CGST Amount = Subtotal × CGST%
- SGST Amount = Subtotal × SGST%
- **Grand Total = Subtotal + CGST + SGST**

**Actions:**
- Save & Create Another
- Save & Print
- Save & Close
- Cancel

### F3.2 — Order List View (`/dashboard/orders`)

**Table columns** (matching reference screenshot):
LR No | GST Bill No | Order Date | Dealer Name | Consignee Name | Total Weight | Total Box | Total Amount | Product | Tempo

**Per-row actions:**
- Edit (pencil icon)
- Print LR Receipt (printer icon)
- Print LR (printer icon)
- Delete (trash icon)

**Filter bar:**
- Date range picker (with presets: Today, This Week, This Month, Custom)
- Dealer filter (dropdown)
- Consignee filter (dropdown)
- Vehicle filter (dropdown)
- Status filter (dropdown: All, Created, In Transit, Delivered, etc.)

**Pagination:**
- Show 10/25/50/100 rows selector
- "Showing X to Y of Z entries"
- Previous/Next page buttons

**Export buttons:** Copy, Excel, CSV, PDF

### F3.3 — Today's LRs Dashboard Widget
- Table: Order ID, LR No, Order Date, Total Weight, LR Receipt (print), LR Print, Update, Delete
- Auto-refresh every 60 seconds
- "View All Orders" link to full order list
- Positioned prominently on main dashboard

### F3.4 — LR Print Templates

**Template 1: LR Consignee Copy**
- Header: Company logo, name, address, GSTIN, phone
- Dealer info block
- Date / LR No / Vehicle block
- Consignee block
- Goods table: Sr | Good | Box | Packing | Weight | DCPI No
- Terms & conditions
- Footer: Service Tax info, Receiver Signature line, Carriers disclaimer

**Template 2: LR Driver Copy**
- Same layout as consignee copy
- "DRIVER COPY" watermark/label

**Template 3: LR with HSN Code**
- Same as Template 1 but with HSN Code column in goods table

**Multi-copy print**: All 3 copies on one A4 sheet (option) or separate pages
**Print preview**: Modal preview before sending to printer
**PDF download**: Generate PDF for email/WhatsApp sharing

### F3.5 — Pallet Management (`/dashboard/pallets`)

**Pallet Creation Form:**
- LR No (auto-increment)
- Dealer (dropdown)
- Date (default today)
- Tempo No (dropdown)
- Company Name
- Party Code
- GST %
- Qty/Rate line items (3 pairs initially, expandable)
- Consignee section: 5 rows of (Consignee Name, Qty, Rate)

**Today's Pallet Widget:**
- Table: Sr No, LR No, Pallet Date, Pallet Qty, Dealer Name, Pallet Print, Update, Delete

**Pallet Print**: Formatted PDF with company branding

### F3.6 — LR Status Updates
- Status flow: Created → Loaded → In Transit → Delivered → Cancelled
- Status update form: select status, add notes, auto-timestamp
- Status history timeline on LR detail page
- Status badge colors matching design system

---

## Backend Tasks

### B3.1 — Order Routes
```
GET    /v1/orders              → List (paginated, filtered)
POST   /v1/orders              → Create new LR
GET    /v1/orders/today        → Today's LRs
GET    /v1/orders/:id          → Get LR detail
PUT    /v1/orders/:id          → Update LR
DELETE /v1/orders/:id          → Soft delete
POST   /v1/orders/:id/status   → Update status
GET    /v1/orders/:id/print    → Generate PDF
POST   /v1/orders/import       → Bulk import from Excel
GET    /v1/orders/export       → Export filtered list
```

### B3.2 — LR Engine Service
```ts
class LREngine {
  async create(input, ctx): Promise<TOrder>
  // → Generate LR no, calculate totals, create order + details

  async update(id, input, ctx): Promise<TOrder>
  // → Recalculate totals, update order + details

  async updateStatus(id, status, notes, ctx): Promise<void>
  // → Create lr_status_log entry, update order status

  async getNextLRNumber(companyId): Promise<number>
  // → MAX(lr_no) + 1 for company

  calculateTotals(freight, hamali, cgstPct, sgstPct, details): TTotals
  // → Pure function: all in paise
  // → subtotal = freight + hamali
  // → cgst = round(subtotal * cgstPct / 100)
  // → sgst = round(subtotal * sgstPct / 100)
  // → total = subtotal + cgst + sgst
  // → totalWeight = sum(details.weight)
  // → totalBoxes = sum(details.box_count)
}
```

### B3.3 — PDF Service (LR Print)
- Use Puppeteer/Playwright for server-side PDF generation
- HTML template → inject LR data → render to PDF
- Templates stored as React components or Handlebars templates
- Support 3 formats: Consignee, Driver, HSN
- Multi-copy option: 3 copies per A4 page

### B3.4 — Pallet Routes
```
GET    /v1/pallets            → List
POST   /v1/pallets            → Create
GET    /v1/pallets/today      → Today's pallets
GET    /v1/pallets/:id        → Detail
PUT    /v1/pallets/:id        → Update
DELETE /v1/pallets/:id        → Delete
GET    /v1/pallets/:id/print  → Generate PDF
```

### B3.5 — e-Way Bill Integration (Manual First)
- Store EWB number on order (manual entry)
- Future: NIC API integration for auto-generation
- EWB validation: 12-digit format

### B3.6 — Bulk Import Service
- Accept Excel/CSV file upload
- Parse with column mapping
- Validate each row (Zod schema)
- Batch create orders in transaction
- Return success/error counts + error report

### B3.7 — WhatsApp LR Notification (Optional)
- On LR creation → enqueue notification job
- Send LR details + PDF to consignee phone via Twilio WhatsApp
- Configurable per tenant (module: mod_whatsapp)

---

## Testing Tasks

### T3.1 — Unit Tests
- LR total calculation (freight + hamali + GST) with various inputs
- LR number auto-increment logic
- GST amount rounding (paise)
- Weight and box totaling from line items

### T3.2 — Integration Tests
- Create LR with all fields → verify saved correctly
- Create LR with line items → verify totals calculated
- Update LR → verify totals recalculated
- Delete LR → verify soft deleted
- LR number uniqueness per company
- Status flow: Created → In Transit → Delivered
- Today's LRs endpoint returns only today's records
- Pallet CRUD
- Export CSV/Excel with correct data
- Import with valid/invalid data

### T3.3 — E2E Tests
- Complete LR creation flow: fill form → save → verify in list → print
- Multi-product LR with 5+ line items
- Quick-add dealer from LR form
- Print preview → PDF download

---

## Acceptance Criteria

| Criteria | Pass Condition |
|----------|---------------|
| LR created with all fields | All fields saved, LR No auto-incremented |
| LR print matches reference | Printed PDF matches Transport_invoice.pdf layout |
| Multi-product LR works | Can add 5+ products per LR, totals correct |
| Pallet management works | Pallet created, linked to LR, printable |
| Today's dashboard updates | New LR appears in today's widget within 60 seconds |
| Search and filter | Filter by date, dealer, consignee, vehicle, status |
| Export works | CSV/Excel/PDF export with correct data |
| Status updates work | Status transitions with history log |
