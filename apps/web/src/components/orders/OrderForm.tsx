'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type Order } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  FileText, Plus, Trash2, Printer, Save, ArrowLeft, 
  Search, Calculator, Truck, User, MapPin, 
  ChevronRight, Box, CreditCard, ShieldCheck, AlertCircle, Hash, Building2, Calendar, Package,
  TrendingUp, TrendingDown, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DealerForm } from '@/components/masters/dealer-form';
import { ConsigneeForm } from '@/components/masters/consignee-form';
import { VehicleForm } from '@/components/masters/vehicle-form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

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

  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isConsigneeModalOpen, setIsConsigneeModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
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
    margin: 0,
  });

  const watchedDate = watch('date');
  const watchedDealerId = watch('dealerId');
  const watchedConsigneeId = watch('consigneeId');

  // Predictive Route logic
  useEffect(() => {
    if (!watchedDealerId || !watchedConsigneeId || isEditing) return;

    const fetchLastRoute = async () => {
      try {
        const res = await fetch(`/api/v1/orders/last-route?dealerId=${watchedDealerId}&consigneeId=${watchedConsigneeId}`).then(r => r.json());
        if (res?.route) {
          if (!getValues('fromLocation')) setValue('fromLocation', res.route.fromLocation);
          if (!getValues('toLocation')) setValue('toLocation', res.route.toLocation);
          toast.info('Route auto-filled from history', { duration: 2000 });
        }
      } catch (e) {
        console.error('Failed to fetch last route');
      }
    };

    fetchLastRoute();
  }, [watchedDealerId, watchedConsigneeId, isEditing]);

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
    if (isEditing) return;

    const fetchNextLr = async () => {
      try {
        const res = await fetch(`/api/v1/orders/next-lr?date=${watchedDate}`).then(r => r.json());
        if (res?.nextLr && !getValues('lrNo')) {
          setValue('lrNo', res.nextLr, { shouldDirty: true });
        }
      } catch (error) {
        console.error('Failed to fetch next LR', error);
        toast.error('Failed to auto-generate LR number');
      }
    };

    fetchNextLr();
  }, [watchedDate, isEditing]);

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
    const margin = Number(watchedFreight || 0) - Number(watchedHamali || 0); // Basic Operational Margin
    setTotals({ totalWeight, totalBoxes, subtotal: calculatedSubtotal, cgstAmount, sgstAmount, totalAmount, margin });
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
              <FormInputWrapper label="Dealer / Consignor *" error={errors.dealerId?.message}>
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name="dealerId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="premium-select-trigger pl-11">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <SelectValue placeholder="Select Consignor" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.dealers.map((d) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-12 w-12 rounded-xl border-slate-100" onClick={() => setIsDealerModalOpen(true)}>+</Button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Consignee *" error={errors.consigneeId?.message}>
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name="consigneeId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="premium-select-trigger pl-11">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <SelectValue placeholder="Select Consignee" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.consignees.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-12 w-12 rounded-xl border-slate-100" onClick={() => setIsConsigneeModalOpen(true)}>+</Button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Vehicle Assignment *" error={errors.vehicleId?.message}>
                <div className="flex gap-2">
                  <Controller
                    control={control}
                    name="vehicleId"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger className="premium-select-trigger pl-11">
                          <Truck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                          <SelectValue placeholder="Select Active Vehicle" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.vehicles.map((v) => (
                            <SelectItem key={v.id} value={v.id}>{v.plateNumber || v.regNo}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-12 w-12 rounded-xl border-slate-100" onClick={() => setIsVehicleModalOpen(true)}>+</Button>
                </div>
              </FormInputWrapper>

              <Input 
                label="Custom LR NO *" 
                error={errors.lrNo?.message}
                icon={<Hash className="h-4 w-4" />}
                type="text"
                className="font-black text-blue-600 bg-blue-50/30 border-blue-100"
                {...register('lrNo')}
              />
              
              <Input 
                label="Companies Name *" 
                error={errors.companyName?.message} 
                icon={<Building2 className="h-4 w-4" />}
                {...register('companyName')} 
              />


              <Input 
                label="Issue Date *" 
                type="date"
                icon={<Calendar className="h-4 w-4" />}
                {...register('date')} 
              />

              <Textarea 
                label="Origin *" 
                error={errors.fromLocation?.message} 
                icon={<MapPin className="h-4 w-4 text-blue-500" />}
                rows={2}
                className="min-h-[60px]"
                {...register('fromLocation')} 
              />

              <Textarea 
                label="Destination *" 
                error={errors.toLocation?.message} 
                icon={<MapPin className="h-4 w-4 text-emerald-500" />}
                rows={2}
                className="min-h-[60px]"
                {...register('toLocation')} 
              />
            </div>
          </div>

          {/* Inventory Payload Section — Labour Registry Style */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
            <div className="p-8 bg-white border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Box className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 uppercase tracking-[0.2em] text-[10px]">Inventory Payload</h3>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={() => append({ productName: '', boxCount: 0, weight: 0, sortOrder: fields.length })}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 h-auto text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <Plus className="h-3 w-3" /> Add Item
              </Button>
            </div>
            
            <div className="p-0">
              <table className="w-full text-left">
                <thead className="bg-slate-50/30 text-slate-400">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Product Description</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-28 text-center">Boxes</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-32 text-center text-blue-600">Packing</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-32 text-center">Weight (KG)</th>
                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest w-40 text-right">DCPI #</th>
                    <th className="px-6 py-4 w-16 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="group hover:bg-slate-50/20 transition-all duration-300">
                      <td className="px-8 py-6">
                        <div className="relative group/field">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                            <Package className="h-4 w-4" />
                          </div>
                          <input 
                            {...register(`details.${index}.productName`)} 
                            placeholder="Describe cargo..." 
                            className="w-full h-12 pl-14 pr-4 bg-slate-50/30 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm" 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="bg-slate-50/50 rounded-2xl p-1 border border-slate-100 group-focus-within:border-blue-100 transition-all shadow-inner">
                          <input 
                            type="number" 
                            {...register(`details.${index}.boxCount`, { valueAsNumber: true })} 
                            className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-sm h-10" 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6">
                        <div className="bg-slate-50/50 rounded-2xl p-1 border border-slate-100 group-focus-within:border-blue-100 transition-all shadow-inner">
                          <input 
                            {...register(`details.${index}.packingType`)} 
                            placeholder="JBF/Box"
                            className="w-full bg-transparent border-none font-black text-blue-600/70 text-center focus:ring-0 text-sm h-10 placeholder:text-slate-300" 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6 text-center">
                        <div className="bg-slate-50/50 rounded-2xl p-1 border border-slate-100 group-focus-within:border-blue-100 transition-all shadow-inner">
                          <input 
                            type="number" 
                            step="0.01" 
                            {...register(`details.${index}.weight`, { valueAsNumber: true })} 
                            className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-sm h-10" 
                          />
                        </div>
                      </td>
                      <td className="px-4 py-6 text-right">
                        <div className="relative group/field inline-block w-full">
                          <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300 group-focus-within/field:text-blue-400 transition-colors" />
                          <input 
                            {...register(`details.${index}.dcpiNo`)} 
                            placeholder="Optional"
                            className="w-full h-10 pl-8 pr-3 bg-slate-50/30 border border-slate-100 rounded-xl font-bold text-slate-500 text-right focus:bg-white focus:border-blue-100 focus:ring-0 transition-all text-xs placeholder:text-slate-300" 
                          />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <button 
                          type="button" 
                          onClick={() => remove(index)} 
                          disabled={fields.length === 1} 
                          className="p-3 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-8 bg-white border-t border-slate-50 flex justify-between items-center">
                <div className="flex gap-16">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Tonnage</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {totals.totalWeight.toFixed(2)} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">KG</span>
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Boxes</p>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">
                      {totals.totalBoxes} <span className="text-xs text-slate-400 font-bold ml-1 uppercase">Units</span>
                    </p>
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
                  <Input 
                    label="Unit Rate *"
                    type="number"
                    step="0.01"
                    icon={<Calculator className="h-4 w-4" />}
                    className="bg-white/5 border-white/10 text-blue-400"
                    {...register('rate', { valueAsNumber: true })}
                  />
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

              {/* Profitability Check — Premium Insight */}
              <div className={cn(
                "p-6 rounded-2xl border transition-all duration-500",
                totals.margin > 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-rose-500/10 border-rose-500/20"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {totals.margin > 0 ? <TrendingUp className="h-4 w-4 text-emerald-500" /> : <TrendingDown className="h-4 w-4 text-rose-500" />}
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Net Margin Est.</span>
                  </div>
                  <Zap className={cn("h-3 w-3", totals.margin > 0 ? "text-emerald-500" : "text-rose-500")} />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={cn("text-2xl font-black tracking-tighter", totals.margin > 0 ? "text-emerald-400" : "text-rose-400")}>
                    {formatPaise(totals.margin)}
                  </span>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Base P/L</span>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 space-y-4">
                <Input 
                  label="GST Bill Reference" 
                  icon={<FileText className="h-4 w-4" />}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-700"
                  {...register('gstBillNo')}
                />
                
                <Input 
                  label="12-Digit E-Way Bill" 
                  error={errors.ewayBillNo?.message}
                  icon={<ShieldCheck className="h-4 w-4 text-blue-500" />}
                  placeholder="Verified E-Way No."
                  maxLength={12}
                  className="bg-white/5 border-white/10 text-white placeholder:text-slate-700"
                  {...register('ewayBillNo')}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={isDealerModalOpen} onClose={() => setIsDealerModalOpen(false)} title="Quick Add Dealer" size="lg">
        <DealerForm onSuccess={(d) => { setMasters(m => ({ ...m, dealers: [d, ...m.dealers] })); setValue('dealerId', d.id!); setIsDealerModalOpen(false); }} onCancel={() => setIsDealerModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConsigneeModalOpen} onClose={() => setIsConsigneeModalOpen(false)} title="Quick Add Consignee" size="lg">
        <ConsigneeForm onSuccess={(c) => { setMasters(m => ({ ...m, consignees: [c, ...m.consignees] })); setValue('consigneeId', c.id!); setIsConsigneeModalOpen(false); }} onCancel={() => setIsConsigneeModalOpen(false)} />
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Quick Add Vehicle" size="lg">
        <VehicleForm onSuccess={(v) => { setMasters(m => ({ ...m, vehicles: [v, ...m.vehicles] })); setValue('vehicleId', v.id!); setIsVehicleModalOpen(false); }} onCancel={() => setIsVehicleModalOpen(false)} />
      </Modal>
        <style jsx global>{`
        .premium-select-trigger {
          width: 100%;
          height: 3rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 0.75rem;
          font-weight: 800;
          font-size: 0.8125rem;
          color: #1e293b;
          transition: all 0.2s ease;
          outline: none;
          position: relative;
        }
        .premium-select-trigger:focus {
          background: white;
          border-color: #3b82f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
      `}</style>
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
