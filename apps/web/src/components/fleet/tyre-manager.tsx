'use client';

import React, { useState } from 'react';
import { 
  CircleDot, Settings2, Plus, 
  Search, Filter, History,
  TrendingUp, AlertCircle, Trash2,
  CheckCircle2, XCircle, MoreHorizontal,
  ChevronRight, Gauge, Download,
  Truck, ArrowUpRight, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { updateTyreStatus } from '@/app/actions/fleet/tyres';
import { toast } from 'sonner';

interface Tyre {
  id: string;
  serialNo: string;
  brand: string;
  size: string;
  position: string | null;
  status: 'stock' | 'mounted' | 'scrapped';
  purchaseDate: string;
  purchaseCost: number;
  currentKm: number;
  treadDepth: number | null;
  vehicle: {
    regNo: string;
  } | null;
}

export function TyreManager({ tyres }: { tyres: Tyre[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'stock' | 'mounted' | 'scrapped'>('all');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredTyres = tyres.filter(t => {
    const matchesSearch = t.serialNo.toLowerCase().includes(search.toLowerCase()) || 
                         t.brand.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    return t.status === filter;
  });

  const handleScrap = async (tyreId: string) => {
    if (!confirm('Are you sure you want to scrap this tyre? This action cannot be undone.')) return;
    setLoadingId(tyreId);
    try {
      await updateTyreStatus(tyreId, 'scrapped');
      toast.success('Tyre marked as scrapped');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Tyre Lifecycle Management</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Performance Tracking & Cost Audit</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <Download className="h-4 w-4" /> Export Registry
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-slate-900 hover:bg-black text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-slate-200 gap-3">
            <Plus className="h-4 w-4" /> Register New Tyre
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Total Inventory" value={tyres.length} icon={<CircleDot className="h-6 w-6" />} color="slate" />
        <KpiCard label="Currently Mounted" value={tyres.filter(t => t.status === 'mounted').length} icon={<Truck className="h-6 w-6" />} color="blue" />
        <KpiCard label="Ready in Stock" value={tyres.filter(t => t.status === 'stock').length} icon={<RotateCcw className="h-6 w-6" />} color="emerald" />
        <KpiCard label="Scrapped (Total)" value={tyres.filter(t => t.status === 'scrapped').length} icon={<Trash2 className="h-6 w-6" />} color="rose" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-50 p-2 rounded-2xl">
          {['all', 'stock', 'mounted', 'scrapped'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={cn(
                "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                filter === f ? "bg-white text-blue-600 shadow-md" : "text-slate-400"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search serial no or brand..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
          <Button variant="outline" className="h-14 w-14 rounded-2xl border-slate-100 shrink-0">
            <Filter className="h-4 w-4 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Tyre Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredTyres.map((tyre) => (
          <div key={tyre.id} className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest",
                  tyre.status === 'mounted' ? 'bg-blue-50 text-blue-600' :
                  tyre.status === 'stock' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                )}>
                  {tyre.status}
                </div>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Tread Depth</span>
                   <div className="h-2 w-16 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          "h-full rounded-full transition-all duration-1000",
                          (tyre.treadDepth || 0) < 3 ? 'bg-rose-500' : 'bg-blue-500'
                        )}
                        style={{ width: `${(tyre.treadDepth || 0) * 10}%` }}
                      />
                   </div>
                </div>
              </div>

              <div className="space-y-1 mb-8">
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{tyre.serialNo}</h3>
                <p className="text-sm font-bold text-slate-400 italic">{tyre.brand} • {tyre.size}</p>
              </div>

              <div className="grid grid-cols-2 gap-6 mb-10">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Distance</p>
                   <p className="text-lg font-black text-slate-900">{tyre.currentKm.toLocaleString()} KM</p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Purchase Cost</p>
                   <p className="text-lg font-black text-slate-900">₹{(tyre.purchaseCost / 100).toLocaleString()}</p>
                </div>
              </div>

              {tyre.status === 'mounted' && (
                <div className="flex items-center gap-4 p-5 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-200 mb-8 animate-in slide-in-from-left-4">
                  <Truck className="h-6 w-6 opacity-50" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Mounted On</p>
                    <p className="text-sm font-black">{tyre.vehicle?.regNo || 'Unknown'}</p>
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">{tyre.position?.replace('_', ' ')}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button className="flex-1 h-12 rounded-xl bg-slate-50 border-none text-slate-600 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 gap-2">
                  <History className="h-3 w-3" /> Inspection
                </Button>
                {tyre.status !== 'scrapped' && (
                  <Button 
                    onClick={() => handleScrap(tyre.id)}
                    disabled={loadingId === tyre.id}
                    className="h-12 w-12 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Background Accent */}
            <div className="absolute -right-10 -bottom-10 h-32 w-32 bg-slate-50 rounded-full group-hover:scale-150 transition-transform duration-700" />
          </div>
        ))}

        {filteredTyres.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <RotateCcw className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No tyres found in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden bg-white",
      color === 'blue' ? 'border-blue-100' : color === 'emerald' ? 'border-emerald-100' : color === 'rose' ? 'border-rose-100' : 'border-slate-100'
    )}>
      <div className={cn(
        "h-12 w-12 rounded-2xl flex items-center justify-center mb-6",
        color === 'blue' ? 'bg-blue-50 text-blue-600' : color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : color === 'rose' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
      )}>
        {icon}
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <h4 className="text-3xl font-black text-slate-900">{value}</h4>
    </div>
  );
}
