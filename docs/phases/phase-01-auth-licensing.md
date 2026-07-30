# Phase 1 — Authentication, Licensing & Super Admin Portal

> **Duration**: 7-10 days | **Goal**: Working login, license issuance, tenant provisioning, module control

---

## Overview

This phase builds the complete authentication system, license management engine, super admin portal, and tenant onboarding wizard. After this phase, new tenants can be provisioned and managed.

---

## Database Tasks

### D1.1 — Auth Schema Extensions
- Configure Supabase Auth with custom user metadata fields
- Add `app_role`, `tenant_id`, `company_id`, `branch_id` to user metadata
- Create trigger to sync Supabase auth.users → public.users table

### D1.2 — Session & Token Tables
```sql
-- user_sessions (for tracking active sessions)
id, user_id, device_info, ip_address, created_at, expires_at

-- mfa_settings
id, user_id, is_enabled, totp_secret_encrypted, verified_at
```

### D1.3 — Module Registry Seed
Insert all 18 module keys into `tenant_modules` for the demo tenant with default on/off states per the blueprint (mod_core_accounting = always ON, mod_crm = OFF by default, etc.)

---

## Frontend Tasks

### F1.1 — Login Page
- Email/password login form with Supabase Auth
- "Login with OTP" tab (phone number + OTP flow)
- "Forgot Password" link → password reset flow
- FreightFlow Pro branding: navy gradient header, logo, tagline
- Error handling: invalid credentials, account locked, license expired
- Remember me checkbox

### F1.2 — MFA Setup Screen
- TOTP setup: QR code display, manual key entry
- Verification code input with 6-digit format
- Backup codes display (one-time view)

### F1.3 — Protected Route Wrapper
```tsx
// middleware.ts — intercepts all dashboard routes
// 1. Check Supabase session exists
// 2. If no session → redirect to /login
// 3. If session → refresh if within 5 min of expiry
// 4. Inject tenant context into request
```

### F1.4 — Super Admin Portal (`/super-admin`)

**Dashboard Page:**
- KPI cards: Total Tenants, Active Licenses, Expiring in 30 days, Total Revenue
- Module usage chart (bar chart: which modules are most enabled)
- Recent activity feed

**Tenant Management Page:**
- Tenant list: searchable, filterable by plan/status, paginated
- Create Tenant form → generates tenant + license key + welcome email
- Tenant detail page: license info, usage metrics, module toggles
- Edit tenant: change plan, extend license, change status

**License Management Page:**
- License list: all issued licenses with status
- Issue new license: select tenant, plan, duration, limits
- Revoke/extend/change plan actions
- License key display with copy button

**Module Control Page:**
- Per-tenant module toggle grid
- Enable/disable with confirmation dialog
- Bulk enable/disable for plan presets (Starter/Growth/Enterprise)

**Audit Log Page:**
- Chronological list of all super admin actions
- Filter by admin, action type, target tenant, date range
- Columns: Timestamp, Admin, Action, Tenant, Details

### F1.5 — License Warning Banner
- Yellow banner when license expires in < 30 days
- Red banner when license expired (grace period)
- Block banner when grace period expired (7 days)
- Banner shows days remaining, "Renew Now" CTA

### F1.6 — Tenant Onboarding Wizard
Multi-step wizard (5 steps):
1. **Company Details**: Name, GSTIN, PAN, address, logo upload
2. **Admin User**: Name, email, phone, password, role
3. **Module Selection**: Checkboxes based on plan limits
4. **Chart of Accounts**: Auto-seed transport-specific COA, allow customization
5. **Data Import**: Optional CSV upload for consignees, dealers, vehicles

---

## Backend Tasks

### B1.1 — Auth Routes
```
POST /v1/auth/login         → Supabase signInWithPassword
POST /v1/auth/otp/send      → Supabase signInWithOtp (phone)
POST /v1/auth/otp/verify     → Verify OTP
POST /v1/auth/refresh        → Supabase refreshSession
POST /v1/auth/logout         → Supabase signOut
POST /v1/auth/mfa/setup      → Generate TOTP secret + QR
POST /v1/auth/mfa/verify     → Verify TOTP code
POST /v1/auth/forgot-password → Supabase resetPasswordForEmail
```

### B1.2 — Auth Middleware
- Extract JWT from Authorization header
- Validate with Supabase
- Fetch user record: tenant_id, company_id, role, branch_id
- Fetch enabled_modules from tenant_modules table
- Inject `TenantContext` object into request

### B1.3 — License Engine Service
```ts
class LicenseEngine {
  generateKey(tenantId, plan, expiresAt, modules): string
  // → HMAC-SHA256 signed: tenantId|plan|expiresAt|modulesHash

  validateKey(key): LicenseStatus
  // → Check signature, expiry, parse plan details

  checkLimits(tenantId, metric): boolean
  // → Compare current usage vs plan limits

  getStatus(tenantId): LicenseStatusResponse
  // → { daysRemaining, currentUsage, planLimits, isGracePeriod }
}
```

### B1.4 — License Middleware
- Runs after auth middleware on ALL protected routes
- Checks license expiry: active, grace (read-only), expired (blocked)
- Checks plan limits: user count, vehicle count
- Returns 402 if expired, 403 if over limit

### B1.5 — Module Middleware
- Checks `tenant_modules` table (NOT just JWT — prevents bypass)
- Maps route to module_key (e.g., `/v1/orders/*` → `mod_lr_management`)
- Returns 403 with `MODULE_DISABLED` code if module is off

### B1.6 — Rate Limiter
- Upstash Redis rate limiter
- 100 req/min per IP
- 1000 req/min per tenant
- Returns 429 with retry-after header

### B1.7 — Super Admin Routes
```
GET    /v1/super-admin/dashboard    → KPI stats
GET    /v1/super-admin/tenants      → List tenants (paginated)
POST   /v1/super-admin/tenants      → Create tenant
GET    /v1/super-admin/tenants/:id  → Tenant detail
PUT    /v1/super-admin/tenants/:id  → Update tenant
POST   /v1/super-admin/licenses     → Issue license
PUT    /v1/super-admin/licenses/:id → Extend/revoke
PUT    /v1/super-admin/modules/:tid → Toggle modules
GET    /v1/super-admin/audit-log    → Audit log (paginated)
GET    /v1/super-admin/usage/:tid   → Tenant usage metrics
```

### B1.8 — Tenant Onboarding Service
- Create tenant record
- Generate and store license key
- Create company with GSTIN, PAN
- Create admin user linked to Supabase Auth
- Seed default modules based on plan
- Seed chart of accounts (transport-specific template)
- Send welcome email via Resend

### B1.9 — Email Templates (Resend)
- Welcome email (new tenant created)
- License expiry warning (30, 7, 3, 1 day before)
- Password reset email
- MFA setup confirmation

---

## Testing Tasks

### T1.1 — Unit Tests
- License key generation and validation
- HMAC signature verification
- Grace period logic (7 days post-expiry)
- Plan limit checking logic

### T1.2 — Integration Tests
- Login with valid/invalid credentials
- OTP send and verify flow
- Token refresh before/after expiry
- License middleware: active, grace, expired
- Module middleware: enabled → 200, disabled → 403
- RLS: Tenant A cannot access Tenant B data
- Super admin CRUD: create tenant, issue license, toggle module

### T1.3 — E2E Tests
- Full login flow (email/password)
- Super admin: create tenant → verify tenant exists
- Module toggle: disable → verify hidden in nav + 403 from API

---

## Acceptance Criteria

| Criteria | Pass Condition |
|----------|---------------|
| Super admin can create tenant | Tenant provisioned, license key issued, email sent |
| Module toggle works | Disabled module returns 403 API + hidden in UI |
| License expiry enforced | Expired tenant blocked from creating new records |
| Tenant login isolated | Tenant A user cannot access Tenant B data (RLS test) |
| Onboarding wizard completes | Demo company fully set up in < 5 minutes |
| MFA works | Can enable TOTP and login with 2FA |
| Rate limiter works | Returns 429 after exceeding limits |
