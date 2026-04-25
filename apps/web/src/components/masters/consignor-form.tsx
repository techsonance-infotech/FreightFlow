'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConsignorSchema, type Consignor } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ConsignorFormProps {
  initialData?: Partial<Consignor>;
  onSuccess: (data: Consignor) => void;
  onCancel: () => void;
}

export function ConsignorForm({ initialData, onSuccess, onCancel }: ConsignorFormProps) {
  const isEditing = !!initialData?.id;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(ConsignorSchema),
    defaultValues: { isActive: true, ...initialData },
  });

  const onSubmit = async (data: any) => {
    try {
      const url = isEditing ? `/api/v1/masters/consignors/${initialData?.id}` : '/api/v1/masters/consignors';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      toast.success(isEditing ? 'Consignor updated' : 'Consignor created');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Name *" placeholder="e.g. John Doe" icon="👤" error={(errors.name as any)?.message} {...register('name')} />
        <Input label="Company Name" placeholder="e.g. ABC Corp" icon="🏢" error={(errors.companyName as any)?.message} {...register('companyName')} />
        <Input label="Email" placeholder="email@example.com" icon="📧" error={(errors.email as any)?.message} {...register('email')} />
        <Input label="Phone" placeholder="10-digit number" icon="📱" error={(errors.phone as any)?.message} {...register('phone')} />
        <Input label="GSTIN" placeholder="GST Number" icon="⚖️" error={(errors.gstin as any)?.message} {...register('gstin')} />
        <div className="md:col-span-2">
          <Input label="Address" placeholder="Full Address" icon="🏠" error={(errors.address as any)?.message} {...register('address')} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Consignor' : 'Create Consignor'}</Button>
      </div>
    </form>
  );
}
