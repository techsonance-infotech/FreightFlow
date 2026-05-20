'use client';

import React from 'react';
import { MessageSquare, AlertCircle, ArrowUpRight, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface UrgentTicket {
  id: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  createdAt: Date;
  tenant: {
    name: string;
  };
  user: {
    name: string;
  };
}

interface TicketAlertsProps {
  tickets: UrgentTicket[];
}

export function DashboardTicketAlerts({ tickets }: TicketAlertsProps) {
  const priorityColors: Record<string, string> = {
    urgent: 'bg-rose-50 text-rose-600 border-rose-100 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    high: 'bg-amber-50 text-amber-600 border-amber-100 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    medium: 'bg-blue-50 text-blue-600 border-blue-100',
    low: 'bg-slate-50 text-slate-500 border-slate-100'
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm relative overflow-hidden flex flex-col h-full">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-[80px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" /> SLA Helpdesk Queue
          </h3>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1 text-left">
            Urgent Open Support Incidents
          </p>
        </div>
        <Link 
          href="/admin/support"
          className="h-9 px-4 bg-slate-50 hover:bg-slate-900 hover:text-white border border-slate-100 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
        >
          View Deck <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="space-y-4 flex-1 relative z-10">
        {tickets.length === 0 ? (
          <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center opacity-30">
            <AlertCircle className="h-10 w-10 text-blue-500 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest">SLA Helpdesk Clear</p>
            <p className="text-[9px] font-bold text-slate-400 mt-1">No open platform tickets</p>
          </div>
        ) : (
          tickets.map((t) => (
            <Link 
              key={t.id}
              href="/admin/support"
              className="p-5 bg-slate-50/50 hover:bg-white border border-slate-100/50 hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-100/40 rounded-[2rem] flex items-center justify-between gap-6 transition-all duration-500 group cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">
                  {t.subject}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    {t.tenant.name} &bull; {t.user.name}
                  </span>
                  <span className="text-slate-200">/</span>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" /> 
                    {formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <span className={cn(
                "px-3.5 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border shrink-0",
                priorityColors[t.priority.toLowerCase()] || priorityColors.medium
              )}>
                {t.priority}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
