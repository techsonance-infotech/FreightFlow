'use client';

import React, { useState } from 'react';
import { 
  Calendar, Clock, AlertCircle, 
  CheckCircle2, Play, Pause,
  Search, Filter, Plus,
  Truck, Settings, Wrench,
  ChevronRight, ArrowRight, Bell,
  ShieldCheck, History, MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, isBefore, addDays } from 'date-fns';
import { updateScheduleStatus } from '@/app/actions/fleet/maintenance';
import { toast } from 'sonner';

interface Schedule {
  id: string;
  serviceType: string;
  intervalKm: number | null;
  intervalDays: number | null;
  lastServiceKm: number;
  lastServiceDate: string;
  nextDueKm: number | null;
  nextDueDate: string | null;
  status: 'active' | 'paused' | 'completed';
  vehicle: {
    regNo: string;
    odometer: number;
  };
}

export function MaintenanceScheduleManager({ schedules }: { schedules: Schedule[] }) {
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredSchedules = schedules.filter(s => 
    s.vehicle.regNo.toLowerCase().includes(search.toLowerCase()) ||
    s.serviceType.toLowerCase().includes(search.toLowerCase())
  );

  const handleStatusToggle = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    setLoadingId(id);
    try {
      await updateScheduleStatus(id, nextStatus);
      toast.success(`Schedule ${nextStatus === 'active' ? 'resumed' : 'paused'}`);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoadingId(null);
    }
  };

  const getDueStatus = (s: Schedule) => {
    if (s.status !== 'active') return 'inactive';

    const isKmDue = s.nextDueKm && s.vehicle.odometer >= s.nextDueKm;
    const isDateDue = s.nextDueDate && isBefore(new Date(s.nextDueDate), new Date());

    if (isKmDue || isDateDue) return 'overdue';
    
    // Warning if within 1000km or 7 days
    const isKmWarning = s.nextDueKm && (s.nextDueKm - s.vehicle.odometer) <= 1000;
    const isDateWarning = s.nextDueDate && isBefore(new Date(s.nextDueDate), addDays(new Date(), 7));

    if (isKmWarning || isDateWarning) return 'warning';
    
    return 'healthy';
  };

  return (
    <div className="space-y-10 p-8 lg:p-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Preventive Maintenance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-widest">Automated Service Schedules & Alerts</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-200 font-black text-xs uppercase tracking-widest gap-3 shadow-sm">
            <Bell className="h-4 w-4" /> Alert Settings
          </Button>
          <Button className="h-14 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-blue-200 gap-3">
            <Plus className="h-4 w-4" /> Create Schedule
          </Button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <StatCard label="Active Schedules" value={schedules.filter(s => s.status === 'active').length} icon={<Play className="h-5 w-5" />} color="blue" />
        <StatCard label="Overdue Service" value={schedules.filter(s => getDueStatus(s) === 'overdue').length} icon={<AlertCircle className="h-5 w-5" />} color="rose" />
        <StatCard label="Pending Renewal" value={schedules.filter(s => getDueStatus(s) === 'warning').length} icon={<Clock className="h-5 w-5" />} color="amber" />
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-between bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <Input 
            placeholder="Search vehicle or service type..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 h-14 rounded-2xl bg-slate-50 border-none font-bold text-sm focus:ring-4 focus:ring-blue-50 transition-all"
          />
        </div>
        <div className="flex gap-4">
           <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">
             <Filter className="h-4 w-4 mr-2" /> Filter
           </Button>
           <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">
             <History className="h-4 w-4 mr-2" /> Service History
           </Button>
        </div>
      </div>

      {/* Schedule List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {filteredSchedules.map((schedule) => {
          const status = getDueStatus(schedule);
          return (
            <div key={schedule.id} className="bg-white rounded-[3rem] border border-slate-100 p-10 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group">
               <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl shadow-lg">
                       <Truck className="h-6 w-6" />
                     </div>
                     <div>
                       <h3 className="text-xl font-black text-slate-900 tracking-tight">{schedule.vehicle.regNo}</h3>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Odometer: {schedule.vehicle.odometer.toLocaleString()} KM</p>
                     </div>
                   </div>
                   <div className={cn(
                     "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2",
                     status === 'overdue' ? 'bg-rose-50 text-rose-600 animate-pulse' :
                     status === 'warning' ? 'bg-amber-50 text-amber-600' :
                     status === 'inactive' ? 'bg-slate-50 text-slate-400' : 'bg-emerald-50 text-emerald-600'
                   )}>
                     {status === 'overdue' ? <AlertCircle className="h-3 w-3" /> : <ShieldCheck className="h-3 w-3" />}
                     {status}
                   </div>
                 </div>

                 <div className="p-8 rounded-[2rem] bg-slate-50/50 border border-slate-50 mb-8">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Wrench className="h-4 w-4" /></div>
                      <h4 className="text-lg font-black text-slate-800">{schedule.serviceType}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Interval</p>
                        <p className="text-sm font-bold text-slate-700">
                          {schedule.intervalKm ? `${schedule.intervalKm.toLocaleString()} KM` : ''} 
                          {schedule.intervalKm && schedule.intervalDays ? ' or ' : ''}
                          {schedule.intervalDays ? `${schedule.intervalDays} Days` : ''}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Next Due</p>
                        <p className="text-sm font-black text-slate-900">
                          {schedule.nextDueKm ? `${schedule.nextDueKm.toLocaleString()} KM` : '—'}
                          <br />
                          <span className="text-[10px] font-bold text-slate-400">
                            {schedule.nextDueDate ? format(new Date(schedule.nextDueDate), 'dd MMM yyyy') : ''}
                          </span>
                        </p>
                      </div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2">
                     <button 
                       onClick={() => handleStatusToggle(schedule.id, schedule.status)}
                       disabled={loadingId === schedule.id}
                       className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all shadow-sm",
                        schedule.status === 'active' ? 'bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                       )}
                     >
                       {schedule.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                     </button>
                     <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50"><Settings className="h-4 w-4 text-slate-400" /></Button>
                   </div>
                   <Button className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 gap-2">
                     Record Service <ArrowRight className="h-4 w-4" />
                   </Button>
                 </div>
               </div>
               
               {/* Decorative background element */}
               <div className="absolute right-0 top-0 h-40 w-40 bg-slate-50 rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-125 transition-transform duration-700" />
            </div>
          );
        })}
        
        {filteredSchedules.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <History className="h-12 w-12 text-slate-100 mx-auto mb-4" />
            <p className="text-sm font-black text-slate-200 uppercase tracking-widest">No maintenance schedules defined</p>
            <Button variant="ghost" className="mt-4 font-black text-[10px] uppercase tracking-widest text-blue-500">Add First Schedule</Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    blue: 'bg-blue-600 text-white shadow-blue-100',
    rose: 'bg-rose-500 text-white shadow-rose-100',
    amber: 'bg-amber-400 text-white shadow-amber-100'
  };

  return (
    <div className={cn(
      "p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden",
      colors[color]
    )}>
      <div className="relative z-10">
        <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center mb-6">
          {icon}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">{label}</p>
        <h4 className="text-4xl font-black">{value}</h4>
      </div>
      <div className="absolute right-0 bottom-0 h-24 w-24 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3 blur-xl" />
    </div>
  );
}
