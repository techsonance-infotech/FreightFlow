'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type Order } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  FileText, Plus, Trash2, Printer, Save, ArrowLeft, 
  Search, Calculator, Truck, User, MapPin, 
  ChevronRight, Box, CreditCard, ShieldCheck, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OrderFormProps {
  initialData?: Partial<Order>;
  isEditing?: boolean;
}

export const OrderForm: React.FC<OrderFormProps> = ({ initialData, isEditing }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState<{
    dealers: any[];
    consignees: any[];
    vehicles: any[];
    products: any[];
  }>({
    dealers: [],
    consignees: [],
    vehicles: [],
    products: [],
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(OrderSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      details: [{ productName: '', boxCount: 0, weight: 0, sortOrder: 0 }],
      freight: 0,
      hamali: 0,
      cgstPct: 2.5,
      sgstPct: 2.5,
      rateOn: 'weight',
      rate: 0,
      status: 'created',
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const watchedDetails = watch('details');
  const watchedFreight = watch('freight');
  const watchedHamali = watch('hamali');
  const watchedCgstPct = watch('cgstPct');
  const watchedSgstPct = watch('sgstPct');
  const watchedRate = watch('rate');
  const watchedRateOn = watch('rateOn');

  const [totals, setTotals] = useState({
    totalWeight: 0,
    totalBoxes: 0,
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [dealers, consignees, vehicles, products] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/consignees?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/vehicles?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/products?limit=100').then((r) => r.json()),
        ]);
        setMasters({
          dealers: dealers.data || [],
          consignees: consignees.data || [],
          vehicles: vehicles.data || [],
          products: products.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch master data', error);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => {
    const totalWeight = watchedDetails.reduce((sum, d) => sum + (Number(d.weight) || 0), 0);
    const totalBoxes = watchedDetails.reduce((sum, d) => sum + (Number(d.boxCount) || 0), 0);
    let calculatedSubtotal = 0;
    if (watchedRateOn === 'weight') {
      calculatedSubtotal = Math.round(totalWeight * Number(watchedRate || 0));
    } else {
      calculatedSubtotal = totalBoxes * Number(watchedRate || 0);
    }
    calculatedSubtotal += Number(watchedFreight || 0) + Number(watchedHamali || 0);
    const cgstAmount = Math.round((calculatedSubtotal * Number(watchedCgstPct || 0)) / 100);
    const sgstAmount = Math.round((calculatedSubtotal * Number(watchedSgstPct || 0)) / 100);
    const totalAmount = calculatedSubtotal + cgstAmount + sgstAmount;
    setTotals({ totalWeight, totalBoxes, subtotal: calculatedSubtotal, cgstAmount, sgstAmount, totalAmount });
  }, [watchedDetails, watchedFreight, watchedHamali, watchedCgstPct, watchedSgstPct, watchedRate, watchedRateOn]);

  const onSubmit = async (data: Order) => {
    try {
      setLoading(true);
      const url = isEditing ? `/api/v1/orders/${data.id}` : '/api/v1/orders';
      const method = isEditing ? 'PATCH' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save order');
      toast.success(isEditing ? 'Order updated successfully' : 'Order created successfully');
      router.push('/dashboard/orders');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 pb-24 px-4">
      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-40 -mx-4 px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <button type="button" onClick={() => router.back()} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{isEditing ? 'Modify LR Entry' : 'New LR Generation'}</h1>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Order Provisioning Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" type="button" icon={<Printer className="h-4 w-4" />} className="hidden md:flex">
            Print Preview
          </Button>
          <Button type="submit" loading={loading} icon={<Save className="h-4 w-4" />}>
            {isEditing ? 'Update LR' : 'Establish LR'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Logistics Context Card */}
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <FormSectionHeader icon={<Truck className="text-blue-600" />} title="Logistics Context" sub="Define route, vehicle and parties" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInputWrapper label="Dealer / Consignor" error={errors.dealerId?.message}>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select {...register('dealerId')} className="premium-select pl-11">
                    <option value="">Select Consignor</option>
                    {masters.dealers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Consignee" error={errors.consigneeId?.message}>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select {...register('consigneeId')} className="premium-select pl-11">
                    <option value="">Select Consignee</option>
                    {masters.consignees.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Vehicle Assignment" error={errors.vehicleId?.message}>
                <div className="relative">
                  <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <select {...register('vehicleId')} className="premium-select pl-11">
                    <option value="">Select Active Vehicle</option>
                    {masters.vehicles.map((v) => <option key={v.id} value={v.id}>{v.regNo} — {v.type}</option>)}
                  </select>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Issue Date">
                <input type="date" {...register('date')} className="premium-input px-5" />
              </FormInputWrapper>

              <FormInputWrapper label="Origin" error={errors.fromLocation?.message}>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                  <input type="text" {...register('fromLocation')} placeholder="Loading Point" className="premium-input pl-11" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Destination" error={errors.toLocation?.message}>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                  <input type="text" {...register('toLocation')} placeholder="Unloading Point" className="premium-input pl-11" />
                </div>
              </FormInputWrapper>
            </div>
          </div>

          {/* Inventory Payload Section */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Box className="h-5 w-5 text-blue-600" />
                <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs">Inventory Payload</h3>
              </div>
              <Button size="sm" type="button" onClick={() => append({ productName: '', boxCount: 0, weight: 0, sortOrder: fields.length })} icon={<Plus className="h-3 w-3" />}>
                Add Item
              </Button>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Product Description</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-28">Boxes</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-32 text-center">Weight (KG)</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-40 text-right">DCPI #</th>
                    <th className="px-6 py-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-slate-50/30 transition-colors">
                      <td className="px-6 py-3">
                        <input {...register(`details.${index}.productName`)} placeholder="Describe cargo..." className="w-full bg-transparent border-none font-bold text-slate-700 focus:ring-0 placeholder:text-slate-300 text-sm" />
                      </td>
                      <td className="px-4 py-3">
                        <input type="number" {...register(`details.${index}.boxCount`, { valueAsNumber: true })} className="w-full bg-slate-50/50 border-none rounded-xl px-4 py-2 font-black text-slate-700 focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all text-sm" />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="number" step="0.01" {...register(`details.${index}.weight`, { valueAsNumber: true })} className="w-full bg-slate-50/50 border-none rounded-xl px-4 py-2 font-black text-slate-700 text-center focus:bg-white focus:ring-2 focus:ring-blue-50 transition-all text-sm" />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <input {...register(`details.${index}.dcpiNo`)} placeholder="Optional" className="w-full bg-transparent border-none text-right font-bold text-slate-400 focus:ring-0 text-xs" />
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="p-2 rounded-lg text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-20"><Trash2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-6 bg-slate-50/20 border-t border-slate-50 flex justify-between items-center">
                <div className="flex gap-10">
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Tonnage</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{totals.totalWeight.toFixed(2)} <span className="text-xs text-slate-400">KG</span></p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Boxes</p>
                    <p className="text-xl font-black text-slate-900 tracking-tight">{totals.totalBoxes} <span className="text-xs text-slate-400">Units</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Settlement Sidecard */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl sticky top-32">
            <div className="flex items-center gap-3 mb-8">
              <Calculator className="h-5 w-5 text-blue-500" />
              <div>
                <h3 className="font-black uppercase tracking-widest text-[10px] text-slate-400">Financial Core</h3>
                <p className="text-lg font-black tracking-tight">Billing & Settlement</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Rate Strategy</label>
                  <select {...register('rateOn')} className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-black focus:border-blue-500 outline-none transition-all">
                    <option value="weight">By Weight</option>
                    <option value="box">By Unit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Rate</label>
                  <input type="number" step="0.01" {...register('rate', { valueAsNumber: true })} className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-xs font-black text-blue-400 focus:border-blue-500 outline-none" />
                </div>
              </div>

              <SidecardInput label="Base Freight (Paise)" register={register('freight', { valueAsNumber: true })} icon={<CreditCard className="h-4 w-4" />} />
              <SidecardInput label="Hamali Charges (Paise)" register={register('hamali', { valueAsNumber: true })} icon={<User className="h-4 w-4" />} />

              <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Subtotal Settlement</span>
                  <span className="text-white">{formatPaise(totals.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>GST Compliance (5%)</span>
                  <span className="text-white">{formatPaise(totals.cgstAmount + totals.sgstAmount)}</span>
                </div>
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Grand Total</span>
                  <span className="text-2xl font-black tracking-tighter text-white">{formatPaise(totals.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <FormInputWrapper label="GST Bill Reference" className="text-white">
                  <input type="text" {...register('gstBillNo')} placeholder="e.g. GST-2024-001" className="w-full h-10 px-4 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest placeholder:text-slate-700 focus:border-blue-500 outline-none" />
                </FormInputWrapper>
                <FormInputWrapper label="12-Digit E-Way Bill" error={errors.ewayBillNo?.message}>
                  <div className="relative">
                    <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
                    <input type="text" {...register('ewayBillNo')} placeholder="Verified E-Way No." maxLength={12} className="w-full h-10 pl-11 bg-white/5 border border-white/10 rounded-xl text-[11px] font-black placeholder:text-slate-700 focus:border-blue-500 outline-none" />
                  </div>
                </FormInputWrapper>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

function FormSectionHeader({ icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

function FormInputWrapper({ label, children, error, className }: any) {
  return (
    <div className="space-y-1.5">
      <label className={cn("text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1", className)}>{label}</label>
      {children}
      {error && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1"><AlertCircle className="h-3 w-3" /> {error}</p>}
    </div>
  );
}

function SidecardInput({ label, register, icon }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600">{icon}</div>
        <input type="number" {...register} className="w-full h-10 pl-11 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm font-black text-blue-100 placeholder:text-slate-800 focus:border-blue-500 outline-none transition-all" />
      </div>
    </div>
  );
}
