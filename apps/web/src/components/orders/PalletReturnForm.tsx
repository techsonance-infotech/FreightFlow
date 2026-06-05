'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PalletSchema, type Pallet } from '@freightflow/shared';
import { 
  Plus, Trash2, Save, Truck, User, Building2, 
  Hash, Calendar, Calculator,
  Package, Box, MapPin, Navigation, Search,
  ShieldCheck, AlertCircle, TrendingUp, FileText, Zap,
  Users, CheckCircle2, Lightbulb, Info
} from 'lucide-react';
import { cn, fetchOnlineDate } from '@/lib/utils';
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

interface PalletReturnFormProps {
  initialData?: any;
  onSuccess: (data: any) => void;
  onCancel: () => void;
}

function formatLocalDate(dateVal: any): string {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return '';
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.format(d).split('/'); // MM/DD/YYYY
    return `${parts[2]}-${parts[0]}-${parts[1]}`; // YYYY-MM-DD
  } catch (e) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

export function PalletReturnForm({ initialData, onSuccess, onCancel }: PalletReturnFormProps) {
  const [dealers, setDealers] = useState<any[]>([]);
  const [consignees, setConsignees] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [palletMasters, setPalletMasters] = useState<any[]>([]);
  const [loadingMasters, setLoadingMasters] = useState(true);
  const [isDealerModalOpen, setIsDealerModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
  const [isConsigneeModalOpen, setIsConsigneeModalOpen] = useState(false);
  const [successPallet, setSuccessPallet] = useState<any>(null);
  
  const [dealerSearch, setDealerSearch] = useState('');
  const [palletDealerSearch, setPalletDealerSearch] = useState('');
  const [selectedDealerId, setSelectedDealerId] = useState<string>('');
  const [selectedPalletDealerId, setSelectedPalletDealerId] = useState<string>('');
  const [vehicleSearch, setVehicleSearch] = useState('');
  const isFirstMountRef = useRef(true);

  useEffect(() => {
    isFirstMountRef.current = false;
  }, []);

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
      date: initialData?.date ? formatLocalDate(initialData.date) : '',
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
      type: 'RETURN',
      palletDetails: initialData?.palletDetails?.length > 0 
        ? initialData.palletDetails.map((p: any) => ({
            ...p,
            rate: p.rate / 100 
          }))
        : [{ palletDisplayId: '', qty: 1, rate: 0, consigneeName: '' }],
      isGstRequired: initialData?.isGstRequired ?? (
        (initialData?.cgstAmount && initialData.cgstAmount > 0) ||
        (initialData?.sgstAmount && initialData.sgstAmount > 0) ||
        (initialData?.igstAmount && initialData.igstAmount > 0) ||
        (initialData?.cgstPct && Number(initialData.cgstPct) > 0) ||
        (initialData?.sgstPct && Number(initialData.sgstPct) > 0) ||
        (initialData?.igstPct && Number(initialData.igstPct) > 0)
      ) ?? false,
    }
  });

  const { fields: palletFields, append: appendPallet, remove: removePallet } = useFieldArray({ control, name: 'palletDetails' });
  
  const watchedPallets = useWatch({
    control,
    name: 'palletDetails'
  }) || [];

  const watchedDealerId = useWatch({ control, name: 'dealerId' });
  const watchedVehicleId = useWatch({ control, name: 'vehicleId' });
  const watchedGstType = useWatch({ control, name: 'gstType' });
  const watchedCgstPct = useWatch({ control, name: 'cgstPct' }) || 0;
  const watchedSgstPct = useWatch({ control, name: 'sgstPct' }) || 0;
  const watchedIgstPct = useWatch({ control, name: 'igstPct' }) || 0;
  const watchedIsGstRequired = useWatch({ control, name: 'isGstRequired' });
  const watchedDate = useWatch({ control, name: 'date' });

  const [totals, setTotals] = useState({
    totalQty: 0,
    totalReturns: 0,
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
        const [dealersRes, consigneesRes, vehiclesRes, palletMastersRes] = await Promise.all([
          fetch('/api/v1/masters/dealers?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/consignees?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/vehicles?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/pallets?limit=100').then(r => r.json()),
        ]);
        const loadedDealers = dealersRes.data || [];
        setDealers(loadedDealers);
        setConsignees(consigneesRes.data || []);
        setVehicles(vehiclesRes.data || []);
        setPalletMasters(palletMastersRes.data || []);

        if (initialData?.dealerId) {
          const match = loadedDealers.find((d: any) => d.id === initialData.dealerId);
          const meta = initialData.metadata as any;
          if (meta?.palletReturnDealerId) {
            setSelectedDealerId(initialData.dealerId);
            setDealerSearch(match?.name || '');
            
            const rMatch = loadedDealers.find((d: any) => d.id === meta.palletReturnDealerId);
            setSelectedPalletDealerId(meta.palletReturnDealerId);
            setPalletDealerSearch(rMatch?.name || '');
          } else {
            // Legacy fallback
            if (match?.isPalletReturn) {
              setSelectedPalletDealerId(initialData.dealerId);
              setPalletDealerSearch(match.name);
            } else {
              setSelectedDealerId(initialData.dealerId);
              setDealerSearch(match?.name || '');
            }
          }
        }
      } catch (error) {
        console.error('Failed to load masters');
      } finally {
        setLoadingMasters(false);
      }
    }
    loadMasters();
  }, []);

  useEffect(() => {
    if (!initialData?.id) {
      fetchOnlineDate().then((onlineDate) => {
        if (onlineDate) {
          setValue('date', onlineDate);
        }
      });
    }
  }, [initialData, setValue]);

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

  useEffect(() => {
    if (!selectedPalletDealerId) return;
    const initialPalletDealerId = (initialData?.metadata as any)?.palletReturnDealerId || initialData?.dealerId || '';
    const isDealerChanged = !initialData?.id || selectedPalletDealerId !== initialPalletDealerId;
    if (!isDealerChanged) return;
    const dealer = dealers.find(d => d.id === selectedPalletDealerId);
    if (dealer && dealer.isPalletReturn === true) {
      if (dealer.address) {
        setValue('fromAddress', dealer.address, { shouldDirty: true });
        setValue('toAddress', dealer.address, { shouldDirty: true });
      }
      const dealerLocation = dealer.area || (dealer as any).location || '';
      if (dealerLocation) {
        setValue('fromLocation', dealerLocation, { shouldDirty: true });
        setValue('toLocation', dealerLocation, { shouldDirty: true });
      }
    }
  }, [selectedPalletDealerId, dealers, initialData?.id, initialData?.metadata, initialData?.dealerId]);

  // Calculation Logic
  useEffect(() => {
    const totalQty = watchedPallets.reduce((acc: number, curr: any) => acc + (parseInt(curr.qty as any) || 0), 0);
    const totalReturns = watchedPallets.length;
    
    // Total value calculated directly from the payload table
    const subtotal = watchedPallets.reduce((acc: number, curr: any) => {
      const q = parseInt(curr.qty as any) || 0;
      const r = parseFloat(curr.rate as any) || 0;
      return acc + (q * r);
    }, 0);

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
      totalReturns,
      baseFreight: subtotal,
      subtotal,
      cgstAmount: cgst,
      sgstAmount: sgst,
      igstAmount: igst,
      totalAmount,
      margin: subtotal
    });
  }, [watchedPallets, watchedGstType, watchedCgstPct, watchedSgstPct, watchedIgstPct, watchedIsGstRequired]);

  const onSubmit = async (data: Pallet) => {
    try {
      const finalDealerId = selectedDealerId || data.dealerId;
      const returnDealer = dealers.find(d => d.id === selectedPalletDealerId);
      const payload = {
        ...data,
        dealerId: finalDealerId,
        companyName: returnDealer?.name || data.companyName || '',
        toAddress: returnDealer?.address || data.toAddress || '',
        toLocation: returnDealer?.area || (returnDealer as any)?.location || data.toLocation || '',
        metadata: {
          palletReturnDealerId: selectedPalletDealerId || '',
          palletReturnDealerName: returnDealer?.name || '',
          palletReturnDealerAddress: returnDealer?.address || '',
          palletReturnDealerGstin: returnDealer?.gstin || '',
          palletReturnDealerPan: returnDealer?.pan || '',
          palletReturnDealerCode: returnDealer?.code || '',
        },
        freight: Math.round(parseFloat((data.freight || 0) as any) * 100),
        hamali: Math.round(parseFloat((data.hamali || 0) as any) * 100),
        rate: Math.round(parseFloat((data.rate || 0) as any) * 100),
        subtotal: Math.round(totals.subtotal * 100),
        cgstAmount: Math.round(totals.cgstAmount * 100),
        sgstAmount: Math.round(totals.sgstAmount * 100),
        igstAmount: Math.round(totals.igstAmount * 100),
        totalAmount: Math.round(totals.totalAmount * 100),
        totalWeight: 0,
        totalBoxes: totals.totalQty,
        totalQty: totals.totalQty,
        type: 'RETURN',
        palletDetails: (data as any).palletDetails.map((p: any) => ({
          ...p,
          qty: parseInt(p.qty as any) || 0,
          rate: p.rate ? Math.round(parseFloat(p.rate as any) * 100) : 0,
        })),
        consigneeDetails: [] // Optional since we are using palletDetails
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
        toast.success(initialData?.id ? 'Palletized return updated' : 'Palletized Return Registered Successfully');
        if (!initialData?.id) {
          setSuccessPallet(result.data || result);
        } else {
          onSuccess(result);
        }
      } else {
        const err = await response.json();
        toast.error(err.error || 'Failed to establish pallet return');
      }
    } catch {
      toast.error('A communication error occurred');
    }
  };

  if (loadingMasters) {
    return (
      <div className="space-y-10 animate-pulse">
        {/* Banner Skeleton */}
        <div className="bg-slate-100 rounded-[2.5rem] p-10 h-44 flex flex-col justify-end space-y-4">
          <div className="h-4 w-40 bg-slate-200 rounded-lg animate-pulse" />
          <div className="h-8 w-80 bg-slate-200 rounded-lg animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6">
              <div className="flex gap-4 items-center">
                <div className="h-10 w-10 bg-slate-100 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
                  <div className="h-3 w-48 bg-slate-100 rounded-lg animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
              </div>
            </div>
            
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 space-y-6">
              <div className="flex justify-between items-center">
                <div className="h-6 w-40 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-12 w-32 bg-slate-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-48 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 space-y-6">
              <div className="h-6 w-32 bg-slate-100 rounded-lg animate-pulse" />
              <div className="space-y-4">
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
                <div className="h-16 bg-slate-50/50 border border-slate-100 rounded-2xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[500px]">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10 animate-in fade-in duration-700">
      
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
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Reverse Logistics Hub</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">{initialData?.id ? 'Edit Pallet Return' : 'Register Pallet Return'}</h1>
          <p className="text-blue-100 font-bold mt-2 opacity-80 uppercase tracking-widest text-[10px]">Collect delivered pallets from consignees to hub</p>
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
                  <div className="flex-1 relative group/field">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search Dealer..."
                        autoComplete="off"
                        value={dealers.find(d => d.id === selectedDealerId)?.name || dealerSearch}
                        onChange={(e) => {
                          setDealerSearch(e.target.value);
                          if (!e.target.value) {
                            setSelectedDealerId('');
                            setValue('dealerId', '');
                          }
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {dealers
                          .filter(d => !dealerSearch || d.name.toLowerCase().includes(dealerSearch.toLowerCase()))
                          .map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedDealerId(d.id);
                                setValue('dealerId', d.id, { shouldValidate: true });
                                setDealerSearch(d.name);
                                if (d.code) {
                                  setValue('partyCode', d.code, { shouldDirty: true });
                                }
                                (document.activeElement as HTMLElement)?.blur();
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

              <FormInputWrapper label="Dealer Pallet Return (Address Auto-Populate)" error={errors.dealerId?.message}>
                <div className="flex gap-2">
                  <div className="flex-1 relative group/field">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                        <User className="h-4 w-4" />
                      </div>
                      <input 
                        type="text"
                        placeholder="Search Pallet Return Dealer..."
                        autoComplete="off"
                        value={dealers.find(d => d.id === selectedPalletDealerId)?.name || palletDealerSearch}
                        onChange={(e) => {
                          setPalletDealerSearch(e.target.value);
                          if (!e.target.value) {
                            setSelectedPalletDealerId('');
                          }
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {dealers
                          .filter(d => d.isPalletReturn === true)
                          .filter(d => !palletDealerSearch || d.name.toLowerCase().includes(palletDealerSearch.toLowerCase()))
                          .map(d => (
                            <button
                              key={d.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedPalletDealerId(d.id);
                                setPalletDealerSearch(d.name);
                                if (d.address) {
                                  setValue('fromAddress', d.address, { shouldDirty: true });
                                  setValue('toAddress', d.address, { shouldDirty: true });
                                }
                                const dealerLocation = d.area || (d as any).location || '';
                                if (dealerLocation) {
                                  setValue('fromLocation', dealerLocation, { shouldDirty: true });
                                  setValue('toLocation', dealerLocation, { shouldDirty: true });
                                }
                                (document.activeElement as HTMLElement)?.blur();
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{d.name}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{d.location || 'Pallet Return Dealer'}</p>
                              </div>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </FormInputWrapper>

              <FormInputWrapper label="Vehicle Allocation *" error={errors.vehicleId?.message}>
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
                        value={vehicles.find(v => v.id === watch('vehicleId'))?.regNo || vehicleSearch}
                        onChange={(e) => {
                          setVehicleSearch(e.target.value);
                          if (!e.target.value) setValue('vehicleId', '');
                        }}
                        className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none"
                      />
                    </div>
                    
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-y-auto opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] scrollbar-thin scrollbar-thumb-slate-200">
                      <div className="p-2 space-y-1">
                        {vehicles
                          .filter(v => !vehicleSearch || (v.regNo || v.plateNumber || '').toLowerCase().includes(vehicleSearch.toLowerCase()))
                          .map(v => (
                            <button
                              key={v.id}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setValue('vehicleId', v.id, { shouldValidate: true });
                                setVehicleSearch(v.regNo || v.plateNumber);
                                (document.activeElement as HTMLElement)?.blur();
                              }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                            >
                              <div>
                                <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{v.regNo || v.plateNumber}</p>
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
                        <button type="button" onClick={() => setValue('gstType', 'inter')} className={cn("px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all", watchedGstType === 'inter' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-500 hover:text-slate-300')}>Inter</button>
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
                          />
                        </div>
                        <div className="space-y-1.5">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SGST %</p>
                          <input 
                            type="number" 
                            step="0.1" 
                            {...register('sgstPct', { valueAsNumber: true })} 
                            className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 outline-none" 
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
                          className="w-full h-10 px-4 bg-slate-800/50 border border-slate-700 rounded-xl text-xs font-bold text-blue-400 outline-none" 
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
                        <span className="text-xs font-bold text-blue-400">+ ₹{totals.igstAmount.toFixed(2)}</span>
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
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Expected Net Return Value</h4>
              <p className="text-3xl font-black tracking-tighter mb-4">₹{totals.margin.toFixed(2)}</p>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white w-2/3" />
              </div>
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
                { label: 'Dealer Identity Confirmed', status: !!watchedDealerId },
                { label: 'Financials Synchronized', status: totals.totalAmount > 0 },
                { 
                  label: 'Inventory Rows Validated', 
                  status: watchedPallets.length > 0 && watchedPallets.every((p: any) => p.palletDisplayId?.trim() !== '' && p.consigneeName?.trim() !== '' && (parseInt(p.qty) > 0)) 
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
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Return Payload</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Multi-tenant pallet inventory collection</p>
                </div>
              </div>
              <Button 
                type="button" 
                onClick={() => appendPallet({ palletDisplayId: '', code: '', qty: 1, rate: 0, consigneeName: '' } as any)}
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
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-[350px]">Consignee Identification *</th>
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-[280px]">Pallet Specification *</th>
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-[120px]">Code</th>
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-24 text-center">Qty *</th>
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-36 text-center">Unit Rate *</th>
                    <th className="px-4 py-6 text-[10px] font-black uppercase tracking-widest w-36 text-right">Total Amount *</th>
                    <th className="px-8 py-6 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {palletFields.map((field, index) => {
                    const rowQty = Number(watchedPallets[index]?.qty) || 0;
                    const rowRate = Number(watchedPallets[index]?.rate) || 0;
                    const rowTotal = (rowQty * rowRate).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                    return (
                      <tr key={field.id} className="group hover:bg-blue-50/10 transition-all duration-300">
                        <td className="px-8 py-8 align-top">
                          <span className="text-sm font-black text-slate-200 group-hover:text-blue-500 transition-colors">#{index + 1}</span>
                        </td>
                        <td className="px-4 py-8 align-top">
                          <div className="flex gap-2">
                            <div className="flex-1 relative group/field">
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                                  <User className="h-4 w-4" />
                                </div>
                                <input 
                                  {...register(`palletDetails.${index}.consigneeName` as any)} 
                                  autoComplete="off"
                                  placeholder="Search Consignee..." 
                                  className="w-full h-12 pl-14 pr-4 bg-slate-50/50 border border-slate-100 rounded-xl font-bold text-slate-700 focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-50/50 transition-all placeholder:text-slate-300 text-sm outline-none" 
                                />
                              </div>
                              
                              <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden opacity-0 invisible group-focus-within/field:opacity-100 group-focus-within/field:visible transition-all max-h-[250px] overflow-y-auto">
                                <div className="p-2 space-y-1">
                                  {consignees.length > 0 ? (
                                    consignees
                                      .filter(c => {
                                        const inputVal = watch(`palletDetails.${index}.consigneeName`);
                                        const matchesSearch = !inputVal || c.name.toLowerCase().includes(inputVal.toLowerCase());
                                        const matchesDealer = !watchedDealerId || 
                                          (c.dealers && c.dealers.some((d: any) => d.id === watchedDealerId));
                                        return matchesSearch && matchesDealer;
                                      })
                                      .map(c => (
                                        <button
                                          key={c.id}
                                          type="button"
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setValue(`palletDetails.${index}.consigneeName` as any, c.name, { shouldDirty: true });
                                            (document.activeElement as HTMLElement)?.blur();
                                          }}
                                          className="w-full text-left px-4 py-3 rounded-xl hover:bg-blue-50 flex items-center justify-between group/item transition-colors"
                                        >
                                          <div>
                                            <p className="text-sm font-bold text-slate-700 group-hover/item:text-blue-600">{c.name}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{c.location || 'Active Consignee'}</p>
                                          </div>
                                        </button>
                                      ))
                                  ) : (
                                    <div className="p-4 text-center">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No Consignees Found</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button 
                              type="button" 
                              onClick={() => setIsConsigneeModalOpen(true)} 
                              className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-sm"
                            >
                              <Plus className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-8 align-top">
                          <div className="flex gap-2">
                            <div className="flex-1 relative group/field">
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-focus-within/field:bg-blue-50 group-focus-within/field:text-blue-500 transition-all">
                                  <Search className="h-4 w-4" />
                                </div>
                                <input 
                                  {...register(`palletDetails.${index}.palletDisplayId` as any)} 
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
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            setValue(`palletDetails.${index}.palletDisplayId` as any, p.palletId, { shouldDirty: true });
                                            if (p.code) {
                                              setValue(`palletDetails.${index}.code` as any, p.code, { shouldDirty: true });
                                            }
                                            (document.activeElement as HTMLElement)?.blur();
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
                              {...register(`palletDetails.${index}.code` as any)} 
                              readOnly
                              placeholder="-"
                              className="w-full bg-transparent border-none font-bold text-slate-500 text-sm focus:ring-0 outline-none" 
                            />
                          </div>
                        </td>
                        <td className="px-4 py-8 align-top">
                          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-2">
                            <input 
                              type="number" 
                              {...register(`palletDetails.${index}.qty` as any, { valueAsNumber: true })} 
                              className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                              min="0"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-8 align-top">
                          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner h-12 flex items-center px-4">
                            <span className="text-xs font-black text-slate-400 mr-2">₹</span>
                            <input 
                              type="number" 
                              step="0.01"
                              {...register(`palletDetails.${index}.rate` as any, { valueAsNumber: true })} 
                              className="w-full bg-transparent border-none font-black text-slate-900 text-center focus:ring-0 text-base outline-none" 
                              min="0"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-8 align-top text-right">
                          <div className="h-12 flex items-center justify-end pr-4">
                            <span className="text-base font-black text-slate-800 tracking-tight">₹{rowTotal}</span>
                          </div>
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
                    );
                  })}
                </tbody>
              </table>
              <div className="p-10 bg-slate-50/30 flex justify-between items-center rounded-b-[2.5rem]">
                <div className="flex gap-20">
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Return Items</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900 tracking-tighter">{totals.totalReturns}</span>
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Batches</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Pallet Quantity</p>
                    <p className="text-4xl font-black text-slate-900 tracking-tighter">
                      {totals.totalQty} <span className="text-sm text-slate-400 font-bold ml-1 uppercase">Units</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</p>
                    <p className="text-4xl font-black text-blue-600 tracking-tighter">
                      ₹{totals.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
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
              className="h-16 px-12 bg-blue-600 text-white rounded-3xl font-black text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-600/20 hover:bg-blue-700 hover:scale-[1.02] transition-all disabled:opacity-50 flex items-center justify-center gap-3 min-w-[240px]"
            >
              {isSubmitting ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
              {isSubmitting ? 'REGISTERING RETURN...' : 'PUBLISH RETURN'}
            </Button>
          </div>
        </div>
      </div>

      <Modal isOpen={isPalletModalOpen} onClose={() => setIsPalletModalOpen(false)} title="Register New Pallet" size="lg">
        <PalletMasterForm onSuccess={(p) => { setPalletMasters(prev => [p, ...prev]); setIsPalletModalOpen(false); }} onCancel={() => setIsPalletModalOpen(false)} />
      </Modal>

      <Modal isOpen={isDealerModalOpen} onClose={() => setIsDealerModalOpen(false)} title="Quick Add Dealer" size="lg">
        <DealerForm onSuccess={(d) => { setDealers(prev => [d, ...prev]); setValue('dealerId', d.id!); setIsDealerModalOpen(false); }} onCancel={() => setIsDealerModalOpen(false)} />
      </Modal>


      <Modal isOpen={!!successPallet} onClose={() => onSuccess(successPallet)} title="" size="md">
        <div className="p-8 text-center space-y-8">
          <div className="flex justify-center">
            <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
          </div>
          
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">Return Registered</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Return Record #{successPallet?.lrNo} has been synchronized.
            </p>
          </div>

          <Button 
            onClick={() => onSuccess(successPallet)}
            className="w-full h-16 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest text-[11px]"
          >
            Back to Overview
          </Button>
        </div>
      </Modal>

      <Modal isOpen={isVehicleModalOpen} onClose={() => setIsVehicleModalOpen(false)} title="Quick Add Vehicle" size="lg">
        <VehicleForm onSuccess={(v) => { setVehicles(prev => [v, ...prev]); setValue('vehicleId', v.id!); setIsVehicleModalOpen(false); }} onCancel={() => setIsVehicleModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConsigneeModalOpen} onClose={() => setIsConsigneeModalOpen(false)} title="Quick Add Consignee" size="lg">
        <ConsigneeForm defaultDealerId={watchedDealerId} onSuccess={(c) => { setConsignees(prev => [c, ...prev]); setIsConsigneeModalOpen(false); }} onCancel={() => setIsConsigneeModalOpen(false)} />
      </Modal>

    </form>
    </div>
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
