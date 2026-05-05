'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DriverSchema, type Driver } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DriverFormProps {
  initialData?: Partial<Driver>;
  onSuccess: (data: Driver) => void;
  onCancel: () => void;
}

export function DriverForm({ initialData, onSuccess, onCancel }: DriverFormProps) {
  const isEditing = !!initialData?.id;
  const [employees, setEmployees] = useState<any[]>([]);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(DriverSchema),
    defaultValues: { 
      isVendorDriver: false,
      ...initialData,
      // Format date for input
      dlExpiry: initialData?.dlExpiry ? new Date(initialData.dlExpiry).toISOString().split('T')[0] : ''
    },
  });

  useEffect(() => {
    fetch('/api/v1/employees')
      .then(res => res.json())
      .then(data => setEmployees(data))
      .catch(() => toast.error('Failed to load employees'));
  }, []);

  const onSubmit = async (data: Driver) => {
    try {
      const url = isEditing ? `/api/v1/masters/drivers/${initialData.id}` : '/api/v1/masters/drivers';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      toast.success(isEditing ? 'Driver updated' : 'Driver registered');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Linked Employee *</label>
          <select {...register('employeeId')} className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none">
            <option value="">Select Employee</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.empCode})
              </option>
            ))}
          </select>
          {(errors.employeeId as any) && <p className="text-[10px] font-bold text-red-600 px-1 uppercase tracking-wider">{(errors.employeeId as any).message}</p>}
        </div>

        <Input label="DL Number *" placeholder="e.g. MH0120230001234" icon="🪪" error={(errors.dlNumber as any)?.message} {...register('dlNumber')} />
        <Input label="DL Expiry Date *" type="date" icon="📅" error={(errors.dlExpiry as any)?.message} {...register('dlExpiry')} />
        <Input label="DL Category" placeholder="e.g. LMV, HMV" icon="🚚" error={(errors.dlCategory as any)?.message} {...register('dlCategory')} />
        <Input label="Badge Number" placeholder="e.g. B-12345" icon="🛡️" error={(errors.badgeNo as any)?.message} {...register('badgeNo')} />
        
        <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <input type="checkbox" id="isVendorDriver" {...register('isVendorDriver')} className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
          <label htmlFor="isVendorDriver" className="text-sm font-bold text-slate-700 uppercase tracking-widest">Vendor Driver</label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Driver' : 'Register Driver'}</Button>
      </div>
    </form>
  );
}
