'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConsignorSchema, type Consignor } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadMasterDocument } from '@/app/actions/masters/labour';
import { 
  Building2, User, Phone, Mail, Home, ShieldCheck, 
  FileText, CreditCard, IndianRupee, Calendar, FolderOpen, 
  Award, CheckCircle2 
} from 'lucide-react';

interface ConsignorFormProps {
  initialData?: Partial<Consignor>;
  onSuccess: (data: Consignor) => void;
  onCancel: () => void;
}

export function ConsignorForm({ initialData, onSuccess, onCancel }: ConsignorFormProps) {
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [msmeFile, setMsmeFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Consignor>({
    resolver: zodResolver(ConsignorSchema) as any,
    defaultValues: {
      ...initialData,
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      companyName: initialData?.companyName || '',
      gstin: initialData?.gstin || '',
      pan: initialData?.pan || '',
      creditLimit: initialData?.creditLimit ?? 0,
      creditDays: initialData?.creditDays ?? 0,
      isMsme: initialData?.isMsme ?? false,
      isActive: initialData?.isActive ?? true,
    }
  });

  const isMsme = watch('isMsme');

  const onSubmit = async (data: Consignor) => {
    setUploading(true);
    try {
      const consignorId = initialData?.id;
      const uploads: Record<string, any> = {};

      const uploadDoc = async (file: File, type: string, id: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('masterId', id);
        formData.append('masterType', 'consignor');
        const res = await uploadMasterDocument(formData);
        if (res.error) throw new Error(`${type} Upload: ${res.error}`);
        return res.publicUrl;
      };

      // 1. If updating, upload files first
      if (consignorId) {
        if (gstFile) uploads.gstUrl = await uploadDoc(gstFile, 'gst', consignorId);
        if (panFile) uploads.panUrl = await uploadDoc(panFile, 'pan', consignorId);
        if (msmeFile) uploads.msmeUrl = await uploadDoc(msmeFile, 'msme', consignorId);
      }

      // 2. Save Consignor
      const payload = { ...data, ...uploads };
      const method = consignorId ? 'PATCH' : 'POST';
      const url = consignorId ? `/api/v1/masters/consignors/${consignorId}` : '/api/v1/masters/consignors';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save consignor');
      }

      let savedData = await response.json();
      const newId = savedData.id;

      // 3. For NEW consignor, upload files after getting ID
      if (!consignorId && (gstFile || panFile || msmeFile)) {
        const postUploads: Record<string, any> = {};
        if (gstFile) postUploads.gstUrl = await uploadDoc(gstFile, 'gst', newId);
        if (panFile) postUploads.panUrl = await uploadDoc(panFile, 'pan', newId);
        if (msmeFile) postUploads.msmeUrl = await uploadDoc(msmeFile, 'msme', newId);

        if (Object.keys(postUploads).length > 0) {
          const updateRes = await fetch(`/api/v1/masters/consignors/${newId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postUploads),
          });
          if (updateRes.ok) savedData = await updateRes.json();
        }
      }

      toast.success(initialData?.id ? 'Consignor updated' : 'Consignor registered');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message || 'Error saving consignor');
    } finally {
      setUploading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Validation Errors:', errors);
    toast.error('Please fix the errors in the form before submitting.');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 flex items-center gap-2">
            <Building2 className="h-3 w-3" /> Business Profile
          </h3>
          <Input label="Consignor Name *" placeholder="e.g. Reliance Industries" icon={<User className="h-4 w-4" />} error={errors.name?.message} {...register('name')} />
          <Input label="Company Sub-Name" placeholder="e.g. Petrochem Division" icon={<Building2 className="h-4 w-4" />} error={errors.companyName?.message} {...register('companyName')} />
          <Input label="Phone Number *" placeholder="10-digit number" icon={<Phone className="h-4 w-4" />} error={errors.phone?.message} {...register('phone')} />
          <Input label="Email Address" placeholder="office@company.com" icon={<Mail className="h-4 w-4" />} error={errors.email?.message} {...register('email')} />
          <Input label="Pickup Address *" placeholder="Full office/factory address" icon={<Home className="h-4 w-4" />} error={errors.address?.message} {...register('address')} />
        </div>

        {/* Compliance & Credit */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2 flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" /> Compliance & Credit
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="GSTIN" placeholder="15-digit GST" icon={<FileText className="h-4 w-4" />} error={errors.gstin?.message} {...register('gstin')} />
            <Input label="PAN" placeholder="10-digit PAN" icon={<CreditCard className="h-4 w-4" />} error={errors.pan?.message} {...register('pan')} />
          </div>
          
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">MSME Registered?</label>
              <input type="checkbox" className="h-5 w-5 rounded-md" {...register('isMsme')} />
            </div>
            {isMsme && (
              <Input label="MSME Registration No" placeholder="UDYAM-XX-00-0000000" error={errors.msmeRegNo?.message} {...register('msmeRegNo')} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Credit Limit (₹)" 
              type="number" 
              icon={<IndianRupee className="h-4 w-4" />} 
              error={errors.creditLimit?.message} 
              {...register('creditLimit', { valueAsNumber: true })} 
              onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
            />
            <Input 
              label="Credit Days" 
              type="number" 
              icon={<Calendar className="h-4 w-4" />} 
              error={errors.creditDays?.message} 
              {...register('creditDays', { valueAsNumber: true })} 
              onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" /> Compliance Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'GST Certificate', file: gstFile, setFile: setGstFile, url: initialData?.gstUrl, icon: <FileText className="h-5 w-5" /> },
            { label: 'PAN Card', file: panFile, setFile: setPanFile, url: initialData?.panUrl, icon: <CreditCard className="h-5 w-5" /> },
            { label: 'MSME Certificate', file: msmeFile, setFile: setMsmeFile, url: initialData?.msmeUrl, icon: <Award className="h-5 w-5" />, hidden: !isMsme }
          ].filter(d => !d.hidden).map((doc, i) => (
            <div key={i} className="space-y-3">
              <label className="cursor-pointer">
                <div className={`p-4 rounded-3xl bg-slate-50 border-2 border-dashed transition-all group ${
                  doc.file ? 'border-green-300 bg-green-50/30' : 'border-slate-100 hover:border-blue-300'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-slate-400 mb-1">{doc.file ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : doc.icon}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                      {doc.file ? doc.file.name : doc.label}
                    </p>
                    <input type="file" className="hidden" accept=".pdf,image/*" onChange={(e) => doc.setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>
              </label>
              {doc.url && !doc.file && (
                <a href={doc.url} target="_blank" rel="noreferrer" className="block text-center text-[9px] font-black text-blue-600 uppercase underline mt-1">View Current</a>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold text-[10px] uppercase">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="rounded-xl bg-blue-600 text-white px-8 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-blue-100"
        >
          {isSubmitting || uploading ? 'Processing...' : (initialData?.id ? 'Update Consignor' : 'Register Consignor')}
        </Button>
      </div>
    </form>
  );
}
