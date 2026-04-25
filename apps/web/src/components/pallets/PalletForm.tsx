'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PalletSchema, type Pallet } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  Package, Plus, Trash2, Save, ArrowLeft, 
  Truck, User, Calculator, Layers, Building2
} from 'lucide-react';

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

  // Watch for totals
  const watchedPallets = watch('palletDetails');
  const watchedConsignees = watch('consigneeDetails');
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
    
    setSummary({
      totalPallets,
      subtotal,
      gstAmount,
      grandTotal: subtotal + gstAmount,
    });
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

  const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 p-4 backdrop-blur-md border-b">
        <div className="flex items-center gap-4">
          <button type="button" onClick={() => router.back()} className="p-2 hover:bg-muted rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">New Pallet Entry</h1>
            <p className="text-sm text-muted-foreground">Track pallet inventory and billing</p>
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Pallet Record'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        <div className="lg:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Building2 className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">General Details</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dealer</label>
                <select {...register('dealerId')} className="w-full px-4 py-2 border rounded-lg bg-background">
                  <option value="">Select Dealer</option>
                  {masters.dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle</label>
                <select {...register('vehicleId')} className="w-full px-4 py-2 border rounded-lg bg-background">
                  <option value="">Select Vehicle</option>
                  {masters.vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <input {...register('companyName')} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="Client Company" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Party Code</label>
                <input {...register('partyCode')} className="w-full px-4 py-2 border rounded-lg bg-background" placeholder="e.g. PC-123" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">LR No. (Optional)</label>
                <input type="number" {...register('lrNo', { valueAsNumber: true })} className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input type="date" {...register('date')} className="w-full px-4 py-2 border rounded-lg bg-background" />
              </div>
            </div>
          </div>

          {/* Pallet Breakdown */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 flex items-center justify-between border-b">
              <h2 className="font-semibold flex items-center gap-2"><Layers className="h-4 w-4" /> Pallet Items</h2>
              <button type="button" onClick={() => appendPallet({ qty: 1, rate: 0 })} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md">Add Item</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Rate (Paise)</th>
                  <th className="px-4 py-2 text-right">Line Total</th>
                  <th className="px-4 py-2 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {palletFields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="p-2"><input type="number" {...register(`palletDetails.${index}.qty`, { valueAsNumber: true })} className="w-full px-3 py-1.5 border rounded" /></td>
                    <td className="p-2"><input type="number" {...register(`palletDetails.${index}.rate`, { valueAsNumber: true })} className="w-full px-3 py-1.5 border rounded" /></td>
                    <td className="p-2 text-right font-medium">
                      {formatPaise((watchedPallets[index]?.qty || 0) * (watchedPallets[index]?.rate || 0))}
                    </td>
                    <td className="p-2 text-center">
                      <button type="button" onClick={() => removePallet(index)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Consignee Distribution */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 flex items-center justify-between border-b">
              <h2 className="font-semibold flex items-center gap-2"><User className="h-4 w-4" /> Consignee Distribution</h2>
              <button type="button" onClick={() => appendConsignee({ consigneeName: '', qty: 1, rate: 0 })} className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md">Add Row</button>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left">Consignee Name</th>
                  <th className="px-4 py-2 text-left w-24">Qty</th>
                  <th className="px-4 py-2 text-left w-32">Rate (Paise)</th>
                  <th className="px-4 py-2 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {consigneeFields.map((field, index) => (
                  <tr key={field.id}>
                    <td className="p-2"><input {...register(`consigneeDetails.${index}.consigneeName`)} className="w-full px-3 py-1.5 border rounded" placeholder="Name..." /></td>
                    <td className="p-2"><input type="number" {...register(`consigneeDetails.${index}.qty`, { valueAsNumber: true })} className="w-full px-3 py-1.5 border rounded" /></td>
                    <td className="p-2"><input type="number" {...register(`consigneeDetails.${index}.rate`, { valueAsNumber: true })} className="w-full px-3 py-1.5 border rounded" /></td>
                    <td className="p-2 text-center">
                      <button type="button" onClick={() => removeConsignee(index)} className="text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Billing Summary</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase">GST (%)</label>
                <input type="number" {...register('gstPct', { valueAsNumber: true })} className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm" />
              </div>
              <div className="bg-muted/30 rounded-lg p-4 mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Pallets</span>
                  <span className="font-medium">{summary.totalPallets}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPaise(summary.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST ({watchedGstPct}%)</span>
                  <span className="font-medium">{formatPaise(summary.gstAmount)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-lg text-primary">{formatPaise(summary.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
