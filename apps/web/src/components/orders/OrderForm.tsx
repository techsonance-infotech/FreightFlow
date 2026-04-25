'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OrderSchema, type Order } from '@freightflow/shared';
import { toast } from 'sonner';
import { 
  FileText, Plus, Trash2, Printer, Save, ArrowLeft, 
  Search, Calculator, Truck, User, MapPin 
} from 'lucide-react';

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

  // Watch fields for real-time calculations
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

  // Fetch master data for dropdowns
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

  // Real-time calculation logic
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

    setTotals({
      totalWeight,
      totalBoxes,
      subtotal: calculatedSubtotal,
      cgstAmount,
      sgstAmount,
      totalAmount,
    });
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

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save order');
      }

      toast.success(isEditing ? 'Order updated successfully' : 'Order created successfully');
      router.push('/dashboard/orders');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatPaise = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-20">
      {/* Header Sticky */}
      <div className="sticky top-0 z-10 flex items-center justify-between bg-background/80 p-4 backdrop-blur-md border-b">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold">{isEditing ? 'Edit LR' : 'New LR Creation'}</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to generate a transport LR</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Preview
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all font-semibold shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving...' : 'Save LR'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        {/* Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <FileText className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Transport Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Dealer / Consignor</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    {...register('dealerId')}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background appearance-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select Dealer</option>
                    {masters.dealers.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>
                {errors.dealerId && <p className="text-xs text-destructive">{errors.dealerId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Consignee</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    {...register('consigneeId')}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background appearance-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select Consignee</option>
                    {masters.consignees.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {errors.consigneeId && <p className="text-xs text-destructive">{errors.consigneeId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Vehicle</label>
                <div className="relative">
                  <Truck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <select
                    {...register('vehicleId')}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background appearance-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Select Vehicle</option>
                    {masters.vehicles.map((v) => (
                      <option key={v.id} value={v.id}>{v.regNo} ({v.type})</option>
                    ))}
                  </select>
                </div>
                {errors.vehicleId && <p className="text-xs text-destructive">{errors.vehicleId.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">LR Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="w-full px-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">From Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    {...register('fromLocation')}
                    placeholder="e.g. Mumbai"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {errors.fromLocation && <p className="text-xs text-destructive">{errors.fromLocation.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">To Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    {...register('toLocation')}
                    placeholder="e.g. Pune"
                    className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                </div>
                {errors.toLocation && <p className="text-xs text-destructive">{errors.toLocation.message}</p>}
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
            <div className="p-4 bg-muted/30 flex items-center justify-between border-b">
              <h2 className="font-semibold flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Line Items (Products)
              </h2>
              <button
                type="button"
                onClick={() => append({ productName: '', boxCount: 0, weight: 0, sortOrder: fields.length })}
                className="text-xs bg-primary text-primary-foreground px-3 py-1 rounded-md hover:opacity-90 transition-all flex items-center gap-1"
              >
                <Plus className="h-3 w-3" />
                Add Row
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Product Name</th>
                    <th className="px-4 py-2 text-left font-medium w-24">Boxes</th>
                    <th className="px-4 py-2 text-left font-medium w-32">Weight (KG)</th>
                    <th className="px-4 py-2 text-left font-medium w-40">DCPI No.</th>
                    <th className="px-4 py-2 text-center font-medium w-16">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {fields.map((field, index) => (
                    <tr key={field.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-2">
                        <input
                          {...register(`details.${index}.productName`)}
                          placeholder="Search or enter product..."
                          className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          {...register(`details.${index}.boxCount`, { valueAsNumber: true })}
                          className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          step="0.01"
                          {...register(`details.${index}.weight`, { valueAsNumber: true })}
                          className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          {...register(`details.${index}.dcpiNo`)}
                          placeholder="DCPI-XXXX"
                          className="w-full px-3 py-1.5 border rounded focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                          className="p-1.5 text-destructive hover:bg-destructive/10 rounded transition-colors disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-muted/10 flex justify-between text-sm font-medium border-t">
              <div className="flex gap-6">
                <span className="text-muted-foreground">Total Weight: <span className="text-foreground">{totals.totalWeight.toFixed(2)} KG</span></span>
                <span className="text-muted-foreground">Total Boxes: <span className="text-foreground">{totals.totalBoxes}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Totals & Billing Sidecard */}
        <div className="space-y-6">
          <div className="bg-card border rounded-xl p-6 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b">
              <Calculator className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Billing Summary</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate On</label>
                  <select
                    {...register('rateOn')}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  >
                    <option value="weight">Weight (KG)</option>
                    <option value="box">Box (Qty)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Rate (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    {...register('rate', { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Freight Amount (Paise)</label>
                <input
                  type="number"
                  {...register('freight', { valueAsNumber: true })}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Hamali Charge (Paise)</label>
                <input
                  type="number"
                  {...register('hamali', { valueAsNumber: true })}
                  className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">CGST (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('cgstPct', { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">SGST (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    {...register('sgstPct', { valueAsNumber: true })}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  />
                </div>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 mt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatPaise(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST</span>
                  <span className="font-medium">{formatPaise(totals.cgstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST</span>
                  <span className="font-medium">{formatPaise(totals.sgstAmount)}</span>
                </div>
                <div className="pt-3 border-t flex justify-between items-center">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-lg text-primary">{formatPaise(totals.totalAmount)}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">GST Bill No. (Optional)</label>
                  <input
                    type="text"
                    {...register('gstBillNo')}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  />
                </div>
                <div className="space-y-2 mt-3">
                  <label className="text-xs font-medium text-muted-foreground">E-Way Bill No.</label>
                  <input
                    type="text"
                    {...register('ewayBillNo')}
                    placeholder="12 Digit Number"
                    maxLength={12}
                    className="w-full px-3 py-1.5 border rounded-lg bg-background text-sm"
                  />
                  {errors.ewayBillNo && <p className="text-xs text-destructive">{errors.ewayBillNo.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
