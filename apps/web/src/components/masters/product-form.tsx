'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, type Product } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSuccess: (data: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!initialData?.id;
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(ProductSchema),
    defaultValues: { isActive: true, ...initialData },
  });

  const onSubmit = async (data: Product) => {
    try {
      const url = isEditing ? `/api/v1/masters/products/${initialData.id}` : '/api/v1/masters/products';
      const response = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save');
      toast.success(isEditing ? 'Product updated' : 'Product created');
      onSuccess(result);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="Product Name *" placeholder="e.g. Cement, Steel Rods" icon="📦" error={(errors.name as any)?.message} {...register('name')} />
        <Input label="HSN Code" placeholder="e.g. 2523" icon="🔢" error={(errors.hsnCode as any)?.message} {...register('hsnCode')} />
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Default Packing</label>
          <select {...register('defaultPacking')} className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none">
            <option value="">Select Packing Type</option>
            <option value="Box">Box</option>
            <option value="Bag">Bag</option>
            <option value="Pallet">Pallet</option>
            <option value="Loose">Loose</option>
            <option value="Crate">Crate</option>
          </select>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>{isEditing ? 'Update Product' : 'Create Product'}</Button>
      </div>
    </form>
  );
}
