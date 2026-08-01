# Phase 0 — Foundation & Infrastructure Setup

> **Duration**: 3-5 days | **Goal**: Running dev environment, empty project scaffold, CI/CD pipeline

---

## Overview

This phase establishes the complete development foundation: monorepo structure, Supabase project, Prisma ORM, CI/CD pipeline, and the initial database schema for platform-level tables.

---

## Database Tasks

### D0.1 — Supabase Project Setup
- Create Supabase project (free tier), region: `ap-south-1` (Mumbai)
- Enable Row-Level Security (RLS) globally
- Configure Auth: Email/Password + Phone OTP
- Set JWT expiry: 1 hour
- Create Storage buckets: `documents`, `pod-photos`, `invoice-pdfs`, `profile-images` (all private)
- Save `service_role` key and `anon` key

### D0.2 — Prisma Setup
- Install Prisma CLI and `@prisma/client`
- Configure `schema.prisma` with Supabase connection string
- Set up `DATABASE_URL` and `DIRECT_URL` env vars

### D0.3 — Platform Tables Migration
Create first migration with these tables:

```sql
-- tenants
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
name VARCHAR(255) NOT NULL,
slug VARCHAR(100) UNIQUE NOT NULL,
plan VARCHAR(50) NOT NULL DEFAULT 'starter',
status VARCHAR(20) NOT NULL DEFAULT 'active',
license_key TEXT,
license_expires_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()

-- tenant_modules
id UUID PRIMARY KEY,
tenant_id UUID REFERENCES tenants(id),
module_key VARCHAR(50) NOT NULL,
is_enabled BOOLEAN DEFAULT true,
enabled_by UUID,
enabled_at TIMESTAMPTZ DEFAULT NOW()

-- license_keys
id UUID PRIMARY KEY,
tenant_id UUID REFERENCES tenants(id),
key_hash TEXT NOT NULL,
plan VARCHAR(50) NOT NULL,
max_users INTEGER NOT NULL,
max_vehicles INTEGER NOT NULL,
expires_at TIMESTAMPTZ NOT NULL,
issued_at TIMESTAMPTZ DEFAULT NOW()

-- platform_admins
id UUID PRIMARY KEY,
email VARCHAR(255) UNIQUE NOT NULL,
password_hash TEXT NOT NULL,
role VARCHAR(50) DEFAULT 'super_admin',
last_login TIMESTAMPTZ

-- tenant_usage
id UUID PRIMARY KEY,
tenant_id UUID REFERENCES tenants(id),
metric_name VARCHAR(100) NOT NULL,
metric_value INTEGER DEFAULT 0,
recorded_at TIMESTAMPTZ DEFAULT NOW()

-- audit_log_platform
id UUID PRIMARY KEY,
admin_id UUID REFERENCES platform_admins(id),
action VARCHAR(100) NOT NULL,
target_tenant_id UUID,
payload JSONB,
created_at TIMESTAMPTZ DEFAULT NOW()
```

### D0.4 — Tenant Core Tables Migration
```sql
-- companies
id, tenant_id, name, gstin, pan, address, logo_url, fiscal_year_start

-- branches
id, company_id, name, address, state_code, manager_id

-- users
id, tenant_id, company_id, auth_uid, name, role, branch_id, is_active
```

### D0.5 — RLS Policies
Apply RLS on `companies`, `branches`, `users` tables using the standard tenant isolation pattern.

### D0.6 — Seed Script
- 1 super admin account (from env vars)
- 1 demo tenant ("Shree Shivay Roadlines")
- 1 demo company with GSTIN, PAN, address
- 1 company admin user

---

## Frontend Tasks

### F0.1 — Next.js Project Setup
- Initialize Next.js 14 with App Router in `/apps/web`
- Configure TypeScript strict mode
- Install and configure Tailwind CSS with brand color tokens
- Install shadcn/ui and initialize with `npx shadcn-ui@latest init`
- Set up Google Font: Inter

### F0.2 — Layout Structure
- Create `(auth)` route group with basic layout
- Create `(dashboard)` route group with sidebar layout placeholder
- Create `super-admin` route group with separate layout
- Set up loading/error boundary pages

### F0.3 — Supabase Client Setup
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Create client-side Supabase client (`lib/supabase/client.ts`)
- Create server-side Supabase client (`lib/supabase/server.ts`)
- Create middleware for auth session refresh (`middleware.ts`)

### F0.4 — Design System Foundation
- Configure Tailwind with full brand color palette
- Create CSS variables for theme tokens
- Set up base component overrides (shadcn theme)
- Create utility classes for status badges, buttons, cards

---

## Backend Tasks

### B0.1 — Fastify API Server Setup
- Initialize Node.js project in `/apps/api`
- Install Fastify, TypeScript, tsx (dev runner)
- Set up environment variable validation with Zod
- Create health check endpoint: `GET /v1/health`
- Configure CORS, logging, error handler

### B0.2 — Prisma Client Integration
- Set up Prisma client singleton in `/packages/db`
- Configure for Supabase connection pooling
- Verify connection with a test query

---

## CI/CD Tasks

### C0.1 — Repository Setup
- Initialize Git repository
- Create `.gitignore` (node_modules, .env, dist, .next, etc.)
- Create `main` and `develop` branches with protection rules

### C0.2 — Monorepo Configuration
- Configure `pnpm-workspace.yaml`
- Set up `turbo.json` with build/dev/test pipelines
- Create root `package.json` with workspace scripts

### C0.3 — GitHub Actions
- Create PR check workflow: lint, type-check, unit test, build
- Create deploy workflows for web and API (manual trigger initially)

### C0.4 — Environment Template
- Create `.env.example` with ALL required variables documented

---

## Testing Tasks

### T0.1 — Test Framework Setup
- Install Vitest for unit testing
- Install Supertest for API integration tests
- Install Playwright for E2E tests
- Configure test scripts in turbo.json

### T0.2 — Smoke Tests
- Test: Supabase connection works
- Test: RLS prevents cross-tenant access
- Test: API health endpoint returns 200

---

## Acceptance Criteria

| Criteria | Pass Condition |
|----------|---------------|
| Supabase project is live | Can connect via Prisma and run raw SQL |
| RLS works | User A cannot see User B's tenant data |
| CI pipeline passes | All checks green on empty scaffold |
| Super admin login works | Can login to `/super-admin` with seeded credentials |
| Monorepo builds | `pnpm build` succeeds for all packages |
| Dev server runs | `pnpm dev` starts both web (3000) and API (4000) |
