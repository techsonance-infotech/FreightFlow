'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductCategorySchema, type ProductCategory } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductCategoryFormProps {
  onSuccess: (data: ProductCategory) => void;
  onCancel: () => void;
}

export function ProductCategoryForm({ onSuccess, onCancel }: ProductCategoryFormProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProductCategory>({
    resolver: zodResolver(ProductCategorySchema),
  });

  const onSubmit = async (data: ProductCategory) => {
    try {
      const response = await fetch('/api/v1/masters/product-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to create category');
      toast.success('Category created');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50 flex items-center gap-3">
        <span className="text-xl">💡</span>
        <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Adding a category helps in grouping products for better reporting and tax tracking.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input 
          label="Category Name *" 
          placeholder="e.g. Raw Material, Finished Goods" 
          icon="🏷️" 
          error={errors.name?.message} 
          {...register('name')} 
        />
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-50">
          <Button type="button" variant="ghost" onClick={onCancel} className="font-bold">Cancel</Button>
          <Button type="submit" loading={isSubmitting} className="px-8 font-black">Create Category</Button>
        </div>
      </form>
    </div>
  );
}
