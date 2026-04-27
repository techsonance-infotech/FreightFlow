'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JournalEntrySchema, type JournalEntry } from '@freightflow/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface VoucherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  accountOptions: { id: string; name: string; code: string }[];
}

export function VoucherForm({ onSuccess, onCancel, accountOptions }: VoucherFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalDebit, setTotalDebit] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<any>({
    resolver: zodResolver(JournalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      voucherType: 'journal',
      lines: [
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' },
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines"
  });

  const watchLines = watch("lines");

  useEffect(() => {
    let d = 0;
    let c = 0;
    watchLines?.forEach((line: any) => {
      d += Number(line.debit) || 0;
      c += Number(line.credit) || 0;
    });
    setTotalDebit(d);
    setTotalCredit(c);
  }, [watchLines]);

  const onSubmit = async (data: JournalEntry) => {
    if (totalDebit !== totalCredit) {
      toast.error('Debits must equal Credits');
      return;
    }
    if (totalDebit === 0) {
      toast.error('Voucher must have a non-zero value');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save voucher');
      }

      toast.success('Voucher posted successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Input 
          label="Date" 
          type="date"
          {...register('date')} 
          error={(errors.date as any)?.message} 
        />
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Voucher Type</label>
          <select 
            {...register('voucherType')}
            className="w-full bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
          >
            <option value="journal">Journal</option>
            <option value="payment">Payment</option>
            <option value="receipt">Receipt</option>
            <option value="contra">Contra</option>
            <option value="sales">Sales</option>
            <option value="purchase">Purchase</option>
          </select>
          {(errors.voucherType as any)?.message && <p className="text-red-500 text-xs font-bold mt-1">{(errors.voucherType as any).message}</p>}
        </div>

        <Input 
          label="Reference / Voucher No" 
          placeholder="Auto-generated if empty" 
          {...register('voucherNo')} 
          error={(errors.voucherNo as any)?.message} 
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Ledger Entries</h3>
          <Button type="button" variant="outline" size="sm" onClick={() => append({ accountId: '', debit: 0, credit: 0, description: '' })}>
            Add Line
          </Button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 space-y-4 border border-slate-100">
          <div className="grid grid-cols-12 gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
            <div className="col-span-5">Account</div>
            <div className="col-span-3">Description</div>
            <div className="col-span-1 text-right">Debit (paise)</div>
            <div className="col-span-2 text-right">Credit (paise)</div>
            <div className="col-span-1 text-center">Action</div>
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5">
                <select 
                  {...register(`lines.${index}.accountId`)}
                  className="w-full bg-white border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                >
                  <option value="">Select Account...</option>
                  {accountOptions.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                  ))}
                </select>
                {(errors.lines as any)?.[index]?.accountId && <p className="text-red-500 text-[10px] mt-1">{(errors.lines as any)[index]?.accountId?.message}</p>}
              </div>
              
              <div className="col-span-3">
                <input 
                  type="text"
                  placeholder="Narration..."
                  {...register(`lines.${index}.description`)}
                  className="w-full bg-white border-none rounded-xl text-sm font-medium text-slate-700 px-4 py-2 focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                />
              </div>

              <div className="col-span-1">
                <input 
                  type="number"
                  min="0"
                  {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                  className="w-full bg-white border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-2 text-right focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                />
              </div>

              <div className="col-span-2">
                <input 
                  type="number"
                  min="0"
                  {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                  className="w-full bg-white border-none rounded-xl text-sm font-bold text-slate-700 px-4 py-2 text-right focus:ring-2 focus:ring-blue-500/20 outline-none shadow-sm"
                />
              </div>

              <div className="col-span-1 text-center">
                {fields.length > 2 && (
                  <button type="button" onClick={() => remove(index)} className="text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                    🗑️
                  </button>
                )}
              </div>
            </div>
          ))}

          <div className="grid grid-cols-12 gap-4 items-center pt-4 border-t border-slate-200 mt-4 px-2">
            <div className="col-span-8 text-right text-sm font-black text-slate-700">TOTAL</div>
            <div className={`col-span-1 text-right text-sm font-black ${totalDebit === totalCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalDebit}
            </div>
            <div className={`col-span-2 text-right text-sm font-black ${totalDebit === totalCredit ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalCredit}
            </div>
            <div className="col-span-1"></div>
          </div>
          {totalDebit !== totalCredit && (
            <p className="text-rose-500 text-xs font-bold text-right px-2 mt-2">Difference: {Math.abs(totalDebit - totalCredit)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Master Narration</label>
        <textarea 
          {...register('narration')}
          className="w-full bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 px-4 py-3 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none h-24"
          placeholder="Brief description of the transaction..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting} disabled={totalDebit !== totalCredit || totalDebit === 0}>
          Post Voucher
        </Button>
      </div>
    </form>
  );
}
