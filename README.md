# 🚛 FreightFlow

> **Every Trip. Every Rupee. Every Mile — In Control.**

[![License](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Node.js-0F2B5B)](https://freightflow.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-1E88E5)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/Status-In%20Development-F57F17)](https://github.com/freightflow)

---

## What is FreightFlow?

FreightFlow is a **full-stack SaaS platform built exclusively for Indian road transport and logistics businesses**. It replaces disconnected spreadsheets, paper registers, and generic accounting tools with a single, purpose-built system that manages everything — from the moment a lorry receipt is created to the moment the freight invoice is paid and the GST return is filed.

Whether you run 5 trucks or 500, FreightFlow gives you real-time visibility into every trip, every expense, every vehicle, and every rupee — with the compliance automation that Indian transport law demands.

---

## The Problem It Solves

Transport businesses in India are drowning in paperwork and manual cesses:

- LRs are written by hand, invoices are made in Excel, and accounts are maintained in Tally with no link between them
- Driver advances, toll expenses, and trip settlements are tracked on paper and frequently disputed
- GST filing for transport (RCM, e-Way Bills, SAC codes) is complex and done manually every month
- Vehicle documents (insurance, fitness, permits, PUC) expire without warning
- There is no single number that tells the owner: *"This truck made ₹X fit last month"*

FreightFlow  solves all of this in one platform.

---

## Key Features

### 📦 Lorry Receipt & Order Management
Create, print, and track LRs with full consignee, dealer, duct, and weight details. Supports multi-duct per LR, custom LR numbering, e-Way Bill integration, and three print formats (Consignee Copy, Driver Copy, HSN Copy). Dashboard shows today's LRs at a glance.

### 🪵 Pallet Management
Manage pallets linked to LRs with per-consignee quantity and rate breakdown. Print pallet slips directly from the system.

### 🚚 Trip Management
Full trip lifecycle — create, dispatch, record expenses, upload POD, and settle advance. Every trip has its own P&L: freight earned minus fuel, toll, driver wages, and repairs.

### 💰 Core Accounting
Double-entry General Ledger with transport-specific chart of accounts pre-loaded. Accounts Receivable with ageing, Accounts Payable with TDS, bank reconciliation with statement import, and fixed asset management for your fleet.

### 🧾 GST & Compliance
Automated CGST/SGST/IGST calculation, RCM handling for GTA payments, e-Invoice IRN generation, e-Way Bill API integration, GSTR-1 and GSTR-3B preparation, TDS deduction register, and a compliance calendar with deadline alerts.

### 👥 HR & Payroll
Employee and driver master, monthly attendance, payroll cessing with PF/ESI/PT deductions, per-trip incentive calculation, salary slips, bank transfer files, and Form 16 generation. Includes a separate Labour management module for loading staff.

### 🔧 Fleet & Maintenance
Vehicle document expiry tracking (insurance, fitness, permit, PUC), maintenance job cards, breakdown management, tyre and battery tracking, and fuel fill-up register with KMPL monitoring and theft detection.

### 📊 Reports & Dashboard
Executive dashboard with live KPIs, vehicle-wise P&L, route-wise fitability, customer-wise revenue, debtors/creditors ageing, trial balance, fit & loss statement, balance sheet, and fully exportable MIS reports.

### 🤖 AI & Automation
OCR-powered vendor invoice data extraction, anomaly detection on trip expenses and fuel consumption, natural language report queries ("What was my best route last month?"), cash flow forecasting, and smart compliance reminders.

### 📱 Driver Mobile App
React Native app for drivers to view assigned trips, record expenses with receipt photos, capture of of delivery with GPS-tagged photos and digital signatures, and track their advance balance and earnings.

### 🌐 Customer Portal
Self-service portal for your freight customers to track shipments by LR number, download invoices, make online payments via Razorpay, and view their statement of account — without calling your office.

---

## Platform Architecture

FreightFlow  is built as a **multi-tenant, multi-company SaaS** with enterprise-grade isolation:

```
┌─────────────────────────────────────────────────────────┐
│                    SUPER ADMIN PORTAL                    │
│         Manage Tenants · Licenses · Module Control       │
└──────────────────────┬──────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
   Tenant A       Tenant B       Tenant C
 (5 trucks)    (50 trucks)    (200 trucks)
        │
        ├── Company 1 (Shree Shivay Roadlines)
        │     ├── Branch: Surat HQ
        │     └── Branch: Kadodara
        └── Company 2 (Shivay Cargo Pvt Ltd)
```

- **Multi-Tenant**: Row-Level Security in PostgreSQL ensures complete data isolation between customers
- **Multi-Company**: One license can run multiple transport companies with separate GST registrations
- **Module-Based**: Super Admin can enable or disable any of 18 functional modules per tenant
- **Licensing Engine**: Time-based licenses with expiry warnings, grace periods, and plan-based feature limits

---

## Technology Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR, file routing, API routes |
| UI | shadcn/ui + Tailwind CSS | Beautiful, accessible, fast to build |
| State | Zustand + TanStack Query | Lightweight, server-state friendly |
| Mobile | React Native + Expo | Single codebase for iOS and Android |
| API | Node.js + Fastify + Prisma | Type-safe, fast, Supabase-native |
| Database | Supabase (PostgreSQL) | Auth, RLS, Storage, Realtime in one |
| Auth | Supabase Auth (JWT + MFA) | Built-in OTP, TOTP, RBAC |
| Queue | BullMQ + Upstash Redis | Payroll runs, report generation, emails |
| Email | Resend | Transactional emails with React templates |
| SMS | Twilio / MSG91 | OTP and freight notifications |
| AI | OpenAI GPT-4o-mini + custom ML | OCR, anomaly detection, NLP queries |
| Storage | Supabase Storage | POD photos, invoices, documents |
| Maps | Google Maps Platform | Route display, geocoding, distance |
| Payments | Razorpay | Customer invoice payment |
| Monitoring | Sentry + PostHog | Error tracking, duct analytics |
| CI/CD | GitHub Actions + Vercel + Railway | Automated test and deploy pipeline |

---

## Licensing Model

FreightFlow  is a **commercial SaaS duct** sold on annual or monthly subscription licenses.

| Plan | Companies | Users | Vehicles | Monthly LRs |
|---|---|---|---|---|
| **Starter** | 1 | 5 | 20 | 500 |
| **Growth** | 3 | 25 | 100 | 5,000 |
| **Enterprise** | Unlimited | Unlimited | Unlimited | Unlimited |

Licenses are cryptographically signed and validated on every API request. Expired accounts enter a 7-day read-only grace period before access is suspended.

---

## Module Control

The Super Admin can toggle any module per tenant. Disabled modules are completely hidden from the UI and return `403 Forbidden` from the API.

| Module | Default |
|---|---|
| LR / Order Management | ✅ On |
| Pallet Management | ✅ On |
| Trip Management | ✅ On |
| Core Accounting | ✅ On |
| GST & e-Way Bill | ✅ On |
| Fleet & Maintenance | ✅ On |
| HR & Payroll | ✅ On |
| Driver Mobile App | ✅ On |
| AI & Analytics | ⬜ Off (Growth+) |
| Customer Portal | ⬜ Off (Growth+) |
| Multi-Company | ⬜ Off (Growth+) |
| WhatsApp Notifications | ⬜ Off (Add-on) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase account (free tier)
- Upstash Redis account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/freightflow-.git
cd freightflow-

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase, Redis, and other API keys

# Run database migrations
pnpm db:migrate

# Seed the database (super admin + demo tenant)
pnpm db:seed

# Start development servers
pnpm dev
```

The web app runs at `http://localhost:3000`
The API server runs at `http://localhost:3001`
Super Admin panel at `http://localhost:3000/super-admin`

### Demo Credentials
After seeding, use these to explore:
- **Super Admin**: `admin@freightflow.com` / `Admin@1234`
- **Demo Tenant**: `demo@shreeShivay.com` / `Demo@1234`
- **Demo Company**: Shree Shivay Roadlines (pre-loaded with sample data)

---

## ject Structure

```
freightflow-/
├── apps/
│   ├── web/                    # Next.js 14 frontend
│   │   ├── app/(auth)/         # Login, register pages
│   │   ├── app/(dashboard)/    # All app pages
│   │   │   ├── orders/         # LR management
│   │   │   ├── pallets/        # Pallet management
│   │   │   ├── masters/        # Dealers, consignees, vehicles
│   │   │   ├── trips/          # Trip lifecycle
│   │   │   ├── accounting/     # GL, AR, AP, bank recon
│   │   │   ├── compliance/     # GST, TDS, e-Way Bill
│   │   │   ├── hr/             # Employees, payroll
│   │   │   ├── fleet/          # Vehicles, maintenance, fuel
│   │   │   ├── reports/        # All MIS reports
│   │   │   └── ai/             # AI assistant
│   │   ├── app/super-admin/    # Platform admin panel
│   │   └── app/portal/         # Customer self-service
│   ├── api/                    # Node.js Fastify API
│   │   ├── src/routes/         # Route handlers
│   │   ├── src/services/       # Business logic
│   │   ├── src/middleware/     # Auth, license, modules
│   │   └── src/jobs/           # Background job definitions
│   └── mobile/                 # React Native Expo driver app
├── packages/
│   ├── shared/                 # Shared types, validators, constants
│   └── db/                     # Prisma schema + migrations
├── docs/                       # Architecture diagrams, API specs
└── infrastructure/             # Deployment configs
```

---

## Implementation Phases

The platform is being built in 14 phases by AI agents following the implementation blueprint:

| Phase | Status | Description |
|---|---|---|
| 0 — Foundation | 🔄 In gress | Supabase setup, CI/CD, scaffold |
| 1 — Auth & Licensing | ⏳ Planned | Login, license engine, super admin |
| 2 — Master Data | ⏳ Planned | Dealers, consignees, vehicles, labour |
| 3 — LR & Pallet | ⏳ Planned | Core order management, print formats |
| 4 — Trip Management | ⏳ Planned | Trip lifecycle, advances, POD |
| 5 — Accounting | ⏳ Planned | GL, AR, AP, bank reconciliation |
| 6 — GST & Compliance | ⏳ Planned | GST engine, e-Invoice, GSTR |
| 7 — HR & Payroll | ⏳ Planned | Employees, attendance, payroll |
| 8 — Fleet & Fuel | ⏳ Planned | Vehicle docs, maintenance, fuel |
| 9 — Reports | ⏳ Planned | Dashboard, MIS, financial reports |
| 10 — Mobile App | ⏳ Planned | React Native driver app |
| 11 — AI Features | ⏳ Planned | OCR, anomaly detection, NLP |
| 12 — Customer Portal | ⏳ Planned | Shipment tracking, online payment |
| 13 — Testing | ⏳ Planned | Full test suite, security audit |
| 14 — duction | ⏳ Planned | Deploy, monitoring, go-live |

---

## Security

- **JWT Authentication** via Supabase Auth with 1-hour token expiry
- **Row-Level Security** enforced at the database level — tenants are fully isolated
- **MFA** (TOTP + SMS OTP) mandatory for financial apval actions
- **AES-256 encryption** for sensitive fields (Aadhaar, PAN, bank account numbers)
- **TLS 1.3** for all API communication
- **License tamper detection** via HMAC-signed keys validated server-side on every request
- **OWASP Top-10** compliance verified at each release
- **Append-only audit log** for all financial mutations — immutable and tamper-of
- Annual third-party penetration testing

---

## Compliance

FreightFlow  is built specifically for Indian regulatory requirements:

- ✅ GST (CGST, SGST, IGST, RCM) with SAC codes for transport services
- ✅ e-Invoice (IRN generation via IRP portal API)
- ✅ e-Way Bill (NIC API — generate, extend, cancel)
- ✅ TDS under Sec 194C, 194I, 194J with Form 26Q and Form 16A
- ✅ PF (ECR challan), ESI (challan), fessional Tax
- ✅ Motor Vehicle Act — permit, fitness, road tax tracking
- ✅ MSME 45-day payment compliance alerts

---

## Contributing

This is a commercial duct. Contributions from the core team follow the implementation blueprint located at `/docs/FreightFlow_Implementation_Blueprint.docx`.

For bug reports or feature requests, please open an issue with the appriate template.

---

## Support

- 📧 Email: support@freightflow.com
- 💬 WhatsApp: +91-XXXXXXXXXX
- 📖 Documentation: https://docs.freightflow.com
- 🐛 Issues: https://github.com/your-org/freightflow-/issues

---

## License

FreightFlow is a **commercially licensed** SaaS product. All rights reserved.
See [LICENSE](LICENSE) for the full commercial license terms.

---

<p align="center">
  <strong>FreightFlow</strong> — Built for Indian Transport. Powered by Modern Technology.<br/>
  <em>Every Trip. Every Rupee. Every Mile — In Control.</em>
</p>
