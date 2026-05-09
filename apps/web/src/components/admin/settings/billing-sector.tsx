'use client';

import React, { useState } from 'react';
import { Save, CreditCard, Users, Clock, Zap, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updatePlatformSetting } from '@/app/actions/admin/platform-config';

export function BillingSector({ config }: { config: any }) {
  const [data, setData] = useState({
    trialPeriod: config.TRIAL_PERIOD || 14,
    defaultNodes: config.DEFAULT_NODES || 5,
    licenseRenewalDiscount: config.LICENSE_DISCOUNT || 10,
    currencyCode: config.CURRENCY_CODE || 'USD'
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updatePlatformSetting('TRIAL_PERIOD', data.trialPeriod),
        updatePlatformSetting('DEFAULT_NODES', data.defaultNodes),
        updatePlatformSetting('LICENSE_DISCOUNT', data.licenseRenewalDiscount),
        updatePlatformSetting('CURRENCY_CODE', data.currencyCode)
      ]);
      toast.success('Billing matrix updated');
    } catch (error) {
      toast.error('Failed to commit billing changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-6 mb-16 border-b border-slate-50 pb-10">
          <div className="h-16 w-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-emerald-500/20 rotate-6">
            <CreditCard className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Monetization Matrix</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">SaaS Revenue & Resource Constants</p>
          </div>
        </div>

        <div className="space-y-12">
          <ConfigItem 
            label="Trial Period Node" 
            description="The default duration (in days) granted to new tenant organizations for feature evaluation."
            icon={<Clock className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-6">
              <input 
                type="number"
                value={data.trialPeriod}
                onChange={(e) => setData({...data, trialPeriod: parseInt(e.target.value)})}
                className="h-16 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calendar Days</span>
            </div>
          </ConfigItem>

          <ConfigItem 
            label="Base User Capacity" 
            description="Maximum active user nodes allowed for newly initialized Trial/Starter workspaces."
            icon={<Users className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-6">
              <input 
                type="number"
                value={data.defaultNodes}
                onChange={(e) => setData({...data, defaultNodes: parseInt(e.target.value)})}
                className="h-16 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Licenses</span>
            </div>
          </ConfigItem>

          <ConfigItem 
            label="Renewal Incentive" 
            description="Standard percentage discount applied to license renewals triggered before expiration."
            icon={<Percent className="h-4 w-4 text-slate-400" />}
          >
             <div className="flex items-center gap-6">
              <input 
                type="number"
                value={data.licenseRenewalDiscount}
                onChange={(e) => setData({...data, licenseRenewalDiscount: parseInt(e.target.value)})}
                className="h-16 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-emerald-600/10 focus:border-emerald-600 transition-all outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Percent (%)</span>
            </div>
          </ConfigItem>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-50 flex justify-end gap-6">
           <Button 
            disabled={loading}
            onClick={handleSave}
            className="h-16 px-12 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
          >
            {loading ? <Zap className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Commit Fiscal Protocol
          </Button>
        </div>
      </div>
    </div>
  );
}

function ConfigItem({ label, description, icon, children }: any) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
      <div>
        <div className="flex items-center gap-3 mb-3">
          {icon}
          <h4 className="text-lg font-black text-slate-900 tracking-tight">{label}</h4>
        </div>
        <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-md">{description}</p>
      </div>
      <div className="flex justify-start lg:justify-end">
        <div className="w-full lg:max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
