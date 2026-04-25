'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function ComplianceCalendarWidget() {
  const [deadlines, setDeadlines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app we fetch from /api/v1/compliance/deadlines
    // Mocking for immediate UI feedback as per phase instructions
    setLoading(true);
    setTimeout(() => {
      setDeadlines([
        { id: 1, type: 'GSTR-1', desc: 'Outward Supplies', date: new Date(Date.now() + 3 * 86400000), status: 'urgent' },
        { id: 2, type: 'TDS', desc: 'Payment (Form 26Q)', date: new Date(Date.now() + 6 * 86400000), status: 'warning' },
        { id: 3, type: 'GSTR-3B', desc: 'Monthly Return', date: new Date(Date.now() + 15 * 86400000), status: 'normal' },
      ]);
      setLoading(false);
    }, 500);
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <h3 className="text-sm font-black tracking-widest text-slate-700 uppercase mb-4">Compliance Calendar</h3>
        <div className="animate-pulse space-y-3">
          <div className="h-10 bg-slate-100 rounded-xl"></div>
          <div className="h-10 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-sm font-black tracking-widest text-slate-700 uppercase mb-4 flex justify-between items-center">
        <span>Compliance Calendar</span>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded-full">Next 30 Days</span>
      </h3>
      
      <div className="space-y-3">
        {deadlines.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-4">No upcoming deadlines.</p>
        ) : (
          deadlines.map(d => (
            <div key={d.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-black text-slate-800">{d.type}</p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{d.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-slate-700">
                  {d.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                </p>
                <span className={`text-[9px] font-black uppercase tracking-widest ${
                  d.status === 'urgent' ? 'text-rose-600' :
                  d.status === 'warning' ? 'text-amber-600' : 'text-emerald-600'
                }`}>
                  {Math.ceil((d.date.getTime() - Date.now()) / 86400000)} Days Left
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
