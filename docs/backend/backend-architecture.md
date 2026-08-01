# FreightFlow Pro — Backend Architecture Document

> **Runtime**: Node.js 20 LTS | **Framework**: Fastify | **ORM**: Prisma | **Auth**: Supabase

---

## 1. API Architecture

### 1.1 API Versioning & Base URL

```
Production:  https://api.freightflowpro.com/v1/
Staging:     https://api-staging.freightflowpro.com/v1/
Development: http://localhost:4000/v1/
```

### 1.2 Middleware Pipeline

Every request passes through this middleware chain:

```
Request
  │
  ├── 1. CORS Middleware (strict origin whitelist)
  ├── 2. Rate Limiter (Upstash Redis: 100 req/min/IP)
  ├── 3. Request Logger (Logtail)
  ├── 4. Auth Middleware (Supabase JWT validation)
  │       → Extracts: user_id, email
  │       → Fetches: tenant_id, company_id, role, branch_id
  ├── 5. License Middleware
  │       → Validates license expiry
  │       → Checks plan limits (users, vehicles, LRs)
  │       → Grace period: 7 days read-only
  ├── 6. Module Middleware
  │       → Checks tenant_modules for route's module_key
  │       → Returns 403 if module disabled
  ├── 7. Role Middleware
  │       → Checks user role against route permissions
  │       → RBAC matrix lookup
  └── 8. Route Handler
          → Zod input validation
          → Service layer call
          → Response formatting
```

---

## 2. Project Structure

```
apps/api/
├── src/
│   ├── index.ts                 # Fastify server entry
│   ├── config/
│   │   ├── env.ts               # Environment validation (Zod)
│   │   ├── cors.ts              # CORS configuration
│   │   └── swagger.ts           # OpenAPI documentation
│   │
│   ├── middleware/
│   │   ├── auth.ts              # Supabase JWT validation
│   │   ├── license.ts           # License key validation
│   │   ├── module-check.ts      # Module enablement check
│   │   ├── rate-limit.ts        # Redis rate limiter
│   │   ├── rbac.ts              # Role-based access control
│   │   └── tenant-context.ts    # Inject tenant context
│   │
│   ├── routes/
│   │   ├── auth/                # Login, register, refresh, MFA
│   │   ├── super-admin/         # Platform admin routes
│   │   ├── masters/             # Dealers, consignees, vehicles, etc.
│   │   ├── orders/              # LR CRUD, status updates
│   │   ├── pallets/             # Pallet management
│   │   ├── trips/               # Trip lifecycle
│   │   ├── accounting/          # Vouchers, AR, AP
│   │   ├── fleet/               # Vehicle docs, maintenance, fuel
│   │   ├── hr/                  # Employees, attendance, payroll
│   │   ├── compliance/          # GST, TDS, e-Way Bill
│   │   ├── reports/             # Report generation
│   │   ├── ai/                  # AI features
│   │   └── portal/              # Customer portal
│   │
│   ├── services/
│   │   ├── lr-engine.ts         # LR creation, numbering, calculations
│   │   ├── accounting-engine.ts # GL entries, trial balance
│   │   ├── gst-engine.ts        # GST computation, e-Invoice
│   │   ├── payroll-engine.ts    # Salary processing
│   │   ├── license-engine.ts    # License CRUD, validation
│   │   ├── trip-engine.ts       # Trip lifecycle, settlement
│   │   ├── fleet-service.ts     # Vehicle, maintenance, fuel
│   │   ├── notification-svc.ts  # Email, SMS, WhatsApp
│   │   ├── pdf-service.ts       # PDF generation
│   │   ├── ai-service.ts        # OpenAI integration
│   │   └── report-engine.ts     # Report SQL + formatting
│   │
│   ├── jobs/
│   │   ├── queue.ts             # BullMQ queue setup
│   │   ├── email-job.ts         # Send emails
│   │   ├── pdf-job.ts           # Generate PDFs
│   │   ├── report-job.ts        # Scheduled reports
│   │   ├── expiry-alert-job.ts  # Document expiry alerts
│   │   └── usage-meter-job.ts   # Usage metering
│   │
│   └── utils/
│       ├── currency.ts          # Paise ↔ Rupee conversion
│       ├── dates.ts             # IST formatting
│       ├── errors.ts            # Error classes
│       ├── logger.ts            # Structured logging
│       └── crypto.ts            # PII encryption helpers
│
├── tests/
│   ├── unit/                    # Service layer unit tests
│   ├── integration/             # API route integration tests
│   └── fixtures/                # Test data fixtures
│
├── package.json
├── tsconfig.json
└── Dockerfile
```

---

## 3. API Route Design

### 3.1 RESTful Endpoints

| Method | Endpoint | Module | Description |
|--------|---------|--------|-------------|
| **Auth** |
| POST | `/v1/auth/login` | core | Email/password login |
| POST | `/v1/auth/otp/send` | core | Send OTP for mobile login |
| POST | `/v1/auth/otp/verify` | core | Verify OTP |
| POST | `/v1/auth/refresh` | core | Refresh access token |
| POST | `/v1/auth/mfa/setup` | core | Setup TOTP MFA |
| **Masters** |
| GET/POST | `/v1/masters/dealers` | mod_lr_management | List/Create dealers |
| GET/PUT/DELETE | `/v1/masters/dealers/:id` | mod_lr_management | Get/Update/Delete dealer |
| GET/POST | `/v1/masters/consignees` | mod_lr_management | List/Create consignees |
| GET/POST | `/v1/masters/vehicles` | mod_fleet | List/Create vehicles |
| GET/POST | `/v1/masters/labour` | mod_hr_payroll | List/Create labour |
| GET/POST | `/v1/masters/drivers` | mod_fleet | List/Create drivers |
| **Orders (LR)** |
| GET | `/v1/orders` | mod_lr_management | List orders (paginated, filtered) |
| POST | `/v1/orders` | mod_lr_management | Create new LR |
| GET | `/v1/orders/:id` | mod_lr_management | Get LR detail |
| PUT | `/v1/orders/:id` | mod_lr_management | Update LR |
| DELETE | `/v1/orders/:id` | mod_lr_management | Soft delete LR |
| GET | `/v1/orders/:id/print` | mod_lr_management | Generate LR PDF |
| POST | `/v1/orders/:id/status` | mod_lr_management | Update LR status |
| GET | `/v1/orders/today` | mod_lr_management | Today's LRs |
| POST | `/v1/orders/import` | mod_lr_management | Bulk import from Excel |
| **Trips** |
| GET/POST | `/v1/trips` | mod_trip_management | List/Create trips |
| POST | `/v1/trips/:id/expenses` | mod_trip_management | Add trip expense |
| POST | `/v1/trips/:id/settle` | mod_trip_management | Settle trip |
| GET | `/v1/trips/:id/pnl` | mod_trip_management | Trip P&L |
| **Accounting** |
| POST | `/v1/accounting/vouchers` | mod_core_accounting | Create voucher |
| GET | `/v1/accounting/ledger/:accountId` | mod_core_accounting | Account ledger |
| GET | `/v1/accounting/trial-balance` | mod_core_accounting | Trial balance |
| POST | `/v1/accounting/invoices` | mod_freight_billing | Create invoice |
| POST | `/v1/accounting/payments` | mod_core_accounting | Record payment |
| **Super Admin** |
| GET/POST | `/v1/super-admin/tenants` | platform | Manage tenants |
| POST | `/v1/super-admin/licenses` | platform | Issue license |
| PUT | `/v1/super-admin/modules/:tenantId` | platform | Toggle modules |

### 3.2 Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}

// Error
{
  "success": false,
  "error": "Dealer with this GSTIN already exists",
  "code": "DUPLICATE_GSTIN",
  "details": { "field": "gstin", "value": "24AABCS1234A1Z5" }
}
```

---

## 4. Service Layer Patterns

### 4.1 LR Engine Example

```ts
class LREngine {
  async createOrder(input: TCreateOrderInput, ctx: TenantContext) {
    // 1. Validate input with Zod
    const validated = CreateOrderSchema.parse(input);

    // 2. Generate next LR number
    const lrNo = await this.getNextLRNumber(ctx.companyId);

    // 3. Calculate totals (all in paise)
    const freight = validated.freight; // already in paise
    const hamali = validated.hamali;
    const subtotal = freight + hamali;
    const cgst = Math.round(subtotal * validated.cgstPct / 100);
    const sgst = Math.round(subtotal * validated.sgstPct / 100);
    const total = subtotal + cgst + sgst;

    // 4. Create order + details in transaction
    const order = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.create({ ... });
      await tx.orderDetail.createMany({ ... });
      await tx.lrStatusLog.create({ status: 'CREATED', ... });
      return ord;
    });

    // 5. Enqueue background jobs
    await emailQueue.add('lr-notification', { orderId: order.id });
    await pdfQueue.add('lr-pdf', { orderId: order.id });

    // 6. Update usage metrics
    await usageService.increment(ctx.tenantId, 'lr_count');

    return order;
  }
}
```

### 4.2 Accounting Engine — Double Entry

```ts
class AccountingEngine {
  async createJournalEntry(voucher: TVoucherInput, ctx: TenantContext) {
    // Validate DR = CR
    const totalDr = voucher.lines.reduce((s, l) => s + l.debit, 0);
    const totalCr = voucher.lines.reduce((s, l) => s + l.credit, 0);
    if (totalDr !== totalCr) throw new BalanceError();

    // Create in transaction
    return prisma.$transaction(async (tx) => {
      const entry = await tx.journalEntry.create({ ... });
      await tx.journalLine.createMany({
        data: voucher.lines.map(l => ({ entryId: entry.id, ...l }))
      });

      // Update account balances
      for (const line of voucher.lines) {
        await this.updateAccountBalance(tx, line.accountId, line.debit, line.credit);
      }

      // Audit log
      await tx.auditLog.create({ action: 'VOUCHER_CREATED', ... });

      return entry;
    });
  }
}
```

---

## 5. Background Jobs (BullMQ)

| Queue | Job | Schedule | Description |
|-------|-----|----------|-------------|
| `email` | `send-email` | On demand | Transactional emails via Resend |
| `sms` | `send-sms` | On demand | OTP, notifications via Twilio |
| `pdf` | `generate-pdf` | On demand | LR, invoice, payslip PDFs |
| `reports` | `scheduled-report` | Cron | Daily/weekly/monthly reports |
| `alerts` | `expiry-check` | Daily 9 AM | Vehicle doc expiry alerts |
| `alerts` | `license-expiry` | Daily | License expiry warnings |
| `usage` | `meter-usage` | Hourly | Tenant usage metric updates |
| `payroll` | `process-payroll` | On demand | Monthly payroll batch |
| `gst` | `gstr-prep` | Monthly | GSTR-1 JSON generation |

---

## 6. Error Handling Strategy

```ts
// Custom error classes
class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number,
    public details?: any
  ) { super(message); }
}

class NotFoundError extends AppError { /* 404 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ForbiddenError extends AppError { /* 403 — module disabled, license expired */ }
class ValidationError extends AppError { /* 422 — Zod validation failures */ }
class ConflictError extends AppError { /* 409 — duplicate GSTIN, etc. */ }
class LicenseExpiredError extends AppError { /* 402 — license expired */ }
class BalanceError extends AppError { /* 422 — DR ≠ CR */ }
```

---

## 7. Security Implementation

| Control | Implementation |
|---------|---------------|
| JWT Validation | Supabase validates on every request |
| Rate Limiting | Upstash Redis: 100 req/min/IP, 1000 req/min/tenant |
| Input Validation | Zod schemas on all endpoints |
| SQL Injection | Prisma parameterized queries only |
| CORS | Strict origin whitelist |
| PII Encryption | AES-256 for Aadhaar, PAN, bank accounts |
| Audit Log | Append-only table for all financial mutations |
| MFA | TOTP for financial approval actions |
| HTTPS | Enforced via hosting config + HSTS |
