'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  Plus, Trash2, Save, Truck, User, Building2, 
  Hash, Calendar, CreditCard, ChevronRight, Calculator,
  Package, Scale, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderPalletFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function OrderPalletForm({ initialData, onSuccess, onCancel }: OrderPalletFormProps) {
  const [dealers, setDealers] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);

  const { register, control, handleSubmit, setValue, watch, getValues, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      lrNo: initialData?.lrNo || '',
      dealerId: initialData?.dealerId || '',
      vehicleId: initialData?.vehicleId || '',
      date: initialData?.date ? new Date(initialData?.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      companyName: initialData?.companyName || '',
      partyCode: initialData?.partyCode || '',
      gstPct: initialData?.gstPct || 0,
      palletDetails: initialData?.palletDetails?.length > 0 
        ? initialData.palletDetails 
        : Array(5).fill({ palletDisplayId: '', boxQty: '', weight: '', consigneeName: '', rate: '' }),
    }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'palletDetails' });
  const watchedDate = watch('date');

  useEffect(() => {
    async function loadMasters() {
      try {
        const [dRes, vRes, lrRes] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=1000'),
          fetch('/api/v1/masters/vehicles?limit=1000'),
          !initialData?.id ? fetch(`/api/v1/orders/next-lr?date=${watchedDate}`).then(r => r.json()) : Promise.resolve(null)
        ]);
        const dData = await dRes.json();
        const vData = await vRes.json();
        
        setDealers(dData.data || []);
        setVehicles(vData.data || []);
        
        if (lrRes?.nextLr && !getValues('lrNo')) {
          setValue('lrNo', lrRes.nextLr, { shouldDirty: true });
        }
      } catch {
        toast.error('Failed to load master data');
      } finally {
        setLoadingMasters(false);
      }
    }
    loadMasters();
  }, [initialData?.id, watchedDate]);

  const onSubmit = async (data: any) => {
    try {
      const filteredPallets = data.palletDetails.filter((p: any) => p.boxQty || p.palletDisplayId);

      if (filteredPallets.length === 0) {
        toast.error('Please add at least one pallet record');
        return;
      }

      const payload = {
        ...data,
        lrNo: data.lrNo ? parseInt(data.lrNo) : null,
        gstPct: parseFloat(data.gstPct),
        palletDetails: filteredPallets.map((p: any) => ({
          ...p,
          boxQty: p.boxQty ? parseInt(p.boxQty) : 0,
          weight: p.weight ? parseFloat(p.weight) : 0,
          qty: 1, // Each row is 1 pallet
          rate: p.rate ? Math.round(parseFloat(p.rate) * 100) : 0,
        })),
      };

      const response = await fetch('/api/v1/pallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Palletized Order Synchronized Successfully');
        onSuccess(result);
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to establish pallet order');
      }
    } catch {
      toast.error('A communication error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Contextual Header */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <Package className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Hash className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Unit</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter">Establish Pallet Load</h1>
          <p className="text-blue-100 font-bold mt-2 opacity-80">Configure multi-tenant palletized inventory and consignment routes.</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <p className="text-[8px] font-black uppercase tracking-widest text-blue-200 mb-1">LR Number</p>
            <input 
              type="text" 
              {...register('lrNo')} 
              className="bg-transparent text-xl font-black w-full outline-none placeholder:text-blue-300" 
            />
          </div>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
            <p className="text-[8px] font-black uppercase tracking-widest text-blue-200 mb-1">Order Date</p>
            <input 
              type="date" 
              {...register('date')} 
              className="bg-transparent text-sm font-black w-full outline-none invert brightness-0" 
            />
          </div>
        </div>
      </div>

      {/* Registry & Logistics Mapping */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Business Context</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInputWrapper label="Dealer / Payer" icon={<User className="h-3 w-3" />}>
              <select {...register('dealerId')} className="premium-input-field">
                <option value="">Select Registry Member</option>
                {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </FormInputWrapper>
            <FormInputWrapper label="Vehicle Allocation" icon={<Truck className="h-3 w-3" />}>
              <select {...register('vehicleId')} className="premium-input-field">
                <option value="">Select Asset</option>
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.plateNumber}</option>)}
              </select>
            </FormInputWrapper>
            <FormInputWrapper label="Company Ident" icon={<Building2 className="h-3 w-3" />}>
              <input {...register('companyName')} placeholder="Legal Entity" className="premium-input-field" />
            </FormInputWrapper>
            <FormInputWrapper label="Party Reference" icon={<Hash className="h-3 w-3" />}>
              <input {...register('partyCode')} placeholder="External Code" className="premium-input-field" />
            </FormInputWrapper>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Financial & Tax</h3>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">GST Compliance (%)</p>
              <h4 className="text-sm font-black text-slate-700">Set the tax rate for this consignment</h4>
            </div>
            <select {...register('gstPct')} className="h-14 px-6 bg-white rounded-xl font-black text-sm border-2 border-slate-100 outline-none focus:border-blue-500 transition-all">
              <option value="0">GST 0%</option>
              <option value="5">GST 5%</option>
              <option value="12">GST 12%</option>
              <option value="18">GST 18%</option>
            </select>
          </div>
        </section>
      </div>

      {/* High-Density Pallet Registry Table */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Consignment Breakdown</h3>
              <p className="text-xs font-bold text-slate-400">Detailed pallet and box inventory mapping</p>
            </div>
          </div>
          <Button 
            type="button" 
            onClick={() => append({ palletDisplayId: '', boxQty: '', weight: '', consigneeName: '', rate: '' })}
            className="bg-slate-900 text-white rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all"
          >
            + Add Pallet
          </Button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Sr.</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Pallet ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Box Qty</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Weight (kg)</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Consignee Breakdown</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Rate (INR)</th>
                <th className="p-6 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {fields.map((field, index) => (
                <tr key={field.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="p-6 font-black text-slate-300 text-xs">{index + 1}</td>
                  <td className="p-4">
                    <input {...register(`palletDetails.${index}.palletDisplayId` as const)} placeholder="P-001" className="table-input" />
                  </td>
                  <td className="p-4 w-32">
                    <input type="number" {...register(`palletDetails.${index}.boxQty` as const)} placeholder="0" className="table-input text-center" />
                  </td>
                  <td className="p-4 w-32">
                    <input type="number" step="0.01" {...register(`palletDetails.${index}.weight` as const)} placeholder="0.00" className="table-input text-center" />
                  </td>
                  <td className="p-4">
                    <input {...register(`palletDetails.${index}.consigneeName` as const)} placeholder="Consignee Name" className="table-input" />
                  </td>
                  <td className="p-4 w-40">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px]">₹</span>
                      <input type="number" step="0.01" {...register(`palletDetails.${index}.rate` as const)} placeholder="0.00" className="table-input text-right pl-8" />
                    </div>
                  </td>
                  <td className="p-4">
                    <button type="button" onClick={() => remove(index)} className="p-3 text-slate-200 hover:text-rose-500 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <Info className="h-4 w-4 text-blue-500" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Totals will be automatically calculated on printing</p>
             </div>
             <div className="flex gap-4">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Boxes</p>
                  <p className="text-sm font-black text-slate-900">{watch('palletDetails')?.reduce((acc: number, curr: any) => acc + (parseInt(curr.boxQty) || 0), 0)}</p>
                </div>
                <div className="text-right border-l border-slate-200 pl-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Weight</p>
                  <p className="text-sm font-black text-slate-900">{watch('palletDetails')?.reduce((acc: number, curr: any) => acc + (parseFloat(curr.weight) || 0), 0).toFixed(2)} KG</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Global Sync Action */}
      <div className="pt-10 border-t border-slate-100 flex justify-end">
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="h-16 px-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
          {isSubmitting ? 'ESTABLISHING RECORD...' : 'PUBLISH CONSIGNMENT'}
        </button>
      </div>

      <style jsx global>{`
        .premium-input-field {
          width: 100%;
          padding: 1rem 1.25rem;
          background: white;
          border: 2px solid #f1f5f9;
          border-radius: 1.25rem;
          font-weight: 800;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.3s ease;
          outline: none;
        }
        .premium-input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
        }
        .table-input {
          width: 100%;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid transparent;
          border-radius: 0.75rem;
          font-weight: 800;
          font-size: 0.8125rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
        }
        .table-input:focus {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
    </form>
  );
}

function FormInputWrapper({ label, icon, children }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 ml-1">
        <div className="h-6 w-6 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
          {icon}
        </div>
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      </div>
      {children}
    </div>
  );
}

function Loader2(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
