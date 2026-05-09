'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProductSchema, type Product, type ProductCategory, type ProductUnit } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadMasterDocument } from '@/app/actions/masters/labour';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuickAddModal } from './quick-add-modal';
import { ProductCategoryForm } from './product-category-form';
import { ProductUnitForm } from './product-unit-form';
import { Package, Hash, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSuccess: (data: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ initialData, onSuccess, onCancel }: ProductFormProps) {
  const isEditing = !!initialData?.id;
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gstType, setGstType] = useState<'preset' | 'other'>('preset');

  const presets = [0, 5, 12, 18, 28];

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(ProductSchema) as any,
    defaultValues: { 
      isActive: true, 
      gstRate: 0,
      ...initialData 
    },
  });

  const selectedCategory = watch('categoryId');
  const selectedUnit = watch('unitId');
  const currentGstRate = watch('gstRate');

  useEffect(() => {
    if (initialData?.gstRate !== undefined && !presets.includes(initialData.gstRate)) {
      setGstType('other');
    }
  }, [initialData]);

  const fetchData = async () => {
    try {
      const [catRes, unitRes] = await Promise.all([
        fetch('/api/v1/masters/product-categories'),
        fetch('/api/v1/masters/product-units')
      ]);
      if (catRes.ok) setCategories(await catRes.json());
      if (unitRes.ok) setUnits(await unitRes.json());
    } catch (err) {
      console.error('Failed to fetch masters');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (data: Product) => {
    setUploading(true);
    try {
      let imageUrl = data.imageUrl;

      // 1. Upload image if selected
      if (productImage && initialData?.id) {
        const formData = new FormData();
        formData.append('file', productImage);
        formData.append('type', 'product_image');
        formData.append('masterId', initialData.id);
        formData.append('masterType', 'product');

        const res = await uploadMasterDocument(formData);
        if (res.error) throw new Error(`Image Upload: ${res.error}`);
        if (res.publicUrl) imageUrl = res.publicUrl;
      }

      // 2. Save/Update Product
      const url = isEditing ? `/api/v1/masters/products/${initialData.id}` : '/api/v1/masters/products';
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, imageUrl }),
      });
      
      let savedData = await response.json();
      if (!response.ok) throw new Error(savedData.error?.[0]?.message || savedData.error || 'Failed to save');

      // 3. For NEW product, upload image if selected
      if (!isEditing && productImage) {
        const productId = savedData.id;
        const formData = new FormData();
        formData.append('file', productImage);
        formData.append('type', 'product_image');
        formData.append('masterId', productId);
        formData.append('masterType', 'product');

        const res = await uploadMasterDocument(formData);
        if (res.success && res.publicUrl) {
          const patchRes = await fetch(`/api/v1/masters/products/${productId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl: res.publicUrl }),
          });
          if (patchRes.ok) savedData = await patchRes.json();
        }
      }

      toast.success(isEditing ? 'Product updated successfully' : 'Product created successfully');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full">
          <Input label="Product Name *" placeholder="e.g. Ultratech Cement 50kg" icon={<Package className="h-4 w-4" />} error={errors.name?.message as any} {...register('name')} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category *</label>
            <QuickAddModal 
              entity="Category" 
              title="Add New Category" 
              FormComponent={ProductCategoryForm} 
              onSuccess={(newCat) => {
                setCategories([...categories, newCat]);
                setValue('categoryId', newCat.id);
              }}
              trigger={<button type="button" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest">+ Quick Add</button>}
            />
          </div>
          <Select value={selectedCategory} onValueChange={(val) => setValue('categoryId', val)}>
            <SelectTrigger className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-slate-100 transition-all ${
              errors.categoryId ? 'border-red-500 ring-2 ring-red-500/10' : ''
            }`}>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(cat => <SelectItem key={cat.id} value={cat.id as string}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.categoryId && <p className="text-[10px] font-bold text-red-500 px-1">{errors.categoryId.message as string}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Base Unit *</label>
            <QuickAddModal 
              entity="Unit" 
              title="Add New Unit" 
              FormComponent={ProductUnitForm} 
              onSuccess={(newUnit) => {
                setUnits([...units, newUnit]);
                setValue('unitId', newUnit.id);
              }}
              trigger={<button type="button" className="text-[10px] font-black text-orange-600 hover:text-orange-700 uppercase tracking-widest">+ Quick Add</button>}
            />
          </div>
          <Select value={selectedUnit} onValueChange={(val) => setValue('unitId', val)}>
            <SelectTrigger className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-slate-100 transition-all ${
              errors.unitId ? 'border-red-500 ring-2 ring-red-500/10' : ''
            }`}>
              <SelectValue placeholder="Select Unit" />
            </SelectTrigger>
            <SelectContent>
              {units.map(u => <SelectItem key={u.id} value={u.id as string}>{u.name}</SelectItem>)}
            </SelectContent>
          </Select>
          {errors.unitId && <p className="text-[10px] font-bold text-red-500 px-1">{errors.unitId.message as string}</p>}
        </div>

        <Input label="HSN Code *" placeholder="e.g. 2523" icon={<Hash className="h-4 w-4" />} error={errors.hsnCode?.message as any} {...register('hsnCode')} />
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">GST Rate (%) *</label>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select 
                value={gstType === 'preset' ? currentGstRate.toString() : 'other'} 
                onValueChange={(val) => {
                  if (val === 'other') {
                    setGstType('other');
                  } else {
                    setGstType('preset');
                    setValue('gstRate', parseInt(val));
                  }
                }}
              >
                <SelectTrigger className={`w-full h-11 px-4 rounded-xl bg-slate-50 border-slate-100 transition-all ${
                  errors.gstRate ? 'border-red-500 ring-2 ring-red-500/10' : ''
                }`}>
                  <SelectValue placeholder="Select GST" />
                </SelectTrigger>
                <SelectContent>
                  {presets.map(p => <SelectItem key={p} value={p.toString()}>{p}% GST</SelectItem>)}
                  <SelectItem value="other">Other / Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {gstType === 'other' && (
              <input 
                type="number" 
                placeholder="Rate" 
                className="w-24 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none"
                value={currentGstRate === 0 && gstType === 'other' ? '' : currentGstRate}
                onChange={(e) => {
                  const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                  setValue('gstRate', val);
                }}
                onFocus={(e) => {
                  if (e.target.value === '0') setValue('gstRate', '' as any);
                }}
              />
            )}
          </div>
          {errors.gstRate && <p className="text-[10px] font-bold text-red-500 px-1">{errors.gstRate.message as string}</p>}
        </div>
        
        <div className="col-span-full space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description</label>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${(watch('description')?.length || 0) > 200 ? 'text-red-500' : 'text-slate-300'}`}>
              {(watch('description')?.length || 0)} / 200
            </span>
          </div>
          <textarea 
            {...register('description')} 
            rows={3} 
            placeholder="Add product specifications (max 200 chars)..." 
            className="w-full rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none" 
          />
          {errors.description && <p className="text-[10px] font-bold text-red-500 px-1">{errors.description.message as string}</p>}
        </div>

        <div className="col-span-full">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1 block mb-2">Product Image</label>
          <div className="flex items-center gap-4">
            <label className="flex-1 flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-50 transition-colors">
              <ImageIcon className="h-6 w-6 text-slate-400" />
              <div className="text-left">
                <p className="text-sm font-black text-slate-900">{productImage ? productImage.name : 'Select Image'}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">PNG, JPG up to 5MB</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => setProductImage(e.target.files?.[0] || null)} />
            </label>
            {initialData?.imageUrl && (
              <a href={initialData.imageUrl} target="_blank" rel="noreferrer" className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shrink-0 bg-slate-50 group relative">
                <img src={initialData.imageUrl} alt="Product" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">View</span>
                </div>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting || uploading}>{isEditing ? 'Update Product' : 'Create Product'}</Button>
      </div>
    </form>
  );
}
