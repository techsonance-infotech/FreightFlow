'use client';

import React, { useState } from 'react';
import { Lock, ShieldAlert, Key, MessageSquare, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { activateLicense } from '@/app/actions/license';

export function LicenseExpiredScreen({ error }: { error: string }) {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 10) {
      toast.error('Please enter a valid 16-character license key.');
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await activateLicense(code);
      if (result.success) {
        toast.success('License activated successfully! Refreshing...');
        setTimeout(() => window.location.reload(), 1500);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to activate license.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-50 z-[100] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
            <Lock className="h-10 w-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Access Locked</h1>
          <p className="mt-3 text-slate-500">
            {error || 'A valid license is required to access the system. If your trial or subscription has expired, please enter a valid product key below.'}
          </p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Product License Key
            </label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="FF-XXXX-XXXX-XXXX"
                className="pl-12 h-14 text-lg font-mono tracking-widest bg-slate-50 border-slate-200"
                maxLength={19}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || code.length < 10}
            className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-lg font-bold"
          >
            {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Activate License'}
          </Button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 mb-4 text-center">Need help?</h3>
          <div className="grid grid-cols-2 gap-3">
            <a 
              href="/dashboard/support"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              Chat Support
            </a>
            <a 
              href="mailto:billing@freightflow.com"
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Email Billing
            </a>
          </div>
        </div>
      </div>
      <div className="mt-8 text-sm font-semibold text-slate-400">
        FreightFlow Enterprise Platform
      </div>
    </div>
  );
}
