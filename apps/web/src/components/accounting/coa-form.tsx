'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChartOfAccountSchema, type ChartOfAccount } from '@freightflow/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface COAFormProps {
  initialData?: ChartOfAccount;
  onSuccess: () => void;
  onCancel: () => void;
  parentOptions: { id: string; name: string; code: string }[];
}

export function COAForm({ initialData, onSuccess, onCancel, parentOptions }: COAFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const methods = useForm<any>({
    resolver: zodResolver(ChartOfAccountSchema),
    defaultValues: initialData || {
      isSystem: false,
      isActive: true,
      type: 'asset'
    }
  });

  const { register, handleSubmit, formState: { errors }, watch } = methods;

  const onSubmit = async (data: ChartOfAccount) => {
    setIsSubmitting(true);
    try {
      // Create only for MVP
      const url = '/api/v1/accounting/coa';
      const method = 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save account');
      }

      toast.success(initialData ? 'Account updated' : 'Account created');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          label="Account Code" 
          placeholder="e.g. 1000" 
          {...register('code')} 
          error={(errors.code as any)?.message} 
        />
        
        <Input 
          label="Account Name *" 
          placeholder="e.g. Cash in Hand" 
          {...register('name')} 
          error={(errors.name as any)?.message} 
        />

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Type</label>
          <select 
            {...register('type')}
            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="asset">Asset</option>
            <option value="liability">Liability</option>
            <option value="equity">Equity</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>
          {errors.type?.message && <p className="text-red-500 text-xs font-bold mt-1">{(errors.type as any).message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Parent Account (Optional)</label>
          <select 
            {...register('parentId')}
            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="">-- No Parent (Root Account) --</option>
            {parentOptions.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-4 mt-6 border-t border-slate-100">
        <input type="checkbox" id="isActive" {...register('isActive')} className="rounded text-blue-600 focus:ring-blue-500" />
        <label htmlFor="isActive" className="text-sm font-bold text-slate-700">Account is Active</label>
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting}>
          {initialData ? 'Save Changes' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
