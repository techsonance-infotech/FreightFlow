'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TripSchema, type Trip } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  Truck, User, MapPin, Calendar, Clock, 
  Plus, Trash2, Save, ArrowLeft, Package,
  Calculator, Wallet
} from 'lucide-react';

export const TripForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [masters, setMasters] = useState({
    vehicles: [],
    drivers: [],
    unassignedOrders: [],
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
    },
  });

  const watchedOrderIds = watch('orderIds') || [];

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [vehicles, drivers, orders] = await Promise.all([
          fetch('/api/v1/masters/vehicles?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/drivers?limit=100').then(r => r.json()),
          fetch('/api/v1/orders?limit=100&status=created').then(r => r.json()), // Unassigned orders are those in 'created' status and not linked to trip
        ]);
        
        setMasters({
          vehicles: vehicles.data || [],
          drivers: drivers.data || [],
          unassignedOrders: orders.data || [],
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

  const toggleOrder = (orderId: string) => {
    const current = [...watchedOrderIds];
    const index = current.indexOf(orderId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(orderId);
    }
    setValue('orderIds', current);
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
                    {masters.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name} ({d.empId})</option>)}
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
                    {masters.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
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
          <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-8 bg-slate-50/50 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-600/20"><Package className="h-5 w-5" /></div>
                <div>
                  <h2 className="font-black text-slate-900 uppercase tracking-tight">Cargo Assignment</h2>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Assign Lorry Receipts to this Trip</p>
                </div>
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px] w-12">Select</th>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px]">LR Details</th>
                    <th className="px-6 py-3 text-left font-black uppercase text-[9px]">Consignee</th>
                    <th className="px-6 py-3 text-right font-black uppercase text-[9px]">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {masters.unassignedOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-bold italic">No unassigned LRs available for dispatch</td>
                    </tr>
                  ) : (
                    masters.unassignedOrders.map((order: any) => (
                      <tr 
                        key={order.id} 
                        className={`hover:bg-blue-50/30 transition-colors cursor-pointer ${watchedOrderIds.includes(order.id) ? 'bg-blue-50/50' : ''}`}
                        onClick={() => toggleOrder(order.id)}
                      >
                        <td className="px-6 py-4">
                          <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${watchedOrderIds.includes(order.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-200 bg-white'}`}>
                            {watchedOrderIds.includes(order.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-black text-slate-900">LR #{order.lrNo}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{order.fromLocation} → {order.toLocation}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-700 text-xs">{order.consignee?.name}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-black text-slate-900">{order.totalWeight} KG</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
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
                    <span className="font-bold text-blue-200/60 uppercase tracking-wider">Assigned LRs</span>
                    <span className="font-black text-blue-400">{watchedOrderIds.length}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-blue-200/60 uppercase tracking-wider">Total Payload</span>
                    <span className="font-black text-blue-400">
                      {masters.unassignedOrders
                        .filter((o: any) => watchedOrderIds.includes(o.id))
                        .reduce((sum, o: any) => sum + o.totalWeight, 0)} KG
                    </span>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-blue-200/40 uppercase tracking-widest mb-1">Estimated Revenue</p>
                        <h3 className="text-2xl font-black text-blue-400">
                          ₹ {(masters.unassignedOrders
                            .filter((o: any) => watchedOrderIds.includes(o.id))
                            .reduce((sum, o: any) => sum + o.totalAmount, 0) / 100).toLocaleString('en-IN')}
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
