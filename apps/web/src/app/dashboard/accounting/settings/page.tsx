'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings2, 
  Save, 
  ChevronLeft, 
  Landmark, 
  Percent, 
  Hash, 
  Calendar,
  Zap,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AccountingSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({
    fiscalYearStart: 4,
    gstEnabled: true,
    defaultGstRate: 5.00,
    voucherPrefixes: {
      payment: 'PAY',
      receipt: 'REC',
      journal: 'JV',
      contra: 'CON',
      sales: 'SL',
      purchase: 'PUR'
    },
    autoPostInvoices: true
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/accounting/settings');
      const data = await res.json();
      if (data.data) {
        setSettings(data.data);
      }
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/accounting/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        toast.success('Settings updated successfully');
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="h-12 w-12 rounded-2xl bg-white border-neutral-200 shadow-sm hover:bg-neutral-50 p-0"
          >
            <ChevronLeft className="h-5 w-5 text-neutral-600" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-6 w-6 rounded-lg bg-accent-600 flex items-center justify-center shadow-lg shadow-accent-600/20">
                <Settings2 className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="text-[10px] font-black text-accent-600 uppercase tracking-[0.2em]">Global Configuration</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-neutral-900">Accounting Settings</h1>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-2xl bg-accent-600 hover:bg-accent-700 text-white shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest gap-2"
        >
          {saving ? <div className="h-4 w-4 animate-spin border-2 border-white border-t-transparent rounded-full" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Financial Controls */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 rounded-[2rem] border-neutral-200 bg-white shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Landmark className="h-32 w-32" />
            </div>
            
            <h2 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-accent-600" />
              Financial Period & Controls
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Fiscal Year Start Month</label>
                <select 
                  value={settings?.fiscalYearStart}
                  onChange={(e) => setSettings({ ...settings, fiscalYearStart: parseInt(e.target.value) })}
                  className="w-full h-12 rounded-xl border-neutral-200 bg-neutral-50 px-4 text-sm font-medium focus:ring-2 focus:ring-accent-600/20 transition-all outline-none"
                >
                  <option value={1}>January</option>
                  <option value={4}>April (Standard India)</option>
                  <option value={7}>July</option>
                  <option value={10}>October</option>
                </select>
                <p className="text-[11px] text-neutral-500 ml-1">Determines how reports aggregate data annually.</p>
              </div>

              <div className="space-y-2 text-right flex flex-col justify-end items-end">
                <div className="flex items-center gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-100 w-full justify-between">
                  <div>
                    <p className="text-xs font-bold text-neutral-900">Auto-Post Invoices</p>
                    <p className="text-[10px] text-neutral-500">Create vouchers automatically</p>
                  </div>
                  <Switch 
                    checked={settings?.autoPostInvoices}
                    onCheckedChange={(checked) => setSettings({ ...settings, autoPostInvoices: checked })}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8 rounded-[2rem] border-neutral-200 bg-white shadow-sm">
            <h2 className="text-xl font-bold text-neutral-900 mb-8 flex items-center gap-3">
              <Hash className="h-5 w-5 text-accent-600" />
              Voucher Numbering (Prefixes)
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {['payment', 'receipt', 'journal', 'contra', 'sales', 'purchase'].map((type) => (
                <div key={type} className="space-y-2">
                  <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">{type}</label>
                  <div className="relative group">
                    <Input 
                      value={settings?.voucherPrefixes?.[type]}
                      onChange={(e) => setSettings({
                        ...settings,
                        voucherPrefixes: {
                          ...settings.voucherPrefixes,
                          [type]: e.target.value.toUpperCase()
                        }
                      })}
                      className="h-12 rounded-xl bg-neutral-50 border-neutral-200 font-bold text-sm uppercase group-hover:bg-white transition-colors"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Zap className="h-3.5 w-3.5 text-neutral-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column - GST Settings */}
        <div className="space-y-8">
          <Card className="p-8 rounded-[2rem] border-neutral-200 bg-accent-600 text-white shadow-xl shadow-accent-600/20 overflow-hidden relative group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="h-48 w-48" />
            </div>

            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold">GST Compliance</h2>
              <Switch 
                checked={settings?.gstEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, gstEnabled: checked })}
                className="data-[state=checked]:bg-white data-[state=unchecked]:bg-accent-800"
              />
            </div>

            <div className="space-y-6 relative">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-accent-100 uppercase tracking-wider opacity-80">Default Tax Rate (%)</label>
                <div className="relative">
                  <Input 
                    type="number"
                    value={settings?.defaultGstRate}
                    onChange={(e) => setSettings({ ...settings, defaultGstRate: e.target.value })}
                    className="h-12 rounded-xl bg-accent-700/50 border-accent-500 text-white font-black text-lg focus:ring-white/20 outline-none placeholder:text-accent-300"
                  />
                  <Percent className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-accent-200" />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 border border-white/10 flex gap-4">
                <AlertCircle className="h-5 w-5 shrink-0 text-accent-200" />
                <p className="text-[11px] leading-relaxed text-accent-100">
                  GST settings affect how tax is calculated on freight invoices and reconciliation tools. Ensure these match your registration.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-8 rounded-[2rem] border-neutral-200 bg-white shadow-sm border-dashed flex flex-col items-center justify-center text-center gap-4 group cursor-pointer hover:border-accent-600/30 transition-all">
            <div className="h-12 w-12 rounded-2xl bg-neutral-50 flex items-center justify-center group-hover:bg-accent-50 transition-colors">
              <ShieldCheck className="h-6 w-6 text-neutral-400 group-hover:text-accent-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Audit Lock Settings</p>
              <p className="text-[10px] text-neutral-500 mt-1">Prevent edits to previous periods</p>
            </div>
            <Button variant="ghost" className="text-[10px] font-black uppercase text-accent-600 hover:bg-accent-50 rounded-xl">Configure Lock</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
