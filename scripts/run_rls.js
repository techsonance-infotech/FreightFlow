const { Client } = require('pg');
require('dotenv').config({ path: '../../.env' });

async function runMigration() {
  const connectionString = process.env.DIRECT_URL;
  const parsedUrl = new URL(connectionString);
  const decodedPassword = decodeURIComponent(parsedUrl.password);
  
  const client = new Client({
    host: parsedUrl.hostname,
    port: parsedUrl.port,
    database: parsedUrl.pathname.replace('/', ''),
    user: parsedUrl.username,
    password: decodedPassword,
    ssl: { rejectUnauthorized: false }
  });

  const sql = `
    CREATE POLICY "tenant_isolation_policy_order_details" ON "order_details" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_pallet_details" ON "pallet_details" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_pallet_consignee_details" ON "pallet_consignee_details" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_lr_status_log" ON "lr_status_log" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_pod_records" ON "pod_records" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_trip_orders" ON "trip_orders" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_trip_expenses" ON "trip_expenses" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_trip_settlements" ON "trip_settlements" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_journal_lines" ON "journal_lines" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_bank_transactions" ON "bank_transactions" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_salary_structures" ON "salary_structures" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_payroll_lines" ON "payroll_lines" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_vehicle_documents" ON "vehicle_documents" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_maintenance_jobs" ON "maintenance_jobs" FOR ALL USING (check_company_tenant(company_id));
    CREATE POLICY "tenant_isolation_policy_fuel_entries" ON "fuel_entries" FOR ALL USING (check_company_tenant(company_id));
  `;

  try {
    await client.connect();
    console.log('Executing new RLS policies...');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.end();
  }
}

runMigration();
