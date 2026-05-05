'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductUnitSchema, type ProductUnit } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductUnitFormProps {
  onSuccess: (data: ProductUnit) => void;
  onCancel: () => void;
}

export function ProductUnitForm({ onSuccess, onCancel }: ProductUnitFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductUnit>({
    resolver: zodResolver(ProductUnitSchema),
  });

  const onSubmit = async (data: ProductUnit) => {
    try {
      const response = await fetch('/api/v1/masters/product-units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create unit');
      toast.success('Unit created');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100/50 flex items-center gap-3">
        <span className="text-xl">📏</span>
        <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Define standard units of measurement for your inventory (e.g., BOX, KG, MT).</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="Unit Name *" 
          placeholder="e.g. Metric Ton, Kilogram" 
          icon="⚖️" 
          error={errors.name?.message} 
          {...register('name')} 
        />
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
          <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="px-8 font-black">Create Unit</Button>
        </div>
      </form>
    </div>
  );
}
