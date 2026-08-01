# FreightFlow Pro — CI/CD & Deployment Document

> **CI**: GitHub Actions | **Web Hosting**: Vercel | **API Hosting**: Railway | **DB**: Supabase

---

## 1. Deployment Architecture

```
GitHub Repository (Monorepo)
    │
    ├── Push to `develop` ──────────> Staging Environment
    │   ├── Vercel Preview (web)      app-staging.freightflowpro.com
    │   ├── Railway Staging (api)     api-staging.freightflowpro.com
    │   └── Supabase Staging          staging.supabase.co
    │
    └── Merge to `main` ───────────> Production Environment
        ├── Vercel Production (web)   app.freightflowpro.com
        ├── Railway Production (api)  api.freightflowpro.com
        └── Supabase Production       prod.supabase.co
```

---

## 2. Branch Strategy

| Branch | Purpose | Deploy Target | Protection |
|--------|---------|--------------|-----------|
| `main` | Production releases | Vercel Prod + Railway Prod | Protected: require PR + 1 approval + CI pass |
| `develop` | Integration/staging | Vercel Preview + Railway Staging | Protected: require CI pass |
| `feature/*` | Feature branches | Vercel Preview (per-PR) | None |
| `fix/*` | Bug fix branches | Vercel Preview (per-PR) | None |
| `release/*` | Release candidates | Manual staging deploy | Protected |

---

## 3. GitHub Actions Workflows

### 3.1 PR Checks (`.github/workflows/pr-check.yml`)

Runs on: Every pull request to `develop` or `main`

```
Steps:
1. Checkout code
2. Setup Node.js 20 + pnpm
3. Install dependencies (pnpm install --frozen-lockfile)
4. Lint check (ESLint)
5. Format check (Prettier)
6. Type check (tsc --noEmit) for all packages
7. Unit tests (Vitest)
8. Integration tests (against Supabase test project)
9. Build check (turbo build)
10. Migration dry-run (prisma migrate diff)
11. Upload test coverage to Codecov
```

### 3.2 Deploy Web (`.github/workflows/deploy-web.yml`)

Runs on: Merge to `main`

```
Steps:
1. Checkout code
2. Vercel CLI: pull → build → deploy --prod
3. Post-deploy health check (curl /api/health)
4. Notify team (Slack/Discord webhook)
```

### 3.3 Deploy API (`.github/workflows/deploy-api.yml`)

Runs on: Merge to `main`

```
Steps:
1. Checkout code
2. Run database migrations (prisma migrate deploy)
3. Build API Docker image
4. Push to Railway via CLI
5. Health check (GET /v1/health)
6. Notify team
```

### 3.4 Database Migration (`.github/workflows/migrate.yml`)

Runs on: Manual trigger or merge to `main` when `packages/db/` changed

```
Steps:
1. Checkout code
2. Setup Prisma
3. Run: prisma migrate deploy --preview-feature
4. Verify migration success
5. Run seed (if new tenant setup needed)
```

---

## 4. Environment Configuration

### 4.1 Environments

| Environment | Purpose | Supabase | API | Web |
|------------|---------|----------|-----|-----|
| Development | Local dev | Local or dev project | localhost:4000 | localhost:3000 |
| Test | CI tests | Dedicated test project | In-memory / test | - |
| Staging | Pre-prod review | Staging project | Railway staging | Vercel preview |
| Production | Live users | Production project | Railway prod | Vercel prod |

### 4.2 Secret Management

| Secret Type | Storage | Access |
|------------|---------|--------|
| Supabase keys | GitHub Secrets + Vercel Env | CI + Deploy |
| API keys (Twilio, Resend, etc.) | GitHub Secrets + Railway Env | CI + Deploy |
| Database URL | GitHub Secrets + Railway Env | CI + Deploy |
| Platform admin credentials | GitHub Secrets | Seed script only |
| License signing key | Railway Env | API server only |

---

## 5. Infrastructure Setup Checklist

### 5.1 Supabase Setup

- [ ] Create Supabase project (region: ap-south-1 Mumbai)
- [ ] Enable Row-Level Security globally
- [ ] Configure Auth: Email/Password + Phone OTP
- [ ] Set JWT expiry to 1 hour
- [ ] Create Storage buckets: `documents`, `pod-photos`, `invoice-pdfs`, `profile-images`
- [ ] Save `service_role` key and `anon` key
- [ ] Configure auth redirect URLs

### 5.2 Vercel Setup

- [ ] Connect GitHub repo
- [ ] Set root directory: `apps/web`
- [ ] Add all `NEXT_PUBLIC_*` env vars
- [ ] Configure custom domain: `app.freightflowpro.com`
- [ ] Enable automatic previews on PRs
- [ ] Set framework preset: Next.js

### 5.3 Railway Setup

- [ ] Create project linked to GitHub
- [ ] Set root directory: `apps/api`
- [ ] Add all API env vars
- [ ] Configure custom domain: `api.freightflowpro.com`
- [ ] Set start command: `node dist/index.js`
- [ ] Configure health check: `/v1/health`

### 5.4 Upstash Redis Setup

- [ ] Create Redis database (region: ap-south-1)
- [ ] Save REST URL and REST token
- [ ] Configure for BullMQ + rate limiting

### 5.5 Monitoring Setup

- [ ] Sentry project for error tracking
- [ ] PostHog project for analytics
- [ ] Logtail/Better Stack for centralized logging
- [ ] Uptime monitoring (Better Stack / UptimeRobot)

---

## 6. Monitoring & Observability

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| Sentry | Error tracking + performance | 5K errors/month |
| PostHog | Product analytics + feature flags | 1M events/month |
| Logtail | Centralized logs | 1 GB/month |
| UptimeRobot | Uptime monitoring | 50 monitors free |
| Vercel Analytics | Web vitals | Built-in free |

---

## 7. Rollback Strategy

| Scenario | Action |
|----------|--------|
| Web deploy broken | Vercel instant rollback to previous deployment |
| API deploy broken | Railway rollback to previous deploy |
| DB migration failed | Prisma migrate down (manual rollback script) |
| Critical bug in prod | Revert merge commit → auto-deploys previous state |

---

## 8. Performance Targets

| Metric | Target | Tool |
|--------|--------|------|
| Web LCP | < 2.5s | Vercel Analytics |
| API p95 latency | < 200ms | Sentry Performance |
| API p99 latency | < 500ms | Sentry Performance |
| DB query p95 | < 50ms | Supabase Dashboard |
| Uptime | 99.9% | UptimeRobot |
| Error rate | < 0.1% | Sentry |
