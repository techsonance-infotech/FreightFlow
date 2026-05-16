'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface ComplianceCalendarWidgetProps {
  data?: any[];
}

export function ComplianceCalendarWidget({ data = [] }: ComplianceCalendarWidgetProps) {
  const deadlines = data.map(d => ({
    id: d.id,
    type: d.type,
    desc: d.vehicleNo,
    date: new Date(d.expiryDate),
    daysLeft: Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / 86400000),
    status: Math.ceil((new Date(d.expiryDate).getTime() - new Date().getTime()) / 86400000) < 7 ? 'urgent' : 'warning'
  }));

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-xl shadow-slate-100/50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Compliance</h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Regulatory Deadlines</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
           <Calendar className="h-5 w-5 text-slate-400" />
        </div>
      </div>
      
      <div className="space-y-4">
        {deadlines.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No upcoming deadlines</p>
          </div>
        ) : (
          deadlines.map(d => (
            <div key={d.id} className="group relative flex items-center justify-between p-4 rounded-3xl bg-slate-50/50 border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5 transition-all">
              <div className="flex items-center gap-4">
                 <div className={`h-2 w-2 rounded-full ${
                   d.status === 'urgent' ? 'bg-rose-500' :
                   d.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                 }`} />
                 <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">{d.type}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{d.desc}</p>
                 </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-900">
                  {format(d.date, 'dd MMM')}
                </p>
                <span className={`text-[8px] font-black uppercase tracking-widest ${
                  d.status === 'urgent' ? 'text-rose-600' :
                  d.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {d.daysLeft} Days
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

import { Calendar } from 'lucide-react';
