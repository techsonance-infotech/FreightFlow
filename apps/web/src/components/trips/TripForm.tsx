'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TripSchema, type Trip } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  Truck, User, MapPin, Calendar, Clock, 
  Plus, Trash2, Save, ArrowLeft, Package,
  Calculator, Wallet, Search, X, CheckSquare, Square,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn, formatWeight } from '@/lib/utils';

export const TripForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState({
    vehicles: [],
    drivers: [],
    unassignedOrders: [],
    unassignedPallets: [],
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(TripSchema),
    defaultValues: {
      status: 'created',
      advanceAmount: 0,
      orderIds: [],
      palletIds: [],
    },
  });

  const watchedOrderIds = watch('orderIds') || [];
  const watchedPalletIds = watch('palletIds') || [];

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [vehicles, drivers, orders, pallets] = await Promise.all([
          fetch('/api/v1/masters/vehicles?limit=5000').then(r => r.json()),
          fetch('/api/v1/masters/drivers?limit=5000').then(r => r.json()),
          fetch('/api/v1/orders?limit=5000&unassigned=true').then(r => r.json()), 
          fetch('/api/v1/pallets?limit=5000&unassigned=true&type=OUTWARD').then(r => r.json()),
        ]);
        
        setMasters({
          vehicles: vehicles.data || [],
          drivers: drivers.data || [],
          unassignedOrders: orders.data || [],
          unassignedPallets: pallets.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch masters', error);
      }
    };
    fetchMasters();
  }, []);

  const onSubmit = async (data: Trip) => {
    try {
      setLoading(true);
      const response = await fetch('/api/v1/trips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to dispatch trip');
      }

      toast.success('Trip dispatched successfully!');
      router.push('/dashboard/trips');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleCargo = (id: string, type: 'LR' | 'PL') => {
    if (type === 'LR') {
      const current = [...watchedOrderIds];
      const index = current.indexOf(id);
      if (index > -1) current.splice(index, 1);
      else current.push(id);
      setValue('orderIds', current);
    } else {
      const current = [...watchedPalletIds];
      const index = current.indexOf(id);
      if (index > -1) current.splice(index, 1);
      else current.push(id);
      setValue('palletIds', current);
    }
  };

  // Unified Cargo Assignment: search + type filter + pagination
  const [cargoSearch, setCargoSearch] = useState('');
  const [cargoTypeFilter, setCargoTypeFilter] = useState<'ALL' | 'LR' | 'PL'>('ALL');
  const [cargoPage, setCargoPage] = useState(1);
  const CARGO_PAGE_SIZE = 15;

  const unifiedCargo = useMemo(() => {
    const lrs = masters.unassignedOrders.map((o: any) => ({
      ...o,
      cargoType: 'LR' as const,
      displayId: o.lrNo,
      origin: o.fromLocation,
      destination: o.toLocation,
      consigneeName: o.consignee?.name || 'N/A',
      weight: Number(o.totalWeight || 0),
    }));

    const pls = masters.unassignedPallets.map((p: any) => ({
      ...p,
      cargoType: 'PL' as const,
      displayId: p.lrNo || p.id.slice(0, 8).toUpperCase(),
      origin: p.fromLocation || 'N/A',
      destination: p.toLocation || 'N/A',
      consigneeName: p.consignee?.name || p.companyName || 'N/A',
      weight: Number(p.totalWeight || 0),
    }));

    let combined = [...lrs, ...pls];

    // Apply Type Filter
    if (cargoTypeFilter !== 'ALL') {
      combined = combined.filter(c => c.cargoType === cargoTypeFilter);
    }

    // Apply Search Filter
    if (cargoSearch.trim()) {
      const q = cargoSearch.toLowerCase();
      combined = combined.filter(c => 
        String(c.displayId).toLowerCase().includes(q) ||
        c.origin?.toLowerCase().includes(q) ||
        c.destination?.toLowerCase().includes(q) ||
        c.consigneeName?.toLowerCase().includes(q)
      );
    }

    return combined;
  }, [masters.unassignedOrders, masters.unassignedPallets, cargoSearch, cargoTypeFilter]);

  const cargoTotalPages = Math.max(1, Math.ceil(unifiedCargo.length / CARGO_PAGE_SIZE));
  const paginatedCargo = useMemo(() => {
    const start = (cargoPage - 1) * CARGO_PAGE_SIZE;
    return unifiedCargo.slice(start, start + CARGO_PAGE_SIZE);
  }, [unifiedCargo, cargoPage]);

  // Reset page when filters change
  useEffect(() => { setCargoPage(1); }, [cargoSearch, cargoTypeFilter]);

  const toggleSelectAllVisible = () => {
    const visibleItems = paginatedCargo;
    const allVisibleSelected = visibleItems.every(item => 
      item.cargoType === 'LR' ? watchedOrderIds.includes(item.id) : watchedPalletIds.includes(item.id)
    );

    if (allVisibleSelected) {
      // Deselect visible
      const newOrderIds = watchedOrderIds.filter((id: string) => !visibleItems.some(i => i.cargoType === 'LR' && i.id === id));
      const newPalletIds = watchedPalletIds.filter((id: string) => !visibleItems.some(i => i.cargoType === 'PL' && i.id === id));
      setValue('orderIds', newOrderIds);
      setValue('palletIds', newPalletIds);
    } else {
      // Select visible
      const visibleOrderIds = visibleItems.filter(i => i.cargoType === 'LR').map(i => i.id);
      const visiblePalletIds = visibleItems.filter(i => i.cargoType === 'PL').map(i => i.id);
      setValue('orderIds', [...new Set([...watchedOrderIds, ...visibleOrderIds])]);
      setValue('palletIds', [...new Set([...watchedPalletIds, ...visiblePalletIds])]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-white/80 p-4 backdrop-blur-md border-b border-slate-100">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">New Trip Dispatch</h1>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Fleet Mission Configuration</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black shadow-xl shadow-blue-600/20 text-xs uppercase tracking-widest disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Dispatching...' : 'Confirm & Dispatch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 max-w-7xl mx-auto">
        <div className="lg:col-span-2 space-y-8">
          {/* Mission Details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-8 border-b border-slate-50 pb-6">
              <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Truck className="h-6 w-6" /></div>
              <div>
                <h2 className="font-black text-slate-900 uppercase tracking-tight">Mission Logistics</h2>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Route and Fleet Assignment</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle Fleet No</label>
                <div className="relative">
                  <Truck className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select {...register('vehicleId')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                    <option value="">Select Vehicle</option>
                    {masters.vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>)}
                  </select>
                </div>
                {errors.vehicleId && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.vehicleId as any).message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Captain</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select {...register('driverId')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                    <option value="">Select Driver</option>
                    {masters.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.employee?.name || d.name} ({d.employee?.empCode || d.empId || 'N/A'})</option>)}
                  </select>
                </div>
                {errors.driverId && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.driverId as any).message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Co-Captain (Optional)</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <select {...register('coDriverId')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                    <option value="">Select Co-Driver</option>
                    {masters.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.employee?.name || d.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure Schedule</label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input type="datetime-local" {...register('departureAt')} className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin Terminal</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input {...register('fromLocation')} placeholder="Terminal A / City" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
                </div>
                {errors.fromLocation && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.fromLocation as any).message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Terminal</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                  <input {...register('toLocation')} placeholder="Terminal B / Destination" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
                </div>
                {errors.toLocation && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.toLocation as any).message}</p>}
              </div>
            </div>
          </div>

          {/* LR Assignment */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 bg-slate-50/50 border-b border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20"><Package className="h-5 w-5" /></div>
                  <div>
                    <h2 className="font-black text-slate-900 uppercase tracking-tight">Cargo Assignment</h2>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assign Lorry Receipts & Pallets to this Trip</p>
                    {errors.orderIds && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">{(errors.orderIds as any).message}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">
                    {watchedOrderIds.length + watchedPalletIds.length} Selected
                  </div>
                </div>
              </div>

              {/* Type Filter */}
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 w-fit">
                {(['ALL', 'LR', 'PL'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setCargoTypeFilter(type)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      cargoTypeFilter === type 
                        ? 'bg-slate-900 text-white shadow-lg' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'ALL' ? 'All Cargo' : type === 'LR' ? 'Lorry Receipts' : 'Pallets'}
                  </button>
                ))}
              </div>

              {/* Search & Actions Bar */}
              <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={cargoSearch}
                    onChange={(e) => setCargoSearch(e.target.value)}
                    placeholder={`Search ${cargoTypeFilter === 'ALL' ? 'Cargo' : cargoTypeFilter === 'LR' ? 'LRs' : 'Pallets'} by number, location...`}
                    className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 outline-none transition-all"
                  />
                  {cargoSearch && (
                    <button onClick={() => setCargoSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAllVisible}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all whitespace-nowrap"
                >
                  {paginatedCargo.length > 0 && paginatedCargo.every(item => 
                    item.cargoType === 'LR' ? watchedOrderIds.includes(item.id) : watchedPalletIds.includes(item.id)
                  ) ? (
                    <><CheckSquare className="h-4 w-4 text-blue-600" /> Deselect Visible</>
                  ) : (
                    <><Square className="h-4 w-4 text-slate-400" /> Select Visible</>
                  )}
                </button>
              </div>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto border border-slate-100 rounded-xl bg-white shadow-inner">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px] w-12">Select</th>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px] w-20">Type</th>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px]">Cargo ID</th>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px]">Consignee</th>
                    <th className="px-6 py-3 text-right font-black uppercase text-[9px]">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {paginatedCargo.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold italic">
                        {unifiedCargo.length === 0 
                          ? "No unassigned cargo available for dispatch" 
                          : "No items match your search criteria"}
                      </td>
                    </tr>
                  ) : (
                    paginatedCargo.map((item: any) => {
                      const isSelected = item.cargoType === 'LR' 
                        ? watchedOrderIds.includes(item.id) 
                        : watchedPalletIds.includes(item.id);
                      
                      return (
                        <tr 
                          key={`${item.cargoType}-${item.id}`} 
                          className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/50' : ''}`}
                          onClick={() => toggleCargo(item.id, item.cargoType)}
                        >
                          <td className="px-6 py-4">
                            <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-white'}`}>
                              {isSelected && <div className="w-2 h-2 bg-white rounded-sm" />}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest ${
                              item.cargoType === 'LR' ? 'bg-amber-100 text-amber-700' : 'bg-purple-100 text-purple-700'
                            }`}>
                              {item.cargoType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-black text-slate-900">{item.cargoType} #{item.displayId}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{item.origin} → {item.destination}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-700 text-xs">{item.consigneeName}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-slate-900">{item.weight} KG</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {cargoTotalPages > 1 && (
              <div className="p-4 border-t border-slate-100 bg-slate-50/80 backdrop-blur-sm flex items-center justify-between rounded-b-3xl">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Showing {(cargoPage - 1) * CARGO_PAGE_SIZE + 1} - {Math.min(cargoPage * CARGO_PAGE_SIZE, unifiedCargo.length)} of {unifiedCargo.length} Manifests
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCargoPage(p => Math.max(1, p - 1))}
                    disabled={cargoPage === 1}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
                  >
                    <ChevronLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Prev</span>
                  </button>
                  
                  <div className="flex gap-1">
                    {[...Array(cargoTotalPages)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCargoPage(i + 1)}
                        className={cn(
                          "h-10 w-10 rounded-xl text-[10px] font-black transition-all",
                          cargoPage === i + 1 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "bg-white border border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-600"
                        )}
                      >
                        {i + 1}
                      </button>
                    )).slice(Math.max(0, cargoPage - 3), Math.min(cargoTotalPages, cargoPage + 2))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setCargoPage(p => Math.min(cargoTotalPages, p + 1))}
                    disabled={cargoPage === cargoTotalPages}
                    className="h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center gap-2 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">Next</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Financial Sidebar */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/40 relative overflow-hidden sticky top-24">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
                <div className="p-2 bg-blue-600 rounded-xl"><Calculator className="h-6 w-6" /></div>
                <div>
                  <h2 className="font-black uppercase tracking-tight">Mission Budget</h2>
                  <p className="text-[9px] text-blue-200/50 font-black uppercase tracking-widest text-left">Advance & Recovery</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest">Initial Advance (₹)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-3.5 h-4 w-4 text-blue-400" />
                    <input 
                      type="number" 
                      {...register('advanceAmount', { valueAsNumber: true })} 
                      className="w-full pl-11 pr-4 py-3.5 bg-white/5 border-none rounded-2xl text-lg font-black text-white focus:ring-2 focus:ring-blue-500/50"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-[9px] text-blue-200/30 font-bold text-right italic">Advance recorded in Paise internally</p>
                </div>

                <div className="bg-white/5 rounded-3xl p-6 space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-200/60 uppercase tracking-wider">Assigned Cargo</span>
                    <span className="font-black text-blue-400">{watchedOrderIds.length + watchedPalletIds.length} ({watchedOrderIds.length} LR, {watchedPalletIds.length} PL)</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-200/60 uppercase tracking-wider">Total Payload</span>
                    <span className="font-black text-blue-400">
                      {formatWeight(
                        masters.unassignedOrders
                          .filter((o: any) => watchedOrderIds.includes(o.id))
                          .reduce((sum, o: any) => sum + Number(o.totalWeight || 0), 0) +
                        masters.unassignedPallets
                          .filter((p: any) => watchedPalletIds.includes(p.id))
                          .reduce((sum, p: any) => sum + Number(p.totalWeight || 0), 0)
                      )} KG
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <div>
                         <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-1">Estimated Revenue</p>
                        <h3 className="text-2xl font-black text-blue-400">
                          ₹ {(
                            (masters.unassignedOrders
                              .filter((o: any) => watchedOrderIds.includes(o.id))
                              .reduce((sum, o: any) => sum + Number(o.totalAmount || 0), 0) +
                            masters.unassignedPallets
                              .filter((p: any) => watchedPalletIds.includes(p.id))
                              .reduce((sum, p: any) => sum + Number(p.totalAmount || 0), 0)) / 100
                          ).toLocaleString('en-IN')}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-start gap-3 p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                    <Clock className="h-5 w-5 text-blue-400 shrink-0" />
                    <p className="text-[10px] text-blue-100/70 leading-relaxed font-medium">
                      Trip will be marked as <span className="text-blue-400 font-black">LOADED</span> once LRs are scanned at the terminal. Initial advance will be debited from Driver's ledger immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Background pattern */}
            <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl" />
          </div>
        </div>
      </div>
    </form>
  );
};
