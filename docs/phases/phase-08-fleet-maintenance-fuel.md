# Phase 8 — Fleet, Maintenance & Fuel

> **Duration**: 5-7 days | **Goal**: Vehicle document tracking, maintenance scheduling, fuel management

---

## Overview

Fleet management: vehicle document expiry tracking with alerts, maintenance job cards, spare parts, fuel entry with KMPL calculation and anomaly detection.

---

## Database Tasks

### D8.1 — Fleet Tables
```sql
-- vehicle_documents
id UUID PK, vehicle_id UUID FK,
doc_type VARCHAR(30), -- rc|insurance|fitness|puc|national_permit|state_permit|road_tax
doc_no VARCHAR(100), issue_date DATE, expiry_date DATE,
file_url TEXT, alert_30_sent BOOLEAN DEFAULT false,
alert_7_sent BOOLEAN DEFAULT false, created_at, updated_at

-- maintenance_jobs
id UUID PK, vehicle_id UUID FK,
job_type VARCHAR(20), -- scheduled|breakdown
description TEXT, mechanic_assigned VARCHAR(255),
odometer INTEGER, estimated_cost INTEGER, actual_cost INTEGER,
started_at TIMESTAMPTZ, completed_at TIMESTAMPTZ,
invoice_url TEXT, status VARCHAR(20), -- open|in_progress|completed
parts_used JSONB, created_at, updated_at

-- fuel_entries
id UUID PK, vehicle_id UUID FK, date DATE,
quantity DECIMAL(10,2), -- litres
rate INTEGER, -- paise per litre
amount INTEGER, -- paise (total)
vendor VARCHAR(255), odometer INTEGER,
prev_odometer INTEGER, distance_km DECIMAL(10,2),
kmpl DECIMAL(6,2), vehicle_avg_kmpl DECIMAL(6,2),
is_anomaly BOOLEAN DEFAULT false,
anomaly_reason TEXT, created_at
```

### D8.2 — Indexes
- `vehicle_documents(vehicle_id, doc_type)` — unique per active doc
- `vehicle_documents(expiry_date)` — expiry alert queries
- `fuel_entries(vehicle_id, date)` — KMPL timeline
- `maintenance_jobs(vehicle_id, status)` — active jobs

---

## Frontend Tasks

### F8.1 — Vehicle Document Tracker (`/dashboard/fleet/vehicles/:id/documents`)
- Per vehicle: table of all document types with status
- Columns: Doc Type, Doc No, Issue Date, Expiry Date, Status, File, Actions
- Status badges: Valid (green), Expiring Soon (amber), Expired (red)
- Upload document file (PDF/image)
- Dashboard widget: "Documents Expiring" — 30/60/90 day view, color-coded

### F8.2 — Document Expiry Central Dashboard (`/dashboard/fleet/documents`)
- Single screen: ALL expiring documents across all vehicles
- Filter by: vehicle, doc type, expiry window (30/60/90 days)
- One-click renewal workflow: upload new doc, update expiry date
- Export list for compliance reporting

### F8.3 — Maintenance Job Cards (`/dashboard/fleet/maintenance`)
- **Job card creation**: vehicle, issue reported, mechanic, date, estimated cost
- **Parts consumed**: line items from spare parts (deducted from inventory)
- **Job completion**: actual cost, invoice upload from workshop
- **List view**: Open jobs (filtered by default), completed jobs
- **Reports**: Maintenance cost per vehicle per period

### F8.4 — Fuel Management (`/dashboard/fleet/fuel`)
- **Fuel entry form**: Vehicle, date, quantity (litres), rate (₹/L), amount, vendor, odometer reading
- **Auto-calculations**:
  - Distance = Current odometer − Last odometer
  - KMPL = Distance / Litres filled
- **KMPL chart**: Per vehicle line chart with benchmark line
- **Anomaly alert**: Red flag if KMPL drops > 20% from vehicle average
- **Fleet fuel report**: Total consumption, cost, avg KMPL across fleet

---

## Backend Tasks

### B8.1 — Fleet Routes
```
-- Vehicle Documents
GET/POST /v1/fleet/vehicles/:vid/documents     → List/Upload docs
PUT      /v1/fleet/vehicles/:vid/documents/:did → Update/renew doc
GET      /v1/fleet/documents/expiring           → All expiring docs

-- Maintenance
GET/POST /v1/fleet/maintenance                  → List/Create job cards
PUT      /v1/fleet/maintenance/:id              → Update/complete job
GET      /v1/fleet/maintenance/report           → Cost report

-- Fuel
GET/POST /v1/fleet/fuel                         → List/Add fuel entries
GET      /v1/fleet/fuel/report                  → Fuel consumption report
GET      /v1/fleet/fuel/:vid/kmpl               → KMPL chart data
```

### B8.2 — Fleet Service
```ts
class FleetService {
  calculateKMPL(currentOdometer, prevOdometer, litres): number
  detectAnomaly(kmpl, vehicleAvgKmpl): { isAnomaly: boolean, reason?: string }
  // Anomaly if KMPL < vehicleAvg * 0.8

  getExpiringDocuments(companyId, withinDays): VehicleDocument[]
  getMaintenanceCost(vehicleId, dateRange): MaintenanceCostReport
}
```

### B8.3 — Expiry Alert Job (BullMQ)
- Daily cron at 9 AM IST
- Query all documents expiring within 30 days
- Send email + WhatsApp to admin for 30-day and 7-day alerts
- Mark `alert_30_sent` / `alert_7_sent` flags

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Document tracking works | All doc types tracked with correct expiry status |
| Expiry alerts sent | Email alerts at 30 and 7 days before expiry |
| KMPL calculation correct | Distance / litres = correct KMPL |
| Anomaly detection works | Flags entries > 20% below vehicle average |
| Maintenance cost report | Correct totals per vehicle per period |
| Fuel report | Fleet-wide consumption and cost aggregation |
