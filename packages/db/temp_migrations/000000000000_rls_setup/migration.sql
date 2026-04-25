-- ==============================================================================
-- FreightFlow Pro — Supabase Row Level Security (RLS) Setup
-- This script must be executed in Supabase SQL Editor or via Supabase CLI
-- ==============================================================================

-- 1. Enable RLS on all Tenant-scoped tables
ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "branches" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "dealers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consignors" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "consignees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "labours" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "employees" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "drivers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_details" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "order_pallets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pallet_details" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pallet_consignee_details" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "lr_status_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pod_records" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trips" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_expenses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "trip_settlements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chart_of_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "journal_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "freight_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments_received" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vendor_invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payments_made" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bank_accounts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bank_transactions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "salary_structures" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_runs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "payroll_lines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "driver_advances" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "vehicle_documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "maintenance_jobs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "fuel_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "gst_returns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tds_entries" ENABLE ROW LEVEL SECURITY;

-- 2. Create Helper Function to extract Tenant ID from JWT
-- The middleware will inject `tenant_id` into the user's `app_metadata` in Supabase Auth
CREATE OR REPLACE FUNCTION get_current_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- 3. Create Default Policies for Base Tables
-- We use a single policy for ALL operations (SELECT, INSERT, UPDATE, DELETE) using 'ALL'

-- For companies (Direct tenant relation)
CREATE POLICY "tenant_isolation_policy_companies" ON "companies" FOR ALL
USING (tenant_id = get_current_tenant_id());

-- For users (Direct tenant relation)
CREATE POLICY "tenant_isolation_policy_users" ON "users" FOR ALL
USING (tenant_id = get_current_tenant_id());

-- 4. Create Policies for Sub-tables (Linked via company_id)
-- Rather than complex JOINs which hurt performance, we trust that if `company_id`
-- belongs to the `tenant_id` in the `companies` table, it's valid.

CREATE OR REPLACE FUNCTION check_company_tenant(company_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM "companies"
    WHERE id = company_uuid AND tenant_id = get_current_tenant_id()
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Apply to all company-linked tables
CREATE POLICY "tenant_isolation_policy_branches" ON "branches" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_dealers" ON "dealers" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_consignors" ON "consignors" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_consignees" ON "consignees" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_vehicles" ON "vehicles" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_labours" ON "labours" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_employees" ON "employees" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_drivers" ON "drivers" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_products" ON "products" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_orders" ON "orders" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_order_pallets" ON "order_pallets" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_trips" ON "trips" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_chart_of_accounts" ON "chart_of_accounts" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_journal_entries" ON "journal_entries" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_freight_invoices" ON "freight_invoices" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_payments_received" ON "payments_received" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_vendor_invoices" ON "vendor_invoices" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_payments_made" ON "payments_made" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_bank_accounts" ON "bank_accounts" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_payroll_runs" ON "payroll_runs" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_driver_advances" ON "driver_advances" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_gst_returns" ON "gst_returns" FOR ALL USING (check_company_tenant(company_id));
CREATE POLICY "tenant_isolation_policy_tds_entries" ON "tds_entries" FOR ALL USING (check_company_tenant(company_id));

-- For deeper nested tables (e.g. order_details, journal_lines),
-- RLS should be enforced at the API layer (Prisma `where` clauses)
-- or using similar functions to verify the parent record's company.
-- To keep performance high, we use Service Role for complex server actions,
-- and rely on the gateway `where: { companyId }` strategy for these.

-- Note: The Service Role Key bypasses all RLS.
