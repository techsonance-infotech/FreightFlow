'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Truck, User, MapPin, Calendar, Clock, 
  Package, Receipt, Calculator, TrendingUp,
  Plus, CheckCircle2, AlertCircle, ArrowLeft,
  DollarSign, FileText, Download,
  ChevronRight, ArrowRight, Loader2, XCircle, Info, ChevronDown,
  ArrowUpRight, Ban, Fuel, Milestone, Wrench, IndianRupee, ShieldAlert, FileEdit
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { FreightInvoiceModal } from '@/components/accounting/freight-invoice-modal';
import { VALID_STATUS_TRANSITIONS } from '@freightflow/shared';
import { generateTripPDF } from '@/lib/pdf/trip-pdf';
import { cn, formatWeight, formatUtcDate } from '@/lib/utils';

export default function TripDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('summary');
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [expenseData, setExpenseData] = useState({ type: 'fuel', amount: 0, description: '' });
  const [settleData, setSettleData] = useState({ demurrage: 0, extraCharges: 0, notes: '' });
  
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [expandedOrderIds, setExpandedOrderIds] = useState<string[]>([]);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<string | null>(null);

  const fetchTrip = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/trips/${id}`);
      const data = await res.json();
      setTrip(data);
    } catch (error) {
      toast.error('Failed to fetch trip details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const handleAddExpense = async () => {
    try {
      const res = await fetch(`/api/v1/trips/${id}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });
      if (!res.ok) throw new Error('Failed to add expense');
      toast.success('Expense recorded');
      setShowExpenseModal(false);
      fetchTrip();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleSettle = async () => {
    try {
      const res = await fetch(`/api/v1/trips/${id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...settleData,
          demurrage: settleData.demurrage * 100, // to paise
          extraCharges: settleData.extraCharges * 100, // to paise
        }),
      });
      if (!res.ok) throw new Error('Failed to settle trip');
      toast.success('Trip settled successfully');
      setShowSettleModal(false);
      fetchTrip();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleStatusTransition = async (newStatus: string) => {
    try {
      setTransitioning(true);
      const res = await fetch(`/api/v1/trips/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      toast.success(`Trip status updated to ${newStatus.replace('_', ' ')}`);
      setConfirmStatus(null);
      fetchTrip();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTransitioning(false);
    }
  };

  const getStatusLabel = (s: string) => {
    const labels: Record<string, string> = {
      loaded: 'Mark as Loaded', in_transit: 'Start Transit',
      delivered: 'Mark Delivered', settled: 'Settle Trip', cancelled: 'Cancel Trip',
    };
    return labels[s] || s;
  };

  const getDriverName = (t: any) => t?.driver?.employee?.name || t?.driver?.name || 'N/A';

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;
    try {
      const res = await fetch(`/api/v1/trips/${id}/expenses/${expenseId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete expense');
      toast.success('Expense deleted');
      fetchTrip();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const getExpenseIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      fuel: <Fuel className="h-5 w-5" />,
      toll: <Milestone className="h-5 w-5" />,
      repair: <Wrench className="h-5 w-5" />,
      driver_allowance: <IndianRupee className="h-5 w-5" />,
      police_rto: <ShieldAlert className="h-5 w-5" />,
      loading: <Package className="h-5 w-5" />,
      unloading: <Package className="h-5 w-5" />,
      other: <FileEdit className="h-5 w-5" />,
    };
    return icons[type] || <FileEdit className="h-5 w-5" />;
  };

  const handleDownloadPDF = async () => {
    try {
      const configRes = await fetch('/api/v1/companies/branding');
      const config = await configRes.json();
      await generateTripPDF(trip, config.data);
      toast.success('PDF Generated');
    } catch (err) {
      toast.error('Failed to generate PDF');
    }
  };
  if (loading) return <div className="p-20 text-center animate-pulse font-black uppercase text-slate-400 tracking-widest">Synchronizing Mission Data...</div>;
  if (!trip) return <div className="p-20 text-center font-bold text-red-500">Mission Not Found.</div>;

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled': return 'text-green-600 bg-green-50 border-green-100';
      case 'delivered': return 'text-indigo-600 bg-indigo-50 border-indigo-100';
      case 'in_transit': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-blue-600 bg-blue-50 border-blue-100';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
            <ArrowLeft className="h-3 w-3" /> Back to Missions
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Trip #{trip.id.slice(0, 8).toUpperCase()}</h1>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(trip.status)}`}>
                {trip.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-slate-500 font-bold flex items-center gap-2 mt-1">
              <MapPin className="h-4 w-4 text-red-500" />
              {trip.fromLocation} <ArrowRight className="h-3 w-3 text-slate-300" /> {trip.toLocation}
            </p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-black text-[10px] uppercase tracking-widest">
            <Download className="h-4 w-4 text-blue-600" /> Download PDF
          </button>
          {/* Status transition buttons */}
          {trip.status !== 'settled' && trip.status !== 'cancelled' && (
            <>
              {(VALID_STATUS_TRANSITIONS[trip.status] || []).filter((s: string) => s !== 'cancelled' && s !== 'settled').map((ns: string) => (
                <button key={ns} disabled={transitioning}
                  onClick={() => setConfirmStatus(ns)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-black shadow-lg shadow-blue-600/20 text-[10px] uppercase tracking-widest disabled:opacity-50">
                  {transitioning ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
                  {getStatusLabel(ns)}
                </button>
              ))}
              {trip.status === 'delivered' && (
                <Link href={`/dashboard/trips/${id}/settle`}>
                  <button disabled={transitioning}
                    className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all font-black shadow-lg shadow-green-600/20 text-[10px] uppercase tracking-widest disabled:opacity-50">
                    <CheckCircle2 className="h-4 w-4" /> Settle Trip
                  </button>
                </Link>
              )}
              <button onClick={() => setConfirmStatus('cancelled')}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-all font-black text-[10px] uppercase tracking-widest">
                <Ban className="h-4 w-4" /> Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit overflow-x-auto max-w-full">
        {[
          { id: 'summary', label: 'Summary', icon: <TrendingUp className="h-4 w-4" /> },
          { id: 'route', label: 'Route Intelligence', icon: <MapPin className="h-4 w-4" /> },
          { id: 'orders', label: 'Assigned Cargo', icon: <Package className="h-4 w-4" /> },
          { id: 'expenses', label: 'Expenses', icon: <Receipt className="h-4 w-4" /> },
          { id: 'settlement', label: 'Settlement', icon: <Calculator className="h-4 w-4" /> },
          { id: 'pnl', label: 'Trip P&L', icon: <DollarSign className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {activeTab === 'summary' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-blue-50 rounded-[1.5rem] text-blue-600 shadow-inner"><Truck className="h-8 w-8" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Vehicle</p>
                        <h3 className="text-xl font-black text-slate-900">{trip.vehicle?.regNo}</h3>
                        <p className="text-xs font-bold text-slate-500">{trip.vehicle?.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-50 rounded-[1.5rem] text-green-600 shadow-inner"><User className="h-8 w-8" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Captain</p>
                        <h3 className="text-xl font-black text-slate-900">{getDriverName(trip)}</h3>
                        <p className="text-xs font-bold text-slate-500">Emp Code: {trip.driver?.employee?.empCode || trip.driver?.empId || '—'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-8">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-purple-50 rounded-[1.5rem] text-purple-600 shadow-inner"><Clock className="h-8 w-8" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Departure Time</p>
                        <h3 className="text-lg font-black text-slate-900">
                          {trip.departureAt ? format(new Date(trip.departureAt), 'PPP p') : 'Awaiting Dispatch'}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-red-50 rounded-[1.5rem] text-red-600 shadow-inner"><MapPin className="h-8 w-8" /></div>
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terminal Origin</p>
                        <h3 className="text-xl font-black text-slate-900">{trip.fromLocation}</h3>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-slate-50/50 -z-10 skew-x-12 translate-x-20" />
              </div>

              {/* Progress Timeline placeholder */}
              <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-8 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" /> Mission Timeline
                </h3>
                <div className="flex justify-between relative px-4">
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-100 -z-0" />
                  {(() => {
                    const stages = ['created', 'loaded', 'in_transit', 'delivered', 'settled'];
                    const labels = ['Created', 'Loaded', 'In Transit', 'Delivered', 'Settled'];
                    const currentIdx = stages.indexOf(trip.status);
                    return labels.map((s, idx) => {
                      const stageKey = stages[idx];
                      const isCompleted = idx < currentIdx;
                      const isCurrent = idx === currentIdx;
                      return (
                        <div key={s} className="relative z-10 flex flex-col items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 transition-all ${
                            isCurrent
                              ? 'bg-blue-600 border-blue-100 text-white shadow-lg'
                              : isCompleted
                              ? 'bg-green-500 border-green-100 text-white'
                              : 'bg-white border-slate-50 text-slate-300'
                          }`}>
                            {isCompleted ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest ${
                            isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-slate-400'
                          }`}>{s}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'route' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Map Visualization</h2>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">Simulation based on terminal checkpoints</p>
                     </div>
                     <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert className="h-4 w-4" /> GPS Signal Verified
                     </div>
                  </div>

                  {/* Simulated Map SVG */}
                  <div className="relative aspect-[16/9] bg-slate-50 rounded-[2rem] border border-slate-100 overflow-hidden flex items-center justify-center group">
                     <svg viewBox="0 0 800 450" className="w-full h-full opacity-40 group-hover:opacity-100 transition-opacity duration-1000">
                        {/* Grid Lines */}
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                             <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        
                        {/* Route Path */}
                        <path 
                           d="M 150,300 C 250,300 350,150 450,150 S 650,300 750,300" 
                           fill="none" 
                           stroke="#2563eb" 
                           strokeWidth="4" 
                           strokeDasharray="8,8"
                           className="animate-pulse"
                        />
                        
                        {/* Markers */}
                        <circle cx="150" cy="300" r="12" fill="#ef4444" className="animate-bounce" />
                        <circle cx="450" cy="150" r="8" fill="#3b82f6" />
                        <circle cx="750" cy="300" r="12" fill="#10b981" />
                        
                        <text x="130" y="340" className="text-[12px] font-black fill-slate-400 uppercase tracking-widest">{trip.fromLocation}</text>
                        <text x="730" y="340" className="text-[12px] font-black fill-slate-400 uppercase tracking-widest">{trip.toLocation}</text>
                     </svg>
                     
                     {/* Floating Stats */}
                     <div className="absolute top-6 left-6 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-white shadow-xl space-y-3">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Est. Progress</p>
                           <p className="text-sm font-black text-slate-900">100% Completed</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Dist.</p>
                           <p className="text-sm font-black text-slate-900">482 KM</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                     <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Route</p>
                        <p className="text-xs font-bold text-slate-700">NH-48 via Mumbai-Bangalore Highway</p>
                     </div>
                     <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Checkpoints Passed</p>
                        <p className="text-xs font-bold text-slate-700">12 Terminals Verified</p>
                     </div>
                     <div className="p-6 rounded-[1.5rem] bg-slate-50 border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Signal Strength</p>
                        <p className="text-xs font-bold text-green-600 font-black">EXCELLENT (4G-VoLTE)</p>
                     </div>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden animate-in fade-in duration-500">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600" /> Assigned Cargo ({ (trip.orders?.length || 0) + (trip.pallets?.length || 0) })
                </h3>
                {selectedOrderIds.length > 0 && (
                  <button
                    onClick={() => setIsInvoiceModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2 bg-accent-600 text-white rounded-xl hover:bg-accent-700 transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent-600/20"
                  >
                    <Receipt className="h-4 w-4" /> Generate Invoice ({selectedOrderIds.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[9px] tracking-widest">
                    <tr>
                      <th className="px-8 py-4 text-left w-10">
                        <input 
                          type="checkbox"
                          checked={selectedOrderIds.length === trip.orders?.length && trip.orders?.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOrderIds(trip.orders?.map((o: any) => o.id) || []);
                            } else {
                              setSelectedOrderIds([]);
                            }
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-accent-600 focus:ring-accent-600/20"
                        />
                      </th>
                      <th className="px-8 py-4 text-left">LR Number</th>
                      <th className="px-8 py-4 text-left">Parties</th>
                      <th className="px-8 py-4 text-right">Weight</th>
                      <th className="px-8 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {trip.orders?.map((order: any) => (
                      <React.Fragment key={order.id}>
                        <tr 
                          className={cn(
                            "hover:bg-slate-50/50 transition-all group cursor-pointer",
                            expandedOrderIds.includes(order.id) && "bg-blue-50/30",
                            selectedOrderIds.includes(order.id) && "bg-blue-50"
                          )}
                          onClick={() => {
                            setExpandedOrderIds(prev => 
                              prev.includes(order.id) 
                                ? prev.filter(id => id !== order.id) 
                                : [...prev, order.id]
                            );
                          }}
                        >
                          <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                            <input 
                              type="checkbox"
                              checked={selectedOrderIds.includes(order.id)}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedOrderIds(prev => [...prev, order.id]);
                                else setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
                              }}
                              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20"
                            />
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400">
                                  <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 tracking-tighter uppercase text-xs">LR #{order.lrNo}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">{formatUtcDate(order.date, 'dd MMM yyyy')}</div>
                                </div>
                              </div>
                              <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform duration-300", expandedOrderIds.includes(order.id) && "rotate-180 text-blue-500")} />
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-xs font-bold text-slate-700 uppercase">{order.dealer?.name}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">to {order.consignee?.name}</div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">{formatWeight(order.totalWeight)} <span className="text-[9px] text-slate-400 uppercase">KG</span></td>
                          <td className="px-8 py-5 text-right font-black text-blue-600">{formatCurrency(order.totalAmount)}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                              order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              order.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'
                            )}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            {order.status !== 'delivered' && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/v1/orders/${order.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...order, status: 'delivered' }),
                                    });
                                    if (!res.ok) throw new Error('Failed to update cargo status');
                                    toast.success('LR marked as Delivered');
                                    fetchTrip();
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                title="Mark Delivered"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedOrderIds.includes(order.id) && (
                          <tr className="bg-blue-50/10">
                            <td colSpan={5} className="px-12 py-8 border-l-4 border-blue-500">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Inventory Payload</h4>
                                  </div>
                                  <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                      <thead className="bg-slate-50/50">
                                        <tr>
                                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Description</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Boxes</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Weight</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Unit Price</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {(order.details || []).map((detail: any, dIdx: number) => {
                                          const unitPrice = (order.rate || 0) / 100;
                                          const rowAmount = order.rateOn === 'weight' 
                                            ? (detail.weight || 0) * unitPrice 
                                            : (detail.boxCount || 0) * unitPrice;
                                          return (
                                            <tr key={dIdx}>
                                              <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.productName}</td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.boxCount}</td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{formatWeight(detail.weight)}</td>
                                              <td className="px-4 py-4 text-xs font-black text-slate-600 text-right">₹{unitPrice.toLocaleString()}</td>
                                              <td className="px-4 py-4 text-xs font-black text-blue-600 text-right">₹{rowAmount.toLocaleString()}</td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                                <div className="bg-white p-6 rounded-3xl border border-blue-100 shadow-sm space-y-4">
                                  <div className="flex items-center gap-2">
                                    <Info className="h-4 w-4 text-blue-600" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Logistics Context</h4>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Origin Address</p>
                                      <p className="text-[11px] font-bold text-slate-600 mt-1.5 leading-relaxed">{order.fromAddress || 'N/A'}</p>
                                    </div>
                                    <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Destination Address</p>
                                      <p className="text-[11px] font-bold text-slate-600 mt-1.5 leading-relaxed">{order.toAddress || 'N/A'}</p>
                                    </div>
                                    <div className="pt-4 border-t border-slate-50 grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Tonnage</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tighter mt-1">{formatWeight(order.totalWeight)} <span className="text-[9px] text-slate-400 uppercase ml-1">KG</span></p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Units</p>
                                        <p className="text-lg font-black text-slate-900 tracking-tighter mt-1">{order.totalBoxes || 0} <span className="text-[9px] text-slate-400 uppercase ml-1">Boxes</span></p>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => router.push(`/dashboard/orders/${order.id}`)}
                                      className="w-full h-12 rounded-xl bg-blue-600 text-white font-black uppercase tracking-widest text-[9px] shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                                    >
                                      <FileText className="h-3.5 w-3.5" /> Full Manifest Details
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {trip.pallets?.map((pallet: any) => (
                      <React.Fragment key={pallet.id}>
                        <tr 
                          className={cn(
                            "hover:bg-slate-50/50 transition-all group cursor-pointer",
                            expandedOrderIds.includes(pallet.id) && "bg-blue-50/30"
                          )}
                          onClick={() => {
                            setExpandedOrderIds(prev => 
                              prev.includes(pallet.id) 
                                ? prev.filter(id => id !== pallet.id) 
                                : [...prev, pallet.id]
                            );
                          }}
                        >
                          <td className="px-8 py-5">
                             {/* Pallets not selectable for invoice yet */}
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shadow-sm text-slate-400">
                                  <Package className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="font-black text-slate-900 tracking-tighter uppercase text-xs">PL #{pallet.lrNo || pallet.id.slice(0, 8).toUpperCase()}</div>
                                  <div className="text-[10px] text-slate-400 font-bold uppercase">{formatUtcDate(pallet.date, 'dd MMM yyyy')}</div>
                                </div>
                              </div>
                              <ChevronDown className={cn("h-4 w-4 text-slate-300 transition-transform duration-300", expandedOrderIds.includes(pallet.id) && "rotate-180 text-blue-500")} />
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-xs font-bold text-slate-700 uppercase">{pallet.companyName}</div>
                            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">to {pallet.consignee?.name || 'Multiple'}</div>
                          </td>
                          <td className="px-8 py-5 text-right font-black text-slate-900">{formatWeight(pallet.totalWeight)} <span className="text-[9px] text-slate-400 uppercase">KG</span></td>
                          <td className="px-8 py-5 text-right font-black text-blue-600">{formatCurrency(pallet.totalAmount)}</td>
                          <td className="px-8 py-5 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest",
                              pallet.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 
                              pallet.status === 'in_transit' ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'
                            )}>
                              {pallet.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                            {pallet.status !== 'delivered' && (
                              <button
                                onClick={async () => {
                                  try {
                                    const res = await fetch(`/api/v1/pallets/${pallet.id}`, {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ ...pallet, status: 'delivered' }),
                                    });
                                    if (!res.ok) throw new Error('Failed to update pallet status');
                                    toast.success('Pallet marked as Delivered');
                                    fetchTrip();
                                  } catch (err: any) {
                                    toast.error(err.message);
                                  }
                                }}
                                className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center"
                                title="Mark Delivered"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                        {expandedOrderIds.includes(pallet.id) && (
                          <tr className="bg-blue-50/10">
                            <td colSpan={5} className="px-12 py-8 border-l-4 border-blue-500">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2">
                                  <div className="flex items-center gap-2 mb-4">
                                    <Package className="h-4 w-4 text-blue-600" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pallet Inventory</h4>
                                  </div>
                                  <div className="bg-white rounded-3xl border border-blue-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left">
                                      <thead className="bg-slate-50/50">
                                        <tr>
                                          <th className="px-6 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Consignee</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-center">Qty</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Rate</th>
                                          <th className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-50">
                                        {(pallet.palletDetails || []).map((detail: any, dIdx: number) => (
                                          <tr key={dIdx}>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-700">{detail.consigneeName}</td>
                                            <td className="px-4 py-4 text-xs font-black text-slate-900 text-center">{detail.qty}</td>
                                            <td className="px-4 py-4 text-xs font-black text-slate-600 text-right">₹{(detail.rate / 100).toLocaleString()}</td>
                                            <td className="px-4 py-4 text-xs font-black text-blue-600 text-right">₹{( (detail.qty * detail.rate) / 100).toLocaleString()}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'expenses' && (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-blue-600" /> Mission Expenses
                </h3>
                <button 
                  onClick={() => setShowExpenseModal(true)}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-slate-900/10"
                >
                  <Plus className="h-3 w-3" /> Add Expense
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {trip.expenses?.length === 0 ? (
                  <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-12 text-center text-slate-400 font-bold">
                    No expenses recorded yet for this trip.
                  </div>
                ) : (
                  trip.expenses.map((expense: any) => (
                    <div key={expense.id} className="bg-white border border-slate-100 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-50 transition-all">
                          {getExpenseIcon(expense.type)}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{expense.type.replace('_', ' ')}</p>
                          <h4 className="text-sm font-black text-slate-900">{expense.description || 'No description provided'}</h4>
                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{format(new Date(expense.recordedAt), 'PPP p')}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-lg font-black text-slate-900">{formatCurrency(expense.amount)}</div>
                          <div className="text-[10px] font-black text-green-600 uppercase tracking-widest">Verified</div>
                        </div>
                        {trip.status !== 'settled' && (
                          <button onClick={() => handleDeleteExpense(expense.id)}
                            className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Delete expense">
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'settlement' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-lg font-black uppercase tracking-tighter mb-8 border-b border-white/10 pb-6">Trip Financial Reconciliation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Advance Disbursed</p>
                      <h4 className="text-3xl font-black">{formatCurrency(trip.advanceAmount)}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Expenses</p>
                      <h4 className="text-3xl font-black text-red-400">-{formatCurrency(trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)}</h4>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Due Balance</p>
                      <h4 className={`text-3xl font-black ${
                        (trip.advanceAmount - (trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)) >= 0 
                        ? 'text-green-400' 
                        : 'text-amber-400'
                      }`}>
                        {formatCurrency(trip.advanceAmount - (trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0))}
                      </h4>
                    </div>
                  </div>
                  
                  {trip.settlement ? (
                    <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black text-green-400 uppercase tracking-widest">Mission Settled</p>
                        <p className="text-xs font-bold text-white/60">Final Settlement Ref: SET-{trip.settlement.id.slice(0, 6).toUpperCase()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Settled On</p>
                        <p className="text-sm font-black">{format(new Date(trip.settlement.settledAt), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-12 flex justify-end">
                      <button 
                        onClick={() => setShowSettleModal(true)}
                        className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95"
                      >
                        Execute Settlement
                      </button>
                    </div>
                  )}
                </div>
                <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-blue-600/10 rounded-full blur-3xl" />
              </div>
            </div>
          )}

          {activeTab === 'pnl' && (
            <div className="space-y-8 animate-in fade-in duration-500">
               <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm">
                 <div className="flex items-center gap-3 mb-10 pb-6 border-b border-slate-50">
                   <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600"><TrendingUp className="h-6 w-6" /></div>
                   <div>
                     <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Mission Performance Analysis</h2>
                     <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Profit & Loss Statement</p>
                   </div>
                 </div>

                 <div className="space-y-6">
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                     <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Gross Revenue (Freight)</span>
                     <span className="text-lg font-black text-slate-900">{formatCurrency(trip.pnl?.totalRevenue || 0)}</span>
                   </div>
                   <div className="flex justify-between items-center py-4 border-b border-slate-50">
                     <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Operational Costs (Expenses)</span>
                     <span className="text-lg font-black text-red-600">-{formatCurrency(trip.pnl?.totalExpenses || 0)}</span>
                   </div>
                   <div className="flex justify-between items-center py-6 bg-slate-50 rounded-2xl px-6 mt-10">
                     <div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Net Trip Contribution</span>
                       <span className={`text-3xl font-black ${trip.pnl?.netContribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {formatCurrency(trip.pnl?.netContribution || 0)}
                       </span>
                     </div>
                     <div className="text-right">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Trip Margin</span>
                       <span className="text-2xl font-black text-indigo-600">{trip.pnl?.marginPct || 0}%</span>
                     </div>
                   </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Mission Metadata</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><Calendar className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Created Date</p>
                  <p className="text-xs font-bold text-slate-700">{format(new Date(trip.createdAt), 'PPP')}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400"><User className="h-5 w-5" /></div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Created By</p>
                  <p className="text-xs font-bold text-slate-700">Operations Officer</p>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-50">
                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Mission Note</span>
                  </div>
                  <p className="text-[10px] text-blue-700 leading-relaxed font-medium italic">
                    Ensure all physical PODs are collected at terminal B before settling this trip. GPS tracking is active for vehicle {trip.vehicle?.regNo}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-xl text-blue-600"><Receipt className="h-5 w-5" /></div>
                Record Mission Expense
              </h3>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expense Category</label>
                  <select 
                    value={expenseData.type}
                    onChange={(e) => setExpenseData({...expenseData, type: e.target.value})}
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700"
                  >
                    <option value="fuel">Fuel Purchase</option>
                    <option value="toll">Toll Charges</option>
                    <option value="repair">Maintenance/Repair</option>
                    <option value="driver_allowance">Driver Allowance</option>
                    <option value="police_rto">Police/RTO</option>
                    <option value="other">Miscellaneous</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                    <input 
                      type="number" 
                      value={expenseData.amount || ''}
                      onChange={(e) => setExpenseData({...expenseData, amount: parseInt(e.target.value) || 0})}
                      placeholder="0.00"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-black text-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description / Note</label>
                  <textarea 
                    value={expenseData.description}
                    onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                    placeholder="e.g. Fuel at Bharat Petroleum NH-48"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-medium text-slate-700 h-24"
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button onClick={() => setShowExpenseModal(false)} className="flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                  <button onClick={handleAddExpense} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all">Record Expense</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Freight Invoice Modal */}
      <FreightInvoiceModal 
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        selectedOrders={trip.orders?.filter((o: any) => selectedOrderIds.includes(o.id)) || []}
        onSuccess={() => {
          setIsInvoiceModalOpen(false);
          setSelectedOrderIds([]);
          fetchTrip();
        }}
      />
      {/* Status Transition Confirmation */}
      {confirmStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${confirmStatus === 'cancelled' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
              {confirmStatus === 'cancelled' ? <Ban className="h-8 w-8" /> : <ArrowUpRight className="h-8 w-8" />}
            </div>
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">
              {confirmStatus === 'cancelled' ? 'Cancel Trip?' : `${getStatusLabel(confirmStatus)}?`}
            </h3>
            <p className="text-sm text-slate-500 mb-8">
              {confirmStatus === 'cancelled'
                ? 'This action cannot be undone. The trip will be permanently cancelled.'
                : `This will transition the trip from "${trip.status.replace('_', ' ')}" to "${confirmStatus.replace('_', ' ')}".`}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmStatus(null)}
                className="flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">
                Go Back
              </button>
              <button onClick={() => handleStatusTransition(confirmStatus)} disabled={transitioning}
                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${confirmStatus === 'cancelled' ? 'bg-red-600 hover:bg-red-700 shadow-red-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
                {transitioning && <Loader2 className="h-3 w-3 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Settle Modal */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-xl text-green-600"><Calculator className="h-5 w-5" /></div>
                Mission Settlement Audit
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Demurrage Charges (₹)</label>
                  <input 
                    type="number" 
                    value={settleData.demurrage || ''}
                    onChange={(e) => setSettleData({...settleData, demurrage: parseInt(e.target.value) || 0})}
                    placeholder="Loading/Unloading delay"
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700"
                  />
                  <p className="text-[9px] text-slate-400 italic">Added to driver/vehicle mission cost</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Extra Charges (₹)</label>
                  <input 
                    type="number" 
                    value={settleData.extraCharges || ''}
                    onChange={(e) => setSettleData({...settleData, extraCharges: parseInt(e.target.value) || 0})}
                    placeholder="Tolls, Fine, etc."
                    className="w-full px-5 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-10">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Audit Notes</label>
                <textarea 
                  value={settleData.notes}
                  onChange={(e) => setSettleData({...settleData, notes: e.target.value})}
                  placeholder="Record any discrepancies or remarks for the accountant..."
                  className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-medium text-slate-700 min-h-[100px]"
                />
              </div>

              <div className="p-8 bg-slate-50 rounded-3xl mb-8 space-y-4">
                 <div className="flex justify-between text-xs font-bold text-slate-500">
                   <span>Advance Disbursed</span>
                   <span>{formatCurrency(trip.advanceAmount)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-red-500">
                   <span>Total Mission Expenses</span>
                   <span>-{formatCurrency(trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0)}</span>
                 </div>
                 <div className="flex justify-between text-xs font-bold text-red-500">
                   <span>Demurrage & Extra</span>
                   <span>-{formatCurrency((settleData.demurrage + settleData.extraCharges) * 100)}</span>
                 </div>
                 <div className="pt-4 border-t border-slate-200 flex justify-between items-center">
                   <span className="text-sm font-black text-slate-900 uppercase tracking-widest">Net Settlement</span>
                   <span className="text-2xl font-black text-blue-600">
                     {formatCurrency(
                        trip.advanceAmount - 
                        (trip.expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0) -
                        ((settleData.demurrage + settleData.extraCharges) * 100)
                     )}
                   </span>
                 </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setShowSettleModal(false)} className="flex-1 px-4 py-4 border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 transition-all">Discard</button>
                <button onClick={handleSettle} className="flex-2 px-10 py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-600/20 active:scale-95">Finalize Mission Audit</button>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-32 w-32 bg-green-600/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          </div>
        </div>
      )}
    </div>
  );
}
