'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PalletMasterSchema, type PalletMaster } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface PalletMasterFormProps {
  initialData?: Partial<PalletMaster>;
  onSuccess: (data: PalletMaster) => void;
  onCancel: () => void;
}

export const PalletMasterForm: React.FC<PalletMasterFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PalletMaster>({
    resolver: zodResolver(PalletMasterSchema) as any,
    defaultValues: {
      ...initialData,
      palletId: initialData?.palletId || '',
      name: initialData?.name || '',
      dimensions: initialData?.dimensions || '',
      weightCapacity: initialData?.weightCapacity || 0,
      isActive: initialData?.isActive ?? true,
    }
  });

  const onSubmit = async (data: PalletMaster) => {
    try {
      const palletId = initialData?.id;
      const method = palletId ? 'PUT' : 'POST';
      const url = palletId ? `/api/v1/masters/pallets/${palletId}` : '/api/v1/masters/pallets';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to save pallet');
      }

      const savedData = await response.json();
      toast.success(initialData?.id ? 'Pallet updated' : 'Pallet created');
      onSuccess(savedData);
    } catch (error: any) {
      toast.error(error.message || 'Error saving pallet');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Pallet ID *" 
          placeholder="e.g. PL-001" 
          error={errors.palletId?.message} 
          {...register('palletId')} 
        />
        <Input 
          label="Pallet Name/Type" 
          placeholder="e.g. Standard Wooden" 
          error={errors.name?.message} 
          {...register('name')} 
        />
        <Input 
          label="Dimensions" 
          placeholder="e.g. 120x100x15 cm" 
          error={errors.dimensions?.message} 
          {...register('dimensions')} 
        />
        <Input 
          label="Weight Capacity (kg)" 
          type="number"
          placeholder="e.g. 1500" 
          error={errors.weightCapacity?.message} 
          {...register('weightCapacity')} 
          min="0"
          onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel} className="rounded-xl font-bold uppercase text-[10px] tracking-widest text-slate-400">Cancel</Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 font-black uppercase text-[10px] tracking-widest shadow-xl shadow-blue-100"
        >
          {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Pallet' : 'Create Pallet')}
        </Button>
      </div>
    </form>
  );
};
