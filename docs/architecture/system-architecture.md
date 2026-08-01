# FreightFlow Pro — System Architecture Document

> **Version**: 1.0 | **Date**: April 2026 | **Status**: Design Phase

---

## 1. Architecture Overview

FreightFlow Pro is a **multi-tenant SaaS platform** for Indian road transport and logistics companies. The system follows a **modular monorepo architecture** with clear separation between web frontend, API backend, mobile app, and shared packages.

### 1.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                       │
├──────────────┬──────────────┬──────────────┬────────────────────────┤
│  Next.js Web │  Driver App  │  Customer    │  Super Admin           │
│  (Dashboard) │  (React      │  Portal      │  Panel                 │
│              │   Native)    │  (Next.js)   │  (Next.js)             │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬──────────────┘
       │              │              │                │
       ▼              ▼              ▼                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API GATEWAY / MIDDLEWARE                         │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌────────────────────┐   │
│  │ JWT Auth │ │ Rate     │ │ License    │ │ Module Access      │   │
│  │ Validator│ │ Limiter  │ │ Validator  │ │ Control            │   │
│  └──────────┘ └──────────┘ └────────────┘ └────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     API SERVER (Node.js + Fastify)                   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Route Handlers (per module)                                  │   │
│  │  ├── /auth     ├── /orders    ├── /trips    ├── /accounting  │   │
│  │  ├── /masters  ├── /pallets   ├── /fleet    ├── /hr          │   │
│  │  ├── /gst      ├── /reports   ├── /ai       ├── /portal      │   │
│  │  └── /super-admin                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Service Layer (Business Logic)                               │   │
│  │  ├── LREngine       ├── AccountingEngine  ├── GSTEngine      │   │
│  │  ├── PayrollEngine   ├── LicenseEngine     ├── TripEngine     │   │
│  │  ├── FleetService    ├── NotificationSvc   ├── AIService      │   │
│  │  └── ReportEngine                                             │   │
│  └──────────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  Data Access Layer (Prisma ORM)                               │   │
│  │  ├── Models & Relations  ├── RLS Policies  ├── Migrations    │   │
│  └──────────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
┌─────────────┐   ┌──────────────────┐   ┌──────────────┐
│  Supabase   │   │  Upstash Redis   │   │  External    │
│  PostgreSQL │   │  (Cache/Queue)   │   │  Services    │
│  + Auth     │   │  + BullMQ        │   │  ├── Resend  │
│  + Storage  │   │                  │   │  ├── Twilio  │
│  + Realtime │   │                  │   │  ├── OpenAI  │
│  + RLS      │   │                  │   │  ├── NIC API │
│             │   │                  │   │  ├── Maps    │
│             │   │                  │   │  └── Razorpay│
└─────────────┘   └──────────────────┘   └──────────────┘
```

---

## 2. Monorepo Structure (Turborepo)

```
freightflow-pro/
├── apps/
│   ├── web/                    # Next.js 14 (App Router) — Main dashboard
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, Register, Forgot Password
│   │   │   ├── (dashboard)/    # All authenticated pages
│   │   │   │   ├── orders/     # LR/Order management
│   │   │   │   ├── pallets/    # Pallet management
│   │   │   │   ├── masters/    # Dealers, consignors, consignees, vehicles, labour
│   │   │   │   ├── accounting/ # Vouchers, AR, AP, bank reconciliation
│   │   │   │   ├── trips/      # Trip management
│   │   │   │   ├── fleet/      # Vehicle registry, maintenance, fuel
│   │   │   │   ├── hr/         # Employees, attendance, payroll
│   │   │   │   ├── compliance/ # GST, TDS, e-Way Bill
│   │   │   │   ├── reports/    # All report pages
│   │   │   │   └── ai/         # AI assistant, anomaly alerts
│   │   │   ├── super-admin/    # Platform admin panel (separate layout)
│   │   │   └── portal/         # Customer self-service portal
│   │   ├── components/
│   │   │   ├── ui/             # shadcn/ui base components
│   │   │   ├── forms/          # Reusable form components
│   │   │   ├── print/          # Print-formatted components
│   │   │   └── layout/         # Sidebar, Header, Breadcrumb
│   │   ├── lib/
│   │   │   ├── supabase/       # Client, server, middleware config
│   │   │   ├── validations/    # Zod schemas for all entities
│   │   │   └── utils/          # Formatters, helpers
│   │   └── hooks/              # Custom React hooks
│   │
│   ├── api/                    # Node.js + Fastify API server
│   │   ├── src/
│   │   │   ├── routes/         # Route handlers by module
│   │   │   ├── middleware/     # Auth, license, module-check, rate-limit
│   │   │   ├── services/       # Business logic services
│   │   │   ├── jobs/           # BullMQ background jobs
│   │   │   └── utils/          # Helpers, formatters
│   │   └── tests/              # API integration tests
│   │
│   └── mobile/                 # React Native Expo driver app
│       ├── app/                # Expo Router screens
│       ├── components/         # Mobile UI components
│       └── services/           # API client, offline sync
│
├── packages/
│   ├── shared/                 # TypeScript types, Zod validators, constants
│   │   ├── types/              # TOrder, TDealer, TEmployee, etc.
│   │   ├── validators/         # Shared Zod schemas
│   │   ├── constants/          # Module keys, status enums, plan configs
│   │   └── utils/              # Currency, date, GST calculators
│   │
│   ├── db/                     # Prisma schema, migrations, seed scripts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── src/
│   │       └── client.ts       # Prisma client singleton
│   │
│   └── ui/                     # Shared UI components (optional)
│
├── infrastructure/
│   ├── docker/                 # Docker configs for local dev
│   ├── scripts/                # Deployment scripts
│   └── terraform/              # IaC configs (future)
│
├── docs/                       # This documentation folder
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace config
├── .env.example                # Environment variable template
├── .github/
│   └── workflows/              # CI/CD pipelines
└── package.json                # Root package.json
```

---

## 3. Multi-Tenancy Architecture

### 3.1 Isolation Model: Row-Level Security (RLS)

FreightFlow Pro uses **shared-database, shared-schema** with PostgreSQL Row-Level Security:

```
┌─────────────────────────────────────────────────┐
│              Supabase PostgreSQL                 │
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  tenants table (platform-level)              ││
│  │  ├── tenant_A (Shree Shivay Roadlines)      ││
│  │  ├── tenant_B (XYZ Transport)               ││
│  │  └── tenant_C (ABC Logistics)               ││
│  └─────────────────────────────────────────────┘│
│                                                  │
│  ┌─────────────────────────────────────────────┐│
│  │  orders (LR) table                           ││
│  │  ├── Row 1: tenant_id = A, lr_no = 390      ││
│  │  ├── Row 2: tenant_id = A, lr_no = 391      ││
│  │  ├── Row 3: tenant_id = B, lr_no = 100      ││  ← RLS: User from
│  │  ├── Row 4: tenant_id = B, lr_no = 101      ││     Tenant A CANNOT
│  │  └── Row 5: tenant_id = C, lr_no = 500      ││     see rows 3,4,5
│  └─────────────────────────────────────────────┘│
│                                                  │
│  RLS Policy on EVERY tenant table:              │
│  USING (tenant_id = get_current_tenant_id())    │
└─────────────────────────────────────────────────┘
```

### 3.2 Tenant Hierarchy

```
Platform (Super Admin)
└── Tenant (License Holder)
    ├── Company A (Shree Shivay Roadlines - GSTIN: 24XXXXX)
    │   ├── Branch: Surat HQ
    │   │   ├── Admin Users
    │   │   ├── Accountant
    │   │   └── Dispatcher
    │   └── Branch: Ahmedabad Depot
    │       └── Branch Manager
    └── Company B (Shivay Cargo Pvt Ltd - GSTIN: 24YYYYY)
        └── Branch: Mumbai Office
            └── Staff Users
```

### 3.3 Module Control Flow

```
Client Request → API Gateway
    │
    ├── 1. JWT Validation (Supabase Auth)
    │       → Extract: user_id, tenant_id, role
    │
    ├── 2. License Validation
    │       → Check: license not expired, within grace period
    │       → Check: user count, vehicle count within plan limits
    │
    ├── 3. Module Access Check
    │       → Query tenant_modules table
    │       → If module disabled → 403 Forbidden
    │
    ├── 4. Role-Based Access
    │       → Check user role against route permission matrix
    │
    └── 5. Process Request
            → RLS automatically filters by tenant_id
```

---

## 4. Technology Stack Details

### 4.1 Frontend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14 (App Router) | SSR, SSG, file-based routing, API routes |
| UI Components | shadcn/ui | Accessible, customizable component library |
| Styling | Tailwind CSS | Utility-first CSS with design tokens |
| State (Client) | Zustand | Lightweight client state management |
| State (Server) | TanStack React Query | Server state, caching, auto-refetching |
| Forms | React Hook Form + Zod | Type-safe validation, minimal re-renders |
| Tables | TanStack Table v8 | Virtual scroll, sorting, filtering |
| Charts | Recharts + Tremor | Dashboard visualizations |
| PDF | React-PDF / jsPDF | LR print, invoice PDF, payslip generation |
| Icons | Lucide React | Consistent icon set |

### 4.2 Backend Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Runtime | Node.js 20 LTS | JavaScript runtime |
| API Framework | Fastify | Fast, schema-based API framework |
| ORM | Prisma | Type-safe DB access, migrations |
| Auth | Supabase Auth | JWT, MFA, OAuth, RBAC |
| Queue | BullMQ + Upstash Redis | Background jobs, scheduled tasks |
| Email | Resend | Transactional emails |
| SMS | Twilio / MSG91 | OTP, notifications |
| Storage | Supabase Storage | File uploads |
| PDF Render | Puppeteer (serverless) | Server-side PDF generation |

### 4.3 Database Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Primary DB | Supabase PostgreSQL | ACID-compliant relational database |
| Auth Store | Supabase Auth | User authentication & sessions |
| File Storage | Supabase Storage | Documents, POD photos, PDFs |
| Cache | Upstash Redis | Session cache, rate limiting |
| Realtime | Supabase Realtime | Live dispatch board updates |
| Search | Typesense (self-hosted) | Full-text search across LRs, invoices |

### 4.4 Infrastructure Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Web Hosting | Vercel | Next.js frontend deployment |
| API Hosting | Railway.app | Node.js API server |
| CI/CD | GitHub Actions | Automated testing & deployment |
| Monitoring | Sentry | Error tracking & performance |
| Analytics | PostHog | Product analytics, feature flags |
| Logs | Logtail / Better Stack | Centralized application logs |
| Maps | Google Maps API | Route display, geocoding |

---

## 5. Data Flow Patterns

### 5.1 LR Creation Flow

```
User fills LR Form (Next.js)
    │
    ├── Client-side validation (Zod)
    │
    ├── POST /api/v1/orders
    │       │
    │       ├── Auth middleware: validate JWT
    │       ├── License middleware: check limits
    │       ├── Module middleware: check mod_lr_management
    │       │
    │       ├── Service Layer:
    │       │   ├── Generate next LR number (per company)
    │       │   ├── Calculate totals (freight + hamali + GST)
    │       │   ├── Store amounts as INTEGER (paise)
    │       │   ├── Create order + order_details records
    │       │   └── Trigger: update tenant_usage metrics
    │       │
    │       ├── Background Job (BullMQ):
    │       │   ├── Generate PDF (LR print)
    │       │   ├── Send WhatsApp notification (if enabled)
    │       │   └── Create e-Way Bill (if amount > threshold)
    │       │
    │       └── Response: { order_id, lr_no, status }
    │
    └── React Query: invalidate orders cache → refresh list
```

### 5.2 Financial Transaction Flow

```
Invoice Created
    │
    ├── Service: InvoiceEngine.create()
    │   ├── Validate GST calculations
    │   ├── Create freight_invoice record
    │   └── Auto-generate GL entries:
    │       ├── DR: Accounts Receivable (customer)
    │       ├── CR: Freight Income
    │       ├── CR: CGST Payable
    │       └── CR: SGST Payable
    │
    ├── Payment Received
    │   ├── Create payment_received record
    │   ├── Auto-generate GL entries:
    │   │   ├── DR: Bank Account
    │   │   └── CR: Accounts Receivable
    │   └── Update invoice: paid_amount, status
    │
    └── All entries maintain: DR total = CR total (double-entry)
```

---

## 6. Security Architecture

### 6.1 Defense in Depth

```
Layer 1: Network     → HTTPS only, HSTS, strict CORS
Layer 2: Gateway     → Rate limiting (100 req/min/IP)
Layer 3: Auth        → JWT validation, MFA for financial ops
Layer 4: License     → License key HMAC validation
Layer 5: Module      → Module enablement check from DB
Layer 6: Role        → RBAC permission matrix
Layer 7: Data        → RLS policies on every table
Layer 8: Input       → Zod schema validation on all endpoints
Layer 9: Query       → Prisma parameterized queries (no raw SQL)
Layer 10: Storage    → AES-256 encryption for PII (Aadhaar, PAN)
Layer 11: Audit      → Append-only audit log for all mutations
```

### 6.2 Authentication Flow

```
Login Request (email + password)
    │
    ├── Supabase Auth: validate credentials
    │   └── Returns: access_token (JWT) + refresh_token
    │
    ├── JWT Claims contain:
    │   ├── sub: user UUID
    │   ├── email
    │   └── role: authenticated
    │
    ├── App middleware enriches with:
    │   ├── tenant_id (from users table)
    │   ├── company_id
    │   ├── branch_id
    │   ├── app_role (company_admin, accountant, dispatcher, etc.)
    │   └── enabled_modules[] (from tenant_modules table)
    │
    └── All subsequent requests carry enriched context
```

---

## 7. Coding Conventions

| Area | Convention | Example |
|------|-----------|---------|
| Pages | kebab-case | `/app/lr-management/page.tsx` |
| Components | PascalCase | `LRCreateForm.tsx` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase with T prefix | `TOrder`, `TDealer` |
| API Routes | kebab-case | `/api/v1/lorry-receipts` |
| DB Tables | snake_case | `lorry_receipts`, `order_details` |
| Currency | INTEGER (paise) | Store `46900` → Display `₹469.00` |
| Dates | ISO 8601 UTC in DB | Display in IST `DD/MM/YYYY` |
| Errors | Structured JSON | `{ error, code, details? }` |

---

## 8. Environment Variables

See `.env.example` for the complete list. Key categories:

| Category | Variables |
|----------|----------|
| Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| Database | `DATABASE_URL`, `DIRECT_URL` |
| Security | `JWT_SECRET` |
| AI | `OPENAI_API_KEY` |
| Email | `RESEND_API_KEY` |
| SMS | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` |
| Cache | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` |
| Maps | `GOOGLE_MAPS_API_KEY` |
| Payments | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| GST | `NIC_EWB_USERNAME`, `NIC_EWB_PASSWORD` |
| Platform | `PLATFORM_ADMIN_EMAIL`, `PLATFORM_ADMIN_PASSWORD`, `APP_URL`, `PORTAL_URL` |
