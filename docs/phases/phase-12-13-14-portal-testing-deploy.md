# Phase 12 — Customer Portal & CRM

> **Duration**: 5-7 days | **Goal**: Self-service portal for customers to track shipments and view invoices

---

## Overview

Customer-facing portal: OTP login, shipment tracking by LR number, invoice viewing and download, online payment via Razorpay, and statement of account.

---

## Database Tasks

### D12.1 — Portal Tables
```sql
-- portal_users
id UUID PK, tenant_id UUID FK, customer_id UUID FK,
email VARCHAR(255), phone VARCHAR(15), name VARCHAR(255),
is_active BOOLEAN DEFAULT true, last_login TIMESTAMPTZ, created_at

-- payment_links
id UUID PK, invoice_id UUID FK, razorpay_link_id VARCHAR(100),
amount INTEGER, status VARCHAR(20), -- created|paid|expired
paid_at TIMESTAMPTZ, razorpay_payment_id VARCHAR(100), created_at
```

---

## Frontend Tasks

### F12.1 — Portal Login (`/portal/login`)
- Email + OTP login (no password)
- Tenant-branded login page (logo, colors from company settings)
- White-labeled subdomain: `portal.freightflowpro.com/[tenant-slug]`

### F12.2 — Portal Dashboard (`/portal`)
- Outstanding invoices count and total
- Recent shipments (last 10)
- Total spent this year
- Quick search: Enter LR number

### F12.3 — Shipment Tracking (`/portal/track`)
- Enter LR number → see status timeline
- Status stages: Created → Loaded → In Transit → Delivered
- Current location (if GPS available)
- ETA display
- POD photo and signature (if delivered)

### F12.4 — Invoice List (`/portal/invoices`)
- All invoices with status badges (Paid, Partial, Overdue, Draft)
- PDF download for any invoice
- Online payment button → Razorpay payment page
- Filter by status, date range

### F12.5 — Statement of Account (`/portal/statement`)
- Downloadable PDF: all transactions for date range
- Opening balance, invoices, payments, closing balance

### F12.6 — Online Payment Flow
- Click "Pay Now" on invoice → Razorpay checkout
- Partial payment support
- Payment confirmation → auto-update invoice status
- Receipt PDF generation

---

## Backend Tasks

### B12.1 — Portal Routes
```
POST /v1/portal/auth/otp/send    → Send OTP to customer
POST /v1/portal/auth/otp/verify  → Verify and login
GET  /v1/portal/dashboard        → Portal KPIs
GET  /v1/portal/track/:lrNo      → Shipment tracking
GET  /v1/portal/invoices         → Customer's invoices
GET  /v1/portal/invoices/:id/pdf → Invoice PDF download
POST /v1/portal/pay/:invoiceId   → Create Razorpay payment link
POST /v1/portal/webhook/razorpay → Payment webhook handler
GET  /v1/portal/statement        → Statement of account
```

### B12.2 — Razorpay Integration
- Create payment link for invoice amount
- Webhook handler: payment.captured → update invoice paid_amount + status
- Auto-create GL entry: DR Bank, CR Accounts Receivable
- Send payment receipt email

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| Portal login works | Customer logs in with email OTP |
| Tracking shows status | LR number → correct status timeline |
| Invoice download | PDF downloads with correct data |
| Online payment | Razorpay payment → invoice status updated |
| Statement accurate | Correct opening/closing balances |

---

# Phase 13 — Testing & Security Audit

> **Duration**: 5-7 days | **Goal**: Full test suite, penetration testing, performance optimization

---

## Tasks

### Testing
- Complete unit test coverage for all financial calculations (target: 90%+)
- Integration tests for all API routes (target: 100% route coverage)
- E2E tests for 5 critical paths (Create LR, Invoice, Payment, Payroll, GSTR-1)
- Cross-browser testing: Chrome, Firefox, Safari, Edge
- Mobile app testing on iOS and Android simulators
- Load testing: simulate 50 concurrent users per tenant

### Security Audit
- OWASP Top 10 checklist verification
- RLS bypass testing: attempt cross-tenant data access via all routes
- JWT manipulation testing
- License key tampering testing
- SQL injection testing (should all fail — Prisma parameterized)
- File upload MIME type bypass testing
- Rate limit bypass testing
- CORS misconfiguration testing

### Performance
- API response time < 200ms (p95) for all CRUD operations
- Dashboard load time < 3s (LCP)
- Database query optimization: add missing indexes
- Redis caching for dashboard KPIs
- Image/file lazy loading
- Bundle size analysis and optimization

### Accessibility
- WCAG 2.1 AA compliance for key flows
- Keyboard navigation for all forms
- Screen reader testing for critical screens

---

# Phase 14 — Production Deployment

> **Duration**: 3-5 days | **Goal**: Production deploy with monitoring and documentation

---

## Tasks

### Deployment
- Vercel production deployment (apps/web)
- Railway production deployment (apps/api)
- Supabase production project setup
- Custom domain configuration (app.freightflowpro.com, api.freightflowpro.com)
- SSL certificate verification
- DNS configuration

### Monitoring Setup
- Sentry: error tracking + performance monitoring
- PostHog: product analytics + feature flags
- Logtail: centralized logging
- UptimeRobot: uptime monitoring (5-minute intervals)
- Alerting: email + Slack for critical errors

### Data Migration
- Import demo customer data
- Verify all seed data (COA, modules, admin account)
- Run migration scripts against production DB

### Documentation
- API documentation (OpenAPI/Swagger)
- User guide / help documentation
- Admin guide for super admin portal
- Runbook for common operations

### Go-Live Checklist
- [ ] All environment variables set in production
- [ ] Database migrations applied successfully
- [ ] RLS policies verified in production
- [ ] Super admin login works
- [ ] Demo tenant fully functional
- [ ] Error monitoring active and receiving test errors
- [ ] Uptime monitoring configured and reporting
- [ ] Backup schedule configured in Supabase
- [ ] HTTPS enforced on all endpoints
- [ ] Rate limiting active
- [ ] License engine validated with test license
