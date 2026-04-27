'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeSchema, type Employee } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface EmployeeFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function EmployeeForm({ initialData, onSuccess, onCancel }: EmployeeFormProps) {
  const isEditing = !!initialData?.id;
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    defaultValues: {
      status: 'active',
      ...initialData,
      joiningDate: initialData?.joiningDate ? new Date(initialData.joiningDate).toISOString().split('T')[0] : '',
      salaryStructure: {
        basic: initialData?.salaryStructure?.basic / 100 || 0,
        hra: initialData?.salaryStructure?.hra / 100 || 0,
        conveyance: initialData?.salaryStructure?.conveyance / 100 || 0,
        driverAllowance: initialData?.salaryStructure?.driverAllowance / 100 || 0,
        otherAllowances: initialData?.salaryStructure?.otherAllowances / 100 || 0,
        pfApplicable: initialData?.salaryStructure?.pfApplicable ?? true,
        esiApplicable: initialData?.salaryStructure?.esiApplicable ?? false,
        effectiveFrom: initialData?.salaryStructure?.effectiveFrom ? new Date(initialData.salaryStructure.effectiveFrom).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      }
    }
  });

  const onSubmit = async (data: any) => {
    try {
      // Convert rupees back to paise
      const payload = {
        ...data,
        salaryStructure: {
          ...data.salaryStructure,
          basic: Math.round(data.salaryStructure.basic * 100),
          hra: Math.round(data.salaryStructure.hra * 100),
          conveyance: Math.round(data.salaryStructure.conveyance * 100),
          driverAllowance: Math.round(data.salaryStructure.driverAllowance * 100),
          otherAllowances: Math.round(data.salaryStructure.otherAllowances * 100),
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
      toast.success(isEditing ? 'Employee updated' : 'Employee registered');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-h-[80vh] overflow-y-auto px-1">
      <div className="space-y-6">
        <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest border-b border-slate-100 pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Employee Name *" icon="👤" {...register('name')} error={(errors.name as any)?.message} />
          <Input label="Employee Code *" icon="🆔" {...register('empCode')} error={(errors.empCode as any)?.message} />
          <Input label="Designation" icon="💼" {...register('designation')} />
          <Input label="Joining Date" type="date" icon="📅" {...register('joiningDate')} />
          <Input label="Phone" icon="📱" {...register('phone')} />
          <Input label="Email" type="email" icon="📧" {...register('email')} />
        </div>

        <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest border-b border-slate-100 pb-2 pt-4">Salary Structure (Monthly ₹)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input label="Basic Salary *" type="number" step="0.01" icon="💰" {...register('salaryStructure.basic', { valueAsNumber: true })} />
          <Input label="HRA" type="number" step="0.01" icon="🏠" {...register('salaryStructure.hra', { valueAsNumber: true })} />
          <Input label="Conveyance" type="number" step="0.01" icon="🚗" {...register('salaryStructure.conveyance', { valueAsNumber: true })} />
          <Input label="Driver Allowance" type="number" step="0.01" icon="🚚" {...register('salaryStructure.driverAllowance', { valueAsNumber: true })} />
          <Input label="Other Allowances" type="number" step="0.01" icon="➕" {...register('salaryStructure.otherAllowances', { valueAsNumber: true })} />
          <Input label="Effective From" type="date" icon="📅" {...register('salaryStructure.effectiveFrom')} />
        </div>

        <div className="flex gap-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('salaryStructure.pfApplicable')} className="h-5 w-5 rounded border-slate-300 text-blue-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">PF Applicable (12%)</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" {...register('salaryStructure.esiApplicable')} className="h-5 w-5 rounded border-slate-300 text-blue-600" />
            <span className="text-xs font-black text-slate-700 uppercase tracking-widest">ESI Applicable</span>
          </label>
        </div>

        <h3 className="text-sm font-black text-brand-900 uppercase tracking-widest border-b border-slate-100 pb-2 pt-4">Statutory & Bank</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="PAN Number" icon="💳" {...register('pan')} />
          <Input label="Bank Account Details" placeholder="Account No, IFSC, Branch" icon="🏦" {...register('bankAccount')} />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="bg-brand-600 text-white px-8">
          {isEditing ? 'Update Employee' : 'Save Employee'}
        </Button>
      </div>
    </form>
  );
}
