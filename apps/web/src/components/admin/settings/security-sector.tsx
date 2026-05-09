'use client';

import React, { useState } from 'react';
import { Save, Shield, Lock, Eye, Zap, Key, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updatePlatformSetting } from '@/app/actions/admin/platform-config';

export function SecuritySector({ config }: { config: any }) {
  const [data, setData] = useState({
    mfaEnforced: config.MFA_ENFORCED || false,
    sessionTtl: config.SESSION_TTL || 24,
    maxLoginAttempts: config.MAX_LOGIN_ATTEMPTS || 5,
    auditRetention: config.AUDIT_RETENTION || 365
  });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await Promise.all([
        updatePlatformSetting('MFA_ENFORCED', data.mfaEnforced),
        updatePlatformSetting('SESSION_TTL', data.sessionTtl),
        updatePlatformSetting('MAX_LOGIN_ATTEMPTS', data.maxLoginAttempts),
        updatePlatformSetting('AUDIT_RETENTION', data.auditRetention)
      ]);
      toast.success('Security protocols locked');
    } catch (error) {
      toast.error('Failed to commit security changes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.02)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex items-center gap-6 mb-16 border-b border-slate-50 pb-10">
          <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 -rotate-6">
            <Shield className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Hardened Protocols</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Global Access & Authentication Governance</p>
          </div>
        </div>

        <div className="space-y-12">
          <ConfigItem 
            label="MFA Enforcement" 
            description="Require all administrative nodes to utilize Multi-Factor Authentication for platform access."
            icon={<Key className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-[1.25rem] border border-slate-100 w-fit">
              <button 
                onClick={() => setData({...data, mfaEnforced: false})}
                className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!data.mfaEnforced ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'}`}
              >
                Optional
              </button>
              <button 
                onClick={() => setData({...data, mfaEnforced: true})}
                className={`h-12 px-8 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${data.mfaEnforced ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
              >
                Enforced
              </button>
            </div>
          </ConfigItem>

          <ConfigItem 
            label="Session Persistence" 
            description="Maximum duration (in hours) an administrative session remains valid before re-authentication is required."
            icon={<Clock className="h-4 w-4 text-slate-400" />}
          >
            <div className="flex items-center gap-6">
              <input 
                type="number"
                value={data.sessionTtl}
                onChange={(e) => setData({...data, sessionTtl: parseInt(e.target.value)})}
                className="h-16 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-slate-600/10 focus:border-slate-900 transition-all outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Hours</span>
            </div>
          </ConfigItem>

          <ConfigItem 
            label="Audit Node Retention" 
            description="Duration (in days) that immutable audit logs are persisted in the high-speed observation registry."
            icon={<Eye className="h-4 w-4 text-slate-400" />}
          >
             <div className="flex items-center gap-6">
              <input 
                type="number"
                value={data.auditRetention}
                onChange={(e) => setData({...data, auditRetention: parseInt(e.target.value)})}
                className="h-16 w-32 bg-slate-50 border-slate-100 text-slate-900 rounded-[1.25rem] px-8 font-black text-sm focus:ring-2 focus:ring-slate-600/10 focus:border-slate-900 transition-all outline-none"
              />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Retention Days</span>
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
            Commit Security Protocol
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
