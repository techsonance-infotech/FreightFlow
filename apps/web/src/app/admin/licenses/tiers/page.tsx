import React from 'react';
import { 
  Shield, Building2, Truck, 
  Users, Zap, CheckCircle2,
  ArrowLeft, Save, Info,
  Settings, Layout, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function TierMatrixPage() {
  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link href="/admin/licenses" className="h-14 w-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Governance DNA</h1>
            <p className="text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] mt-1 ml-1">
              Platform-Wide Resource Constraint Matrix
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button className="h-14 px-10 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 transition-all">
            <Save className="h-4 w-4" />
            Commit Matrix Changes
          </Button>
        </div>
      </div>

      {/* Tier Matrix Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <TierConfigCard 
          tier="Starter" 
          price="₹1,999/mo"
          description="Designed for small, single-fleet owners entering digital logistics."
          constraints={[
            { icon: <Building2 />, label: "Max Businesses", value: "1" },
            { icon: <Truck />, label: "Max Fleet Size", value: "5 Vehicles" },
            { icon: <Users />, label: "User Nodes", value: "2 Admins" },
          ]}
          modules={["Fleet Management", "Basic Logistics", "HR Essentials"]}
          color="blue"
        />
        
        <TierConfigCard 
          tier="Pro" 
          price="₹4,999/mo"
          description="Enterprise-grade features for multi-fleet transport operators."
          active
          constraints={[
            { icon: <Building2 />, label: "Max Businesses", value: "3" },
            { icon: <Truck />, label: "Max Fleet Size", value: "25 Vehicles" },
            { icon: <Users />, label: "User Nodes", value: "10 Admins" },
          ]}
          modules={["Core Accounting", "Maintenance Hub", "Fuel Analytics", "Client Portal"]}
          color="indigo"
        />

        <TierConfigCard 
          tier="Enterprise" 
          price="Custom"
          description="Full-scale supply chain governance for large logistics groups."
          constraints={[
            { icon: <Building2 />, label: "Max Businesses", value: "Unlimited" },
            { icon: <Truck />, label: "Max Fleet Size", value: "Unlimited" },
            { icon: <Users />, label: "User Nodes", value: "Unlimited" },
          ]}
          modules={["Advanced MIS", "Predictive Analytics", "Custom Integration", "Priority Support"]}
          color="slate"
        />
      </div>

      {/* Global Constraint Policy */}
      <div className="bg-white border border-slate-100 rounded-[3rem] p-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50 rounded-full blur-[120px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-4 mb-10">
          <div className="h-12 w-12 bg-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
            <Settings className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Global Governance Policies</h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cross-Tier Enforcement Logic</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <PolicyItem 
            label="Grace Period Duration" 
            description="Days allowed for platform access after license expiry before node locking."
            defaultValue="7 Days"
          />
          <PolicyItem 
            label="Multi-Business Aggregation" 
            description="Allow cross-business resource sharing within the same tenant workspace."
            defaultValue="Enabled"
            isToggle
          />
          <PolicyItem 
            label="Audit Log Persistence" 
            description="Minimum duration (days) for maintaining immutable platform logs."
            defaultValue="365 Days"
          />
          <PolicyItem 
            label="Emergency Kill-Switch" 
            description="Allow Super Admins to instantly revoke all active nodes for a tenant."
            defaultValue="Enabled"
            isToggle
          />
        </div>
      </div>
    </div>
  );
}

function TierConfigCard({ tier, price, description, constraints, modules, color, active }: any) {
  const colors: any = {
    blue: 'border-blue-100 bg-blue-50/30',
    indigo: 'border-indigo-100 bg-indigo-50/30 ring-2 ring-indigo-600 ring-offset-8 ring-offset-slate-50',
    slate: 'border-slate-200 bg-slate-50/50',
  };

  const textColors: any = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    slate: 'text-slate-900',
  };

  return (
    <div className={`rounded-[3rem] p-12 border transition-all hover:shadow-2xl shadow-sm ${colors[color]}`}>
      <div className="flex items-center justify-between mb-8">
        <h3 className={`text-3xl font-black tracking-tighter ${textColors[color]}`}>{tier}</h3>
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{price}</span>
      </div>
      
      <p className="text-xs font-bold text-slate-500 leading-relaxed mb-10">
        {description}
      </p>

      <div className="space-y-6 mb-12">
        {constraints.map((c: any, i: number) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center opacity-70 ${textColors[color]}`}>
                {React.cloneElement(c.icon, { size: 18 })}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{c.label}</span>
            </div>
            <span className="text-[11px] font-black text-slate-900">{c.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Unlocked Modules</p>
        {modules.map((m: string, i: number) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className={`h-4 w-4 ${textColors[color]}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{m}</span>
          </div>
        ))}
      </div>

      <button className={`w-full mt-12 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
        active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 'bg-white border border-slate-100 text-slate-400 hover:border-slate-900 hover:text-slate-900'
      }`}>
        Edit Plan DNA
      </button>
    </div>
  );
}

function PolicyItem({ label, description, defaultValue, isToggle }: any) {
  return (
    <div className="flex items-start justify-between gap-12 group">
      <div className="max-w-xs">
        <h4 className="text-base font-black text-slate-900 tracking-tight group-hover:text-amber-600 transition-colors">{label}</h4>
        <p className="text-xs font-bold text-slate-400 mt-2 leading-relaxed">{description}</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {isToggle ? (
          <div className="h-8 w-14 bg-emerald-500 rounded-full p-1 flex justify-end shadow-inner cursor-pointer">
            <div className="h-6 w-6 bg-white rounded-full shadow-sm" />
          </div>
        ) : (
          <input 
            defaultValue={defaultValue}
            className="h-12 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-xl px-4 font-black text-xs text-center focus:ring-0 focus:border-amber-600 transition-all outline-none"
          />
        )}
      </div>
    </div>
  );
}
