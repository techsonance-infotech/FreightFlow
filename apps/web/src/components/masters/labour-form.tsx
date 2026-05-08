'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LabourSchema, type Labour } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { uploadMasterDocument } from '@/app/actions/masters/labour';
import { 
  User, Phone, IndianRupee, Fingerprint, CreditCard, 
  Home, Banknote, Building, Hash, MapPin, ShieldCheck, 
  Contact, Calendar, Award, FolderOpen, Truck, CheckCircle2, Eye 
} from 'lucide-react';

interface LabourFormProps {
  initialData?: Partial<Labour>;
  onSuccess: (data: Labour) => void;
  onCancel: () => void;
}

export function LabourForm({ initialData, onSuccess, onCancel }: LabourFormProps) {
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<Labour>({
    resolver: zodResolver(LabourSchema) as any,
    defaultValues: {
      ...initialData,
      salary: initialData?.salary ? initialData.salary / 100 : 0,
      isActive: initialData?.isActive ?? true,
      dlExpiry: initialData?.dlExpiry ? new Date(initialData.dlExpiry).toISOString().split('T')[0] : '',
      bankName: initialData?.bankName ?? '',
      accountNo: initialData?.accountNo ?? '',
      ifscCode: initialData?.ifscCode ?? '',
      branchName: initialData?.branchName ?? '',
    }
  });

  const selectedSkill = watch('skillCategory');

  const onSubmit = async (data: Labour) => {
    setUploading(true);
    try {
      const labourId = initialData?.id;
      const uploads: Record<string, any> = {};

      // 1. If existing worker, we can upload documents BEFORE the main save
      if (labourId) {
        if (aadharFile) {
          const formData = new FormData();
          formData.append('file', aadharFile);
          formData.append('type', 'aadhar');
          formData.append('masterId', labourId!);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`Aadhar Upload: ${res.error}`);
          if (res.publicUrl) uploads.aadharUrl = res.publicUrl;
        }

        if (panFile) {
          const formData = new FormData();
          formData.append('file', panFile);
          formData.append('type', 'pan');
          formData.append('masterId', labourId!);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`PAN Upload: ${res.error}`);
          if (res.publicUrl) uploads.panUrl = res.publicUrl;
        }

        if (dlFile) {
          const formData = new FormData();
          formData.append('file', dlFile);
          formData.append('type', 'dl');
          formData.append('masterId', labourId!);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`DL Upload: ${res.error}`);
          if (res.publicUrl) uploads.dlUrl = res.publicUrl;
        }
      }

      // 2. Main Save (Create or Update)
      const payload = { 
        ...data, 
        salary: Math.round(data.salary * 100),
        dlExpiry: data.dlExpiry ? new Date(data.dlExpiry).toISOString() : null,
        ...uploads 
      };

      const method = labourId ? 'PATCH' : 'POST';
      const url = labourId 
        ? `/api/v1/masters/labour/${labourId}` 
        : '/api/v1/masters/labour';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save labour');
      }

      let savedData = await response.json();
      const newLabourId = savedData.id;

      // 3. For NEW workers, upload documents AFTER getting the ID
      if (!labourId && (aadharFile || panFile)) {
        const postUploads: Record<string, any> = {};
        
        if (aadharFile) {
          const formData = new FormData();
          formData.append('file', aadharFile);
          formData.append('type', 'aadhar');
          formData.append('masterId', newLabourId);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`Aadhar Upload: ${res.error}`);
          if (res.publicUrl) postUploads.aadharUrl = res.publicUrl;
        }

        if (panFile) {
          const formData = new FormData();
          formData.append('file', panFile);
          formData.append('type', 'pan');
          formData.append('masterId', newLabourId);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`PAN Upload: ${res.error}`);
          if (res.publicUrl) postUploads.panUrl = res.publicUrl;
        }

        if (dlFile) {
          const formData = new FormData();
          formData.append('file', dlFile);
          formData.append('type', 'dl');
          formData.append('masterId', newLabourId);
          formData.append('masterType', 'labour');
          
          const res = await uploadMasterDocument(formData);
          if (res.error) throw new Error(`DL Upload: ${res.error}`);
          if (res.publicUrl) postUploads.dlUrl = res.publicUrl;
        }

        // Final PATCH for new worker URLs
        if (Object.keys(postUploads).length > 0) {
          const updateRes = await fetch(`/api/v1/masters/labour/${newLabourId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postUploads),
          });
          if (updateRes.ok) {
            savedData = await updateRes.json();
          }
        }
      }

      toast.success(initialData?.id ? 'Worker updated successfully' : 'Worker registered successfully');
      onSuccess(savedData);
    } catch (error: any) {
      console.error('Submit Error:', error);
      toast.error(error.message || 'Error saving worker');
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Worker Name *" placeholder="e.g. Ramesh Kumar" icon={<User className="h-4 w-4" />} error={(errors.name as any)?.message} {...register('name')} />
        
        <Input 
          label="Phone Number *" 
          placeholder="10-digit number" 
          icon={<Phone className="h-4 w-4" />} 
          error={(errors.phone as any)?.message} 
          {...register('phone')} 
        />
        
        <Input 
          label="Monthly Salary (₹) *" 
          type="number" 
          step="0.01" 
          icon={<IndianRupee className="h-4 w-4" />} 
          error={(errors.salary as any)?.message} 
          {...register('salary', { 
            valueAsNumber: true,
            onChange: (e) => {
              if (e.target.value === '0') e.target.value = '';
            }
          })} 
          onFocus={(e) => {
            if (e.target.value === '0') e.target.value = '';
          }}
        />
        
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Skill Category *</label>
          <Select 
            value={selectedSkill} 
            onValueChange={(val) => setValue('skillCategory', val as any)}
          >
            <SelectTrigger className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-slate-100 transition-all ${
              errors.skillCategory ? 'border-red-500 ring-2 ring-red-500/10' : ''
            }`}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Driver">Driver</SelectItem>
              <SelectItem value="Loader">Loader</SelectItem>
              <SelectItem value="Cleaner">Cleaner</SelectItem>
              <SelectItem value="Mechanic">Mechanic</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {errors.skillCategory && <p className="text-[10px] font-bold text-red-500 ml-1">{(errors.skillCategory as any).message}</p>}
        </div>

        <Input 
          label="Aadhar Card No *" 
          placeholder="12-digit Aadhar" 
          icon={<Fingerprint className="h-4 w-4" />} 
          error={(errors.aadharNo as any)?.message} 
          {...register('aadharNo')} 
        />
        
        <Input 
          label="PAN Card No" 
          placeholder="PAN Number (Optional)" 
          icon={<CreditCard className="h-4 w-4" />} 
          error={(errors.panNo as any)?.message} 
          {...register('panNo')} 
        />

        <div className="md:col-span-2">
          <Input label="Full Address *" placeholder="Home address" icon={<Home className="h-4 w-4" />} error={(errors.address as any)?.message} {...register('address')} />
        </div>

        {/* Banking Section */}
        <div className="col-span-full mt-4">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <Banknote className="h-4 w-4" /> Banking & Settlement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Bank Name" placeholder="e.g. HDFC Bank" icon={<Building className="h-4 w-4" />} error={errors.bankName?.message} {...register('bankName')} />
            <Input label="Account Number" placeholder="Bank Account No." icon={<CreditCard className="h-4 w-4" />} error={errors.accountNo?.message} {...register('accountNo')} />
            <Input label="IFSC Code" placeholder="e.g. HDFC0001234" icon={<Hash className="h-4 w-4" />} error={errors.ifscCode?.message} {...register('ifscCode')} />
            <Input label="Branch Name" placeholder="Branch location" icon={<MapPin className="h-4 w-4" />} error={errors.branchName?.message} {...register('branchName')} />
          </div>
        </div>

        {/* Dynamic Driver Section */}
        {selectedSkill === 'Driver' && (
          <div className="col-span-full grid grid-cols-1 md:grid-cols-3 gap-6 p-6 mt-4 rounded-3xl bg-blue-50/30 border border-blue-100/50 animate-in slide-in-from-top-4 duration-500">
            <div className="col-span-full mb-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" /> Driver Compliance Details
              </h4>
            </div>
            <Input label="DL Number *" placeholder="e.g. MH1220230012345" icon={<Contact className="h-4 w-4" />} error={errors.dlNumber?.message} {...register('dlNumber')} />
            <Input label="DL Expiry *" type="date" icon={<Calendar className="h-4 w-4" />} error={errors.dlExpiry?.message} {...register('dlExpiry')} />
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">DL Category *</label>
              <Select value={watch('dlCategory') || ''} onValueChange={(val) => setValue('dlCategory', val as any)}>
                <SelectTrigger className="w-full h-11 bg-white border-slate-100 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCWG">MCWG</SelectItem>
                  <SelectItem value="LMV">LMV</SelectItem>
                  <SelectItem value="HMV">HMV</SelectItem>
                  <SelectItem value="TRANS">TRANS</SelectItem>
                </SelectContent>
              </Select>
              {errors.dlCategory && <p className="text-[10px] font-bold text-red-500 ml-1">{(errors.dlCategory as any).message}</p>}
            </div>
            <Input label="Badge Number" placeholder="Special Permit No." icon={<Award className="h-4 w-4" />} error={errors.badgeNo?.message} {...register('badgeNo')} />
          </div>
        )}
      </div>

      <div className="pt-6 border-t border-slate-100">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
          <FolderOpen className="h-4 w-4" /> Compliance Documents
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="cursor-pointer">
              <div className={`p-6 rounded-3xl bg-slate-50 border-2 border-dashed transition-all group ${
                aadharFile ? 'border-green-300 bg-green-50/30' : 'border-slate-100 hover:border-blue-300'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <div className="text-slate-400 mb-2 group-hover:scale-110 transition-transform">{aadharFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Contact className="h-6 w-6" />}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {aadharFile ? aadharFile.name : 'Upload Aadhar Card'}
                  </p>
                  <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">PDF, JPG or PNG (Max 5MB)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/*"
                    onChange={(e) => setAadharFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </label>
            {initialData?.aadharUrl && !aadharFile && (
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Currently Uploaded</p>
                <a href={initialData.aadharUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-700 underline">VIEW DOC</a>
              </div>
            )}
          </div>
          
          <div className="space-y-3">
            <label className="cursor-pointer">
              <div className={`p-6 rounded-3xl bg-slate-50 border-2 border-dashed transition-all group ${
                panFile ? 'border-green-300 bg-green-50/30' : 'border-slate-100 hover:border-blue-300'
              }`}>
                <div className="flex flex-col items-center text-center">
                  <div className="text-slate-400 mb-2 group-hover:scale-110 transition-transform">{panFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <CreditCard className="h-6 w-6" />}</div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {panFile ? panFile.name : 'Upload PAN Card'}
                  </p>
                  <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Optional (PDF, JPG, PNG)</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".pdf,image/*"
                    onChange={(e) => setPanFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>
            </label>
            {initialData?.panUrl && !panFile && (
              <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Currently Uploaded</p>
                <a href={initialData.panUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-700 underline">VIEW DOC</a>
              </div>
            )}
          </div>

          {selectedSkill === 'Driver' && (
            <div className="space-y-3">
              <label className="cursor-pointer">
                <div className={`p-6 rounded-3xl bg-slate-50 border-2 border-dashed transition-all group ${
                  dlFile ? 'border-blue-300 bg-blue-50/30' : 'border-slate-100 hover:border-blue-300'
                }`}>
                  <div className="flex flex-col items-center text-center">
                    <div className="text-slate-400 mb-2 group-hover:scale-110 transition-transform">{dlFile ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : <Truck className="h-6 w-6" />}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {dlFile ? dlFile.name : 'Upload Driving License'}
                    </p>
                    <p className="text-[8px] font-bold text-slate-300 mt-1 uppercase">Required for Drivers (PDF/IMG)</p>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".pdf,image/*"
                      onChange={(e) => setDlFile(e.target.files?.[0] || null)}
                    />
                  </div>
                </div>
              </label>
              {initialData?.dlUrl && !dlFile && (
                <div className="flex items-center justify-between px-4 py-2 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[9px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> DL Uploaded</p>
                  <a href={initialData.dlUrl} target="_blank" rel="noreferrer" className="text-[9px] font-black text-blue-700 underline">VIEW DOC</a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold text-[10px] uppercase">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="rounded-xl bg-slate-900 text-white px-8 font-black uppercase tracking-widest text-[10px] h-12 shadow-xl shadow-slate-200"
        >
          {isSubmitting || uploading ? (
            <div className="flex items-center gap-2">
              <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processing...
            </div>
          ) : (initialData?.id ? 'Update Worker' : 'Register Worker')}
        </Button>
      </div>
    </form>
  );
}
