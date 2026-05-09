'use client';

import React, { useState } from 'react';
import { 
  Building2, MapPin, Hash, Globe, 
  Save, Phone, Mail, Landmark, 
  CreditCard, MessageSquare, ShieldCheck,
  ChevronRight, Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { updateOrganization } from '@/app/actions/settings/organization';
import { cn } from '@/lib/utils';

interface OrganizationSettingsFormProps {
  initialData: any;
}

export function OrganizationSettingsForm({ initialData }: OrganizationSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleFileUpload = (field: string) => {
    // In a real app, this would be an actual file upload to S3/Supabase
    const mockUrl = `https://storage.freightflow.pro/docs/${field}_${formData.id.slice(0, 8)}.pdf`;
    setFormData((prev: any) => ({ ...prev, [field]: mockUrl }));
    toast.info(`${field.replace('Url', '').replace('Certificate', '').toUpperCase()} document staged`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateOrganization(formData);
      toast.success('Organization profile updated successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update organization');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 lg:p-12 space-y-12">
      {/* Header with quick stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-[2rem] bg-blue-600 text-white flex items-center justify-center text-3xl font-black shadow-2xl shadow-blue-200">
            {formData.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{formData.name}</h2>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Corporate Entity</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ID: FF-{formData.id.split('-')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={loading}
          className="h-14 px-10 rounded-2xl bg-slate-900 hover:bg-black text-white font-black uppercase tracking-widest text-xs gap-3 shadow-2xl shadow-slate-200 active:scale-95 transition-all"
        >
          {loading ? (
            <div className="h-4 w-4 animate-spin border-2 border-white/20 border-t-white rounded-full" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Commit Changes
        </Button>
      </div>

      <div className="space-y-12 max-w-4xl">
        {/* Identity Section */}
        <FormSection 
          title="Legal Identity" 
          description="Manage your registered business name and tax identification numbers."
          icon={<ShieldCheck className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField 
              label="Company Legal Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Enter registered name"
            />
            <FormField 
              label="GSTIN Number" 
              name="gstin" 
              value={formData.gstin} 
              onChange={handleChange} 
              placeholder="27AAAAA0000A1Z5"
            />
            <FormField 
              label="PAN Number" 
              name="pan" 
              value={formData.pan} 
              onChange={handleChange} 
              placeholder="ABCDE1234F"
            />
            <FormField 
              label="Official Email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="contact@company.com"
              type="email"
            />
          </div>
        </FormSection>

        {/* Location Section */}
        <FormSection 
          title="Headquarters Location" 
          description="Your primary business address for billing and correspondence."
          icon={<MapPin className="h-5 w-5" />}
        >
          <div className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Registered Address</label>
              <Textarea 
                name="address"
                value={formData.address || ''}
                onChange={handleChange}
                placeholder="Enter complete building, street and area details"
                className="min-h-[100px] rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-medium text-sm p-5"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FormField label="City" name="city" value={formData.city} onChange={handleChange} />
              <FormField label="State" name="state" value={formData.state} onChange={handleChange} />
              <FormField label="Pincode" name="pincode" value={formData.pincode} onChange={handleChange} />
            </div>
          </div>
        </FormSection>

        {/* Communication Section */}
        <FormSection 
          title="Digital Presence" 
          description="Contact points for automated notifications and customer queries."
          icon={<Globe className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField 
              label="Business Phone" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder="+91 00000 00000"
              icon={<Phone className="h-4 w-4" />}
            />
            <FormField 
              label="WhatsApp (For Alerts)" 
              name="whatsappNo" 
              value={formData.whatsappNo} 
              onChange={handleChange} 
              placeholder="+91 00000 00000"
              icon={<MessageSquare className="h-4 w-4" />}
            />
          </div>
        </FormSection>

        {/* Financials Section */}
        <FormSection 
          title="Bank Details" 
          description="Used for printed invoices and payouts. Ensure these match your registered entity."
          icon={<Landmark className="h-5 w-5" />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField label="Bank Name" name="bankName" value={formData.bankName} onChange={handleChange} />
            <FormField label="Account Number" name="accountNo" value={formData.accountNo} onChange={handleChange} />
            <FormField label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleChange} />
            <FormField label="Branch Name" name="branchName" value={formData.branchName} onChange={handleChange} />
          </div>
        </FormSection>

        {/* Verification Files */}
        <div className="p-8 md:p-10 rounded-[2.5rem] bg-blue-600 text-white space-y-8 relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 rotate-12 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
            <Edit3 className="h-64 w-64" />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-2xl font-black tracking-tight">Verification Files</h3>
            <p className="text-sm font-medium text-blue-100/80 leading-relaxed mt-2 max-w-lg">
              Upload your legal certificates to complete the KYC verification process. Documents are securely encrypted.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
            <DocUploadButton 
              label="Registration Certificate" 
              url={formData.registrationCertificateUrl} 
              onUpload={() => handleFileUpload('registrationCertificateUrl')} 
            />
            <DocUploadButton 
              label="GST Certificate" 
              url={formData.gstCertificateUrl} 
              onUpload={() => handleFileUpload('gstCertificateUrl')} 
            />
            <DocUploadButton 
              label="PAN Card Copy" 
              url={formData.panCardUrl} 
              onUpload={() => handleFileUpload('panCardUrl')} 
            />
          </div>
        </div>
      </div>
    </form>
  );
}

function DocUploadButton({ label, url, onUpload }: any) {
  return (
    <div className="space-y-1">
      <button 
        type="button" 
        onClick={onUpload}
        className={cn(
          "w-full py-4 rounded-2xl border text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3",
          url 
            ? "bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20" 
            : "bg-white/10 border-white/20 text-white hover:bg-white/20"
        )}
      >
        {url ? <ShieldCheck className="h-4 w-4" /> : null}
        {label}
      </button>
      {url && (
        <p className="text-[8px] font-black uppercase tracking-tighter text-blue-100/50 text-center">
          Verified • {url.split('/').pop()}
        </p>
      )}
    </div>
  );
}

function FormSection({ title, description, icon, children }: any) {
  return (
    <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-start gap-4">
        <div className="mt-1 h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-slate-400 mt-1">{description}</p>
        </div>
      </div>
      <div className="p-10 rounded-[2.5rem] border border-slate-100 bg-white shadow-sm">
        {children}
      </div>
    </section>
  );
}

function FormField({ label, name, value, onChange, placeholder, type = 'text', icon, variant = 'default' }: any) {
  if (variant === 'simple') {
    return (
      <div className="space-y-2">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
        <Input 
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          className="h-12 rounded-xl bg-white border-slate-200 focus:ring-blue-600/10 font-bold text-sm px-4"
        />
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative group">
        <Input 
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-300"
        />
        {icon && (
          <div className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
