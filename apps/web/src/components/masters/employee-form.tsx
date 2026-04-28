'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  User, Briefcase, IndianRupee, ShieldCheck, 
  Banknote, FileText, Upload, Check, AlertCircle,
  X, CreditCard, Building2, MapPin, CalendarDays
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface EmployeeFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ initialData, onSuccess, onCancel }: EmployeeFormProps) {
  const isEditing = !!initialData?.id;
  const [activeTab, setActiveTab] = useState('profile');
  const [panFile, setPanFile] = useState<File | null>(null);
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [passbookFile, setPassbookFile] = useState<File | null>(null);
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, watch, setValue } = useForm<any>({
    defaultValues: {
      status: 'active',
      role: 'staff',
      gender: 'male',
      ...initialData,
      joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      salaryStructure: {
        basic: (initialData?.salaryStructure?.basic || 0) / 100,
        hra: (initialData?.salaryStructure?.hra || 0) / 100,
        conveyance: (initialData?.salaryStructure?.conveyance || 0) / 100,
        driverAllowance: (initialData?.salaryStructure?.driverAllowance || 0) / 100,
        otherAllowances: (initialData?.salaryStructure?.otherAllowances || 0) / 100,
        pfApplicable: initialData?.salaryStructure?.pfApplicable ?? true,
        esiApplicable: initialData?.salaryStructure?.esiApplicable ?? false,
        effectiveFrom: initialData?.salaryStructure?.effectiveFrom ? new Date(initialData.salaryStructure.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      let panUrl = data.panUrl;
      let aadharUrl = data.aadharUrl;
      let bankPassbookUrl = data.bankPassbookUrl;

      if (panFile || aadharFile || passbookFile) {
        const { uploadMasterDocument } = await import('@/app/actions/masters/labour');
        
        if (panFile) {
          const panFormData = new FormData();
          panFormData.append('file', panFile);
          panFormData.append('type', 'pan');
          panFormData.append('masterId', data.empCode || 'temp');
          panFormData.append('masterType', 'employee');
          const panRes = await uploadMasterDocument(panFormData);
          if (panRes.error) throw new Error(`PAN upload failed: ${panRes.error}`);
          panUrl = panRes.publicUrl;
        }

        if (aadharFile) {
          const aadharFormData = new FormData();
          aadharFormData.append('file', aadharFile);
          aadharFormData.append('type', 'aadhar');
          aadharFormData.append('masterId', data.empCode || 'temp');
          aadharFormData.append('masterType', 'employee');
          const aadharRes = await uploadMasterDocument(aadharFormData);
          if (aadharRes.error) throw new Error(`Aadhar upload failed: ${aadharRes.error}`);
          aadharUrl = aadharRes.publicUrl;
        }

        if (passbookFile) {
          const pbFormData = new FormData();
          pbFormData.append('file', passbookFile);
          pbFormData.append('type', 'bank_passbook');
          pbFormData.append('masterId', data.empCode || 'temp');
          pbFormData.append('masterType', 'employee');
          const pbRes = await uploadMasterDocument(pbFormData);
          if (pbRes.error) throw new Error(`Passbook upload failed: ${pbRes.error}`);
          bankPassbookUrl = pbRes.publicUrl;
        }
      }

      const payload = {
        ...data,
        panUrl,
        aadharUrl,
        bankPassbookUrl,
        salaryStructure: {
          ...data.salaryStructure,
          basic: Math.round((data.salaryStructure.basic || 0) * 100),
          hra: Math.round((data.salaryStructure.hra || 0) * 100),
          conveyance: Math.round((data.salaryStructure.conveyance || 0) * 100),
          driverAllowance: Math.round((data.salaryStructure.driverAllowance || 0) * 100),
          otherAllowances: Math.round((data.salaryStructure.otherAllowances || 0) * 100),
        }
      };

      const url = isEditing ? `/api/v1/masters/employees/${initialData.id}` : '/api/v1/masters/employees';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      
      toast.success(isEditing ? 'Profile Synchronized' : 'Staff Member Registered & Credentials Sent');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-0">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-8 border-b border-slate-100 bg-slate-50/30">
          <TabsList className="bg-transparent border-none p-0 gap-6 h-14">
            <TabTrigger value="profile" icon={<User className="h-4 w-4" />} label="Personal" />
            <TabTrigger value="career" icon={<Briefcase className="h-4 w-4" />} label="Career" />
            <TabTrigger value="finance" icon={<IndianRupee className="h-4 w-4" />} label="Finance" />
            <TabTrigger value="compliance" icon={<ShieldCheck className="h-4 w-4" />} label="Compliance" />
          </TabsList>
        </div>

        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar bg-white">
          {/* 1. Profile Tab */}
          <TabsContent value="profile" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Legal Name *" 
                placeholder="As per Aadhar/PAN" 
                icon={<User className="h-4 w-4" />} 
                {...register('name', { required: 'Name is mandatory' })} 
                error={(errors.name as any)?.message} 
                className="border-slate-200 bg-white" 
              />
              <Input 
                label="Mobile Number *" 
                placeholder="10-digit number" 
                icon={<MapPin className="h-4 w-4" />} 
                {...register('phone', { 
                  required: 'Mobile number is mandatory',
                  pattern: { value: /^[0-9]{10}$/, message: 'Invalid 10-digit number' }
                })} 
                error={(errors.phone as any)?.message}
                className="border-slate-200 bg-white" 
              />
              <Input 
                label="Email Address *" 
                type="email" 
                placeholder="official@company.com" 
                icon={<FileText className="h-4 w-4" />} 
                {...register('email', { 
                  required: 'Email is mandatory',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })} 
                error={(errors.email as any)?.message}
                className="border-slate-200 bg-white" 
              />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Gender *</label>
                <select 
                  {...register('gender', { required: 'Select gender' })}
                  className="w-full h-[46px] px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <Input 
                  label="Permanent Address *" 
                  placeholder="Street, City, State, Pincode" 
                  icon={<MapPin className="h-4 w-4" />} 
                  {...register('address', { required: 'Address is mandatory' })} 
                  error={(errors.address as any)?.message}
                  className="border-slate-200 bg-white" 
                />
              </div>
            </div>
          </TabsContent>

          {/* 2. Career Tab */}
          <TabsContent value="career" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Employee ID / Code *" 
                placeholder="e.g. FF-001" 
                icon={<CreditCard className="h-4 w-4" />} 
                {...register('empCode', { required: 'Employee code is mandatory' })} 
                error={(errors.empCode as any)?.message} 
                className="border-slate-200 bg-white" 
              />
              <Input label="Official Designation" placeholder="e.g. Operations Manager" icon={<Briefcase className="h-4 w-4" />} {...register('designation')} className="border-slate-200 bg-white" />
              <Input label="Joining Date" type="date" icon={<CalendarDays className="h-4 w-4" />} {...register('joiningDate')} className="border-slate-200 bg-white" />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role *</label>
                <select 
                  {...register('role', { required: 'Select a role' })}
                  className="w-full h-[46px] px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="staff">Standard Staff</option>
                  <option value="manager">Operations Manager</option>
                  <option value="accountant">Accountant</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Status</label>
                <select 
                  {...register('status')}
                  className="w-full h-[46px] px-4 bg-white border border-slate-200 rounded-xl text-sm font-bold focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                >
                  <option value="active">Active Service</option>
                  <option value="on_leave">On Extended Leave</option>
                  <option value="inactive">Resigned / Inactive</option>
                  <option value="terminated">Terminated</option>
                </select>
              </div>
            </div>
          </TabsContent>

          {/* 3. Finance Tab */}
          <TabsContent value="finance" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input label="Basic Salary (₹) *" type="number" step="0.01" icon={<IndianRupee className="h-4 w-4" />} {...register('salaryStructure.basic', { valueAsNumber: true })} className="border-slate-200 bg-white" />
                <Input label="House Rent (HRA)" type="number" step="0.01" icon={<Building2 className="h-4 w-4" />} {...register('salaryStructure.hra', { valueAsNumber: true })} className="border-slate-200 bg-white" />
                <Input label="Other Allowances" type="number" step="0.01" icon={<IndianRupee className="h-4 w-4" />} {...register('salaryStructure.otherAllowances', { valueAsNumber: true })} className="border-slate-200 bg-white" />
              </div>

              <div className="flex gap-8 p-6 bg-blue-50/30 rounded-3xl border border-blue-100/50">
                <StatutoryToggle label="PF Applicable" {...register('salaryStructure.pfApplicable')} />
                <StatutoryToggle label="ESI Applicable" {...register('salaryStructure.esiApplicable')} />
              </div>

              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 px-1">Bank Settlement Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input label="Bank Account Name" icon={<User className="h-4 w-4" />} {...register('bankAccountName')} className="border-slate-200 bg-white" />
                  <Input label="Bank Name" icon={<Building2 className="h-4 w-4" />} {...register('bankName')} className="border-slate-200 bg-white" />
                  <Input label="Bank Account Number" icon={<CreditCard className="h-4 w-4" />} {...register('bankAccount')} className="border-slate-200 bg-white" />
                  <Input label="Bank IFSC Code" icon={<ShieldCheck className="h-4 w-4" />} {...register('bankIfsc')} className="border-slate-200 bg-white" />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 4. Compliance Tab */}
          <TabsContent value="compliance" className="mt-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Input 
                    label="PAN Number *" 
                    placeholder="ABCDE1234F" 
                    icon={<FileText className="h-4 w-4" />} 
                    {...register('pan', { 
                      required: 'PAN is mandatory',
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
                    })} 
                    error={(errors.pan as any)?.message}
                    className="border-slate-200 bg-white" 
                  />
                  <DocumentUpload label="PAN Card Copy" file={panFile} onFileSelect={setPanFile} existingUrl={initialData?.panUrl} />
                </div>
                <div className="space-y-4">
                  <Input 
                    label="Aadhar Number *" 
                    placeholder="12-digit number" 
                    icon={<FileText className="h-4 w-4" />} 
                    {...register('aadharNo', { 
                      required: 'Aadhar is mandatory',
                      pattern: { value: /^[0-9]{12}$/, message: 'Invalid 12-digit Aadhar' }
                    })} 
                    error={(errors.aadharNo as any)?.message}
                    className="border-slate-200 bg-white" 
                  />
                  <DocumentUpload label="Aadhar Card Copy" file={aadharFile} onFileSelect={setAadharFile} existingUrl={initialData?.aadharUrl} />
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100">
                 <DocumentUpload label="Bank Passbook / Cancelled Cheque (Max 1MB)" file={passbookFile} onFileSelect={setPassbookFile} existingUrl={initialData?.bankPassbookUrl} maxMB={1} />
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 px-8 py-6 border-t border-slate-100 bg-slate-50/50">
        <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-8 rounded-2xl font-bold text-slate-400 hover:text-slate-600 hover:bg-white">
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting} 
          className="h-12 px-12 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl shadow-blue-100 transition-all active:scale-95"
        >
          {isEditing ? 'Commit Profile Updates' : 'Confirm Registration'}
        </Button>
      </div>
    </form>
  );
}

function TabTrigger({ value, icon, label }: { value: string; icon: React.ReactNode; label: string }) {
  return (
    <TabsTrigger 
      value={value}
      className="data-[state=active]:text-blue-600 data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-xl px-4 text-slate-400 font-black text-[10px] uppercase tracking-widest gap-2 transition-all"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function StatutoryToggle({ label, ...props }: any) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div className="relative">
        <input type="checkbox" className="sr-only" {...props} />
        <div className="h-6 w-11 bg-slate-200 rounded-full group-hover:bg-slate-300 transition-colors" />
        <div className="dot absolute left-1 top-1 h-4 w-4 bg-white rounded-full transition-all" />
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    </label>
  );
}

function DocumentUpload({ label, file, onFileSelect, existingUrl, maxMB = 5 }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className={cn(
        "relative h-32 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden",
        file ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white hover:border-blue-400 hover:bg-blue-50/30"
      )}>
        {file ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-100">
              <Check className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase truncate max-w-[200px]">{file.name}</p>
            <button onClick={() => onFileSelect(null)} className="text-[9px] font-bold text-rose-500 uppercase hover:underline">Remove</button>
          </div>
        ) : existingUrl ? (
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-100">
              <FileText className="h-4 w-4" />
            </div>
            <p className="text-[10px] font-black text-blue-600 uppercase">Document Verified</p>
            <input type="file" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > maxMB * 1024 * 1024) {
                toast.error(`File size exceeds ${maxMB}MB limit`);
                return;
              }
              onFileSelect(f);
            }} className="absolute inset-0 opacity-0 cursor-pointer" />
            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Click to replace</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
              <Upload className="h-6 w-6 text-slate-300 group-hover:text-blue-500" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase">Click to upload</p>
            <p className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">PDF, JPG, or PNG (Max {maxMB}MB)</p>
            <input type="file" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f && f.size > maxMB * 1024 * 1024) {
                toast.error(`File size exceeds ${maxMB}MB limit`);
                return;
              }
              onFileSelect(f);
            }} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
        )}
      </div>
    </div>
  );
}


