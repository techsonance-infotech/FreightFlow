'use client';

import React, { useState } from 'react';
import { 
  Settings2, Plug, Database, Save, Loader2,
  Hash, Globe, Receipt, MapPin, Search, Download,
  CloudLightning, Bell, Smartphone, AlertTriangle, Archive
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { updateTenantSettings } from '@/app/actions/settings/business';

interface BusinessConfigDashboardProps {
  initialSettings: any;
}

export function BusinessConfigDashboard({ initialSettings }: BusinessConfigDashboardProps) {
  const [activeTab, setActiveTab] = useState<'preferences' | 'integrations' | 'data'>('preferences');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialSettings || {});

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      await updateTenantSettings(formData);
      toast.success('Business configuration updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="flex flex-col min-h-[600px]">
      {/* Header & Internal Tabs */}
      <div className="p-8 pb-0 border-b border-slate-100 flex flex-col sm:flex-row sm:items-end justify-between gap-6 shrink-0">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-6">Business Config</h2>
          <div className="flex items-center gap-6">
            <TabButton 
              active={activeTab === 'preferences'} 
              onClick={() => setActiveTab('preferences')} 
              icon={<Settings2 className="h-4 w-4" />} 
              label="Preferences" 
            />
            <TabButton 
              active={activeTab === 'integrations'} 
              onClick={() => setActiveTab('integrations')} 
              icon={<Plug className="h-4 w-4" />} 
              label="Integrations" 
            />
            <TabButton 
              active={activeTab === 'data'} 
              onClick={() => setActiveTab('data')} 
              icon={<Database className="h-4 w-4" />} 
              label="Data & Exports" 
            />
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="mb-[1.125rem] flex items-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Config
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-8 lg:p-12 overflow-y-auto">
        {activeTab === 'preferences' && (
          <div className="space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ConfigSection title="Document Sequencing" description="Custom prefixes for your system-generated documents.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ConfigField label="Lorry Receipt Prefix" name="lrPrefix" value={formData.lrPrefix} onChange={handleChange} placeholder="LR-2026-" icon={<Hash className="h-4 w-4" />} />
                <ConfigField label="Invoice Prefix" name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} placeholder="INV-FF-" icon={<Hash className="h-4 w-4" />} />
                <ConfigField label="Expense Voucher Prefix" name="expensePrefix" value={formData.expensePrefix} onChange={handleChange} placeholder="EXP-" icon={<Hash className="h-4 w-4" />} />
                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors">
                    <input type="checkbox" name="autoPadZeroes" checked={formData.autoPadZeroes || false} onChange={handleChange} className="h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
                    <div>
                      <span className="text-sm font-bold text-slate-700 block">Auto-pad Zeroes</span>
                      <span className="text-[10px] font-black uppercase text-slate-400">0001 instead of 1</span>
                    </div>
                  </label>
                </div>
              </div>
            </ConfigSection>

            <ConfigSection title="Localization & Accounting" description="Default regional settings for currency and dates.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Currency Symbol</label>
                  <select name="currency" value={formData.currency || 'INR'} onChange={handleChange} className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="INR">₹ (INR)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="AED">د.إ (AED)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Timezone</label>
                  <select name="timezone" value={formData.timezone || 'Asia/Kolkata'} onChange={handleChange} className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York (EST)</option>
                  </select>
                </div>
                <ConfigField label="Default Tax Rate (%)" name="defaultTaxRate" value={formData.defaultTaxRate} onChange={handleChange} placeholder="5" type="number" icon={<Receipt className="h-4 w-4" />} />
                <ConfigField label="Financial Year Start Month" name="fiscalMonth" value={formData.fiscalMonth || '4'} onChange={handleChange} type="number" placeholder="4 (April)" />
              </div>
            </ConfigSection>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="space-y-12 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ConfigSection title="Telematics & GPS" description="Connect to GPS providers to sync live vehicle locations.">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Provider</label>
                  <select name="gpsProvider" value={formData.gpsProvider || ''} onChange={handleChange} className="w-full h-12 px-5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none">
                    <option value="">None</option>
                    <option value="loconav">LocoNav</option>
                    <option value="fleetx">Fleetx.io</option>
                    <option value="custom">Custom API</option>
                  </select>
                </div>
                {formData.gpsProvider && (
                  <ConfigField label="API Key / Token" name="gpsApiKey" value={formData.gpsApiKey} onChange={handleChange} placeholder="sk_live_..." type="password" icon={<CloudLightning className="h-4 w-4" />} />
                )}
              </div>
            </ConfigSection>

            <ConfigSection title="Communications (SMS/WhatsApp)" description="Configure automated alerts for dealers and consignees.">
              <div className="grid grid-cols-1 gap-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  <label className="flex-1 flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input type="checkbox" name="enableSms" checked={formData.enableSms || false} onChange={handleChange} className="mt-1 h-5 w-5 rounded text-blue-600 focus:ring-blue-500" />
                    <div>
                      <span className="text-sm font-black text-slate-900 flex items-center gap-2"><Smartphone className="h-4 w-4 text-blue-500" /> SMS Alerts</span>
                      <p className="text-xs font-medium text-slate-500 mt-1">Send LR tracking links via SMS</p>
                    </div>
                  </label>
                  <label className="flex-1 flex items-start gap-4 p-5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors cursor-pointer">
                    <input type="checkbox" name="enableWhatsapp" checked={formData.enableWhatsapp || false} onChange={handleChange} className="mt-1 h-5 w-5 rounded text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <span className="text-sm font-black text-slate-900 flex items-center gap-2"><Globe className="h-4 w-4 text-emerald-500" /> WhatsApp API</span>
                      <p className="text-xs font-medium text-slate-500 mt-1">Send automated invoice PDFs</p>
                    </div>
                  </label>
                </div>
                {(formData.enableSms || formData.enableWhatsapp) && (
                  <ConfigField label="Gateway API Key" name="commsApiKey" value={formData.commsApiKey} onChange={handleChange} placeholder="Paste your provider key here" type="password" />
                )}
              </div>
            </ConfigSection>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-8 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-8 rounded-[2rem] border border-blue-100 bg-blue-50/50 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                  <Download className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Compliance Exports</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Download complete ledgers and registers for auditor review.</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 pt-4 border-t border-blue-100">
                <button onClick={() => toast.success('Export initiated. You will receive an email shortly.')} className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2">
                  <Receipt className="h-4 w-4" /> Export Invoices (FY25-26)
                </button>
                <button onClick={() => toast.success('Export initiated. You will receive an email shortly.')} className="px-6 py-3 bg-white text-slate-700 border border-slate-200 rounded-xl font-black text-xs uppercase tracking-widest hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2">
                  <Database className="h-4 w-4" /> General Ledger Backup
                </button>
              </div>
            </div>

            <div className="p-8 rounded-[2rem] border border-amber-100 bg-amber-50/30 space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Archive className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Data Archiving</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Archive old trips to improve dashboard performance.</p>
                </div>
              </div>
              <div className="pt-4 border-t border-amber-100/50">
                <button onClick={() => toast.info('Archiving feature is currently in maintenance.')} className="px-6 py-3 bg-white text-amber-700 border border-amber-200 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-amber-50 transition-all flex items-center gap-2">
                  <Archive className="h-4 w-4" /> Archive Trips older than 2 years
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "pb-4 flex items-center gap-2 text-sm font-black border-b-2 transition-all relative top-[1px]",
        active 
          ? "border-blue-600 text-blue-600" 
          : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-300"
      )}
    >
      {icon} {label}
    </button>
  );
}

function ConfigSection({ title, description, children }: any) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1">{description}</p>
      </div>
      <div className="p-8 rounded-[2rem] border border-slate-100 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

function ConfigField({ label, name, value, onChange, placeholder, type = 'text', icon }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <input 
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          className="w-full h-12 rounded-xl bg-slate-50 border-none px-5 font-bold text-sm text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-300"
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
