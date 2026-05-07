'use client';

import React, { useState } from 'react';
import { Save, Globe, Palette, Image as ImageIcon, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updatePlatformSetting } from '@/app/actions/admin/platform-config';

export function BrandingSector({ config }: { config: any }) {
  const [data, setData] = useState({
    platformName: config.PLATFORM_NAME || 'FreightFlow Global',
    primaryColor: config.PRIMARY_COLOR || '#3b82f6',
    logoUrl: config.LOGO_URL || '',
    maintenanceMode: config.MAINTENANCE_MODE || false
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updatePlatformSetting('PLATFORM_NAME', data.platformName),
        updatePlatformSetting('PRIMARY_COLOR', data.primaryColor),
        updatePlatformSetting('LOGO_URL', data.logoUrl),
        updatePlatformSetting('MAINTENANCE_MODE', data.maintenanceMode)
      ]);
      toast.success('Branding protocol updated successfully');
    } catch (error) {
      toast.error('Failed to commit branding changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-6 mb-16 border-b border-slate-50 pb-10">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <Globe className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Identity Governance</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Platform-Wide Branding Nodes</p>
          </div>
        </div>

        <div className="space-y-12">
          <ConfigItem 
            label="Platform Identifier" 
            description="The global brand name displayed across all tenant gateways and system communications."
            icon={<Globe className="h-4 w-4 text-slate-400" />}
          >
            <input 
              value={data.platformName}
              onChange={(e) => setData({...data, platformName: e.target.value})}
              className="h-16 w-full bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all outline-none"
            />
          </ConfigItem>

          <ConfigItem 
            label="Strategic Palette" 
            description="The primary accent color used for buttons, links, and high-impact UI nodes."
            icon={<Palette className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-6">
              <input 
                type="color"
                value={data.primaryColor}
                onChange={(e) => setData({...data, primaryColor: e.target.value})}
                className="h-16 w-32 bg-slate-50 border-slate-100 rounded-[1.25rem] px-2 py-2 cursor-pointer outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{data.primaryColor}</span>
            </div>
          </ConfigItem>

          <ConfigItem 
            label="Maintenance Node" 
            description="Intercept all platform traffic and display a governance maintenance advisory."
            icon={<Zap className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[1.25rem] border border-slate-100 w-fit">
              <button 
                onClick={() => setData({...data, maintenanceMode: false})}
                className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!data.maintenanceMode ? 'bg-white shadow-md text-emerald-600' : 'text-slate-400'}`}
              >
                Live
              </button>
              <button 
                onClick={() => setData({...data, maintenanceMode: true})}
                className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.maintenanceMode ? 'bg-white shadow-md text-rose-600' : 'text-slate-400'}`}
              >
                Maintenance
              </button>
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
            Commit Identity Protocol
          </Button>
        </div>
      </div>

      {data.maintenanceMode && (
        <div className="bg-rose-50 border border-rose-100 rounded-[2.5rem] p-10 flex items-center gap-8 animate-pulse shadow-inner">
          <div className="h-14 w-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
            <AlertTriangle className="h-7 w-7" />
          </div>
          <div>
            <p className="text-sm font-black text-rose-900">Platform Lockdown Active</p>
            <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-1">Committing this will sever all active tenant sessions</p>
          </div>
        </div>
      )}
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
