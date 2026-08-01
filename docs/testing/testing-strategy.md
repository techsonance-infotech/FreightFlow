# FreightFlow Pro — Testing Strategy Document

> **Unit**: Vitest | **Integration**: Supertest | **E2E**: Playwright | **Coverage Target**: 80%+

---

## 1. Testing Pyramid

```
         ╱╲          E2E Tests (Playwright)
        ╱  ╲         5 Critical Paths
       ╱────╲
      ╱      ╲       Integration Tests (Supertest + Supabase Test)
     ╱        ╲      Every API route
    ╱──────────╲
   ╱            ╲    Unit Tests (Vitest)
  ╱              ╲   Every calculation, service, utility
 ╱────────────────╲
```

---

## 2. Unit Tests (Vitest)

### 2.1 What to Unit Test

| Category | Examples | Priority |
|----------|---------|----------|
| **Financial Calculations** | GST computation, freight totals, payroll deductions, TDS amounts, trial balance | P0 — Critical |
| **Currency Utils** | Paise ↔ Rupee conversion, INR formatting | P0 |
| **Date Utils** | UTC ↔ IST conversion, fiscal year, DD/MM/YYYY formatting | P0 |
| **LR Number Generator** | Auto-increment logic, per-company sequencing | P0 |
| **License Validation** | HMAC verification, expiry check, grace period logic | P0 |
| **Zod Validators** | All entity schemas (order, dealer, consignee, etc.) | P1 |
| **KMPL Calculator** | Fuel efficiency computation, anomaly detection threshold | P1 |
| **Ageing Calculator** | AR/AP ageing buckets (0-30, 31-60, 61-90, 90+) | P1 |

### 2.2 Test File Pattern

```
packages/shared/
├── utils/
│   ├── currency.ts
│   ├── currency.test.ts      ← Co-located tests
│   ├── gst.ts
│   └── gst.test.ts

apps/api/
├── services/
│   ├── lr-engine.ts
│   ├── lr-engine.test.ts     ← Service unit tests
│   ├── accounting-engine.ts
│   └── accounting-engine.test.ts
```

### 2.3 Example: GST Calculation Test

```ts
describe('GSTEngine', () => {
  it('calculates CGST + SGST for intra-state', () => {
    const result = calculateGST({
      amount: 100000, // ₹1000.00 in paise
      originState: 'GJ',
      destState: 'GJ',
      gstRate: 5,
    });
    expect(result.cgst).toBe(2500);  // ₹25.00
    expect(result.sgst).toBe(2500);  // ₹25.00
    expect(result.igst).toBe(0);
    expect(result.total).toBe(105000);
  });

  it('calculates IGST for inter-state', () => {
    const result = calculateGST({
      amount: 100000,
      originState: 'GJ',
      destState: 'MH',
      gstRate: 5,
    });
    expect(result.cgst).toBe(0);
    expect(result.sgst).toBe(0);
    expect(result.igst).toBe(5000);  // ₹50.00
  });
});
```

---

## 3. Integration Tests (Supertest + Test Supabase)

### 3.1 Setup

- Dedicated **Supabase test project** (separate from dev/prod)
- Test database seeded before each test suite
- Cleaned up after each suite (transaction rollback or truncate)
- Test JWT tokens for different roles

### 3.2 What to Integration Test

| Route Group | Tests | Priority |
|------------|-------|----------|
| Auth | Login, OTP, refresh, MFA, invalid credentials | P0 |
| License | Validate, expired, grace period, over-limit | P0 |
| Module Check | Enabled → 200, disabled → 403 | P0 |
| RLS | Tenant A cannot see Tenant B data | P0 |
| Orders CRUD | Create, list, get, update, delete LR | P0 |
| Masters CRUD | Dealers, consignees, vehicles CRUD | P1 |
| Trips | Create, add expenses, settle | P1 |
| Accounting | Create voucher, DR=CR validation | P1 |
| Invoices | Create, payment, ageing | P1 |
| Payroll | Process payroll, payslip generation | P2 |
| GST | GSTR-1 preparation, e-Invoice | P2 |
| Reports | P&L, trial balance, LR register | P2 |

### 3.3 Example: Order API Test

```ts
describe('POST /v1/orders', () => {
  it('creates LR with auto-incremented number', async () => {
    const res = await request(app)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${tenantAToken}`)
      .send(validOrderPayload);

    expect(res.status).toBe(201);
    expect(res.body.data.lrNo).toBeDefined();
    expect(res.body.data.total).toBe(expectedTotalInPaise);
  });

  it('rejects if module disabled', async () => {
    // Disable mod_lr_management for tenant B
    const res = await request(app)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${tenantBToken}`)
      .send(validOrderPayload);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('MODULE_DISABLED');
  });

  it('enforces tenant isolation', async () => {
    // Tenant A creates order
    const createRes = await request(app)
      .post('/v1/orders')
      .set('Authorization', `Bearer ${tenantAToken}`)
      .send(validOrderPayload);

    // Tenant B cannot see it
    const getRes = await request(app)
      .get(`/v1/orders/${createRes.body.data.id}`)
      .set('Authorization', `Bearer ${tenantBToken}`);

    expect(getRes.status).toBe(404);
  });
});
```

---

## 4. E2E Tests (Playwright)

### 4.1 Five Critical Paths

| # | Path | Steps |
|---|------|-------|
| 1 | **Create LR** | Login → Dashboard → Create Order → Fill form → Save → Verify in list → Print PDF |
| 2 | **Generate Invoice** | Select LRs → Create invoice → Verify GST calc → Generate PDF → Verify GL entry |
| 3 | **Receive Payment** | Open invoice → Record payment → Verify balance update → Bank reconciliation |
| 4 | **Process Payroll** | HR → Select month → Run payroll → Verify deductions → Generate payslips |
| 5 | **File GSTR-1** | Compliance → Generate GSTR-1 → Review → Download JSON |

### 4.2 Additional E2E Flows

| Flow | Purpose |
|------|---------|
| Super admin creates tenant | Verify onboarding wizard |
| Module toggle | Disable module → verify 403 + hidden nav |
| License expiry | Set expired → verify read-only mode |
| Multi-company switch | Switch company → verify data isolation |
| Trip lifecycle | Create → dispatch → expenses → settle |

---

## 5. Test Commands

```bash
# Unit tests
pnpm test:unit                    # Run all unit tests
pnpm test:unit --watch            # Watch mode
pnpm test:unit --coverage         # With coverage report

# Integration tests
pnpm test:integration             # Run API integration tests
pnpm test:integration:orders      # Run only order tests

# E2E tests
pnpm test:e2e                     # Run all E2E tests
pnpm test:e2e --headed            # Run with browser visible
pnpm test:e2e --project=chromium  # Specific browser

# All tests
pnpm test                         # Unit + Integration
pnpm test:all                     # Unit + Integration + E2E

# Coverage
pnpm test:coverage                # Generate coverage report
```

---

## 6. CI Test Pipeline

```yaml
# .github/workflows/test.yml
on: [pull_request]

jobs:
  test:
    steps:
      - Checkout code
      - Install pnpm + dependencies
      - Run lint (ESLint + Prettier)
      - Run type check (tsc --noEmit)
      - Run unit tests (Vitest)
      - Run integration tests (with Supabase test project)
      - Run E2E tests (Playwright, on staging deploy)
      - Upload coverage report
      - Block merge if any test fails
```

---

## 7. Test Data Fixtures

### 7.1 Seed Data for Tests

| Entity | Count | Notes |
|--------|-------|-------|
| Tenants | 2 | Tenant A (active), Tenant B (expired) |
| Companies | 3 | 2 under Tenant A, 1 under Tenant B |
| Users | 6 | Admin, accountant, dispatcher per tenant |
| Dealers | 10 | 5 per company |
| Consignees | 15 | Mixed across companies |
| Vehicles | 8 | Various types and statuses |
| Orders (LR) | 50 | Various statuses |
| Invoices | 20 | Mix of paid, partial, overdue |
| Employees | 12 | Drivers, staff, various salary structures |
