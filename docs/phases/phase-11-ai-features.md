# Phase 11 — AI Features & Automation

> **Duration**: 10-14 days | **Goal**: AI-powered insights, anomaly detection, document OCR, NLP query

---

## Overview

AI-powered features: vendor invoice OCR (auto-entry), fuel/expense anomaly detection, natural language report queries, smart alerts with cash flow forecasting, and debtor risk scoring.

---

## Database Tasks

### D11.1 — AI Tables
```sql
-- ai_query_log
id UUID PK, user_id UUID FK, query TEXT,
intent VARCHAR(50), sql_generated TEXT,
result_summary TEXT, feedback VARCHAR(10), -- helpful|not_helpful
created_at

-- anomaly_log
id UUID PK, company_id UUID FK, entity_type VARCHAR(50),
entity_id UUID, metric VARCHAR(50), expected_value DECIMAL,
actual_value DECIMAL, deviation_pct DECIMAL,
severity VARCHAR(10), -- low|medium|high
status VARCHAR(20), -- flagged|reviewed|legitimate|fraudulent
reviewed_by UUID, reviewed_at, created_at

-- ocr_extractions
id UUID PK, company_id UUID FK, source_file_url TEXT,
extraction_type VARCHAR(20), -- vendor_invoice|lr_scan
extracted_data JSONB, confidence_score DECIMAL,
verified BOOLEAN DEFAULT false, verified_by UUID,
target_record_id UUID, created_at
```

---

## Frontend Tasks

### F11.1 — AI Chat Widget (`/dashboard/ai`)
- Floating chat button on dashboard
- Input: "What was my best performing vehicle last month?"
- Response: formatted table/chart with data
- Multi-turn context: "Now show me only Gujarat routes"
- Query suggestions for first-time users
- Feedback: thumbs up/down on responses

### F11.2 — Document OCR Screen (`/dashboard/ai/ocr`)
- Upload vendor invoice image/PDF
- Processing indicator
- Extracted fields preview: vendor name, GSTIN, invoice no, date, line items, taxes
- Side-by-side: original document + pre-filled form
- User reviews, corrects, and confirms → creates AP invoice entry

### F11.3 — Anomaly Dashboard (`/dashboard/ai/anomalies`)
- Anomaly feed: list of flagged entries sorted by severity
- Each entry: entity type, metric, expected vs actual, deviation %
- Actions: Mark as Legitimate / Mark as Fraudulent
- Filter by severity, entity type, date range

### F11.4 — Smart Alerts Panel
- AI-ranked alert priority (urgency score)
- Cash flow forecast: 30-day projected receivables vs payables chart
- Deficit alert if projected negative cash flow
- Debtor risk flags: customers with late payment patterns

---

## Backend Tasks

### B11.1 — AI Service
```ts
class AIService {
  async processNLQuery(query, context): NLQueryResult
  // → Strip PII → send to OpenAI → parse intent → generate SQL
  // → Execute query → format result → re-inject context

  async extractInvoiceData(fileUrl): OCRResult
  // → Send to OpenAI Vision (gpt-4o-mini)
  // → Extract: vendor, GSTIN, invoice_no, date, items, taxes
  // → Return structured data with confidence scores

  async detectAnomalies(companyId): Anomaly[]
  // → Calculate baselines per vehicle (avg KMPL, toll/km, repair freq)
  // → Flag entries > 2 standard deviations from baseline

  async forecastCashFlow(companyId, days): CashFlowForecast
  // → Project receivables (based on ageing patterns)
  // → Project payables (based on due dates)
  // → Alert if projected deficit
}
```

### B11.2 — Rate Limiting
- Max 100 AI API calls per tenant per day (Starter plan)
- Higher limits for Growth/Enterprise plans
- Track in `tenant_usage` table

### B11.3 — PII Stripping
- Before any OpenAI call: replace names, GSTINs, PANs with tokens
- After response: re-inject original values
- Never send raw PII to external APIs

### B11.4 — Anomaly Detection Job (BullMQ)
- Weekly cron: recalculate baselines, scan for new anomalies
- Insert into anomaly_log
- Send summary notification to admin

---

## Testing & Acceptance

| Criteria | Pass Condition |
|----------|---------------|
| NL query works | "Top 5 customers by revenue" returns correct data |
| OCR extracts correctly | Vendor invoice fields extracted with > 80% accuracy |
| Anomaly detection | Flags KMPL drop > 20% correctly |
| PII stripped | No raw names/GSTINs sent to OpenAI |
| Rate limiting | Returns 429 after exceeding daily AI quota |
| Cash flow forecast | Projects 30-day receivables vs payables |
