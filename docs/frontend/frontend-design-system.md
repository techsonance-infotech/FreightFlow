# FreightFlow Pro — Frontend Design System & Architecture

> **Framework**: Next.js 14 (App Router) | **UI**: shadcn/ui + Tailwind CSS | **State**: Zustand + TanStack Query

---

## 1. Design System — Color Tokens

### 1.1 Brand Colors (Tailwind Config)

```js
// tailwind.config.js — extend.colors
colors: {
  brand: {
    950: '#0A1628',  // Sidebar background, deepest backgrounds
    900: '#0F2B5B',  // Primary brand, headers, logo
    800: '#1A3A6B',  // Sidebar hover, dark UI elements
    700: '#1E4D8C',  // Active nav items, dark buttons
  },
  blue: {
    600: '#1565C0',  // Primary action buttons, links
    500: '#1E88E5',  // Hover states, icons, highlights
    400: '#42A5F5',  // Focus rings, secondary highlights
    100: '#BBDEFB',  // Button hover bg, tag backgrounds
    50:  '#E3F2FD',  // Info callout bg, selected row bg
  },
  amber: {
    900: '#E65100',  // Critical alerts, overdue badges
    700: '#F57F17',  // Logo accent, warning badges, CTAs
    500: '#FFB300',  // Star ratings, highlight accents
    100: '#FFF8E1',  // Warning callout backgrounds
  },
  success: { 700: '#2E7D32', 500: '#43A047', 50: '#E8F5E9' },
  warning: { 700: '#F57F17', 50: '#FFF3E0' },
  error:   { 700: '#C62828', 500: '#E53935', 50: '#FFEBEE' },
  info:    { 700: '#0277BD', 50: '#E1F5FE' },
  gray: {
    900: '#1A1A2E',  // Primary text, headings
    700: '#37474F',  // Body text, descriptions
    500: '#607D8B',  // Placeholder, secondary labels
    400: '#90A4AE',  // Disabled text, icons
    200: '#CFD8DC',  // Borders, dividers
    100: '#ECEFF1',  // Alternating table rows, input bg
    50:  '#F5F7FA',  // Page background, card bg
  },
}
```

### 1.2 Status Badge Colors

| Status | Background | Text Color | Usage |
|--------|-----------|------------|-------|
| In Transit | `#E3F2FD` | `#1565C0` | LR in transit |
| Delivered | `#E8F5E9` | `#2E7D32` | LR delivered |
| Pending | `#FFF3E0` | `#E65100` | Pending dispatch |
| Overdue | `#FFEBEE` | `#C62828` | Invoice overdue |
| Paid | `#E8F5E9` | `#2E7D32` | Invoice paid |
| Partial | `#E1F5FE` | `#0277BD` | Partial payment |
| Draft | `#ECEFF1` | `#607D8B` | Draft documents |
| Cancelled | `#ECEFF1` | `#607D8B` | Cancelled items |
| POD Pending | `#FFF8E1` | `#F57F17` | POD not uploaded |

### 1.3 Typography

- **Font Family**: `Inter` (Google Fonts) — fallback: `system-ui, sans-serif`
- **Headings**: `font-weight: 700-900`, `letter-spacing: -0.5px`
- **Body**: `font-weight: 400`, `font-size: 14px`, `line-height: 1.6`
- **Labels**: `font-weight: 600`, `font-size: 12px`, `text-transform: uppercase`, `letter-spacing: 0.06em`
- **Monospace**: `JetBrains Mono` for codes, LR numbers

---

## 2. Component Architecture

### 2.1 Layout Components

```
AppLayout
├── Sidebar (collapsible, navy gradient)
│   ├── Logo (FreightFlow Pro)
│   ├── CompanySwitcher (multi-company dropdown)
│   ├── Navigation
│   │   ├── NavGroup (Dashboard, Orders, Masters, etc.)
│   │   └── NavItem (icon + label + badge count)
│   ├── ModuleGate (hides disabled modules)
│   └── UserMenu (profile, settings, logout)
│
├── TopBar
│   ├── Breadcrumb
│   ├── SearchCommand (Cmd+K global search)
│   ├── NotificationBell (real-time alerts)
│   ├── LicenseWarningBanner
│   └── BranchSelector
│
└── MainContent
    ├── PageHeader (title + action buttons)
    └── PageContent (scrollable area)
```

### 2.2 Reusable Form Components

| Component | Usage | Features |
|-----------|-------|----------|
| `EntityForm<T>` | Generic form wrapper | React Hook Form + Zod, error display |
| `DealerSelectModal` | Select dealer with quick-add | Searchable dropdown + "Add New" button |
| `ConsigneeSelectModal` | Select consignee with quick-add | Same pattern as dealer |
| `VehicleSelectModal` | Select vehicle with quick-add | Shows reg number, status |
| `DateRangePicker` | Date range selection | Preset: Today, Week, Month, Quarter, Year, Custom |
| `CurrencyInput` | INR amount input | Auto-formats with ₹, stores as paise |
| `GSTCalculator` | GST computation widget | Auto CGST/SGST or IGST based on states |
| `FileUploader` | Document/image upload | Preview, MIME validation, max 10MB |

### 2.3 Table Pattern (All List Views)

Every master list and transaction list follows this pattern:

```tsx
<DataTable
  columns={columnDef}
  data={queryResult.data}
  searchable={true}
  exportable={['copy', 'excel', 'csv', 'pdf']}
  pagination={{ showEntries: true, options: [10, 25, 50, 100] }}
  actions={[
    { icon: Pencil, label: 'Edit', onClick: handleEdit },
    { icon: Printer, label: 'Print', onClick: handlePrint },
    { icon: Trash2, label: 'Delete', onClick: handleDelete, variant: 'destructive' },
  ]}
/>
```

---

## 3. State Management

### 3.1 Zustand Stores

| Store | Purpose | Persisted? |
|-------|---------|-----------|
| `useAuthStore` | Current user, tenant, company, role | Session |
| `useCompanyStore` | Active company, branch selection | LocalStorage |
| `useModuleStore` | Enabled modules for current tenant | Session |
| `useLicenseStore` | License status, days remaining, limits | Session |
| `useUIStore` | Sidebar collapsed, theme, locale | LocalStorage |

### 3.2 TanStack Query Keys

```ts
// Query key factory pattern
export const queryKeys = {
  orders: {
    all: ['orders'] as const,
    list: (filters: OrderFilters) => ['orders', 'list', filters] as const,
    detail: (id: string) => ['orders', 'detail', id] as const,
    today: () => ['orders', 'today'] as const,
  },
  dealers: {
    all: ['dealers'] as const,
    list: (search?: string) => ['dealers', 'list', search] as const,
    detail: (id: string) => ['dealers', 'detail', id] as const,
  },
  // ... same pattern for all entities
};
```

---

## 4. Routing Structure

```
/                           → Redirect to /dashboard
/(auth)/login               → Login page
/(auth)/register            → Registration (tenant onboarding)
/(auth)/forgot-password     → Password reset

/(dashboard)/               → Main dashboard with KPI cards
/(dashboard)/orders         → LR/Order list
/(dashboard)/orders/create  → Create new LR
/(dashboard)/orders/[id]    → LR detail/edit
/(dashboard)/pallets        → Pallet list
/(dashboard)/masters/dealers     → Dealer master
/(dashboard)/masters/consignors  → Consignor master
/(dashboard)/masters/consignees  → Consignee master
/(dashboard)/masters/vehicles    → Vehicle master
/(dashboard)/masters/labour      → Labour master
/(dashboard)/masters/drivers     → Driver master
/(dashboard)/masters/products    → Products master
/(dashboard)/trips               → Trip list
/(dashboard)/trips/[id]          → Trip detail + expenses
/(dashboard)/accounting/vouchers → Voucher entry
/(dashboard)/accounting/ar       → Accounts receivable
/(dashboard)/accounting/ap       → Accounts payable
/(dashboard)/accounting/bank     → Bank reconciliation
/(dashboard)/fleet/vehicles      → Vehicle registry
/(dashboard)/fleet/maintenance   → Maintenance job cards
/(dashboard)/fleet/fuel          → Fuel register
/(dashboard)/hr/employees        → Employee list
/(dashboard)/hr/attendance       → Attendance
/(dashboard)/hr/payroll          → Payroll processing
/(dashboard)/compliance/gst      → GST management
/(dashboard)/compliance/tds      → TDS management
/(dashboard)/compliance/eway     → e-Way Bill
/(dashboard)/reports             → Report center
/(dashboard)/ai                  → AI assistant

/super-admin/                    → Platform admin dashboard
/super-admin/tenants             → Tenant management
/super-admin/licenses            → License management
/super-admin/modules             → Module control

/portal/                         → Customer self-service portal
/portal/track                    → Shipment tracking
/portal/invoices                 → Invoice list + payment
```

---

## 5. Print Templates

### 5.1 LR Print Layouts

| Template | Description | Paper |
|----------|------------|-------|
| LR Consignee Copy | Full LR with company header, goods table, terms | A4 |
| LR Driver Copy | Same layout, "Driver Copy" watermark | A4 |
| LR with HSN | Includes HSN Code column in goods table | A4 |
| Multi-copy | All 3 copies on single sheet | A4 |
| Pallet Print | Pallet details with company branding | A4 |

### 5.2 Financial Print Templates

| Template | Description |
|----------|------------|
| Freight Invoice | Tax invoice with IRN QR code |
| Payment Receipt | Receipt voucher with customer details |
| Payslip | Monthly salary breakdown |
| Statement of Account | Customer-wise outstanding statement |

---

## 6. Responsive Design Strategy

| Breakpoint | Device | Layout |
|-----------|--------|--------|
| `< 640px` | Mobile | Single column, bottom nav, no sidebar |
| `640-1024px` | Tablet | Collapsible sidebar, simplified tables |
| `> 1024px` | Desktop | Full sidebar, data tables, multi-column forms |
