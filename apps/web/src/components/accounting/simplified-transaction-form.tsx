'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Plus, Trash2, CheckCircle2, AlertCircle, 
  Landmark, FileText, Calendar as CalendarIcon,
  ChevronDown, Hash, IndianRupee, Fuel, 
  Settings, MapPin, CreditCard, ShieldCheck,
  Truck, User, Info, Camera, Loader2, Link as LinkIcon
} from 'lucide-react';
import { uploadMasterDocument } from '@/app/actions/masters/labour';

interface SimplifiedTransactionFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  accountOptions: { id: string; name: string; code: string }[];
  type: 'payment' | 'receipt';
  initialData?: any;
}

export function SimplifiedTransactionForm({ onSuccess, onCancel, accountOptions, type, initialData }: SimplifiedTransactionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState<string | null>(initialData?.metadata?.receiptUrl || null);
  const [category, setCategory] = useState(initialData?.category || 'general');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      amount: initialData?.totalAmount ? initialData.totalAmount / 100 : 0,
      narration: initialData?.narration || '',
      referenceNo: initialData?.voucherNo || '',
      accountId: initialData?.lines?.find((l: any) => 
        type === 'payment' ? l.credit > 0 : l.debit > 0
      )?.accountId || '',
      // Dynamic fields from metadata
      vehicleId: initialData?.vehicleId || '',
      employeeId: initialData?.employeeId || '',
      tripId: initialData?.tripId || '',
      litres: initialData?.metadata?.litres || 0,
      rate: initialData?.metadata?.rate || 0,
      odo: initialData?.metadata?.odo || 0,
      vendorName: initialData?.metadata?.vendorName || '',
      jobType: initialData?.metadata?.jobType || 'service',
      policyNo: initialData?.metadata?.policyNo || '',
      expiryDate: initialData?.metadata?.expiryDate || '',
      location: initialData?.metadata?.location || '',
      tripExpenseType: initialData?.metadata?.tripExpenseType || 'toll',
      paymentSubType: initialData?.metadata?.paymentSubType || 'salary',
    }
  });

  const watchAmount = watch('amount');
  const watchLitres = watch('litres');
  const watchRate = watch('rate');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Use PDF, PNG or JPG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File exceeds 5MB limit.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'receipt');
      formData.append('masterId', initialData?.id || 'temp_' + Date.now());
      formData.append('masterType', 'vouchers');

      const result = await uploadMasterDocument(formData);
      if (result.error) throw new Error(result.error);
      
      setReceiptUrl(result.publicUrl as string);
      toast.success('Receipt uploaded successfully');
    } catch (error: any) {
      toast.error(error.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Auto-calculate amount for fuel if litres and rate are provided
  useEffect(() => {
    if (category === 'fuel' && watchLitres > 0 && watchRate > 0 && !initialData) {
      setValue('amount', Math.round(watchLitres * watchRate * 100) / 100);
    }
  }, [watchLitres, watchRate, category, initialData]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [resVehicles, resEmployees, resTrips] = await Promise.all([
          fetch('/api/v1/masters/vehicles'),
          fetch('/api/v1/masters/employees'),
          fetch('/api/v1/trips?status=active')
        ]);
        
        if (!resVehicles.ok || !resEmployees.ok || !resTrips.ok) {
          throw new Error('Failed to fetch operational data');
        }
        
        const vData = await resVehicles.json();
        const eData = await resEmployees.json();
        const tData = await resTrips.json();
        
        setVehicles(vData.data || []);
        setEmployees(eData.data || []);
        setTrips(tData.data || []);
      } catch (error) {
        console.error('Failed to fetch masters for simplified form:', error);
      }
    };
    fetchMasters();
  }, []);

  const onSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      const bankAccountId = formData.accountId;
      
      // Prepare Double-Entry Lines
      const amountPaise = Math.round(formData.amount * 100);
      const lines = [];

      if (type === 'payment') {
        // Dr Expense
        const expenseAcc = accountOptions.find(a => a.name.toLowerCase().includes(category)) || accountOptions[0];
        lines.push({ accountId: expenseAcc.id, debit: amountPaise, credit: 0, description: formData.narration });
        // Cr Bank/Cash
        lines.push({ accountId: bankAccountId, debit: 0, credit: amountPaise, description: formData.narration });
      } else {
        // Dr Bank/Cash
        lines.push({ accountId: bankAccountId, debit: amountPaise, credit: 0, description: formData.narration });
        // Cr Income/Party
        const incomeAcc = accountOptions.find(a => a.name.toLowerCase().includes(category)) || accountOptions[0];
        lines.push({ accountId: incomeAcc.id, debit: 0, credit: amountPaise, description: formData.narration });
      }

      const response = await fetch('/api/v1/accounting/vouchers', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: initialData?.id,
          date: formData.date,
          voucherType: type,
          voucherNo: formData.referenceNo || initialData?.voucherNo,
          narration: formData.narration,
          totalAmount: amountPaise,
          category: category,
          vehicleId: formData.vehicleId || null,
          tripId: formData.tripId || null,
          employeeId: formData.employeeId || null,
          metadata: {
            litres: formData.litres,
            rate: formData.rate,
            odo: formData.odo,
            vendorName: formData.vendorName,
            jobType: formData.jobType,
            policyNo: formData.policyNo,
            expiryDate: formData.expiryDate,
            location: formData.location,
            tripExpenseType: formData.tripExpenseType,
            paymentSubType: formData.paymentSubType,
            receiptUrl: receiptUrl
          },
          lines
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save transaction');
      }

      toast.success(`${type === 'payment' ? 'Payment' : 'Receipt'} ${initialData ? 'updated' : 'recorded'} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = type === 'payment' ? [
    { id: 'fuel', label: 'Fuel Refill', icon: <Fuel className="h-4 w-4" /> },
    { id: 'maintenance', label: 'Maintenance / Repair', icon: <Settings className="h-4 w-4" /> },
    { id: 'trip', label: 'Trip Expense / Batta', icon: <MapPin className="h-4 w-4" /> },
    { id: 'salary', label: 'Staff Salary / Advance', icon: <User className="h-4 w-4" /> },
    { id: 'emi', label: 'Loan / EMI Payment', icon: <CreditCard className="h-4 w-4" /> },
    { id: 'compliance', label: 'Insurance / Permit', icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 'general', label: 'General / Office Expense', icon: <Info className="h-4 w-4" /> },
  ] : [
    { id: 'revenue', label: 'Freight Revenue', icon: <Truck className="h-4 w-4" /> },
    { id: 'advance', label: 'Customer Advance', icon: <IndianRupee className="h-4 w-4" /> },
    { id: 'interest', label: 'Bank Interest', icon: <Landmark className="h-4 w-4" /> },
    { id: 'general', label: 'Other Receipt', icon: <Plus className="h-4 w-4" /> },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-1">
      {/* 1. Category Selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">What is this {type} for? <span className="text-accent-600">*</span></label>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-2xl border transition-all gap-2 h-20",
                category === cat.id 
                  ? "bg-accent-600 border-accent-600 text-white shadow-lg shadow-accent-600/20" 
                  : "bg-white border-neutral-100 text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50"
              )}
            >
              {cat.icon}
              <span className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Core Transaction Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-neutral-50/50 p-6 rounded-[2rem] border border-neutral-100">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Account (Bank/Cash) <span className="text-accent-600">*</span></label>
          <div className="relative">
            <select 
              {...register('accountId', { required: "Account is required" })}
              className={cn(
                "w-full h-12 px-4 pr-10 bg-white border rounded-xl text-sm font-bold outline-none transition-all appearance-none cursor-pointer",
                errors.accountId ? "border-red-500 ring-2 ring-red-500/10" : "border-neutral-200 focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600"
              )}
            >
              <option value="">Select Bank/Cash...</option>
              {(() => {
                const filtered = accountOptions.filter(a => 
                  a.name.toLowerCase().includes('bank') || 
                  a.name.toLowerCase().includes('cash') ||
                  a.name.toLowerCase().includes('petty') ||
                  a.name.toLowerCase().includes('hdfc') ||
                  a.name.toLowerCase().includes('icici') ||
                  a.name.toLowerCase().includes('sbi')
                );
                const displayOptions = filtered.length > 0 ? filtered : accountOptions;
                return displayOptions.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.code})</option>
                ));
              })()}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          </div>
          {errors.accountId && <p className="text-[10px] font-bold text-red-500 px-1">{errors.accountId.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Transaction Date <span className="text-accent-600">*</span></label>
          <input 
            type="date"
            {...register('date', { required: "Date is required" })}
            className={cn(
              "w-full h-12 px-4 bg-white border rounded-xl text-sm font-bold outline-none transition-all",
              errors.date ? "border-red-500 ring-2 ring-red-500/10" : "border-neutral-200 focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600"
            )}
          />
          {errors.date && <p className="text-[10px] font-bold text-red-500 px-1">{errors.date.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Amount (₹) <span className="text-accent-600">*</span></label>
          <div className="relative">
            <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="number"
              step="0.01"
              {...register('amount', { required: "Amount is required", min: { value: 0.01, message: "Amount must be greater than 0" }, valueAsNumber: true })}
              className={cn(
                "w-full h-12 pl-12 pr-4 bg-white border rounded-xl text-lg font-black outline-none transition-all",
                errors.amount ? "border-red-500 ring-2 ring-red-500/10" : "border-neutral-200 focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600"
              )}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="text-[10px] font-bold text-red-500 px-1">{errors.amount.message as string}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Ref No / Bill No</label>
          <div className="relative">
            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input 
              type="text"
              {...register('referenceNo')}
              className="w-full h-12 pl-12 pr-4 bg-white border border-neutral-200 rounded-xl text-sm font-bold text-neutral-700 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all"
              placeholder="e.g. BILL-123"
            />
          </div>
        </div>
      </div>

      {/* 3. Transport Specific Intelligence Section */}
      {(category === 'fuel' || category === 'maintenance' || category === 'compliance' || category === 'emi') && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <div className="h-4 w-1 bg-accent-600 rounded-full" />
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">Operational Context</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Select Vehicle <span className="text-accent-600">*</span></label>
              <div className="relative">
                <select 
                  {...register('vehicleId', { required: "Vehicle is required" })}
                  className={cn(
                    "w-full h-11 px-4 pr-10 bg-white border rounded-xl text-xs font-bold outline-none transition-all appearance-none",
                    errors.vehicleId ? "border-red-500" : "border-neutral-100 focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600"
                  )}
                >
                  <option value="">Choose Vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.regNo} ({v.model})</option>)}
                </select>
                <Truck className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-300" />
              </div>
              {errors.vehicleId && <p className="text-[9px] font-bold text-red-500 px-1">{errors.vehicleId.message as string}</p>}
            </div>

            {category === 'fuel' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Fuel Stats <span className="text-accent-600">*</span></label>
                  <div className="flex gap-2">
                    <input 
                      type="number" step="0.01" placeholder="Litres"
                      {...register('litres', { required: true, valueAsNumber: true })}
                      className="flex-1 h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                    />
                    <input 
                      type="number" step="0.01" placeholder="Rate/L"
                      {...register('rate', { required: true, valueAsNumber: true })}
                      className="flex-1 h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Current Odometer <span className="text-accent-600">*</span></label>
                  <input 
                    type="number" placeholder="Km reading..."
                    {...register('odo', { required: true, valueAsNumber: true })}
                    className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </>
            )}

            {category === 'maintenance' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Garage / Mechanic</label>
                  <input 
                    type="text" placeholder="Garage name..."
                    {...register('vendorName')}
                    className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Job Type <span className="text-accent-600">*</span></label>
                  <select 
                    {...register('jobType', { required: true })}
                    className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                  >
                    <option value="service">Routine Service</option>
                    <option value="repair">Major Repair</option>
                    <option value="tyre">Tyre Change</option>
                    <option value="oil">Oil Change</option>
                  </select>
                </div>
              </>
            )}

            {category === 'compliance' && (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Policy / Permit No</label>
                  <input 
                    type="text" placeholder="Enter number..."
                    {...register('policyNo')}
                    className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">New Expiry Date <span className="text-accent-600">*</span></label>
                  <input 
                    type="date"
                    {...register('expiryDate', { required: true })}
                    className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {category === 'salary' && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <div className="h-4 w-1 bg-blue-600 rounded-full" />
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">Employee Context</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Select Staff / Driver <span className="text-accent-600">*</span></label>
              <select 
                {...register('employeeId', { required: "Employee is required" })}
                className={cn(
                  "w-full h-11 px-4 bg-white border rounded-xl text-xs font-bold outline-none transition-all",
                  errors.employeeId ? "border-red-500" : "border-neutral-100"
                )}
              >
                <option value="">Choose Employee...</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.designation})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Payment Type <span className="text-accent-600">*</span></label>
              <select 
                {...register('paymentSubType', { required: true })}
                className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
              >
                <option value="salary">Monthly Salary</option>
                <option value="advance">Salary Advance</option>
                <option value="bonus">Bonus / Incentive</option>
                <option value="batta">Trip Batta / Allowance</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {category === 'trip' && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-2 px-1">
            <div className="h-4 w-1 bg-amber-600 rounded-full" />
            <h3 className="text-[10px] font-black text-neutral-900 uppercase tracking-[0.2em]">Journey Context</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Select Active Trip <span className="text-accent-600">*</span></label>
              <select 
                {...register('tripId', { required: "Trip is required" })}
                className={cn(
                  "w-full h-11 px-4 bg-white border rounded-xl text-xs font-bold outline-none transition-all",
                  errors.tripId ? "border-red-500" : "border-neutral-100"
                )}
              >
                <option value="">Choose Trip...</option>
                {trips.map(t => <option key={t.id} value={t.id}>{t.fromLocation} to {t.toLocation} ({t.vehicle?.regNo})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Expense Type <span className="text-accent-600">*</span></label>
              <select 
                {...register('tripExpenseType', { required: true })}
                className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
              >
                <option value="toll">Toll Charges</option>
                <option value="loading">Loading / Unloading</option>
                <option value="parking">Parking / Halt</option>
                <option value="detention">Detention / Wait Time</option>
                <option value="rto">RTO Tax / Fine</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Location / Border</label>
              <input 
                type="text" placeholder="e.g. MH Border"
                {...register('location')}
                className="w-full h-11 px-4 bg-white border border-neutral-100 rounded-xl text-xs font-bold outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. Attachment & Narration */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-4 border-t border-neutral-100">
        <div className="md:col-span-8 space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Narration / Internal Notes</label>
          <textarea 
            {...register('narration')}
            className="w-full h-24 p-4 bg-neutral-50 border border-neutral-100 rounded-xl text-sm font-medium text-neutral-600 outline-none focus:ring-2 focus:ring-accent-600/10 focus:border-accent-600 transition-all resize-none"
            placeholder="Enter any additional details for reference..."
          />
        </div>
        <div className="md:col-span-4 space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest px-1">Bill Attachment</label>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".pdf,.png,.jpg,.jpeg"
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "h-24 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer group",
              isUploading ? "bg-neutral-50 border-neutral-200" : 
              receiptUrl ? "bg-green-50 border-green-200 text-green-600" : 
              "border-neutral-200 text-neutral-400 hover:text-accent-600 hover:border-accent-600"
            )}
          >
            {isUploading ? (
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
            ) : receiptUrl ? (
              <CheckCircle2 className="h-6 w-6 mb-2" />
            ) : (
              <Camera className="h-6 w-6 mb-2 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-[10px] font-black uppercase tracking-tighter">
              {isUploading ? 'Uploading...' : receiptUrl ? 'Receipt Uploaded' : 'Upload Receipt'}
            </span>
            {receiptUrl && (
              <div className="flex items-center gap-1 mt-1">
                <LinkIcon className="h-2 w-2" />
                <span className="text-[8px] font-bold opacity-70">File Linked</span>
              </div>
            )}
          </div>
          <p className="text-[8px] text-neutral-400 text-center font-medium">Max 5MB (PDF, PNG, JPG)</p>
        </div>
      </div>

      {/* 5. Footer Actions */}
      <div className="flex items-center justify-between pt-6">
        <p className="text-[9px] font-black text-neutral-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <Landmark className="h-3.5 w-3.5" /> Core Accounting Service
        </p>
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onCancel} className="h-12 px-6 rounded-xl font-bold text-xs uppercase tracking-widest">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting} 
            className="h-12 px-8 rounded-xl bg-accent-600 hover:bg-accent-700 shadow-xl shadow-accent-600/20 font-black text-xs uppercase tracking-widest"
          >
            Record {type === 'payment' ? 'Payment' : 'Receipt'}
          </Button>
        </div>
      </div>
    </form>
  );
}
