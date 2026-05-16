'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type Order } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  FileText, Plus, Trash2, Save, ArrowLeft, 
  Search, Calculator, Truck, User, MapPin, 
  ChevronRight, ChevronDown, Box, CreditCard, ShieldCheck, AlertCircle, Hash, Building2, Calendar, Package,
  TrendingUp, TrendingDown, Zap, Navigation, CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { DealerForm } from '@/components/masters/dealer-form';
import { ConsigneeForm } from '@/components/masters/consignee-form';
import { VehicleForm } from '@/components/masters/vehicle-form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
    productUnits: any[];
  }>({
    dealers: [],
    consignees: [],
    vehicles: [],
    products: [],
    productUnits: [],
  });

  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isConsigneeModalOpen, setIsConsigneeModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const [dealerSearch, setDealerSearch] = useState('');
  const [consigneeSearch, setConsigneeSearch] = useState('');
  const [vehicleSearch, setVehicleSearch] = useState('');

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<Order>({
    resolver: zodResolver(OrderSchema) as any,
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      details: [{ productName: '', boxCount: 0, weight: 0, sortOrder: 0 }],
      freight: 0,
      hamali: 0,
      cgstPct: 2.5,
      sgstPct: 2.5,
      igstPct: 5.0,
      gstType: 'intra',
      rateOn: 'weight',
      rate: 0,
      status: 'created',
      dealerId: '',
      consigneeId: '',
      vehicleId: '',
      fromLocation: '',
      fromAddress: '',
      toLocation: '',
      toAddress: '',
      lrNo: '',
      gstBillNo: '',
      ewayBillNo: '',
      partyCode: '',
      companyName: '',
      ...initialData,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'details',
  });

  const watchedDetails = useWatch({
    control,
    name: 'details'
  }) || [];
  const watchedFreight = watch('freight');
  const watchedHamali = watch('hamali');
  const watchedCgstPct = watch('cgstPct');
  const watchedSgstPct = watch('sgstPct');
  const watchedRate = watch('rate');
  const watchedRateOn = watch('rateOn');
  const watchedGstType = watch('gstType');
  const watchedIgstPct = watch('igstPct');
  const watchedIsGstRequired = watch('isGstRequired');

  const [totals, setTotals] = useState({
    totalWeight: 0,
    totalBoxes: 0,
    subtotal: 0,
    cgstAmount: 0,
    sgstAmount: 0,
    igstAmount: 0,
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
    if (!watchedDealerId || isEditing) return;
    const dealer = masters.dealers.find(d => d.id === watchedDealerId);
    if (dealer?.address && !getValues('fromAddress')) {
      setValue('fromAddress', dealer.address);
    }
  }, [watchedDealerId, masters.dealers, isEditing]);

  useEffect(() => {
    if (!watchedConsigneeId || isEditing) return;
    const consignee = masters.consignees.find(c => c.id === watchedConsigneeId);
    if (consignee?.address && !getValues('toAddress')) {
      setValue('toAddress', consignee.address);
    }
  }, [watchedConsigneeId, masters.consignees, isEditing]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [dealers, consignees, vehicles, products, productUnits] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/consignees?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/vehicles?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/products?limit=100').then((r) => r.json()),
          fetch('/api/v1/masters/product-units').then((r) => r.json()),
        ]);
        setMasters({
          dealers: dealers.data || [],
          consignees: consignees.data || [],
          vehicles: vehicles.data || [],
          products: products.data || [],
          productUnits: productUnits || [],
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
    
    // Financial calculations in standard units (Rupees/KG)
    let calculatedSubtotal = 0;
    if (watchedRateOn === 'weight') {
      calculatedSubtotal = totalWeight * Number(watchedRate || 0);
    } else {
      calculatedSubtotal = totalBoxes * Number(watchedRate || 0);
    }
    
    // Add other charges
    calculatedSubtotal += Number(watchedFreight || 0) + Number(watchedHamali || 0);
    
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    if (watchedGstType === 'intra') {
      cgstAmount = watchedIsGstRequired ? (calculatedSubtotal * Number(watchedCgstPct || 0)) / 100 : 0;
      sgstAmount = watchedIsGstRequired ? (calculatedSubtotal * Number(watchedSgstPct || 0)) / 100 : 0;
    } else {
      igstAmount = watchedIsGstRequired ? (calculatedSubtotal * Number(watchedIgstPct || 0)) / 100 : 0;
    }
    
    const totalAmount = calculatedSubtotal + cgstAmount + sgstAmount + igstAmount;
    const margin = Number(watchedFreight || 0) - Number(watchedHamali || 0); 

    setTotals({ 
      totalWeight, 
      totalBoxes, 
      subtotal: calculatedSubtotal, 
      cgstAmount, 
      sgstAmount, 
      igstAmount, // Added to totals state
      totalAmount, 
      margin 
    });
  }, [watchedDetails, watchedFreight, watchedHamali, watchedCgstPct, watchedSgstPct, watchedIgstPct, watchedRate, watchedRateOn, watchedGstType, watchedIsGstRequired]);

  const onSubmit = async (data: Order) => {
    try {
      setLoading(true);
      
      // Ensure we have the correct ID for editing
      const orderId = data.id || initialData?.id;
      if (isEditing && !orderId) {
        throw new Error('Order ID is missing for update');
      }

      // Send values in Rupees (backend API handles conversion to Paise)
      const submissionData = {
        ...data,
        id: orderId,
        freight: Number(data.freight || 0),
        hamali: Number(data.hamali || 0),
        rate: Number(data.rate || 0),
        // Send raw percentage values
        cgstPct: Number(data.cgstPct || 0),
        sgstPct: Number(data.sgstPct || 0),
        igstPct: Number(data.igstPct || 0),
        details: (data.details || []).map(d => ({
          ...d,
          weight: Number(d.weight || 0),
          boxCount: Number(d.boxCount || 0)
        }))
      };

      const url = isEditing ? `/api/v1/orders/${orderId}` : '/api/v1/orders';
      const method = isEditing ? 'PATCH' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to save order');
      }

      toast.success(isEditing ? 'Lorry Receipt updated successfully' : 'Lorry Receipt established successfully');
      router.push('/dashboard/orders');
      router.refresh();
    } catch (error: any) {
      console.error('Submission error:', error);
      toast.error(error.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('Validation Failed:', errors);
    
    // Find the first error message
    const findFirstErrorMessage = (errs: any): string | null => {
      for (const key in errs) {
        const error = errs[key];
        if (error.message) return error.message;
        if (typeof error === 'object') {
          const nested = findFirstErrorMessage(error);
          if (nested) return nested;
        }
      }
      return null;
    };

    const message = findFirstErrorMessage(errors) || 'Please complete all required fields';
    toast.error(`Entry Blocked: ${message}`);
  };

  const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

  const renderWeightTotal = (weight: number) => {
    const kg = Math.floor(weight);
    const grams = Math.round((weight - kg) * 1000);
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-slate-900 tracking-tighter">{kg}</span>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-3">KG</span>
        {grams > 0 && (
          <>
            <span className="text-2xl font-black text-blue-600 tracking-tighter">{grams}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GRAMS</span>
          </>
        )}
      </div>
    );
  };

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-12 pb-24 px-4 max-w-[1800px] mx-auto">
      {/* Premium Gradient Header */}
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
          <h1 className="text-4xl font-black tracking-tighter uppercase">{isEditing ? 'Modify LR Entry' : 'Establish Lorry Receipt'}</h1>
          <p className="text-blue-100 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Configure multi-tenant freight logistics & routing</p>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          {/* Action buttons moved to bottom */}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column - Form Data */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-10">
          
          {/* Logistics Context Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <FormSectionHeader icon={<Truck className="text-blue-600" />} title="Logistics Context" sub="Define route, vehicle and parties" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInputWrapper label="Dealer / Consignor *" error={errors.dealerId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1 relative group/field">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search Dealer..."
                        autoComplete="off"
                        value={masters.dealers.find(d => d.id === watch('dealerId'))?.name || dealerSearch}
                        onChange={(e) => {
                          setDealerSearch(e.target.value);
                          if (!e.target.value) setValue('dealerId', '');
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {masters.dealers
                          .filter(d => !dealerSearch || d.name.toLowerCase().includes(dealerSearch.toLowerCase()))
                          .map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onMouseDown={() => {
                                setValue('dealerId', d.id, { shouldValidate: true });
                                setDealerSearch(d.name);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{d.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.location || 'Active Dealer'}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  <input type="hidden" {...register('dealerId')} />
                  <button type="button" onClick={() => setIsDealerModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Consignee *" error={errors.consigneeId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1 relative group/field">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search Consignee..."
                        autoComplete="off"
                        value={masters.consignees.find(c => c.id === watch('consigneeId'))?.name || consigneeSearch}
                        onChange={(e) => {
                          setConsigneeSearch(e.target.value);
                          if (!e.target.value) setValue('consigneeId', '');
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {masters.consignees
                          .filter(c => !consigneeSearch || c.name.toLowerCase().includes(consigneeSearch.toLowerCase()))
                          .map(c => (
                            <button
                              key={c.id}
                              type="button"
                              onMouseDown={() => {
                                setValue('consigneeId', c.id, { shouldValidate: true });
                                setConsigneeSearch(c.name);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{c.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.location || 'Active Consignee'}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  <input type="hidden" {...register('consigneeId')} />
                  <button type="button" onClick={() => setIsConsigneeModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Vehicle Assignment *" error={errors.vehicleId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1 relative group/field">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                        <Truck className="h-4 w-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search Vehicle..."
                        autoComplete="off"
                        value={masters.vehicles.find(v => v.id === watch('vehicleId'))?.regNo || vehicleSearch}
                        onChange={(e) => {
                          setVehicleSearch(e.target.value);
                          if (!e.target.value) setValue('vehicleId', '');
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {masters.vehicles
                          .filter(v => !vehicleSearch || v.regNo.toLowerCase().includes(vehicleSearch.toLowerCase()))
                          .map(v => (
                            <button
                              key={v.id}
                              type="button"
                              onMouseDown={() => {
                                setValue('vehicleId', v.id, { shouldValidate: true });
                                setVehicleSearch(v.regNo);
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{v.regNo}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{v.type || 'Standard Fleet'}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                  <input type="hidden" {...register('vehicleId')} />
                  <button type="button" onClick={() => setIsVehicleModalOpen(true)} className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0">
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Custom LR No." error={errors.lrNo?.message}>
                <div className="relative group/field">
                  <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400 group-focus-within/field:text-blue-600 transition-colors" />
                  <input 
                    {...register('lrNo')} 
                    placeholder="Auto-gen if empty" 
                    className="w-full h-12 pl-12 pr-4 bg-blue-50/30 border border-blue-100/50 rounded-2xl text-sm font-black text-blue-600 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all outline-none placeholder:text-blue-200" 
                  />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="GST Bill Ref." error={errors.gstBillNo?.message}>
                <div className="relative group/field">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input {...register('gstBillNo')} placeholder="Optional" className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Company Name" error={errors.companyName?.message}>
                <div className="relative group/field">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input {...register('companyName')} placeholder="Optional branding" className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Issue Date *" error={errors.date?.message}>
                <div className="relative group/field">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input type="date" {...register('date')} className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all outline-none" />
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="E-Way Bill (12 Digits) *" error={errors.ewayBillNo?.message}>
                <div className="relative group/field">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input 
                    {...register('ewayBillNo')} 
                    maxLength={12}
                    placeholder="Enter 12-digit E-Way Bill..." 
                    className="w-full h-12 pl-12 pr-4 bg-slate-50/50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all tracking-[0.2em] outline-none placeholder:text-[10px] placeholder:tracking-normal placeholder:text-slate-300" 
                  />
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
            </div>
          </div>

          {/* Address Card */}
          <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
            <FormSectionHeader icon={<MapPin className="text-rose-500" />} title="Territory Mapping" sub="Define pick-up and delivery points" />
            
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Textarea 
                  label="Full Origin Address *" 
                  error={errors.fromAddress?.message} 
                  icon={<MapPin className="h-4 w-4 text-blue-500" />}
                  rows={2}
                  placeholder="Enter detailed street address, building, etc..."
                  className="min-h-[80px]"
                  {...register('fromAddress')} 
                />

                <Textarea 
                  label="Full Destination Address *" 
                  error={errors.toAddress?.message} 
                  icon={<MapPin className="h-4 w-4 text-emerald-500" />}
                  rows={2}
                  placeholder="Enter detailed street address, building, etc..."
                  className="min-h-[80px]"
                  {...register('toAddress')} 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Textarea 
                  label="Origin City/Point *" 
                  error={errors.fromLocation?.message} 
                  icon={<Navigation className="h-4 w-4 text-blue-400" />}
                  rows={2}
                  className="min-h-[60px]"
                  placeholder="e.g. Mumbai, Maharashtra..."
                  {...register('fromLocation')} 
                />

                <Textarea 
                  label="Destination City/Point *" 
                  error={errors.toLocation?.message} 
                  icon={<Navigation className="h-4 w-4 text-emerald-400" />}
                  rows={2}
                  className="min-h-[60px]"
                  placeholder="e.g. Bangalore, Karnataka..."
                  {...register('toLocation')} 
                />
              </div>
            </div>
          </div>

          </div>

        {/* Right Column - Financials */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl sticky top-32 border border-slate-800">
            <div className="flex items-center gap-3 mb-10">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                <Calculator className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-blue-400/50">Financial Core</h3>
                <p className="text-xl font-black tracking-tight">Billing Hub</p>
              </div>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Rate Per *" error={errors.rate?.message} dark>
                  <div className="relative group/fin">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 group-focus-within/fin:text-blue-400 transition-colors">₹</div>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register('rate', { valueAsNumber: true })} 
                      onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                      className="w-full h-12 pl-8 pr-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                    />
                  </div>
                </FormInputWrapper>

                <FormInputWrapper label="Rate Basis *" dark>
                  <Select value={watch('rateOn')} onValueChange={(val) => setValue('rateOn', val as any)}>
                    <SelectTrigger className="w-full h-12 px-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none">
                      <SelectValue placeholder="Basis" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-800 text-white">
                      <SelectItem value="weight">Per KG</SelectItem>
                      <SelectItem value="box">Per Unit</SelectItem>
                    </SelectContent>
                  </Select>
                </FormInputWrapper>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormInputWrapper label="Base Freight *" error={errors.freight?.message} dark>
                  <div className="relative group/fin">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 group-focus-within/fin:text-blue-400 transition-colors">₹</div>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register('freight', { valueAsNumber: true })} 
                      onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                      className="w-full h-12 pl-8 pr-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
                    />
                  </div>
                </FormInputWrapper>

                <FormInputWrapper label="Hamali *" error={errors.hamali?.message} dark>
                  <div className="relative group/fin">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-500 group-focus-within/fin:text-blue-400 transition-colors">₹</div>
                    <input 
                      type="number" 
                      step="0.01" 
                      {...register('hamali', { valueAsNumber: true })} 
                      onFocus={(e) => { if (e.target.value === '0') e.target.value = ''; }}
                      className="w-full h-12 pl-8 pr-4 bg-slate-800/50 border border-slate-700 rounded-2xl text-sm font-bold text-white focus:bg-slate-800 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none" 
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
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">CGST %</p>
                          <input type="number" step="0.1" {...register('cgstPct', { valueAsNumber: true })} className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SGST %</p>
                          <input type="number" step="0.1" {...register('sgstPct', { valueAsNumber: true })} className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none" />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">IGST %</p>
                        <input type="number" step="0.1" {...register('igstPct', { valueAsNumber: true })} className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-indigo-400 focus:ring-2 focus:ring-indigo-500/20 outline-none" />
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

                <div className="pt-6 flex justify-between items-center">
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
                { label: 'Vehicle Allocation Verified', status: !!watch('vehicleId') },
                { label: 'Dealer Identity Confirmed', status: !!watch('dealerId') },
                { label: 'Financials Synchronized', status: totals.totalAmount > 0 },
                { 
                  label: 'Inventory Rows Validated', 
                  status: fields.length > 0 && fields.every((f: any, idx: number) => watch(`details.${idx}.productName`)?.trim() !== '') 
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
        </div>

        {/* Full Width Inventory Payload */}
      <div className="lg:col-span-12 space-y-8 ml-0">
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
              onClick={() => append({ productName: '', boxCount: 0, weight: 0, sortOrder: fields.length })}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-8 py-4 h-auto text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-200 flex items-center gap-3 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" /> Add Item
            </Button>
          </div>
          
          <div className="p-0 overflow-x-auto">
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50/50 text-slate-400">
                <tr>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest w-20">Sr.</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest">Product Description *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-32 text-center">Boxes *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-40 text-center text-blue-600">Packing *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-40 text-center">Weight (KG) *</th>
                  <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-40 text-right">DCPI #</th>
                  <th className="px-8 py-6 w-20"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {fields.map((field, index) => (
                  <tr key={field.id} className="group hover:bg-blue-50/10 transition-all duration-300">
                    <td className="px-8 py-8 align-top">
                      <span className="text-sm font-black text-slate-200 group-hover:text-blue-500 transition-colors">#{index + 1}</span>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className="relative group/field">
                        <div className="relative">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                            <Search className="h-4 w-4" />
                          </div>
                          <input 
                            {...register(`details.${index}.productName`)} 
                            autoComplete="off"
                            placeholder="Search product..." 
                            onFocus={(e) => {
                              if (e.target.value === '0') e.target.value = '';
                              // Trigger dropdown by focusing
                            }}
                            className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none" 
                          />
                        </div>
                        
                        <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                          <div className="p-2 space-y-1">
                            {masters.products.length > 0 ? (
                              masters.products
                                .filter(p => !getValues(`details.${index}.productName`) || p.name.toLowerCase().includes(getValues(`details.${index}.productName`).toLowerCase()))
                                .map(p => (
                                  <button
                                    key={p.id}
                                    type="button"
                                    onMouseDown={() => {
                                      setValue(`details.${index}.productName`, p.name);
                                      if (p.unit?.name) setValue(`details.${index}.packingType`, p.unit.name);
                                    }}
                                    className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                                  >
                                    <div>
                                      <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{p.name}</p>
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.hsnCode || 'NO HSN'}</p>
                                    </div>
                                    {p.unit?.name && (
                                      <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black text-slate-500">{p.unit.name}</span>
                                    )}
                                  </button>
                                ))
                            ) : (
                              <div className="p-4 text-center">
                                <p className="text-xs font-bold text-slate-400">No products found</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-2">
                        <input 
                          type="number" 
                          min="0"
                          {...register(`details.${index}.boxCount`, { valueAsNumber: true })} 
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
                          className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <Select 
                        value={watchedDetails[index]?.packingType} 
                        onValueChange={(val) => setValue(`details.${index}.packingType`, val)}
                      >
                        <SelectTrigger className="w-full h-12 bg-slate-50/50 border border-slate-100 rounded-2xl px-4 text-sm font-black text-blue-600 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50 transition-all outline-none">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {masters.productUnits.map(u => (
                            <SelectItem key={u.id} value={u.name}>{u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-8 align-top">
                      <div className="bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-2">
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          {...register(`details.${index}.weight`, { valueAsNumber: true })} 
                          onFocus={(e) => e.target.value === '0' && (e.target.value = '')}
                          onKeyDown={(e) => { if(e.key === '-' || e.key === 'e') e.preventDefault(); }}
                          className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                        />
                      </div>
                    </td>
                    <td className="px-4 py-8 align-top text-right">
                      <div className="relative group/field inline-block w-full">
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-300" />
                        <input 
                          {...register(`details.${index}.dcpiNo`)} 
                          className="w-full h-10 pl-8 pr-3 bg-slate-50/30 border border-slate-100 rounded-xl font-bold text-slate-500 text-right focus:bg-white focus:border-blue-100 focus:ring-0 transition-all text-xs outline-none" 
                        />
                      </div>
                    </td>
                    <td className="px-8 py-8 text-center align-top">
                      <button type="button" onClick={() => remove(index)} disabled={fields.length === 1} className="p-3 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all disabled:opacity-0"><Trash2 className="h-5 w-5" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-10 bg-slate-50/30 flex justify-between items-center rounded-b-[2.5rem]">
              <div className="flex gap-20">
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Tonnage</p>
                  {renderWeightTotal(totals.totalWeight)}
                </div>
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Boxes</p>
                  <p className="text-4xl font-black text-slate-900 tracking-tighter">
                    {totals.totalBoxes} <span className="text-sm text-slate-400 font-bold ml-1 uppercase">Units</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Actions */}
    <div className="flex justify-end items-center gap-4 pt-8">
      <Button 
        type="button" 
        variant="ghost" 
        onClick={() => router.push('/dashboard/orders')}
        className="h-16 px-10 rounded-3xl font-black uppercase tracking-widest text-[10px] text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
      >
        Discard Changes
      </Button>
      <Button 
        type="submit" 
        disabled={loading} 
        className="h-16 px-12 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[240px]"
      >
        {loading ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
        {loading ? 'SYNCING...' : isEditing ? 'UPDATE LORRY RECEIPT' : 'ESTABLISH LORRY RECEIPT'}
      </Button>
    </div>

  </form>

    <Modal isOpen={isDealerModalOpen} onClose={() => setIsDealerModalOpen(false)} title="Quick Add Dealer" size="lg">
      <DealerForm onSuccess={(d) => { setMasters(m => ({ ...m, dealers: [d, ...m.dealers] })); setValue('dealerId', d.id!); setIsDealerModalOpen(false); }} onCancel={() => setIsDealerModalOpen(false)} />
    </Modal>

    <Modal isOpen={isConsigneeModalOpen} onClose={() => setIsConsigneeModalOpen(false)} title="Quick Add Consignee" size="lg">
      <ConsigneeForm onSuccess={(c) => { setMasters(m => ({ ...m, consignees: [c, ...m.consignees] })); setValue('consigneeId', c.id!); setIsConsigneeModalOpen(false); }} onCancel={() => setIsConsigneeModalOpen(false)} />
    </Modal>

    <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Quick Add Vehicle" size="lg">
      <VehicleForm onSuccess={(v) => { setMasters(m => ({ ...m, vehicles: [v, ...m.vehicles] })); setValue('vehicleId', v.id!); setIsVehicleModalOpen(false); }} onCancel={() => setIsVehicleModalOpen(false)} />
    </Modal>
    </>
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
