import React from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';

export default function ReportsHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Intelligence & BI</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Operational analytics and financial performance reporting</p>
      </div>

      <ModuleGrid>
        <ModuleCard 
          title="Transport Analytics" 
          description="Trip efficiency, route profitability and fleet stats" 
          icon="🚛" 
          path="/dashboard/reports/transport" 
          color="#1565C0" 
        />
        <ModuleCard 
          title="Financial Reports" 
          description="P&L, Balance Sheet, Ageing and GST Registers" 
          icon="💰" 
          path="/dashboard/reports/financial" 
          color="#2E7D32" 
        />
        <ModuleCard 
          title="LR Register" 
          description="Detailed log of all Lorry Receipts generated" 
          icon="📋" 
          path="/api/v1/reports/lr-register" 
          color="#E65100" 
        />
      </ModuleGrid>

      {/* BI Section */}
      <div className="pt-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Advanced BI Features Coming Soon</h3>
            <p className="text-slate-400 text-sm max-w-lg font-medium">
              We are building interactive dashboards for route optimization, fuel anomaly detection, and predictive maintenance scheduling.
            </p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10 rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0">
             <span className="text-[120px]">📈</span>
          </div>
        </div>
      </div>
    </div>
  );
}
