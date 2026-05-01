import React from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';

export default function MastersHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Master Registry</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage core entities, stakeholders, and product catalogs</p>
      </div>

      <ModuleGrid>
        <ModuleCard 
          title="Vehicle Registry" 
          description="Manage your fleet, technical specs and ownership" 
          icon="🚚" 
          path="/dashboard/masters/vehicles" 
          color="#1E88E5" 
        />
        <ModuleCard 
          title="Driver Directory" 
          description="Driver profiles, DL details and assignments" 
          icon="👷" 
          path="/dashboard/masters/drivers" 
          color="#2E7D32" 
        />
        <ModuleCard 
          title="Dealer Management" 
          description="Customer accounts, billing terms and TDS" 
          icon="🏢" 
          path="/dashboard/masters/dealers" 
          color="#F57F17" 
        />
        <ModuleCard 
          title="Consignors" 
          description="Dispatch points and loading locations" 
          icon="📤" 
          path="/dashboard/masters/consignors" 
          color="#C62828" 
        />
        <ModuleCard 
          title="Consignees" 
          description="Delivery points and unloading restrictions" 
          icon="👥" 
          path="/dashboard/masters/consignees" 
          color="#673AB7" 
        />
        <ModuleCard 
          title="Product Catalog" 
          description="Item codes, HSN and GST rates" 
          icon="📦" 
          path="/dashboard/masters/products" 
          color="#00ACC1" 
        />
        <ModuleCard 
          title="Labour Registry" 
          description="Track loaders, cleaners and support staff" 
          icon="👷" 
          path="/dashboard/masters/labour" 
          color="#546E7A" 
        />
        <ModuleCard 
          title="Employee Master" 
          description="HR records, salary structures and docs" 
          icon="👥" 
          path="/dashboard/masters/employees" 
          color="#3949AB" 
        />
      </ModuleGrid>
    </div>
  );
}
