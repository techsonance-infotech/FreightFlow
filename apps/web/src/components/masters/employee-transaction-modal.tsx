'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { EmployeeTransactionSchema } from '@freightflow/shared';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface EmployeeTransactionModalProps {
  employeeId: string;
  initialData?: any;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EmployeeTransactionModal({ employeeId, initialData, onSuccess, onCancel }: EmployeeTransactionModalProps) {
  const isEditing = !!initialData?.id;
  
  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<any>({
    resolver: zodResolver(EmployeeTransactionSchema),
    defaultValues: {
      employeeId,
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      type: initialData?.type || 'Advance',
      paymentMode: initialData?.paymentMode || 'Cash',
      amount: initialData?.amount ? initialData.amount / 100 : 0,
      message: initialData?.message || '',
    },
  });

  const selectedType = watch('type');
  const selectedMode = watch('paymentMode');

  const onSubmit = async (data: any) => {
    try {
      const payload = { 
        ...data, 
        amount: Math.round(parseFloat(data.amount) * 100) 
      };
      
      const url = isEditing 
        ? `/api/v1/masters/employees/${employeeId}/transactions/${initialData.id}` 
        : `/api/v1/masters/employees/${employeeId}/transactions`;
        
      const response = await fetch(url, {
        method: isEditing ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save transaction');
      
      toast.success(isEditing ? 'Transaction updated successfully' : 'Transaction recorded successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Transaction Type *</label>
          <Select value={selectedType} onValueChange={(val) => setValue('type', val)}>
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Advance">Advance Payment</SelectItem>
              <SelectItem value="Salary">Salary Payment</SelectItem>
              <SelectItem value="Bonus">Bonus</SelectItem>
              <SelectItem value="Deduction">Deduction</SelectItem>
              <SelectItem value="Other">Other Transaction</SelectItem>
            </SelectContent>
          </Select>
          {errors.type && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.type.message as string}</p>}
        </div>

        <Input 
          label="Amount (₹) *" 
          type="number" 
          step="0.01" 
          placeholder="0.00"
          error={(errors.amount as any)?.message} 
          {...register('amount', { valueAsNumber: true })} 
        />

        <Input 
          label="Date *" 
          type="date" 
          error={(errors.date as any)?.message} 
          {...register('date')} 
        />

        <div className="space-y-2">
          <label className="text-xs font-black uppercase tracking-widest text-slate-500">Payment Mode</label>
          <Select value={selectedMode} onValueChange={(val) => setValue('paymentMode', val)}>
            <SelectTrigger className="w-full h-11 bg-slate-50 border-slate-100 rounded-xl">
              <SelectValue placeholder="Select mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Cash">Cash</SelectItem>
              <SelectItem value="Bank">Bank Transfer</SelectItem>
              <SelectItem value="Online">Online / UPI</SelectItem>
            </SelectContent>
          </Select>
          {errors.paymentMode && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.paymentMode.message as string}</p>}
        </div>

        <div className="md:col-span-2">
          <Input 
            label="Message / Remarks *" 
            placeholder="e.g. Salary for April 2024" 
            error={(errors.message as any)?.message} 
            {...register('message')} 
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-50">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
          {isEditing ? 'Update Transaction' : 'Record Transaction'}
        </Button>
      </div>
    </form>
  );
}
