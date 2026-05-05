'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, Smartphone, LogOut, 
  History, AlertTriangle, CheckCircle2, Loader2,
  ChevronRight, Laptop, Tablet, Smartphone as MobileIcon,
  Globe, ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { updatePassword, toggle2FA } from '@/app/actions/settings/security';

export function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await updatePassword(formData);
      if (res.success) {
        toast.success('Password updated successfully');
        (e.target as HTMLFormElement).reset();
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="divide-y divide-slate-100">
      {/* 1. Password Section */}
      <div className="p-8 lg:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Lock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Security Credentials</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Update your access password</p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="max-w-2xl space-y-6">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Password</label>
              <input 
                name="currentPassword" 
                type="password" 
                required 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
                <input 
                  name="newPassword" 
                  type="password" 
                  required 
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm New Password</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  required 
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            Update Password
          </button>
        </form>
      </div>

      {/* 2. Two-Factor Authentication */}
      <div className="p-8 lg:p-12 bg-slate-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
              <Smartphone className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Two-Factor Authentication</h2>
              <p className="text-sm text-slate-500 max-w-md mt-1">Add an extra layer of security to your account by requiring a code from your phone to log in.</p>
            </div>
          </div>
          <button 
            onClick={() => setIs2FAEnabled(!is2FAEnabled)}
            className={cn(
              "px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border",
              is2FAEnabled 
                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                : "bg-white text-slate-900 border-slate-200 hover:border-slate-300 shadow-sm"
            )}
          >
            {is2FAEnabled ? 'Enabled' : 'Enable 2FA'}
          </button>
        </div>
      </div>

      {/* 3. Active Sessions */}
      <div className="p-8 lg:p-12">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <History className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Device Sessions</h2>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Active log-ins on your account</p>
            </div>
          </div>
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 hover:text-rose-600">Sign Out All Devices</button>
        </div>

        <div className="space-y-4">
          <SessionCard 
            device="MacBook Pro" 
            browser="Chrome on macOS" 
            location="Surat, India" 
            ip="103.155.22.1" 
            isCurrent 
            icon={<Laptop />} 
          />
          <SessionCard 
            device="iPhone 15" 
            browser="Safari on iOS" 
            location="Mumbai, India" 
            ip="103.122.45.18" 
            icon={<MobileIcon />} 
          />
        </div>
      </div>

      {/* 4. Danger Zone */}
      <div className="p-8 lg:p-12 bg-rose-50/20">
        <div className="p-8 rounded-[2rem] border-2 border-dashed border-rose-100 bg-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                <ShieldAlert className="h-6 w-6 text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Delete Account</h2>
                <p className="text-sm text-slate-500 max-w-md mt-1">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
            </div>
            <button className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all">
              Delete Forever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SessionCard({ device, browser, location, ip, isCurrent, icon }: any) {
  return (
    <div className={cn(
      "flex items-center justify-between p-6 rounded-2xl border transition-all",
      isCurrent ? "bg-slate-50 border-slate-200" : "bg-white border-slate-100"
    )}>
      <div className="flex items-center gap-5">
        <div className={cn(
          "h-12 w-12 rounded-xl flex items-center justify-center",
          isCurrent ? "bg-white text-blue-600 shadow-sm" : "bg-slate-50 text-slate-400"
        )}>
          {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-5 w-5' })}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black text-slate-900">{device}</h4>
            {isCurrent && <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-tighter">Current</span>}
          </div>
          <p className="text-xs text-slate-400 font-bold mt-0.5">{browser} • {location}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{ip}</p>
        <button className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-widest mt-1">Revoke Access</button>
      </div>
    </div>
  );
}
