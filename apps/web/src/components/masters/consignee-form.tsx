'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConsigneeSchema, type Consignee } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadMasterDocument } from '@/app/actions/masters/labour';

interface ConsigneeFormProps {
  initialData?: Consignee;
  onSuccess: (data: Consignee) => void;
  onCancel: () => void;
}

export const ConsigneeForm: React.FC<ConsigneeFormProps> = ({ initialData, onSuccess, onCancel }) => {
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
  } = useForm<Consignee>({
    resolver: zodResolver(ConsigneeSchema) as any,
    defaultValues: {
      ...initialData,
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      email: initialData?.email || '',
      companyName: initialData?.companyName || '',
      gstin: initialData?.gstin || '',
      pan: initialData?.pan || '',
      msmeRegNo: initialData?.msmeRegNo || '',
      unloadingHours: initialData?.unloadingHours || '',
      restrictions: initialData?.restrictions || '',
      creditLimit: initialData?.creditLimit ?? 0,
      creditDays: initialData?.creditDays ?? 0,
      isMsme: initialData?.isMsme ?? false,
      isActive: initialData?.isActive ?? true,
    }
  });

  const onSubmit = async (data: Consignee) => {
    try {
      setUploading(true);
      const consigneeId = initialData?.id;
      const uploads: Record<string, any> = {};

      const uploadDoc = async (file: File, type: string, id: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('masterId', id);
        formData.append('masterType', 'consignee');
        const res = await uploadMasterDocument(formData);
        if (res.error) throw new Error(`${type} Upload: ${res.error}`);
        return res.publicUrl;
      };

      // 1. If updating, upload files first
      if (consigneeId) {
        if (gstFile) uploads.gstUrl = await uploadDoc(gstFile, 'gst', consigneeId);
        if (panFile) uploads.panUrl = await uploadDoc(panFile, 'pan', consigneeId);
        if (msmeFile) uploads.msmeUrl = await uploadDoc(msmeFile, 'msme', consigneeId);
      }

      // 2. Save Consignee
      const payload = { ...data, ...uploads };
      const method = consigneeId ? 'PATCH' : 'POST';
      const url = consigneeId ? `/api/v1/masters/consignees/${consigneeId}` : '/api/v1/masters/consignees';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save consignee');
      }

      let savedData = await response.json();
      const newId = savedData.id;

      // 3. For NEW consignee, upload files after getting ID
      if (!consigneeId && (gstFile || panFile || msmeFile)) {
        const postUploads: Record<string, any> = {};
        if (gstFile) postUploads.gstUrl = await uploadDoc(gstFile, 'gst', newId);
        if (panFile) postUploads.panUrl = await uploadDoc(panFile, 'pan', newId);
        if (msmeFile) postUploads.msmeUrl = await uploadDoc(msmeFile, 'msme', newId);

        if (Object.keys(postUploads).length > 0) {
          const updateRes = await fetch(`/api/v1/masters/consignees/${newId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postUploads),
          });
          if (updateRes.ok) savedData = await updateRes.json();
        }
      }

      toast.success(initialData?.id ? 'Consignee updated' : 'Consignee registered');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message || 'Error saving consignee');
    } finally {
      setUploading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Detailed Validation Errors:', errors);
    const errorFields = Object.keys(errors).join(', ');
    toast.error(`Please fix errors in: ${errorFields}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8 p-1">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Info */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">🏢 Identity & Contact</h3>
          <Input label="Consignee Name *" placeholder="e.g. Maruti Suzuki Warehouse" icon="👤" error={errors.name?.message} {...register('name')} />
          <Input label="Sub-Company / Unit" placeholder="e.g. Unit 4, Manesar" icon="🏢" error={errors.companyName?.message} {...register('companyName')} />
          <Input label="Phone Number *" placeholder="10-digit mobile" icon="📱" error={errors.phone?.message} {...register('phone')} />
          <Input label="Email Address" placeholder="consignee@example.com" icon="📧" error={errors.email?.message} {...register('email')} />
          <Input label="Delivery Address *" placeholder="Full destination address" icon="🏠" error={errors.address?.message} {...register('address')} />
        </div>

        {/* Logistics & Credit */}
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-2">🛡️ Logistics & Compliance</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="GSTIN" placeholder="15-digit GST" icon="📝" error={errors.gstin?.message} {...register('gstin')} />
            <Input label="PAN" placeholder="10-digit PAN" icon="💳" error={errors.pan?.message} {...register('pan')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Unloading Hours" placeholder="e.g. 9 AM - 6 PM" icon="⏰" error={errors.unloadingHours?.message} {...register('unloadingHours')} />
            <Input label="Vehicle Restrictions" placeholder="e.g. No 12-wheelers" icon="🚫" error={errors.restrictions?.message} {...register('restrictions')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Credit Limit (₹)" 
              type="number" 
              icon="💰" 
              error={errors.creditLimit?.message} 
              {...register('creditLimit', { valueAsNumber: true })} 
              onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
            />
            <Input 
              label="Credit Days" 
              type="number" 
              icon="📅" 
              error={errors.creditDays?.message} 
              {...register('creditDays', { valueAsNumber: true })} 
              onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
            />
          </div>

          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">MSME Registered?</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Small & Medium Enterprise Compliance</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" {...register('isMsme')} />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {watch('isMsme') && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <Input label="MSME Registration Number" placeholder="UDYAM-XX-00-0000000" icon="📜" error={errors.msmeRegNo?.message} {...register('msmeRegNo')} />
              </div>
            )}

            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">📄 Delivery Compliance Documents</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-2">
                <label className="group relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <input type="file" className="hidden" onChange={(e) => setGstFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
                  <span className="text-xl mb-1">{gstFile || initialData?.gstUrl ? '📝' : '📄'}</span>
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter">GST</span>
                </label>
                {(gstFile || initialData?.gstUrl) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl text-[9px] uppercase font-bold"
                    onClick={() => window.open(gstFile ? URL.createObjectURL(gstFile) : initialData?.gstUrl!, '_blank')}
                  >
                    👁️ View
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className="group relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                  <input type="file" className="hidden" onChange={(e) => setPanFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
                  <span className="text-xl mb-1">{panFile || initialData?.panUrl ? '💳' : '📄'}</span>
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter">PAN</span>
                </label>
                {(panFile || initialData?.panUrl) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl text-[9px] uppercase font-bold"
                    onClick={() => window.open(panFile ? URL.createObjectURL(panFile) : initialData?.panUrl!, '_blank')}
                  >
                    👁️ View
                  </Button>
                )}
              </div>

              <div className="space-y-2">
                <label className={`group relative flex flex-col items-center justify-center p-4 border-2 border-dashed ${watch('isMsme') ? 'border-blue-100 bg-blue-50/10' : 'border-slate-100'} rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer`}>
                  <input type="file" className="hidden" onChange={(e) => setMsmeFile(e.target.files?.[0] || null)} accept=".pdf,.jpg,.jpeg,.png" />
                  <span className="text-xl mb-1">{msmeFile || initialData?.msmeUrl ? '📜' : '📄'}</span>
                  <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter">MSME</span>
                </label>
                {(msmeFile || initialData?.msmeUrl) && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="w-full rounded-xl text-[9px] uppercase font-bold"
                    onClick={() => window.open(msmeFile ? URL.createObjectURL(msmeFile) : initialData?.msmeUrl!, '_blank')}
                  >
                    👁️ View
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          {isSubmitting || uploading ? (
            <>
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </>
          ) : (initialData?.id ? 'Update Consignee' : 'Register Consignee')}
        </Button>
      </div>
    </form>
  );
};
