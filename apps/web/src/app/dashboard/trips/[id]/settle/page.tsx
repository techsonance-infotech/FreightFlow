'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Wallet, TrendingUp, TrendingDown, 
  Receipt, Truck, User, MapPin, Calendar,
  AlertCircle, CheckCircle2, Loader2, Info,
  Plus, Minus, Calculator, DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { settleTripAction } from '@/app/actions/logistics/settlement';

export default function TripSettlementPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adjustments, setAdjustments] = useState({
    demurrage: 0,
    extraCharges: 0,
    notes: '',
  });

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/trips/${tripId}`);
      if (!res.ok) throw new Error('Trip not found');
      const data = await res.json();
      setTrip(data);
    } catch (error) {
      toast.error('Failed to fetch trip details');
      router.push('/dashboard/trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  if (loading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Financial Ledger...</p>
      </div>
    );
  }

  if (!trip) return null;

  // Financial Calculations
  const totalRevenue = trip.orders?.reduce((sum: number, o: any) => sum + (o.subtotal || 0), 0) || 0;
  const totalExpenses = trip.expenses?.reduce((sum: number, e: any) => sum + (e.amount || 0), 0) || 0;
  const totalAdvance = trip.advanceAmount || 0;
  
  const adjDemurrage = adjustments.demurrage * 100; // to paise
  const adjExtra = adjustments.extraCharges * 100; // to paise

  // Balance to/from driver = Advance - (Expenses + Adjustments)
  const driverBalance = totalAdvance - (totalExpenses + adjDemurrage + adjExtra);
  
  // Trip Profit = Revenue - (Expenses + Adjustments)
  // Note: Advance is just a cash transfer, not a cost by itself, 
  // but if the driver doesn't return the balance, it becomes a cost.
  // In a closed settlement, we assume all expenses are recorded.
  const netProfit = totalRevenue - (totalExpenses + adjDemurrage + adjExtra);
  const marginPct = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const handleSettle = async () => {
    try {
      setSubmitting(true);
      const result = await settleTripAction({
        tripId,
        demurrage: adjDemurrage,
        extraCharges: adjExtra,
        notes: adjustments.notes,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Trip settled successfully');
        router.push(`/dashboard/trips/${tripId}`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  return (
    <div className="p-8 space-y-10 animate-in fade-in duration-700 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/dashboard/trips/${tripId}`}>
            <button className="h-12 w-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
              <ArrowLeft className="h-6 w-6" />
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Trip Settlement</h1>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Closing Mission: TR-{trip.id.slice(0, 6).toUpperCase()}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right mr-4">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Status</p>
             <p className="text-sm font-black text-blue-600 uppercase">{trip.status.replace('_', ' ')}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Left Column: Financial Audit */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Trip Summary Card */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                     <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Vehicle</p>
                    <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{trip.vehicle?.regNo}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                     <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Driver</p>
                    <p className="text-lg font-black text-slate-900 uppercase tracking-tight">{trip.driver?.employee?.name || trip.driver?.name}</p>
                  </div>
               </div>
            </div>
            <div className="h-full w-[1px] bg-slate-100 hidden md:block" />
            <div className="flex-1 space-y-4">
               <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                  <MapPin className="h-4 w-4 text-red-500" />
                  {trip.fromLocation}
                  <TrendingUp className="h-4 w-4 text-slate-200 rotate-90" />
                  {trip.toLocation}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Departure</p>
                    <p className="text-xs font-bold text-slate-600">{trip.departureAt ? format(new Date(trip.departureAt), 'dd MMM, HH:mm') : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Arrival</p>
                    <p className="text-xs font-bold text-slate-600">{trip.actualDeliveryAt ? format(new Date(trip.actualDeliveryAt), 'dd MMM, HH:mm') : 'N/A'}</p>
                  </div>
               </div>
            </div>
          </div>

          {/* Ledger Sections */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight ml-4 flex items-center gap-2">
               <Receipt className="h-5 w-5 text-blue-600" /> Financial Breakdown
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {/* Revenue Ledger */}
               <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-emerald-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                     <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Revenue (LRs)</span>
                     <span className="text-sm font-black text-emerald-700">{formatCurrency(totalRevenue)}</span>
                  </div>
                  <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                     {trip.orders?.map((o: any, i: number) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div>
                             <p className="text-[10px] font-black text-slate-900 uppercase">#{o.lrNo}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">{o.consignee?.name || 'Local Delivery'}</p>
                          </div>
                          <p className="text-xs font-black text-slate-600">{formatCurrency(o.subtotal)}</p>
                       </div>
                     ))}
                  </div>
               </div>

               {/* Expense Ledger */}
               <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                  <div className="bg-rose-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                     <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Expenses (Trip)</span>
                     <span className="text-sm font-black text-rose-700">{formatCurrency(totalExpenses)}</span>
                  </div>
                  <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                     {trip.expenses?.map((e: any, i: number) => (
                       <div key={i} className="flex justify-between items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                          <div>
                             <p className="text-[10px] font-black text-slate-900 uppercase">{e.type}</p>
                             <p className="text-[9px] font-bold text-slate-400 uppercase truncate max-w-[100px]">{e.description || 'General Expense'}</p>
                          </div>
                          <p className="text-xs font-black text-slate-600">{formatCurrency(e.amount)}</p>
                       </div>
                     ))}
                     {trip.expenses?.length === 0 && (
                       <div className="text-center py-8">
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No expenses recorded</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          </div>

          {/* Adjustments Form */}
          <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-6">
                  <h3 className="text-2xl font-black tracking-tighter flex items-center gap-3">
                     <Calculator className="h-8 w-8 text-blue-400" /> Final Adjustments
                  </h3>
                  <p className="text-slate-400 text-sm font-bold">Input any additional charges or penalties to finalize the mission profitability.</p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Demurrage / Waitings (₹)</label>
                       <Input 
                         type="number"
                         value={adjustments.demurrage}
                         onChange={(e) => setAdjustments({...adjustments, demurrage: parseFloat(e.target.value) || 0})}
                         className="h-16 bg-slate-800 border-none rounded-2xl text-white font-black text-xl px-8 focus:ring-2 focus:ring-blue-500/50 transition-all"
                         placeholder="0.00"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Other Extra Charges (₹)</label>
                       <Input 
                         type="number"
                         value={adjustments.extraCharges}
                         onChange={(e) => setAdjustments({...adjustments, extraCharges: parseFloat(e.target.value) || 0})}
                         className="h-16 bg-slate-800 border-none rounded-2xl text-white font-black text-xl px-8 focus:ring-2 focus:ring-blue-500/50 transition-all"
                         placeholder="0.00"
                       />
                    </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Settlement Remarks</label>
                     <textarea 
                        value={adjustments.notes}
                        onChange={(e) => setAdjustments({...adjustments, notes: e.target.value})}
                        className="w-full h-44 bg-slate-800 border-none rounded-[2rem] p-8 text-white font-bold text-sm focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600"
                        placeholder="Add details about the settlement, extra charges, or trip performance..."
                     />
                  </div>
               </div>
            </div>
            {/* Background Decor */}
            <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
          </div>

        </div>

        {/* Right Column: Profitability Panel (Sticky) */}
        <div className="space-y-6">
           <div className="sticky top-8 space-y-6">
              
              {/* Profit Card */}
              <div className="bg-white rounded-[3rem] p-8 border border-slate-100 shadow-2xl space-y-8">
                 <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estimated Net Profit</p>
                    <h2 className={cn(
                      "text-5xl font-black tracking-tighter text-center mt-2",
                      netProfit >= 0 ? "text-emerald-600" : "text-rose-600"
                    )}>
                      {formatCurrency(netProfit)}
                    </h2>
                    <div className="flex justify-center mt-2">
                       <span className={cn(
                         "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                         netProfit >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                       )}>
                         {marginPct.toFixed(1)}% Margin
                       </span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-slate-50">
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Revenue</span>
                       <span className="text-sm font-black text-slate-900">{formatCurrency(totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-500">
                       <span className="text-[10px] font-black uppercase tracking-widest">Operating Costs</span>
                       <span className="text-sm font-black">- {formatCurrency(totalExpenses + adjDemurrage + adjExtra)}</span>
                    </div>
                 </div>

                 <div className="space-y-4 pt-8 border-t border-slate-50">
                    <div className="flex items-center gap-2 mb-4">
                       <Wallet className="h-4 w-4 text-blue-600" />
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Driver Reconciliation</h4>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cash Advance</span>
                       <span className="text-sm font-black text-slate-900">{formatCurrency(totalAdvance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reported Expenses</span>
                       <span className="text-sm font-black text-slate-900">{formatCurrency(totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl mt-2 border border-slate-100">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {driverBalance >= 0 ? 'To Refund' : 'To Pay Driver'}
                       </span>
                       <span className={cn(
                         "text-lg font-black",
                         driverBalance >= 0 ? "text-blue-600" : "text-rose-600"
                       )}>
                         {formatCurrency(Math.abs(driverBalance))}
                       </span>
                    </div>
                 </div>

                 <Button 
                   onClick={handleSettle}
                   disabled={submitting || trip.status === 'settled'}
                   className="w-full h-16 rounded-[1.5rem] bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-200 disabled:opacity-50"
                 >
                   {submitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                   Finalize Settlement
                 </Button>
                 
                 <p className="text-[9px] font-bold text-slate-300 text-center uppercase tracking-tighter px-4">
                    By finalizing, you confirm that all expenses have been audited and the mission is closed.
                 </p>
              </div>

              {/* Info Box */}
              <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                 <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                    <Info className="h-4 w-4" />
                 </div>
                 <p className="text-[10px] font-bold text-amber-800 leading-relaxed uppercase tracking-tight">
                    Closed settlements will automatically update the driver's ledger and lock financial modifications for this trip.
                 </p>
              </div>

           </div>
        </div>

      </div>
    </div>
  );
}
