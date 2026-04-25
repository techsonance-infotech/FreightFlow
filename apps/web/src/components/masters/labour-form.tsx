'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LabourSchema, type Labour } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LabourFormProps {
  initialData?: Partial<Labour>;
  onSuccess: (data: Labour) => void;
  onCancel: () => void;
}

export function LabourForm({ initialData, onSuccess, onCancel }: LabourFormProps) {
  const isEditing = !!initialData?.id;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(LabourSchema),
    defaultValues: { 
      isActive: true, 
      ...initialData,
      // Convert paise to rupees for display
      salary: initialData?.salary ? initialData.salary / 100 : 0
    },
  });

  const onSubmit = async (data: Labour) => {
    try {
      // Convert rupees back to paise for storage
      const payload = { ...data, salary: Math.round(data.salary * 100) };
      
      const url = isEditing ? `/api/v1/masters/labour/${initialData.id}` : '/api/v1/masters/labour';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      toast.success(isEditing ? 'Worker updated' : 'Worker registered');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Worker Name *" placeholder="e.g. Ramesh Kumar" icon="👤" error={(errors.name as any)?.message} {...register('name')} />
        <Input label="Phone Number" placeholder="10-digit number" icon="📱" error={(errors.phone as any)?.message} {...register('phone')} />
        <Input label="Monthly Salary (₹) *" type="number" step="0.01" icon="💰" error={(errors.salary as any)?.message} {...register('salary', { valueAsNumber: true })} />
        <div className="md:col-span-2">
          <Input label="Full Address" placeholder="Home address" icon="🏠" error={(errors.address as any)?.message} {...register('address')} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Worker' : 'Register Worker'}</Button>
      </div>
    </form>
  );
}
