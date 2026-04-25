'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PalletSchema, type Pallet } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  Package, Plus, Trash2, Save, ArrowLeft, 
  Truck, User, Calculator, Layers, Building2,
  Box, MapPin, Hash, Phone, CreditCard, ShieldCheck,
  ChevronRight, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PalletFormProps {
  initialData?: Partial<Pallet>;
  isEditing?: boolean;
}

export const PalletForm: React.FC<PalletFormProps> = ({ initialData, isEditing }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState<{
    dealers: any[];
    vehicles: any[];
  }>({
    dealers: [],
    vehicles: [],
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(PalletSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      palletDetails: [{ qty: 0, rate: 0 }],
      consigneeDetails: [{ consigneeName: '', qty: 0, rate: 0 }],
      gstPct: 18,
      status: 'active',
      ...initialData,
    },
  });

  const { fields: palletFields, append: appendPallet, remove: removePallet } = useFieldArray({
    control,
    name: 'palletDetails',
  });

  const { fields: consigneeFields, append: appendConsignee, remove: removeConsignee } = useFieldArray({
    control,
    name: 'consigneeDetails',
  });

  const watchedPallets = watch('palletDetails');
  const watchedGstPct = watch('gstPct');

  const [summary, setSummary] = useState({
    totalPallets: 0,
    subtotal: 0,
    gstAmount: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [dealers, vehicles] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/vehicles?limit=100').then((r) => r.json()),
        ]);
        setMasters({
          dealers: dealers.data || [],
          vehicles: vehicles.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch masters', error);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    const totalPallets = watchedPallets.reduce((sum: number, p: any) => sum + (Number(p.qty) || 0), 0);
    const subtotal = watchedPallets.reduce((sum: number, p: any) => sum + (Number(p.qty) * Number(p.rate || 0)), 0);
    const gstAmount = Math.round((subtotal * Number(watchedGstPct || 0)) / 100);
    setSummary({ totalPallets, subtotal, gstAmount, grandTotal: subtotal + gstAmount });
  }, [watchedPallets, watchedGstPct]);

  const onSubmit = async (data: Pallet) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/pallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save pallet record');
      toast.success('Pallet record saved successfully');
      router.push('/dashboard/pallets');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-24 px-4">
      {/* High-Impact Sticky Header */}
      <div className="sticky top-0 z-40 -mx-4 px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Pallet Entry</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Inventory Ledger Provisioning</p>
          </div>
        </div>
        <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
          Log Transaction
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Transaction Context */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">General Details</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Define organization & transit context</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInputWrapper label="Fleet Dealer">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select {...register('dealerId')} className="premium-select pl-11">
                    <option value="">Select Dealer</option>
                    {masters.dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Linked Vehicle">
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select {...register('vehicleId')} className="premium-select pl-11">
                    <option value="">Select Vehicle</option>
                    {masters.vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                  </select>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Client Organization">
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input {...register('companyName')} className="premium-input pl-11" placeholder="Entity Name" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Party Ledger Code">
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input {...register('partyCode')} className="premium-input pl-11" placeholder="e.g. PC-402" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Linked LR No. (Opt)">
                <input type="number" {...register('lrNo', { valueAsNumber: true })} className="premium-input px-5" placeholder="Order ID" />
              </FormInputWrapper>

              <FormInputWrapper label="Transaction Date">
                <input type="date" {...register('date')} className="premium-input px-5" />
              </FormInputWrapper>
            </div>
          </div>

          {/* Pallet Line Items */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Pallet Items</h3>
              </div>
              <Button size="sm" type="button" onClick={() => appendPallet({ qty: 1, rate: 0 })} icon={<Plus className="h-3 w-3" />}>
                Add Item
              </Button>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-slate-400">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Quantity (Units)</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Rate (Paise)</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Line Total</th>
                    <th className="px-8 py-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {palletFields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-8 py-3">
                        <input type="number" {...register(`palletDetails.${index}.qty`, { valueAsNumber: true })} className="w-full bg-slate-50/50 border-none rounded-xl px-5 py-2.5 font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm" />
                      </td>
                      <td className="px-8 py-3 text-center">
                        <input type="number" {...register(`palletDetails.${index}.rate`, { valueAsNumber: true })} className="w-40 mx-auto bg-slate-50/50 border-none rounded-xl px-5 py-2.5 font-black text-slate-700 text-center focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all text-sm" />
                      </td>
                      <td className="px-8 py-3 text-right font-black text-slate-900">
                        {formatPaise((watchedPallets[index]?.qty || 0) * (watchedPallets[index]?.rate || 0))}
                      </td>
                      <td className="px-8 py-3 text-center">
                        <button type="button" onClick={() => removePallet(index)} className="p-2 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Distribution Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Distribution Flow</h3>
              </div>
              <Button size="sm" type="button" onClick={() => appendConsignee({ consigneeName: '', qty: 1, rate: 0 })} icon={<Plus className="h-3 w-3" />}>
                Add Recipient
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-slate-400">
                  <tr>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Consignee Name</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest w-32">Units</th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest w-40 text-right">Settlement Rate</th>
                    <th className="px-8 py-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {consigneeFields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-slate-50/10">
                      <td className="px-8 py-3">
                        <input {...register(`consigneeDetails.${index}.consigneeName`)} className="w-full bg-transparent border-none font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300 text-sm" placeholder="Enter recipient name..." />
                      </td>
                      <td className="px-8 py-3">
                        <input type="number" {...register(`consigneeDetails.${index}.qty`, { valueAsNumber: true })} className="w-full bg-slate-50/50 border-none rounded-xl px-4 py-2 font-black text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all text-sm text-center" />
                      </td>
                      <td className="px-8 py-3">
                        <input type="number" {...register(`consigneeDetails.${index}.rate`, { valueAsNumber: true })} className="w-full bg-slate-50/50 border-none rounded-xl px-4 py-2 font-black text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all text-sm text-right" />
                      </td>
                      <td className="px-8 py-3 text-center">
                        <button type="button" onClick={() => removeConsignee(index)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Summary Sidecard */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl sticky top-32">
            <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="text-lg font-black tracking-tight leading-none">Ledger Summary</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">Real-time settlement</p>
              </div>
            </div>

            <div className="space-y-6">
              <FormInputWrapper label="Tax Compliance (GST %)" className="text-slate-400">
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <input type="number" {...register('gstPct', { valueAsNumber: true })} className="w-full h-10 pl-11 bg-white/5 border border-white/10 rounded-xl text-sm font-black focus:border-blue-500 outline-none transition-all" />
                </div>
              </FormInputWrapper>

              <div className="bg-white/5 rounded-2xl p-6 space-y-4 border border-white/5">
                <SummaryRow label="Total Units" value={summary.totalPallets.toString()} sub="Pallets" />
                <SummaryRow label="Core Subtotal" value={formatPaise(summary.subtotal)} />
                <SummaryRow label={`Tax (${watchedGstPct}%)`} value={formatPaise(summary.gstAmount)} />
                
                <div className="pt-4 border-t border-white/10 flex flex-col items-center gap-1">
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Grand Total</p>
                  <p className="text-3xl font-black tracking-tighter text-white">{formatPaise(summary.grandTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

function FormInputWrapper({ label, children, className }: any) {
  return (
    <div className="space-y-1.5">
      <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1", className)}>{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, sub }: { label: string, value: string, sub?: string }) {
  return (
    <div className="flex justify-between items-end">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      <div className="text-right">
        <span className="text-base font-black text-white">{value}</span>
        {sub && <span className="text-[9px] font-black text-slate-500 uppercase ml-1 tracking-tighter">{sub}</span>}
      </div>
    </div>
  );
}
