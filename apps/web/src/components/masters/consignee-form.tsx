'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ConsigneeSchema, type Consignee } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ConsigneeFormProps {
  initialData?: Partial<Consignee>;
  onSuccess: (data: Consignee) => void;
  onCancel: () => void;
}

export function ConsigneeForm({ initialData, onSuccess, onCancel }: ConsigneeFormProps) {
  const isEditing = !!initialData?.id;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(ConsigneeSchema),
    defaultValues: { isActive: true, ...initialData },
  });

  const onSubmit = async (data: Consignee) => {
    try {
      const url = isEditing ? `/api/v1/masters/consignees/${initialData.id}` : '/api/v1/masters/consignees';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      toast.success(isEditing ? 'Consignee updated' : 'Consignee created');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Name *" placeholder="e.g. John Doe" icon="👤" error={errors.name?.message} {...register('name')} />
        <Input label="Company Name" placeholder="e.g. ABC Corp" icon="🏢" error={errors.companyName?.message} {...register('companyName')} />
        <Input label="Email" placeholder="email@example.com" icon="📧" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" placeholder="10-digit number" icon="📱" error={errors.phone?.message} {...register('phone')} />
        <Input label="GSTIN" placeholder="GST Number" icon="⚖️" error={errors.gstin?.message} {...register('gstin')} />
        <Input label="PAN" placeholder="PAN Number" icon="📄" error={errors.pan?.message} {...register('pan')} />
        <div className="md:col-span-2">
          <Input label="Address" placeholder="Full Address" icon="🏠" error={errors.address?.message} {...register('address')} />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Consignee' : 'Create Consignee'}</Button>
      </div>
    </form>
  );
}
