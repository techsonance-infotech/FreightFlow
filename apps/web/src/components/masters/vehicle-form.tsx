'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { VehicleSchema, type Vehicle } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VehicleFormProps {
  initialData?: Partial<Vehicle>;
  onSuccess: (data: Vehicle) => void;
  onCancel: () => void;
}

export function VehicleForm({ initialData, onSuccess, onCancel }: VehicleFormProps) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(VehicleSchema),
    defaultValues: {
      status: 'active',
      type: 'Truck',
      ownership: 'Own',
      odometer: 0,
      ...initialData,
    },
  });

  const onSubmit = async (data: Vehicle) => {
    try {
      const url = isEditing ? `/api/v1/masters/vehicles/${initialData.id}` : '/api/v1/masters/vehicles';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save vehicle');

      toast.success(isEditing ? 'Vehicle updated' : 'Vehicle registered');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Registration Number *" placeholder="e.g. MH01AB1234" icon="🚛" error={(errors.regNo as any)?.message} {...register('regNo')} />
        <Input label="Make" placeholder="e.g. Tata, Ashok Leyland" icon="🏗️" error={(errors.make as any)?.message} {...register('make')} />
        <Input label="Model" placeholder="e.g. Signa 4825.TK" icon="📐" error={(errors.model as any)?.message} {...register('model')} />
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Vehicle Type</label>
          <select {...register('type')} className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none">
            <option value="Truck">Truck</option>
            <option value="Trailer">Trailer</option>
            <option value="Tempo">Tempo</option>
            <option value="Container">Container</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Ownership</label>
          <select {...register('ownership')} className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none">
            <option value="Own">Own</option>
            <option value="Hired">Hired</option>
          </select>
        </div>

        <Input label="Chassis Number" placeholder="Chassis No" icon="🔢" error={(errors.chassisNo as any)?.message} {...register('chassisNo')} />
        <Input label="Engine Number" placeholder="Engine No" icon="⚙️" error={(errors.engineNo as any)?.message} {...register('engineNo')} />
        <Input label="Current Odometer" type="number" icon="📟" error={(errors.odometer as any)?.message} {...register('odometer', { valueAsNumber: true })} />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Vehicle' : 'Register Vehicle'}</Button>
      </div>
    </form>
  );
}
