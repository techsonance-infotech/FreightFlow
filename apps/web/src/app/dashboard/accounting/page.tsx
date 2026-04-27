import React from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';

export default function AccountingHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Accounting Control Center</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage your ledgers, receivables, payables and reconciliation</p>
      </div>

      <ModuleGrid>
        <ModuleCard 
          title="Chart of Accounts" 
          description="Manage your GL structure, groups and accounts" 
          icon="🗂️" 
          path="/dashboard/accounting/coa" 
          color="#1565C0" 
        />
        <ModuleCard 
          title="Journal Vouchers" 
          description="Create and review double-entry journal entries" 
          icon="📝" 
          path="/dashboard/accounting/vouchers" 
          color="#1E88E5" 
        />
        <ModuleCard 
          title="Accounts Receivable" 
          description="Track customer dues, ageing and collections" 
          icon="📥" 
          path="/dashboard/accounting/ar" 
          color="#2E7D32" 
        />
        <ModuleCard 
          title="Accounts Payable" 
          description="Manage vendor bills, payments and TDS" 
          icon="📤" 
          path="/dashboard/accounting/ap" 
          color="#E65100" 
        />
        <ModuleCard 
          title="Bank Reconciliation" 
          description="Auto-match bank statements with system ledgers" 
          icon="🏦" 
          path="/dashboard/accounting/bank" 
          color="#0277BD" 
        />
      </ModuleGrid>
    </div>
  );
}
