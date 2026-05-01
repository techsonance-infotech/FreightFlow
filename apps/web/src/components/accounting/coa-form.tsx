'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChartOfAccountSchema, type ChartOfAccount } from '@freightflow/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

  const { register, handleSubmit, formState: { errors }, reset, setValue } = methods;

  const fetchNextCode = async () => {
    try {
      const res = await fetch('/api/v1/accounting/coa?nextCode=true');
      const json = await res.json();
      if (json.data) {
        setValue('code', json.data);
      }
    } catch (err) {
      console.error('Failed to fetch next account code');
    }
  };

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      fetchNextCode();
    }
  }, [initialData, reset]);

  const onSubmit = async (data: ChartOfAccount) => {
    setIsSubmitting(true);
    try {
      const url = '/api/v1/accounting/coa' + (initialData ? `?id=${initialData.id}` : '');
      const method = initialData ? 'PUT' : 'POST';

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 py-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
            Account Code <span className="text-rose-500">*</span>
          </label>
          <input 
            {...register('code')}
            placeholder="e.g. 1000"
            className={cn(
              "w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 transition-all",
              errors.code ? "border-rose-300 focus:ring-rose-500/10" : "focus:ring-accent-600/10 focus:border-accent-600"
            )}
          />
          {errors.code?.message && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{(errors.code as any).message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
            Account Name <span className="text-rose-500">*</span>
          </label>
          <input 
            {...register('name')}
            placeholder="e.g. Cash in Hand"
            className={cn(
              "w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 transition-all",
              errors.name ? "border-rose-300 focus:ring-rose-500/10" : "focus:ring-accent-600/10 focus:border-accent-600"
            )}
          />
          {errors.name?.message && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{(errors.name as any).message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">
            Account Type <span className="text-rose-500">*</span>
          </label>
          <select 
            {...register('type')}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none cursor-pointer"
          >
            <option value="asset">Asset (Current/Fixed)</option>
            <option value="liability">Liability (Payables/Loans)</option>
            <option value="equity">Equity (Capital/Earnings)</option>
            <option value="revenue">Revenue (Sales/Income)</option>
            <option value="expense">Expense (Operating/Direct)</option>
          </select>
          {errors.type?.message && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{(errors.type as any).message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Parent Account (Optional)</label>
          <select 
            {...register('parentId', { 
              setValueAs: v => v === "" ? null : v 
            })}
            className={cn(
              "w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 transition-all appearance-none cursor-pointer",
              errors.parentId ? "border-rose-300 focus:ring-rose-500/10" : "focus:ring-accent-600/10 focus:border-accent-600"
            )}
          >
            <option value="">-- No Parent (Root Account) --</option>
            {parentOptions.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>
          {errors.parentId?.message && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{(errors.parentId as any).message}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
        <input 
          type="checkbox" 
          id="isActive" 
          {...register('isActive')} 
          className="h-5 w-5 rounded border-neutral-300 text-accent-600 focus:ring-accent-600/20" 
        />
        <label htmlFor="isActive" className="text-xs font-bold text-neutral-700 uppercase tracking-widest cursor-pointer select-none">
          Active Account <span className="text-[9px] font-medium text-neutral-400 ml-2">(Enabled for transactions)</span>
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="h-12 px-8 font-bold text-xs uppercase tracking-widest"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          loading={isSubmitting}
          className="h-12 px-8 bg-accent-600 hover:bg-accent-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-accent-600/20"
        >
          {initialData ? 'Update Account' : 'Create Account'}
        </Button>
      </div>
    </form>
  );
}
