# 🚛 FreightFlow

> **Every Trip. Every Rupee. Every Mile — In Control.**

[![License](https://img.shields.io/badge/License-Commercial-blue.svg)](LICENSE)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%7C%20Supabase%20%7C%20Node.js-0F2B5B)](https://freightflow.com)
[![Version](https://img.shields.io/badge/Version-1.0.0-1E88E5)](CHANGELOG.md)
[![Status](https://img.shields.io/badge/Status-In%20Development-F57F17)](https://github.com/freightflow)

---

## 📌 What is FreightFlow?

FreightFlow is a **full-stack SaaS platform built exclusively for Indian road transport and logistics businesses**. It replaces disconnected spreadsheets, paper registers, and generic accounting tools with a single, purpose-built system that manages everything — from the moment a lorry receipt is created to the moment the freight invoice is paid and the GST return is filed.

Whether you run 5 trucks or 500, FreightFlow gives you real-time visibility into every trip, every expense, every vehicle, and every rupee — with the compliance automation that Indian transport law demands.

---

## 🎯 Challenges & Solutions

The transport industry faces unique hurdles that generic software cannot address. FreightFlow bridges these gaps:

| **Industry Challenge** | **The FreightFlow Solution** |
|-----------------------|-----------------------------|
| **Manual Paperwork & Disconnected Systems** | Replaces paper LRs, Excel invoices, and disjointed Tally accounts with a unified digital ecosystem. |
| **Financial Leakage & Dispute** | Digitally tracks driver advances, toll expenses, and trip settlements, ensuring clear, indisputable records. |
| **Complex GST & Compliance** | Automates CGST/SGST/IGST calculations, RCM for GTA, e-Way Bills, and SAC code tracking for seamless monthly filing. |
| **Vehicle Document Expiry** | Provides automated alerts for expiring insurance, fitness certificates, permits, and PUCs. |
| **Lack of Profitability Visibility** | Generates real-time, per-trip P&L statements so owners know exactly how much each truck earns. |

---

## 🚀 Key Advantages

- **100% Digital Operations:** Go completely paperless with digital LRs, e-Way bills, and online invoices.
- **Enhanced Financial Control:** Stop financial leakages with tight tracking of every expense, from fuel drops to driver advances.
- **Automated Compliance:** Never miss a GST filing, TDS deduction, or document renewal with automated tracking and alerts.
- **Real-Time Visibility:** Monitor your entire fleet, view route-wise profitability, and access executive KPI dashboards instantly.
- **Scalability:** Built on a robust multi-tenant architecture, FreightFlow grows with your business, supporting 5 to 500+ trucks seamlessly.
- **Driver Empowerment:** Dedicated mobile app reduces friction in expense reporting, POD uploads, and trip management.

---

## ⚙️ Features & Modules

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
Employee and driver master, monthly attendance, payroll processing with PF/ESI/PT deductions, per-trip incentive calculation, salary slips, bank transfer files, and Form 16 generation. Includes a separate Labour management module for loading staff.

### 🔧 Fleet & Maintenance
Vehicle document expiry tracking (insurance, fitness, permit, PUC), maintenance job cards, breakdown management, tyre and battery tracking, and fuel fill-up register with KMPL monitoring and theft detection.

### 📊 Reports & Dashboard
Executive dashboard with live KPIs, vehicle-wise P&L, route-wise profitability, customer-wise revenue, debtors/creditors ageing, trial balance, profit & loss statement, balance sheet, and fully exportable MIS reports.

### 🤖 AI & Automation
OCR-powered vendor invoice data extraction, anomaly detection on trip expenses and fuel consumption, natural language report queries ("What was my best route last month?"), cash flow forecasting, and smart compliance reminders.

### 📱 Driver Mobile App
React Native app for drivers to view assigned trips, record expenses with receipt photos, capture proof of delivery with GPS-tagged photos and digital signatures, and track their advance balance and earnings.

### 🌐 Customer Portal
Self-service portal for your freight customers to track shipments by LR number, download invoices, make online payments via Razorpay, and view their statement of account — without calling your office.

---

## 🏗️ Platform Architecture

FreightFlow is built as a **multi-tenant, multi-company SaaS** with enterprise-grade isolation:

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

## 🛠️ Technology Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend Framework** | Next.js 16 (App Router) + React 19 | SSR, fast routing, advanced React features |
| **Language** | TypeScript | Strong typing, safer code, better DX |
| **UI Components** | shadcn/ui + Tailwind CSS 4 | Beautiful, accessible, customizable components |
| **State & Data Fetching** | Zustand + TanStack Query | Lightweight client state, powerful server state |
| **Forms & Validation** | React Hook Form + Zod | Performant, type-safe form validation |
| **Tables & Charts** | TanStack Table + Recharts | Powerful data grids and interactive charting |
| **Database ORM** | Prisma | Type-safe database client and migrations |
| **Database** | Supabase (PostgreSQL) | Scalable relational DB, Auth, and Storage |
| **Authentication** | Supabase Auth | Robust JWT auth, role-based access control |
| **Caching/Queue** | Upstash Redis | Fast caching, potential for job queues |
| **Email Services** | Nodemailer | Reliable transactional email delivery |
| **Reporting & Exports** | jsPDF + XLSX | Generating PDF receipts and Excel data reports |
| **Monorepo Tooling** | Turborepo | High-performance build system for monorepos |
| **Documentation** | Swagger / OpenAPI | Auto-generated interactive API docs |

---

## 💼 Licensing Model & Module Control

FreightFlow is a **commercial SaaS product** sold on annual or monthly subscription licenses.

| Plan | Companies | Users | Vehicles | Monthly LRs |
|---|---|---|---|---|
| **Starter** | 1 | 5 | 20 | 500 |
| **Growth** | 3 | 25 | 100 | 5,000 |
| **Enterprise** | Unlimited | Unlimited | Unlimited | Unlimited |

Licenses are cryptographically signed and validated on every API request. Expired accounts enter a 7-day read-only grace period before access is suspended.

The Super Admin can toggle any module per tenant. Disabled modules are completely hidden from the UI and return `403 Forbidden` from the API.

---

## 💻 Getting Started

### Prerequisites
- Node.js 20+
- pnpm 9+
- Supabase account (free tier)
- Upstash Redis account (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/freightflow/freightflow.git
cd freightflow

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

## 📂 Project Structure

```
freightflow/
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

## 🛡️ Security & Compliance

FreightFlow is built securely and tailored specifically for Indian regulatory requirements:

### **Security**
- **JWT Authentication** via Supabase Auth with 1-hour token expiry
- **Row-Level Security** enforced at the database level — tenants are fully isolated
- **MFA** (TOTP + SMS OTP) mandatory for financial approval actions
- **AES-256 encryption** for sensitive fields (Aadhaar, PAN, bank account numbers)
- **TLS 1.3** for all API communication
- **License tamper detection** via HMAC-signed keys validated server-side
- **Append-only audit log** for all financial mutations

### **Compliance**
- ✅ **GST** (CGST, SGST, IGST, RCM) with SAC codes for transport services
- ✅ **e-Invoice** (IRN generation via IRP portal API)
- ✅ **e-Way Bill** (NIC API — generate, extend, cancel)
- ✅ **TDS** under Sec 194C, 194I, 194J with Form 26Q and Form 16A
- ✅ **PF & ESI** challan support and Professional Tax handling
- ✅ **Motor Vehicle Act** — permit, fitness, road tax tracking
- ✅ **MSME** 45-day payment compliance alerts

---

## 🤝 Contributing

This is a commercial product. Contributions from the core team follow the implementation blueprint located at `/docs/FreightFlow_Implementation_Blueprint.docx`.

For bug reports or feature requests, please open an issue with the appropriate template.

---

## 📞 Support

- 📧 Email: support@freightflow.com
- 💬 WhatsApp: +91-XXXXXXXXXX
- 📖 Documentation: https://docs.freightflow.com
- 🐛 Issues: https://github.com/freightflow/issues

---

## 📄 License

FreightFlow is a **commercially licensed** SaaS product. All rights reserved.
See [LICENSE](LICENSE) for the full commercial license terms.

---

<p align="center">
  <strong>FreightFlow</strong> — Built for Indian Transport. Powered by Modern Technology.<br/>
  <em>Every Trip. Every Rupee. Every Mile — In Control.</em>
</p>
