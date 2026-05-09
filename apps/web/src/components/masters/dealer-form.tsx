'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DealerSchema, type Dealer } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadMasterDocument } from '@/app/actions/masters/labour';
import { FileText, CreditCard, Banknote, CheckCircle2, Eye } from 'lucide-react';

interface DealerFormProps {
  initialData?: Partial<Dealer>;
  onSuccess: (data: Dealer) => void;
  onCancel: () => void;
}

export const DealerForm: React.FC<DealerFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [gstFile, setGstFile] = useState<File | null>(null);
  const [panFile, setPanFile] = useState<File | null>(null);
  const [bankFile, setBankFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Dealer>({
    resolver: zodResolver(DealerSchema) as any,
    defaultValues: {
      ...initialData,
      name: initialData?.name || '',
      address: initialData?.address || '',
      phone: initialData?.phone || '',
      tdsRate: initialData?.tdsRate || 0,
      fleetSize: initialData?.fleetSize || 0,
      isActive: initialData?.isActive ?? true,
    }
  });

  const onSubmit = async (data: Dealer) => {
    try {
      setUploading(true);
      const dealerId = initialData?.id;
      const uploads: Record<string, any> = {};

      const uploadDoc = async (file: File, type: string, id: string) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        formData.append('masterId', id);
        formData.append('masterType', 'dealer');
        const res = await uploadMasterDocument(formData);
        if (res.error) throw new Error(`${type} Upload: ${res.error}`);
        return res.publicUrl;
      };

      // 1. If updating, upload files first
      if (dealerId) {
        if (gstFile) uploads.gstUrl = await uploadDoc(gstFile, 'gst', dealerId);
        if (panFile) uploads.panUrl = await uploadDoc(panFile, 'pan', dealerId);
        if (bankFile) uploads.bankProofUrl = await uploadDoc(bankFile, 'bank', dealerId);
      }

      // 2. Save Dealer
      const payload = { ...data, ...uploads };
      const method = dealerId ? 'PUT' : 'POST';
      const url = dealerId ? `/api/v1/masters/dealers/${dealerId}` : '/api/v1/masters/dealers';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save dealer');
      }

      let savedData = await response.json();
      const newId = savedData.id;

      // 3. For NEW dealer, upload files after getting ID
      if (!dealerId && (gstFile || panFile || bankFile)) {
        const postUploads: Record<string, any> = {};
        if (gstFile) postUploads.gstUrl = await uploadDoc(gstFile, 'gst', newId);
        if (panFile) postUploads.panUrl = await uploadDoc(panFile, 'pan', newId);
        if (bankFile) postUploads.bankProofUrl = await uploadDoc(bankFile, 'bank', newId);

        if (Object.keys(postUploads).length > 0) {
          const updateRes = await fetch(`/api/v1/masters/dealers/${newId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postUploads),
          });
          if (updateRes.ok) savedData = await updateRes.json();
        }
      }

      toast.success(initialData?.id ? 'Dealer updated' : 'Dealer registered');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message || 'Error saving dealer');
    } finally {
      setUploading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Validation Errors:', errors);
    const errorFields = Object.keys(errors).join(', ');
    toast.error(`Please fix: ${errorFields}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-10 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Section 1: Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-sm">01</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Business Identity</h3>
          </div>
          <Input label="Dealer/Company Name *" placeholder="e.g. Agarwal Logistics" error={errors.name?.message} {...register('name')} />
          <Input label="Short Name" placeholder="e.g. AGW" error={errors.shortName?.message} {...register('shortName')} />
          <Input label="Contact Person" placeholder="e.g. Rajesh Agarwal" error={errors.personName?.message} {...register('personName')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone Number *" placeholder="10-digit" error={errors.phone?.message} {...register('phone')} />
            <Input label="Email" placeholder="vendor@example.com" error={errors.email?.message} {...register('email')} />
          </div>
          <Input label="Pickup/Office Address *" placeholder="Full address" error={errors.address?.message} {...register('address')} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Pincode" placeholder="6-digit" error={errors.pincode?.message} {...register('pincode')} />
            <Input label="Area/City" placeholder="e.g. Bhiwandi" error={errors.area?.message} {...register('area')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Service Tax No" placeholder="Enter SerTaxNo" error={errors.serviceTaxNo?.message} {...register('serviceTaxNo')} />
            <Input label="Dealer Type" placeholder="e.g. Regular, Composition" error={errors.dealerType?.message} {...register('dealerType')} />
          </div>
        </div>

        {/* Section 2: Banking & Tax */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600 font-bold text-sm">02</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Banking & Financials</h3>
          </div>
          <div className="bg-slate-50/50 p-6 rounded-[24px] border border-slate-100 space-y-4">
            <Input label="Bank Name" placeholder="e.g. HDFC Bank" error={errors.bankName?.message} {...register('bankName')} />
            <Input label="Account Number" placeholder="Payout Account No" error={errors.accountNo?.message} {...register('accountNo')} />
            <Input label="IFSC Code" placeholder="e.g. HDFC0001234" error={errors.ifscCode?.message} {...register('ifscCode')} />
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            <Input label="GSTIN" placeholder="15-digit GST" error={errors.gstin?.message} {...register('gstin')} />
            <Input label="PAN" placeholder="10-digit PAN" error={errors.pan?.message} {...register('pan')} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="TDS Rate (%)" type="number" step="0.1" error={errors.tdsRate?.message} {...register('tdsRate')} onFocus={(e) => e.target.value === '0' && (e.target.value = '')} />
            <Input label="TDS Section" placeholder="e.g. 194C" error={errors.tdsSection?.message} {...register('tdsSection')} />
          </div>
        </div>

        {/* Section 3: Logistics & Docs */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <span className="h-8 w-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 font-bold text-sm">03</span>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">Logistics & Compliance</h3>
          </div>
          <Input label="Fleet Size (Approx)" type="number" error={errors.fleetSize?.message} {...register('fleetSize')} onFocus={(e) => e.target.value === '0' && (e.target.value = '')} />
          <Input label="Primary Operating Routes" placeholder="e.g. Mumbai - Delhi, Gujarat" error={errors.primaryRoutes?.message} {...register('primaryRoutes')} />
          
          <div className="space-y-4 pt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <FileText className="h-3 w-3" /> Documents Vault
            </p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'GST', file: gstFile, setFile: setGstFile, url: initialData?.gstUrl, icon: <FileText className="h-5 w-5" /> },
                { label: 'PAN', file: panFile, setFile: setPanFile, url: initialData?.panUrl, icon: <CreditCard className="h-5 w-5" /> },
                { label: 'Bank', file: bankFile, setFile: setBankFile, url: initialData?.bankProofUrl, icon: <Banknote className="h-5 w-5" /> },
              ].map((doc, i) => (
                <div key={i} className="space-y-2">
                  <label className="group relative flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-100 rounded-2xl hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer">
                    <input type="file" className="hidden" onChange={(e) => doc.setFile(e.target.files?.[0] || null)} accept=".pdf,image/*" />
                    <div className="text-slate-400 mb-1">
                      {doc.file || doc.url ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : doc.icon}
                    </div>
                    <span className="text-[9px] font-black text-slate-400 group-hover:text-blue-600 uppercase tracking-tighter">{doc.label} Copy</span>
                  </label>
                  {(doc.file || doc.url) && (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="w-full text-[9px] font-bold text-blue-600"
                      onClick={() => window.open(doc.file ? URL.createObjectURL(doc.file) : doc.url!, '_blank')}
                    >
                    <Eye className="h-3 w-3 mr-1" /> VIEW
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 pt-8 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting || uploading}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-10 h-14 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100 flex items-center gap-2"
        >
          {isSubmitting || uploading ? 'Processing...' : (initialData?.id ? 'Update Vendor Profile' : 'Register New Vendor')}
        </Button>
      </div>
    </form>
  );
};
