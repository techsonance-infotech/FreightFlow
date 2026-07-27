'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, User, Truck, Calendar, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DriverAdvanceSchema, type DriverAdvance } from '@freightflow/shared';

interface AdvanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdvanceModal({ isOpen, onClose, onSuccess }: AdvanceModalProps) {
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(DriverAdvanceSchema),
    defaultValues: {
      mode: 'cash',
      date: '',
      amount: 0,
    },
  });

  useEffect(() => {
    if (isMounted) {
      setValue('date', new Date().toISOString().split('T')[0]);
    }
  }, [isMounted, setValue]);

  useEffect(() => {
    if (!isOpen) return;
    Promise.all([
      fetch('/api/v1/masters/drivers?limit=200').then(r => r.json()),
      fetch('/api/v1/trips?limit=5000&status=in_transit').then(r => r.json()),
    ]).then(([d, t]) => {
      setDrivers(d.data || []);
      setTrips(t.data || []);
    });
  }, [isOpen]);

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/trips/advances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) { 
        const err = await res.json(); 
        throw new Error(err.error || 'Failed to record advance'); 
      }
      toast.success('Advance recorded successfully');
      onSuccess();
      onClose();
      reset();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-10 shadow-2xl relative overflow-hidden">
        <button type="button" onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400 z-20">
          <X className="h-5 w-5" />
        </button>
        <div className="relative z-10">
          <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1 flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Wallet className="h-5 w-5" /></div>
            Record Driver Advance
          </h3>
          <p className="text-xs text-slate-400 font-bold mb-8">Disburse advance payment to a driver</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver *</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <select {...register('driverId')} required
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                  <option value="">Select Driver</option>
                  {drivers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.employee?.name || d.name} ({d.employee?.empCode || d.empId})</option>
                  ))}
                </select>
              </div>
              {errors.driverId && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.driverId as any).message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linked Trip (Optional)</label>
              <div className="relative">
                <Truck className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <select {...register('tripId')}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                  <option value="">No Trip (Standalone)</option>
                  {trips.map((t: any) => (
                    <option key={t.id} value={t.id}>TR-{t.id.slice(0, 6).toUpperCase()} · {t.fromLocation} → {t.toLocation}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹) *</label>
                <input type="number" step="0.01" {...register('amount', { valueAsNumber: true })} required placeholder="0.00"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-900 focus:ring-2 focus:ring-blue-600/10" />
                {errors.amount && <p className="text-[10px] text-red-500 font-bold uppercase">{(errors.amount as any).message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mode</label>
                <select {...register('mode')}
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-[10px] font-black uppercase text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                  <option value="cash">Cash</option>
                  <option value="bank">Bank</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <input type="date" {...register('date')}
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purpose / Notes</label>
              <textarea {...register('purpose')} rows={2} placeholder="e.g. Fuel advance for Delhi trip"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 focus:ring-2 focus:ring-blue-600/10 resize-none" />
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
              <button type="submit" disabled={loading}
                className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                {loading ? 'Recording...' : 'Record Advance'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
