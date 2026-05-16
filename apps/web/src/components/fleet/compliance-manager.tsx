'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, XCircle, 
  Search, Filter, Calendar, 
  Truck, FileText, Download,
  ExternalLink, Edit2, CheckCircle2,
  Bell, ChevronRight, MoreHorizontal,
  Clock, Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isBefore, isAfter, addDays } from 'date-fns';

interface VehicleDocument {
  id: string;
  docType: string;
  docNo: string;
  issueDate: string;
  expiryDate: string;
  fileUrl: string | null;
}

interface Vehicle {
  id: string;
  regNo: string;
  model: string;
  documents: VehicleDocument[];
}

interface ComplianceStats {
  totalDocuments: number;
  expiringSoon: number;
  expired: number;
  complianceRate: number;
}

export function ComplianceManager({ stats, vehicles }: { stats: ComplianceStats, vehicles: Vehicle[] }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired'>('all');

  const getDocStatus = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const soon = addDays(today, 30);

    if (isBefore(expiry, today)) return 'expired';
    if (isBefore(expiry, soon)) return 'expiring';
    return 'valid';
  };

  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = v.regNo.toLowerCase().includes(search.toLowerCase()) || 
                         v.model.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;

    if (filter === 'all') return true;
    
    return v.documents?.some(doc => {
      const status = getDocStatus(doc.expiryDate);
      return status === filter;
    }) || false;
  });

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Fleet Compliance Engine</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Regulatory Vault & Renewal Tracking</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <Bell className="h-4 w-4" /> Setup Alerts
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-200 gap-3">
            <Calendar className="h-4 w-4" /> Renewal Calendar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard label="Overall Compliance" value={`${stats.complianceRate}%`} icon={<ShieldCheck className="h-6 w-6" />} color="blue" />
        <KpiCard label="Total Documents" value={stats.totalDocuments} icon={<FileText className="h-6 w-6" />} color="slate" />
        <KpiCard label="Expiring Soon" value={stats.expiringSoon} icon={<Clock className="h-6 w-6" />} color="amber" />
        <KpiCard label="Expired / Critical" value={stats.expired} icon={<XCircle className="h-6 w-6" />} color="rose" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex bg-slate-50 p-2 rounded-2xl">
          <button onClick={() => setFilter('all')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'all' ? "bg-white text-slate-900 shadow-md" : "text-slate-400")}>All Fleet</button>
          <button onClick={() => setFilter('expiring')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'expiring' ? "bg-white text-amber-600 shadow-md" : "text-slate-400")}>Expiring Soon</button>
          <button onClick={() => setFilter('expired')} className={cn("px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", filter === 'expired' ? "bg-white text-rose-600 shadow-md" : "text-slate-400")}>Expired</button>
        </div>

        <div className="flex gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <Input 
              placeholder="Search vehicle reg no or model..." 
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

      {/* Fleet Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-lg">
                  <Truck className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">{vehicle.regNo}</h3>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{vehicle.model}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50"><MoreHorizontal className="h-5 w-5" /></Button>
            </div>

            <div className="space-y-4">
              {vehicle.documents?.map((doc) => {
                const status = getDocStatus(doc.expiryDate);
                return (
                  <div key={doc.id} className="flex items-center justify-between p-5 rounded-[1.5rem] bg-slate-50/50 border border-transparent hover:border-slate-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center",
                        status === 'valid' ? 'bg-emerald-50 text-emerald-600' :
                        status === 'expiring' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{doc.docType.replace('_', ' ')}</p>
                        <p className="text-sm font-black text-slate-700">{doc.docNo}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expires On</p>
                      <p className={cn(
                        "text-xs font-black",
                        status === 'expired' ? 'text-rose-600 animate-pulse' : 
                        status === 'expiring' ? 'text-amber-600' : 'text-slate-900'
                      )}>
                        {format(new Date(doc.expiryDate), 'dd MMM yyyy')}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!vehicle.documents || vehicle.documents.length === 0) && (
                <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                   <AlertTriangle className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                   <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">No Documents Found</p>
                </div>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex -space-x-3">
                 <div className="h-10 w-10 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-blue-600 text-[10px] font-black">RC</div>
                 <div className="h-10 w-10 rounded-full bg-indigo-100 border-4 border-white flex items-center justify-center text-indigo-600 text-[10px] font-black">IN</div>
                 <div className="h-10 w-10 rounded-full bg-purple-100 border-4 border-white flex items-center justify-center text-purple-600 text-[10px] font-black">PT</div>
                 <div className="h-10 w-10 rounded-full bg-slate-100 border-4 border-white flex items-center justify-center text-slate-400 text-[10px] font-black">+2</div>
              </div>
              <Button className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest gap-2">
                Manage Vault <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 text-white shadow-blue-200',
    slate: 'bg-white border-slate-100 text-slate-900',
    amber: 'bg-white border-amber-100 text-amber-600',
    rose: 'bg-rose-600 text-white shadow-rose-200'
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] border shadow-sm relative overflow-hidden",
      colors[color] || colors.slate
    )}>
      <div className="relative z-10">
        <div className={cn(
          "h-10 w-10 rounded-xl flex items-center justify-center mb-6",
          color === 'blue' || color === 'rose' ? 'bg-white/10' : 'bg-slate-50'
        )}>
          {icon}
        </div>
        <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1", color === 'blue' || color === 'rose' ? 'text-white/60' : 'text-slate-400')}>{label}</p>
        <h4 className="text-3xl font-black">{value}</h4>
      </div>
      {color === 'blue' && <div className="absolute right-0 top-0 h-24 w-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />}
    </div>
  );
}
