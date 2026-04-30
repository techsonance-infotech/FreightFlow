'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JournalEntrySchema, type JournalEntry } from '@freightflow/shared';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface VoucherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  accountOptions: { id: string; name: string; code: string }[];
}

import { 
  Plus, Trash2, CheckCircle2, AlertCircle, 
  Landmark, FileText, Calendar as CalendarIcon,
  ChevronDown, Hash, IndianRupee
} from 'lucide-react';

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

  const onSubmit = async (data: any) => {
    // Convert Rupees to Paise for the API
    const formattedLines = data.lines.map((line: any) => ({
      ...line,
      debit: Math.round((Number(line.debit) || 0) * 100),
      credit: Math.round((Number(line.credit) || 0) * 100)
    }));

    const totalD = formattedLines.reduce((acc: number, l: any) => acc + l.debit, 0);
    const totalC = formattedLines.reduce((acc: number, l: any) => acc + l.credit, 0);

    if (totalD !== totalC) {
      toast.error('Debits must equal Credits (Balanced Entry Required)');
      return;
    }
    if (totalD === 0) {
      toast.error('Voucher must have a non-zero value');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/v1/accounting/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          lines: formattedLines,
          totalAmount: totalD // Include total in paise
        }),
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

  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-1">
      {/* 1. Master Info Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <CalendarIcon className="h-3 w-3 text-accent-600" />
            Voucher Date <span className="text-rose-500">*</span>
          </label>
          <input 
            type="date"
            {...register('date')}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <FileText className="h-3 w-3 text-accent-600" />
            Voucher Type <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <select 
              {...register('voucherType')}
              className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none cursor-pointer"
            >
              <option value="journal">Journal (General Entry)</option>
              <option value="payment">Payment (Cash/Bank Out)</option>
              <option value="receipt">Receipt (Cash/Bank In)</option>
              <option value="contra">Contra (Bank Transfer)</option>
              <option value="purchase">Purchase (Liability In)</option>
              <option value="sales">Sales (Receivable In)</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1 flex items-center gap-2">
            <Hash className="h-3 w-3 text-accent-600" />
            Reference No
          </label>
          <input 
            type="text" 
            placeholder="Auto-generated if empty"
            {...register('voucherNo')}
            className="w-full h-12 px-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
          />
        </div>
      </div>

      {/* 2. Ledger Entries Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <h3 className="text-xs font-black text-neutral-900 uppercase tracking-widest">Accounting Lines</h3>
            {isBalanced ? (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase border border-emerald-100 animate-in fade-in zoom-in duration-300">
                <CheckCircle2 className="h-3 w-3" /> Balanced
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 rounded-full text-[9px] font-black uppercase border border-rose-100">
                <AlertCircle className="h-3 w-3" /> Unbalanced
              </span>
            )}
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            onClick={() => append({ accountId: '', debit: 0, credit: 0, description: '' })}
            className="h-9 px-4 rounded-xl border-neutral-200 font-bold text-[10px] uppercase tracking-widest hover:bg-accent-50 hover:text-accent-600 hover:border-accent-200 transition-all"
          >
            <Plus className="h-3 w-3 mr-2" /> Add Accounting Line
          </Button>
        </div>

        <div className="bg-neutral-50/50 rounded-2xl border border-neutral-100 p-2 overflow-hidden shadow-inner">
          <table className="w-full">
            <thead>
              <tr className="text-[9px] font-black text-neutral-400 uppercase tracking-widest text-left">
                <th className="px-4 py-3 w-[35%]">Ledger Account <span className="text-rose-500">*</span></th>
                <th className="px-4 py-3">Line Description</th>
                <th className="px-4 py-3 w-[15%] text-right">Debit (₹)</th>
                <th className="px-4 py-3 w-[15%] text-right">Credit (₹)</th>
                <th className="px-4 py-3 w-[60px]"></th>
              </tr>
            </thead>
            <tbody className="space-y-2">
              {fields.map((field, index) => (
                <tr key={field.id} className="group">
                  <td className="p-1">
                    <div className="relative">
                      <select 
                        {...register(`lines.${index}.accountId`)}
                        className="w-full h-11 px-4 pr-10 bg-white border border-neutral-100 rounded-xl text-xs font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all appearance-none cursor-pointer shadow-sm"
                      >
                        <option value="">Select Ledger...</option>
                        {accountOptions.map(acc => (
                          <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300 pointer-events-none group-focus-within:text-accent-600 transition-colors" />
                    </div>
                  </td>
                  <td className="p-1">
                    <input 
                      type="text"
                      placeholder="Line narration..."
                      {...register(`lines.${index}.description`)}
                      className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-medium text-neutral-600 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all shadow-sm"
                    />
                  </td>
                  <td className="p-1">
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.debit`, { valueAsNumber: true })}
                        className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-black text-neutral-900 text-right outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all shadow-sm"
                      />
                    </div>
                  </td>
                  <td className="p-1">
                    <div className="relative">
                      <input 
                        type="number"
                        step="0.01"
                        min="0"
                        {...register(`lines.${index}.credit`, { valueAsNumber: true })}
                        className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-black text-neutral-900 text-right outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all shadow-sm"
                      />
                    </div>
                  </td>
                  <td className="p-1 text-center">
                    {fields.length > 2 && (
                      <button 
                        type="button" 
                        onClick={() => remove(index)} 
                        className="p-2.5 text-neutral-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Remove Line"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-100">
                <td colSpan={2} className="px-4 py-4 text-[10px] font-black text-neutral-400 uppercase tracking-widest text-right">Trial Balance Verification</td>
                <td className="px-4 py-4">
                  <div className={cn(
                    "text-xs font-black text-right transition-colors",
                    isBalanced ? "text-emerald-600" : "text-rose-500"
                  )}>
                    ₹{totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className={cn(
                    "text-xs font-black text-right transition-colors",
                    isBalanced ? "text-emerald-600" : "text-rose-500"
                  )}>
                    ₹{totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          {!isBalanced && (totalDebit > 0 || totalCredit > 0) && (
            <div className="bg-rose-50 p-3 flex justify-between items-center animate-in slide-in-from-top-2 duration-300">
              <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="h-3 w-3" /> Unbalanced Entry
              </span>
              <span className="text-xs font-black text-rose-600">Difference: ₹{Math.abs(totalDebit - totalCredit).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Master Narration */}
      <div className="space-y-2">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Master Voucher Narration</label>
        <textarea 
          {...register('narration')}
          className="w-full h-24 p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium text-neutral-600 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all resize-none shadow-sm"
          placeholder="Enter a consolidated description for this accounting entry..."
        />
      </div>

      {/* 4. Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-neutral-100">
        <div className="flex items-center gap-2 text-neutral-400">
          <Landmark className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">General Ledger Posting Service</span>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting} 
            disabled={!isBalanced}
            className="h-12 px-8 rounded-xl bg-accent-600 hover:bg-accent-700 shadow-lg shadow-accent-600/10 font-black text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:grayscale"
          >
            Post Journal Entry
          </Button>
        </div>
      </div>
    </form>
  );
}
