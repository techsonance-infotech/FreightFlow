'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PalletSchema, type Pallet } from '@freightflow/shared';
import { 
  Plus, Trash2, Save, Truck, User, Building2, 
  Hash, Calendar, CreditCard, ChevronRight, Calculator,
  Package, Scale, Info, Search, Box, MapPin, Navigation,
  ShieldCheck, AlertCircle, TrendingUp, TrendingDown, FileText, Zap,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from '@/components/ui/modal';
import { DealerForm } from '@/components/masters/dealer-form';
import { ConsigneeForm } from '@/components/masters/consignee-form';
import { VehicleForm } from '@/components/masters/vehicle-form';
import { PalletMasterForm } from '@/components/masters/pallet-master-form';
import { toast } from 'sonner';
import { PalletInvoiceDownloader } from './PalletInvoiceDownloader';
import { CheckCircle2, X } from 'lucide-react';

interface OrderPalletFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

export function OrderPalletForm({ initialData, onSuccess, onCancel }: OrderPalletFormProps) {
  const [dealers, setDealers] = useState<any[]>([]);
  const [consignees, setConsignees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [palletMasters, setPalletMasters] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isConsigneeModalOpen, setIsConsigneeModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
  const [successPallet, setSuccessPallet] = useState<any>(null);

  const { 
    register, 
    control, 
    handleSubmit, 
    setValue, 
    watch, 
    getValues, 
    formState: { errors, isSubmitting } 
  } = useForm<Pallet>({
    resolver: zodResolver(PalletSchema) as any,
    defaultValues: {
      lrNo: initialData?.lrNo || '',
      dealerId: initialData?.dealerId || '',
      consigneeId: initialData?.consigneeId || '',
      vehicleId: initialData?.vehicleId || '',
      date: initialData?.date ? new Date(initialData?.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      companyName: initialData?.companyName || '',
      partyCode: initialData?.partyCode || '',
      fromLocation: initialData?.fromLocation || '',
      fromAddress: initialData?.fromAddress || '',
      toLocation: initialData?.toLocation || '',
      toAddress: initialData?.toAddress || '',
      freight: initialData?.freight ? initialData.freight / 100 : 0,
      hamali: initialData?.hamali ? initialData.hamali / 100 : 0,
      rate: initialData?.rate ? initialData.rate / 100 : 0,
      rateOn: initialData?.rateOn || 'qty',
      gstType: initialData?.gstType || 'intra',
      cgstPct: initialData?.cgstPct || 2.5,
      sgstPct: initialData?.sgstPct || 2.5,
      igstPct: initialData?.igstPct || 5.0,
      type: 'OUTWARD',
      palletDetails: initialData?.palletDetails?.length > 0 
        ? initialData.palletDetails.map((p: any) => ({
            ...p,
            rate: p.rate / 100 
          }))
        : [{ palletDisplayId: '', qty: 1, rate: 0, consigneeName: '' }],
      isGstRequired: initialData?.isGstRequired ?? false,
    }
  });

  const { fields: palletFields, append: appendPallet, remove: removePallet } = useFieldArray({ control, name: 'palletDetails' });
  
  const watchedPallets = useWatch({
    control,
    name: 'palletDetails'
  }) || [];

  const watchedDealerId = useWatch({ control, name: 'dealerId' });
  const watchedConsigneeId = useWatch({ control, name: 'consigneeId' });
  const watchedVehicleId = useWatch({ control, name: 'vehicleId' });
  const watchedFreight = useWatch({ control, name: 'freight' }) || 0;
  const watchedHamali = useWatch({ control, name: 'hamali' }) || 0;
  const watchedRate = useWatch({ control, name: 'rate' }) || 0;
  const watchedRateOn = useWatch({ control, name: 'rateOn' });
  const watchedGstType = useWatch({ control, name: 'gstType' });
  const watchedCgstPct = useWatch({ control, name: 'cgstPct' }) || 0;
  const watchedSgstPct = useWatch({ control, name: 'sgstPct' }) || 0;
  const watchedIgstPct = useWatch({ control, name: 'igstPct' }) || 0;
  const watchedIsGstRequired = useWatch({ control, name: 'isGstRequired' });
  const watchedDate = useWatch({ control, name: 'date' });

  const [totals, setTotals] = useState({
    totalQty: 0,
    totalPallets: 0,
    baseFreight: 0,
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
    totalAmount: 0,
    margin: 0
  });

  useEffect(() => {
    async function loadMasters() {
      try {
        const [dealersRes, consigneesRes, vehiclesRes, palletsRes] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/consignees?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/vehicles?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/pallets').then(r => r.json()),
        ]);
        setDealers(dealersRes.data || []);
        setConsignees(consigneesRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setPalletMasters(palletsRes.data || []);
      } catch (error) {
        console.error('Failed to load masters');
      } finally {
        setLoadingMasters(false);
      }
    }
    loadMasters();
  }, []);

  useEffect(() => {
    if (initialData?.id) return;

    const fetchNextLr = async () => {
      try {
        const res = await fetch(`/api/v1/pallets/next-lr?date=${watchedDate}`).then(r => r.json());
        if (res?.nextLr && !getValues('lrNo')) {
          setValue('lrNo', res.nextLr, { shouldDirty: true });
        }
      } catch (error) {
        console.error('Failed to fetch next LR', error);
      }
    };

    fetchNextLr();
  }, [watchedDate, initialData?.id, setValue, getValues]);

  // Calculation Logic
  useEffect(() => {
    const totalQty = watchedPallets.reduce((acc, curr) => acc + (parseInt(curr.qty as any) || 0), 0);
    const totalPallets = watchedPallets.length;
    
    // Total value calculated directly from the payload table
    const subtotalFromTable = watchedPallets.reduce((acc, curr) => {
      const q = parseInt(curr.qty as any) || 0;
      const r = parseFloat(curr.rate as any) || 0;
      return acc + (q * r);
    }, 0);

    const subtotal = subtotalFromTable + (parseFloat(watchedFreight as any) || 0) + (parseFloat(watchedHamali as any) || 0);
    
    let cgst = 0, sgst = 0, igst = 0;
    if (watchedIsGstRequired) {
      if (watchedGstType === 'intra') {
        cgst = (subtotal * watchedCgstPct) / 100;
        sgst = (subtotal * watchedSgstPct) / 100;
      } else {
        igst = (subtotal * watchedIgstPct) / 100;
      }
    }

    const totalAmount = subtotal + cgst + sgst + igst;

    setTotals({
      totalQty,
      totalPallets,
      baseFreight: subtotalFromTable,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount,
      margin: subtotalFromTable
    });
  }, [watchedPallets, watchedFreight, watchedHamali, watchedGstType, watchedCgstPct, watchedSgstPct, watchedIgstPct, watchedIsGstRequired]);

  const onSubmit = async (data: Pallet) => {
    try {
      const payload = {
        ...data,
        freight: Math.round(parseFloat(data.freight as any) * 100),
        hamali: Math.round(parseFloat(data.hamali as any) * 100),
        rate: 0,
        subtotal: Math.round(totals.subtotal * 100),
        cgstAmount: Math.round(totals.cgstAmount * 100),
        sgstAmount: Math.round(totals.sgstAmount * 100),
        igstAmount: Math.round(totals.igstAmount * 100),
        totalAmount: Math.round(totals.totalAmount * 100),
        totalWeight: 0,
        totalBoxes: totals.totalQty,
        totalQty: totals.totalQty,
        type: 'OUTWARD',
        palletDetails: data.palletDetails.map((p: any) => ({
          ...p,
          qty: parseInt(p.qty as any) || 0,
          rate: p.rate ? Math.round(parseFloat(p.rate as any) * 100) : 0,
        })),
      };

      const url = initialData?.id ? `/api/v1/pallets/${initialData.id}` : '/api/v1/pallets';
      const method = initialData?.id ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(initialData?.id ? 'Palletized record updated' : 'Palletized Order Synchronized Successfully');
        if (!initialData?.id) {
          setSuccessPallet(result.data || result);
        } else {
          onSuccess(result);
        }
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to establish pallet order');
      }
    } catch {
      toast.error('A communication error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-700">
      
      {/* Premium Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 -mx-8 px-8 py-4 mb-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">{initialData?.id ? 'Edit Pallet Load' : 'Establish Palletized Load'}</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Advanced Fleet Ops Hub</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 h-12 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center gap-2">
            {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Syncing...' : 'Publish Load'}
          </Button>
        </div>
      </div>

      {/* Hero Banner (Non-sticky) */}
      <div className="bg-blue-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-blue-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
          <Package className="h-48 w-48" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Zap className="h-4 w-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Advanced Fleet Ops</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">{initialData?.id ? 'Edit Pallet Load' : 'Establish Palletized Load'}</h1>
          <p className="text-blue-100 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Configure multi-tenant palletized inventory routes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Main Content Area */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-8">
          
          {/* Logistics Context */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <FormSectionHeader icon={<Truck className="text-blue-600" />} title="Logistics Context" sub="Identity & Asset Allocation" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInputWrapper label="Dealer / Consignor *" error={errors.dealerId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={watchedDealerId} onValueChange={(val) => {
                      setValue('dealerId', val, { shouldValidate: true });
                      const dealer = dealers.find(d => d.id === val);
                      if (dealer) {
                        setValue('companyName', dealer.name, { shouldDirty: true });
                        setValue('partyCode', dealer.code || '', { shouldDirty: true });
                      }
                    }}>
                      <SelectTrigger className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                        <SelectValue placeholder="Select Registry Member" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealers.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <button type="button" onClick={() => setIsDealerModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Consignee *" error={errors.consigneeId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={watchedConsigneeId} onValueChange={(val) => setValue('consigneeId', val, { shouldValidate: true })}>
                      <SelectTrigger className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                        <SelectValue placeholder="Select Consignee" />
                      </SelectTrigger>
                      <SelectContent>
                        {consignees.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <button type="button" onClick={() => setIsConsigneeModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Vehicle Allocation *" error={errors.vehicleId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select value={watchedVehicleId} onValueChange={(val) => setValue('vehicleId', val, { shouldValidate: true })}>
                      <SelectTrigger className="w-full h-12 px-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                        <SelectValue placeholder="Select Asset" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.map(v => <SelectItem key={v.id} value={v.id}>{v.regNo || v.plateNumber}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <button type="button" onClick={() => setIsVehicleModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Custom LR No. *" error={errors.lrNo?.message}>
                <div className="relative group/field">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 group-focus-within/field:text-blue-600 transition-colors" />
                  <input 
                    {...register('lrNo')} 
                    placeholder="Auto-gen if empty" 
                    className="w-full h-12 pl-12 pr-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-sm font-black text-blue-600 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-blue-200 uppercase" 
                  />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Issue Date *" error={errors.date?.message}>
                <div className="relative group/field">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input type="date" {...register('date')} className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Party Reference">
                <div className="relative group/field">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    {...register('partyCode')} 
                    placeholder="External Code"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Company Branding" error={errors.companyName?.message} className="md:col-span-2">
                <div className="relative group/field">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    {...register('companyName')} 
                    placeholder="Legal Identity"
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none"
                  />
                </div>
              </FormInputWrapper>
            </div>
          </div>

          {/* Territory Mapping */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <FormSectionHeader icon={<MapPin className="text-rose-500" />} title="Territory Mapping" sub="Define pick-up and delivery points" />
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Origin Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-blue-500" />
                    <Textarea 
                      {...register('fromAddress')} 
                      placeholder="Enter detailed street address, building, etc..."
                      className={cn(
                        "min-h-[80px] pl-12 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none",
                        errors.fromAddress && "border-rose-300 ring-4 ring-rose-50"
                      )}
                    />
                    {errors.fromAddress && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 ml-1"><AlertCircle className="h-3 w-3" /> {errors.fromAddress.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Destination Address *</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-emerald-500" />
                    <Textarea 
                      {...register('toAddress')} 
                      placeholder="Enter detailed street address, building, etc..."
                      className={cn(
                        "min-h-[80px] pl-12 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none",
                        errors.toAddress && "border-rose-300 ring-4 ring-rose-50"
                      )}
                    />
                    {errors.toAddress && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 ml-1"><AlertCircle className="h-3 w-3" /> {errors.toAddress.message}</p>}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Origin City/Point *</label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
                    <input 
                      {...register('fromLocation')} 
                      placeholder="e.g. Mumbai, Maharashtra..."
                      className={cn(
                        "w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none",
                        errors.fromLocation && "border-rose-300 ring-4 ring-rose-50"
                      )}
                    />
                    {errors.fromLocation && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 ml-1"><AlertCircle className="h-3 w-3" /> {errors.fromLocation.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Destination City/Point *</label>
                  <div className="relative">
                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
                    <input 
                      {...register('toLocation')} 
                      placeholder="e.g. Bangalore, Karnataka..."
                      className={cn(
                        "w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none",
                        errors.toLocation && "border-rose-300 ring-4 ring-rose-50"
                      )}
                    />
                    {errors.toLocation && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1.5 ml-1"><AlertCircle className="h-3 w-3" /> {errors.toLocation.message}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>


        </div>

        {/* Sidebar - Financial Core */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-8 border border-slate-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-blue-400/50">Financial Core</h3>
                <p className="text-xl font-black tracking-tight text-white">Billing Hub</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Freight" dark>
                  <div className="relative group/fin">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 group-focus-within/fin:text-blue-400 transition-colors">₹</div>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register('freight', { valueAsNumber: true })} 
                      className="w-full h-12 pl-8 pr-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                      min="0"
                      onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                    />
                  </div>
                </FormInputWrapper>

                <FormInputWrapper label="Hamali" dark error={errors.hamali?.message}>
                  <div className="relative group/fin">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 group-focus-within/fin:text-blue-400 transition-colors">₹</div>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register('hamali', { valueAsNumber: true })} 
                      className="w-full h-12 pl-8 pr-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                      min="0"
                      onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                    />
                  </div>
                </FormInputWrapper>
              </div>

              <div className="p-6 bg-slate-800/30 rounded-3xl border border-slate-700/50 space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GST Requirement</span>
                  <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
                    <button type="button" onClick={() => setValue('isGstRequired', true)} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", watchedIsGstRequired ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-500 hover:text-slate-300')}>With GST</button>
                    <button type="button" onClick={() => setValue('isGstRequired', false)} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", !watchedIsGstRequired ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/50' : 'text-slate-500 hover:text-slate-300')}>Without GST</button>
                  </div>
                </div>

                {watchedIsGstRequired && (
                  <div className="space-y-4 pt-4 border-t border-slate-700/50 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">GST Setup</span>
                      <div className="flex bg-slate-800 rounded-full p-1 border border-slate-700">
                        <button type="button" onClick={() => setValue('gstType', 'intra')} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", watchedGstType === 'intra' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-500 hover:text-slate-300')}>Intra</button>
                        <button type="button" onClick={() => setValue('gstType', 'inter')} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", watchedGstType === 'inter' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-500 hover:text-slate-300')}>Inter</button>
                      </div>
                    </div>

                    {watchedGstType === 'intra' ? (
                      <div className="grid grid-cols-2 gap-4 text-white">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CGST %</p>
                          <input 
                            type="number" 
                            step="0.1" 
                            {...register('cgstPct', { valueAsNumber: true })} 
                            className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 outline-none" 
                            min="0"
                            onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SGST %</p>
                          <input 
                            type="number" 
                            step="0.1" 
                            {...register('sgstPct', { valueAsNumber: true })} 
                            className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 outline-none" 
                            min="0"
                            onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-white">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IGST %</p>
                        <input 
                          type="number" 
                          step="0.1" 
                          {...register('igstPct', { valueAsNumber: true })} 
                          className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-indigo-400 outline-none" 
                          min="0"
                          onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-800 space-y-3">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-xs font-bold">Base Total</span>
                  <span className="text-sm font-black text-white">₹{totals.subtotal.toFixed(2)}</span>
                </div>
                
                {watchedIsGstRequired && (
                  <>
                    {watchedGstType === 'intra' ? (
                      <>
                        <div className="flex justify-between items-center text-slate-500">
                          <span className="text-[10px] font-black uppercase tracking-widest">CGST ({watchedCgstPct}%)</span>
                          <span className="text-xs font-bold text-blue-400">+ ₹{totals.cgstAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-500">
                          <span className="text-[10px] font-black uppercase tracking-widest">SGST ({watchedSgstPct}%)</span>
                          <span className="text-xs font-bold text-blue-400">+ ₹{totals.sgstAmount.toFixed(2)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center text-slate-500">
                        <span className="text-[10px] font-black uppercase tracking-widest">IGST ({watchedIgstPct}%)</span>
                        <span className="text-xs font-bold text-indigo-400">+ ₹{totals.igstAmount.toFixed(2)}</span>
                      </div>
                    )}
                  </>
                )}

                <div className="pt-6 flex justify-between items-center border-t border-slate-800/50">
                  <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Grand Settlement</span>
                  <span className="text-3xl font-black text-white tracking-tighter">₹{totals.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Margin Insights */}
          <div className={cn("rounded-[2.5rem] p-8 text-white shadow-xl transition-all duration-500 relative overflow-hidden group", totals.margin > 0 ? "bg-emerald-600" : "bg-rose-600")}>
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
              <TrendingUp className="h-32 w-32" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Expected Net Margin</h4>
              <p className="text-3xl font-black tracking-tighter mb-4">₹{totals.margin.toFixed(2)}</p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-white/70 flex items-center gap-2">
                <ShieldCheck className="h-3 w-3" /> Basic Ops Shield
              </p>
            </div>
          </div>

          {/* Submission Checklist */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Submission Checklist</h4>
              <div className="h-5 w-5 rounded-full bg-slate-50 flex items-center justify-center">
                <ShieldCheck className="h-3 w-3 text-slate-300" />
              </div>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Vehicle Allocation Verified', status: !!watchedVehicleId },
                { label: 'Consignee Identity Verified', status: !!watchedConsigneeId },
                { label: 'Financials Synchronized', status: totals.totalAmount > 0 },
                { 
                  label: 'Inventory Rows Validated', 
                  status: watchedPallets.length > 0 && watchedPallets.every((p: any) => p.palletDisplayId?.trim() !== '' && (parseInt(p.qty as any) > 0)) 
                }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={cn(
                    "h-5 w-5 rounded-full flex items-center justify-center transition-all duration-500",
                    item.status ? "bg-emerald-100 text-emerald-600 shadow-sm scale-110" : "bg-slate-50 text-slate-200"
                  )}>
                    <CheckCircle2 className={cn("h-3 w-3", item.status ? "animate-in zoom-in" : "")} />
                  </div>
                  <span className={cn("text-[11px] font-bold transition-all duration-500", item.status ? "text-slate-700" : "text-slate-300")}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Global Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] space-y-3 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Validation Blocked</span>
              </div>
              <ul className="space-y-1">
                {Object.entries(errors).map(([key, error]: any) => {
                  if (key === 'palletDetails' && Array.isArray(error)) {
                    return error.map((err: any, idx: number) => 
                      Object.entries(err || {}).map(([subKey, subErr]: any) => (
                        <li key={`${key}-${idx}-${subKey}`} className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-6">
                          • Row {idx + 1}: {subErr?.message || 'Invalid'}
                        </li>
                      ))
                    );
                  }
                  return (
                    <li key={key} className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-6">
                      • {key}: {(error as any).message || 'Field is required'}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        {/* Move Inventory Payload INSIDE the grid */}
        <div className="lg:col-span-12 space-y-8">
        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50">
          <div className="p-10 bg-white border-b border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Box className="h-7 w-7 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Inventory Payload</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-tenant pallet inventory distribution</p>
              </div>
            </div>
            <Button 
              type="button" 
              onClick={() => appendPallet({ palletDisplayId: '', code: '', qty: 1, rate: 0, consigneeName: '' })}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-4 h-auto text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" /> Add Row
            </Button>
          </div>

          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50/50 text-slate-400">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-20">Sr.</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-[350px]">Pallet Identification *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-[250px]">Code</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-32 text-center">Qty *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-40 text-center">Unit Rate *</th>
                  <th className="px-8 py-6 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {palletFields.map((field, index) => (
                  <tr key={field.id} className="group hover:bg-blue-50/10 transition-all duration-300">
                    <td className="px-8 py-8 align-top">
                      <span className="text-sm font-black text-slate-200 group-hover:text-blue-500 transition-colors">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className="flex gap-2">
                        <div className="flex-1 relative group/field">
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                              <Search className="h-4 w-4" />
                            </div>
                            <input 
                              {...register(`palletDetails.${index}.palletDisplayId` as const)} 
                              autoComplete="off"
                              placeholder="Search Pallet ID..." 
                              className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none" 
                            />
                          </div>
                          
                          <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {palletMasters.length > 0 ? (
                                palletMasters
                                  .filter(p => !watch(`palletDetails.${index}.palletDisplayId`) || p.palletId.toLowerCase().includes(watch(`palletDetails.${index}.palletDisplayId`).toLowerCase()) || p.name?.toLowerCase().includes(watch(`palletDetails.${index}.palletDisplayId`).toLowerCase()))
                                  .map(p => (
                                    <button
                                      key={p.id}
                                      type="button"
                                      onMouseDown={() => {
                                        setValue(`palletDetails.${index}.palletDisplayId`, p.palletId, { shouldDirty: true });
                                        if (p.code) {
                                          setValue(`palletDetails.${index}.code`, p.code, { shouldDirty: true });
                                        }
                                      }}
                                      className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                                    >
                                      <div>
                                        <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{p.palletId}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.name || 'STANDARD PALLET'}</p>
                                      </div>
                                      {p.dimensions && (
                                        <span className="px-2 py-1 bg-slate-100 rounded-md text-[9px] font-black text-slate-500 uppercase tracking-tighter">{p.dimensions}</span>
                                      )}
                                    </button>
                                  ))
                              ) : (
                                <div className="p-4 text-center">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Pallets Found</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => setIsPalletModalOpen(true)} 
                          className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-sm"
                        >
                          <Plus className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 shadow-inner h-12 flex items-center px-4">
                        <input 
                          type="text" 
                          {...register(`palletDetails.${index}.code` as const)} 
                          readOnly
                          placeholder="-"
                          className="w-full bg-transparent border-none font-bold text-slate-500 text-sm focus:ring-0 outline-none" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className={cn(
                        "bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-2",
                        errors.palletDetails?.[index]?.qty && "border-rose-300 ring-4 ring-rose-50"
                      )}>
                        <input 
                          type="number" 
                          {...register(`palletDetails.${index}.qty` as const, { valueAsNumber: true })} 
                          className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                          min="0"
                          onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                        />
                      </div>
                      {errors.palletDetails?.[index]?.qty && <p className="text-[9px] font-bold text-rose-500 mt-1 text-center">{errors.palletDetails[index]?.qty?.message}</p>}
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className={cn(
                        "bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-4",
                        errors.palletDetails?.[index]?.rate && "border-rose-300 ring-4 ring-rose-50"
                      )}>
                        <span className="text-xs font-black text-slate-400 mr-2">₹</span>
                        <input 
                          type="number" 
                          step="0.01"
                          {...register(`palletDetails.${index}.rate` as const, { valueAsNumber: true })} 
                          className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                          min="0"
                          onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                        />
                      </div>
                      {errors.palletDetails?.[index]?.rate && <p className="text-[9px] font-bold text-rose-500 mt-1 text-center">{errors.palletDetails[index]?.rate?.message}</p>}
                    </td>
                    <td className="px-8 py-8 text-center align-top">
                      <button 
                        type="button" 
                        onClick={() => removePallet(index)} 
                        disabled={palletFields.length === 1}
                        className="p-3 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-0"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-10 bg-slate-50/30 flex justify-between items-center rounded-b-[2.5rem]">
              <div className="flex gap-20">
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pallets</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-slate-900 tracking-tighter">{totals.totalPallets}</span>
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Nodes</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Quantity</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">
                    {totals.totalQty} <span className="text-sm text-slate-400 font-bold ml-1 uppercase">Units</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Actions */}
        <div className="flex justify-end items-center gap-4 pt-4">
          <Button 
            type="button" 
            variant="ghost" 
            onClick={onCancel}
            className="h-16 px-10 rounded-3xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
          >
            Discard Changes
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="h-16 px-12 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-4"
          >
            {isSubmitting ? <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
            {isSubmitting ? 'ESTABLISHING...' : 'PUBLISH CONSIGNMENT'}
          </Button>
        </div>
      </div>
      <Modal isOpen={isDealerModalOpen} onClose={() => setIsDealerModalOpen(false)} title="Quick Add Dealer" size="lg">
        <DealerForm onSuccess={(d) => { setDealers(prev => [d, ...prev]); setValue('dealerId', d.id!); setIsDealerModalOpen(false); }} onCancel={() => setIsDealerModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConsigneeModalOpen} onClose={() => setIsConsigneeModalOpen(false)} title="Quick Add Consignee" size="lg">
        <ConsigneeForm onSuccess={(c) => { setConsignees(prev => [c, ...prev]); setValue('consigneeId', c.id!); setIsConsigneeModalOpen(false); }} onCancel={() => setIsConsigneeModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!successPallet} onClose={() => onSuccess(successPallet)} title="" size="md">
        <div className="p-8 text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Pallet Established</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Record #{successPallet?.lrNo} has been synchronized with the global ledger.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <PalletInvoiceDownloader 
              palletId={successPallet?.id} 
              lrNo={successPallet?.lrNo}
              variant="receipt"
              label="Download Challan"
              className="h-16 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-black transition-all"
            />
            <PalletInvoiceDownloader 
              palletId={successPallet?.id} 
              lrNo={successPallet?.lrNo}
              variant="invoice"
              label="Download Invoice"
              className="h-16 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
            />
          </div>
          <Button 
            variant="ghost" 
            onClick={() => onSuccess(successPallet)}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-slate-400"
          >
            Back to Overview
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Quick Add Vehicle" size="lg">
        <VehicleForm onSuccess={(v) => { setVehicles(prev => [v, ...prev]); setValue('vehicleId', v.id!); setIsVehicleModalOpen(false); }} onCancel={() => setIsVehicleModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPalletModalOpen} onClose={() => setIsPalletModalOpen(false)} title="Quick Add Pallet Master" size="md">
        <PalletMasterForm onSuccess={(p) => { 
          setPalletMasters(prev => [p, ...prev]); 
          // We don't set a single value here because it's for a list row
          setIsPalletModalOpen(false); 
        }} onCancel={() => setIsPalletModalOpen(false)} />
      </Modal>

    </form>
  );
}

function FormSectionHeader({ icon, title, sub }: any) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-lg font-black text-slate-900 tracking-tight leading-none uppercase">{title}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">{sub}</p>
      </div>
    </div>
  );
}

function FormInputWrapper({ label, children, error, dark, className }: any) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className={cn(
        "text-[10px] font-black uppercase tracking-widest ml-1",
        dark ? "text-slate-500" : "text-slate-400"
      )}>
        {label}
      </label>
      {children}
      {error && <p className="text-[10px] font-bold text-rose-500 flex items-center gap-1 mt-1 ml-1"><AlertCircle className="h-3 w-3" /> {error}</p>}
    </div>
  );
}
