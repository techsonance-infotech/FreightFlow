'use client';

import React, { useState } from 'react';
import { 
  FileCheck, Clock, AlertCircle, 
  Camera, Signature, MapPin, 
  CheckCircle2, XCircle, Eye, 
  Upload, Search, Filter, 
  MoreHorizontal, Download, ChevronRight,
  ShieldCheck, ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { verifyPod, submitPod } from '@/app/actions/logistics/pod';

interface Order {
  id: string;
  lrNo: string;
  date: Date;
  fromLocation: string | null;
  toLocation: string | null;
  status: string;
  totalAmount: number;
  podRecord?: any;
  dealer?: { name: string };
  consignee?: { name: string };
}

interface PodManagerProps {
  orders: Order[];
}

export function PodManager({ orders }: PodManagerProps) {
  const [filter, setFilter] = useState<'pending' | 'delivered' | 'completed'>('pending');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter logic
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.lrNo.toLowerCase().includes(search.toLowerCase()) || 
                         order.consignee?.name?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'pending') return matchesSearch && (order.status === 'dispatched' || order.status === 'delivered') && !order.podRecord;
    if (filter === 'delivered') return matchesSearch && order.status === 'delivered' && order.podRecord;
    if (filter === 'completed') return matchesSearch && order.status === 'completed';
    return matchesSearch;
  });

  const handleVerify = async (orderId: string, status: 'verified' | 'rejected') => {
    setLoading(true);
    try {
      await verifyPod(orderId, status);
      toast.success(`POD ${status} successfully`);
      setSelectedOrder(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">POD Central</h1>
          <p className="text-sm font-medium text-slate-500">Evidence-based delivery verification & audit hub.</p>
        </div>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Pending Upload" 
            value={orders.filter(o => o.status === 'dispatched' && !o.podRecord).length} 
            color="amber" 
            icon={<Clock />} 
          />
          <StatCard 
            label="Awaiting Audit" 
            value={orders.filter(o => o.status === 'delivered' && o.podRecord).length} 
            color="blue" 
            icon={<ShieldCheck />} 
          />
          <StatCard 
            label="Verified (MTD)" 
            value={orders.filter(o => o.status === 'completed').length} 
            color="emerald" 
            icon={<CheckCircle2 />} 
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-50 p-1.5 rounded-2xl">
          {(['pending', 'delivered', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === tab ? "bg-white text-blue-600 shadow-md" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {tab === 'pending' ? 'Pending POD' : tab === 'delivered' ? 'Ready for Audit' : 'Verified'}
            </button>
          ))}
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search LR Number or Consignee..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-slate-50 border-none font-bold text-sm"
            />
          </div>
          <Button variant="outline" className="h-12 w-12 rounded-2xl border-slate-100">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOrders.map((order) => (
          <div key={order.id} className="group p-8 rounded-[2.5rem] bg-white border border-slate-100 hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-blue-600 font-black text-xs shadow-inner">
                  LR
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight">{order.lrNo}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</p>
                </div>
              </div>
              <div className={cn(
                "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest",
                order.status === 'delivered' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
              )}>
                {order.status}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <LocationItem label="From" value={order.fromLocation} />
              <div className="h-6 w-0.5 bg-slate-50 ml-5" />
              <LocationItem label="To" value={order.toLocation} />
            </div>

            <div className="p-5 rounded-3xl bg-slate-50/50 border border-slate-100 space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Consignee</p>
              <p className="text-sm font-black text-slate-700 truncate">{order.consignee?.name || 'Unknown'}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between gap-4">
              <div className="flex -space-x-3">
                <div className={cn("h-10 w-10 rounded-xl border-2 border-white flex items-center justify-center transition-all", order.podRecord?.photoUrl ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-200")}>
                  <Camera className="h-4 w-4" />
                </div>
                <div className={cn("h-10 w-10 rounded-xl border-2 border-white flex items-center justify-center transition-all", order.podRecord?.signatureUrl ? "bg-emerald-50 text-emerald-500" : "bg-slate-50 text-slate-200")}>
                  <Signature className="h-4 w-4" />
                </div>
              </div>
              
              {filter === 'delivered' ? (
                <Button 
                  size="sm" 
                  onClick={() => setSelectedOrder(order)}
                  className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-100"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Audit POD
                </Button>
              ) : filter === 'pending' ? (
                <Button 
                  size="sm" 
                  onClick={() => setSelectedOrder(order)}
                  variant="outline"
                  className="h-10 px-6 rounded-xl border-blue-100 text-blue-600 font-black text-[10px] uppercase tracking-widest gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              ) : (
                <Button 
                  size="sm" 
                  variant="ghost"
                  className="h-10 px-6 rounded-xl text-emerald-600 font-black text-[10px] uppercase tracking-widest gap-2"
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL: Audit/Upload --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-10 py-8 border-b border-slate-50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                  <FileCheck className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">LR Verification Hub</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Order ID: {selectedOrder.lrNo}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <XCircle className="h-6 w-6 text-slate-300" />
              </button>
            </div>

            <div className="p-10 overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left: Evidence */}
                <div className="space-y-10">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Delivery Evidence</h3>
                    <div className="aspect-[4/3] rounded-[2rem] bg-slate-100 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center overflow-hidden group">
                      {selectedOrder.podRecord?.photoUrl ? (
                         <img src={selectedOrder.podRecord.photoUrl} className="w-full h-full object-cover" alt="POD Evidence" />
                      ) : (
                        <div className="p-10">
                          <Camera className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                          <p className="text-sm font-bold text-slate-400">Cargo Handover Photo</p>
                          <p className="text-[10px] font-medium text-slate-300 mt-2">Required for verification</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                       <Signature className="h-6 w-6 text-slate-300 mx-auto mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Sign</p>
                       <p className="text-xs font-bold text-slate-600 mt-1">{selectedOrder.podRecord?.signatureUrl ? 'Captured' : 'Pending'}</p>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                       <MapPin className="h-6 w-6 text-slate-300 mx-auto mb-3" />
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Geo-tag</p>
                       <p className="text-xs font-bold text-slate-600 mt-1">{selectedOrder.podRecord?.geoLat ? 'Verified' : 'Unavailable'}</p>
                    </div>
                  </div>
                </div>

                {/* Right: Details & Audit */}
                <div className="space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 ml-1">Order Summary</h3>
                    <div className="p-8 rounded-[2rem] bg-slate-900 text-white space-y-6">
                      <div className="flex justify-between items-center pb-6 border-b border-white/10">
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Revenue</span>
                         <span className="text-2xl font-black text-emerald-400">₹{(selectedOrder.totalAmount / 100).toLocaleString()}</span>
                      </div>
                      <div className="space-y-4">
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Consignee</p>
                            <p className="text-sm font-bold truncate">{selectedOrder.consignee?.name}</p>
                         </div>
                         <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Destination</p>
                            <p className="text-sm font-bold truncate">{selectedOrder.toLocation}</p>
                         </div>
                      </div>
                    </div>
                  </div>

                  {filter === 'delivered' ? (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-rose-600 ml-1">Audit Decision</h3>
                      <div className="flex gap-4">
                        <Button 
                          onClick={() => handleVerify(selectedOrder.id, 'rejected')}
                          disabled={loading}
                          variant="outline" 
                          className="flex-1 h-16 rounded-2xl border-rose-100 text-rose-500 font-black uppercase tracking-widest text-xs gap-3"
                        >
                          <XCircle className="h-5 w-5" />
                          Reject Evidence
                        </Button>
                        <Button 
                          onClick={() => handleVerify(selectedOrder.id, 'verified')}
                          disabled={loading}
                          className="flex-1 h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs gap-3 shadow-xl shadow-emerald-100"
                        >
                          <CheckCircle2 className="h-5 w-5" />
                          Approve Delivery
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 rounded-[2rem] border-2 border-dashed border-slate-100 text-center space-y-4">
                       <Upload className="h-10 w-10 text-slate-200 mx-auto" />
                       <p className="text-xs font-bold text-slate-400">The mobile dispatch app is used for driver-side POD uploads. You can manually upload a scanned copy here.</p>
                       <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest">Choose Scanned PDF/JPG</Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-300">
                 <ShieldCheck className="h-4 w-4" />
                 Chain of Custody Verified
               </div>
               <Button variant="ghost" onClick={() => setSelectedOrder(null)} className="font-black text-[10px] uppercase tracking-widest text-slate-400">Close Panel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color, icon }: any) {
  const colors: any = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className={cn("p-6 rounded-[2rem] border flex items-center justify-between shadow-sm", colors[color])}>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">{label}</p>
        <p className="text-3xl font-black tracking-tight leading-none">{value}</p>
      </div>
      <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center">
        {React.cloneElement(icon, { className: 'h-6 w-6' })}
      </div>
    </div>
  );
}

function LocationItem({ label, value }: { label: string, value: string | null }) {
  return (
    <div className="flex items-center gap-4">
      <div className="h-10 w-10 rounded-full border-2 border-slate-50 flex items-center justify-center">
         <div className={cn("h-2 w-2 rounded-full", label === 'From' ? 'bg-blue-500' : 'bg-emerald-500')} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-300">{label}</p>
        <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{value || '---'}</p>
      </div>
    </div>
  );
}
