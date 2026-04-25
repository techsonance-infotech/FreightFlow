import React from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';

export default function ComplianceHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Tax & Compliance Hub</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Automated GST, TDS, and statutory reporting</p>
      </div>

      <ModuleGrid>
        <ModuleCard 
          title="GSTR-1 Preparation" 
          description="Outward supply reporting and JSON generation" 
          icon="📊" 
          path="/dashboard/compliance/gst/gstr1" 
          color="#1565C0" 
        />
        <ModuleCard 
          title="e-Invoice Management" 
          description="IRN generation and QR code tracking" 
          icon="🧾" 
          path="/dashboard/compliance/gst/einvoice" 
          color="#1E88E5" 
        />
        <ModuleCard 
          title="TDS Management" 
          description="Quarterly deductions, Form 26Q and challans" 
          icon="✂️" 
          path="/dashboard/compliance/tds" 
          color="#C62828" 
        />
      </ModuleGrid>
    </div>
  );
}
