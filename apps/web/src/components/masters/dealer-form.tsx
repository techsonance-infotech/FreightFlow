'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DealerSchema, type Dealer } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface DealerFormProps {
  initialData?: Partial<Dealer>;
  onSuccess: (data: Dealer) => void;
  onCancel: () => void;
}

export function DealerForm({ initialData, onSuccess, onCancel }: DealerFormProps) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(DealerSchema),
    defaultValues: {
      isActive: true,
      ...initialData,
    },
  });

  const onSubmit = async (data: Dealer) => {
    try {
      const url = isEditing 
        ? `/api/v1/masters/dealers/${initialData.id}` 
        : '/api/v1/masters/dealers';
      
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save dealer');
      }

      toast.success(isEditing ? 'Dealer updated successfully' : 'Dealer created successfully');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
      console.error('Dealer form error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Full Name of Dealer / Entity"
            placeholder="e.g. Shree Shivay Roadlines"
            icon="🏢"
            error={(errors.name as any)?.message}
            {...register('name')}
          />
        </div>

        <Input
          label="Short Name / Alias"
          placeholder="e.g. SSR"
          icon="🏷️"
          error={(errors.shortName as any)?.message}
          {...register('shortName')}
        />

        <Input
          label="Contact Person Name"
          placeholder="e.g. Rahul Sharma"
          icon="👤"
          error={(errors.personName as any)?.message}
          {...register('personName')}
        />

        <Input
          label="Mobile Number"
          placeholder="10-digit number"
          icon="📱"
          error={(errors.phone as any)?.message}
          {...register('phone')}
        />

        <Input
          label="Email Address"
          placeholder="dealer@example.com"
          icon="📧"
          error={(errors.email as any)?.message}
          {...register('email')}
        />

        <Input
          label="GSTIN"
          placeholder="15-digit GST Number"
          icon="⚖️"
          error={(errors.gstin as any)?.message}
          {...register('gstin')}
        />

        <Input
          label="PAN"
          placeholder="10-digit PAN"
          icon="📄"
          error={(errors.pan as any)?.message}
          {...register('pan')}
        />

        <Input
          label="Area / Locality"
          placeholder="e.g. Transport Nagar"
          icon="📍"
          error={(errors.area as any)?.message}
          {...register('area')}
        />

        <Input
          label="Pincode"
          placeholder="6-digit PIN"
          icon="📮"
          error={(errors.pincode as any)?.message}
          {...register('pincode')}
        />

        <div className="md:col-span-2">
          <Input
            label="Full Registered Address"
            placeholder="Detailed office address..."
            icon="🏠"
            error={(errors.address as any)?.message}
            {...register('address')}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Discard Changes
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isEditing ? 'Update Dealer Profile' : 'Register New Dealer'}
        </Button>
      </div>
    </form>
  );
}
