'use client';

import React from 'react';
import { 
  Zap, Package, Calendar, 
  CheckCircle2, AlertCircle,
  Clock, Users, Truck, Blocks,
  Crown, Sparkles, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface BillingData {
  plan: string;
  status: string;
  licenseExpiresAt: string | null;
  createdAt: string | null;
  usage: {
    users: number;
    maxUsers: number;
    vehicles: number;
    maxVehicles: number;
    modules: number;
    totalModules: number;
  };
}

const PLAN_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode; gradient: string }> = {
  trial: { label: 'Free Trial', color: 'text-amber-600', icon: <Clock className="h-8 w-8" />, gradient: 'from-amber-500 to-orange-600' },
  starter: { label: 'Starter', color: 'text-blue-600', icon: <Sparkles className="h-8 w-8" />, gradient: 'from-blue-500 to-blue-700' },
  pro: { label: 'Professional', color: 'text-indigo-600', icon: <Crown className="h-8 w-8" />, gradient: 'from-indigo-500 to-purple-700' },
  enterprise: { label: 'Enterprise', color: 'text-slate-900', icon: <Shield className="h-8 w-8" />, gradient: 'from-slate-700 to-slate-900' },
};

export function BillingDashboard({ data }: { data: BillingData }) {
  const planInfo = PLAN_CONFIG[data.plan] || PLAN_CONFIG.starter;
  const isExpired = data.licenseExpiresAt && new Date(data.licenseExpiresAt) < new Date();
  const isTrial = data.plan === 'trial';

  return (
    <div className="divide-y divide-slate-100">
      {/* 1. Plan Overview */}
      <div className="p-8 lg:p-12">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div className="flex items-start gap-6">
            <div className={cn(
              "h-20 w-20 rounded-3xl bg-gradient-to-br flex items-center justify-center text-white shadow-2xl shrink-0",
              planInfo.gradient
            )}>
              {planInfo.icon}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{planInfo.label}</h2>
                {isExpired ? (
                  <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Expired
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2 flex-wrap">
                {data.licenseExpiresAt && (
                  <p className="text-sm text-slate-500 font-bold flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-300" />
                    {isExpired ? 'Expired' : 'Renews'}{' '}
                    <span className={cn("underline decoration-2", isExpired ? "text-rose-600 decoration-rose-300" : "text-slate-900 decoration-blue-500/30")}>
                      {format(new Date(data.licenseExpiresAt), 'dd MMM yyyy')}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({formatDistanceToNow(new Date(data.licenseExpiresAt), { addSuffix: true })})
                    </span>
                  </p>
                )}
                {data.createdAt && (
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    Member since {format(new Date(data.createdAt), 'MMM yyyy')}
                  </p>
                )}
              </div>
            </div>
          </div>
          {isTrial && (
            <button className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-105 transition-all shrink-0">
              <Zap className="h-4 w-4 fill-current" />
              Upgrade Now
            </button>
          )}
        </div>

        {/* Usage Stats from Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <UsageMetric 
            label="Admin Seats" 
            used={data.usage.users} 
            total={data.usage.maxUsers} 
            sub="Active staff accounts" 
            color="bg-blue-600"
            icon={<Users className="h-5 w-5" />}
          />
          <UsageMetric 
            label="Fleet Capacity" 
            used={data.usage.vehicles} 
            total={data.usage.maxVehicles} 
            sub="Registered vehicles" 
            color="bg-indigo-600"
            icon={<Truck className="h-5 w-5" />}
          />
          <UsageMetric 
            label="Active Modules" 
            used={data.usage.modules} 
            total={data.usage.totalModules} 
            sub="Licensed features" 
            color="bg-amber-500"
            icon={<Blocks className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* 2. Plan Features */}
      <div className="p-8 lg:p-12 bg-slate-50/30">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
            <Package className="h-6 w-6 text-slate-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">What&apos;s Included</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Features available in your current plan</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: 'LR / Order Management', included: true },
            { name: 'Pallet Tracking', included: true },
            { name: 'Trip Management', included: true },
            { name: 'Core Accounting', included: data.plan !== 'trial' },
            { name: 'Fleet Management', included: data.plan === 'pro' || data.plan === 'enterprise' },
            { name: 'HR & Payroll', included: data.plan === 'pro' || data.plan === 'enterprise' },
            { name: 'AI Analytics', included: data.plan === 'enterprise' },
            { name: 'Custom Branding', included: data.plan !== 'trial' },
            { name: 'Priority Support', included: data.plan === 'enterprise' },
          ].map((feature) => (
            <div key={feature.name} className={cn(
              "flex items-center gap-3 p-4 rounded-2xl border transition-all",
              feature.included 
                ? "bg-white border-emerald-100" 
                : "bg-slate-50 border-slate-100 opacity-50"
            )}>
              {feature.included 
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : <AlertCircle className="h-4 w-4 text-slate-300 shrink-0" />
              }
              <span className={cn("text-sm font-bold", feature.included ? "text-slate-700" : "text-slate-400 line-through")}>
                {feature.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Contact for Billing */}
      <div className="p-8 lg:p-12">
        <div className="p-8 rounded-[2rem] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 opacity-5 translate-x-1/4 -translate-y-1/4">
            <Zap className="h-64 w-64" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black tracking-tight">Need help with billing?</h3>
            <p className="text-sm font-medium text-slate-400 mt-2 max-w-md">
              For plan upgrades, custom pricing, or invoice queries, contact our support team.
            </p>
            <div className="flex flex-wrap gap-4 mt-6">
              <a 
                href="mailto:support@freightflow.pro" 
                className="px-6 py-3 bg-white/10 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
              >
                Email Support
              </a>
              <a 
                href="https://wa.me/919876543210" 
                target="_blank"
                className="px-6 py-3 bg-emerald-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-600/20"
              >
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UsageMetric({ label, used, total, sub, color, icon }: any) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isNearLimit = percentage >= 80;
  
  return (
    <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center text-white", color)}>
            {icon}
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        </div>
        <span className={cn(
          "text-lg font-black",
          isNearLimit ? "text-amber-600" : "text-slate-900"
        )}>
          {used}<span className="text-slate-300 text-sm font-bold">/{total}</span>
        </span>
      </div>
      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-1000",
            isNearLimit ? "bg-amber-500" : color
          )} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] font-bold text-slate-400">{sub}</p>
    </div>
  );
}
