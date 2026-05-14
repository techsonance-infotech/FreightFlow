'use client';

import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, MessageSquare, ShieldAlert } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TicketList({ tickets = [] }: { tickets: any[] }) {
  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-12 text-center">
         <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-slate-300" />
         </div>
         <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Support History</p>
         <p className="text-xs text-slate-400 mt-1">Your logged tickets will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <div 
          key={ticket.id} 
          className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                ticket.category === 'bug' ? 'bg-rose-50 text-rose-600' :
                ticket.category === 'license' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              )}>
                {ticket.category === 'bug' ? <ShieldAlert className="h-5 w-5" /> : 
                 ticket.category === 'license' ? <AlertCircle className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight">{ticket.subject}</h3>
                <div className="flex items-center gap-2 mt-1">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                     ID: #{ticket.id.slice(0, 8)} • {format(new Date(ticket.createdAt), 'dd MMM yyyy')}
                   </p>
                   <Badge variant="outline" className={cn(
                     "text-[8px] font-black uppercase tracking-widest px-2 py-0",
                     ticket.priority === 'urgent' ? 'text-rose-600 border-rose-100 bg-rose-50' :
                     ticket.priority === 'high' ? 'text-amber-600 border-amber-100 bg-amber-50' : 'text-slate-400 border-slate-100'
                   )}>
                     {ticket.priority}
                   </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
               <Badge className={cn(
                 "text-[9px] font-black uppercase tracking-widest px-3 py-1",
                 ticket.status === 'open' ? 'bg-blue-500 text-white' :
                 ticket.status === 'pending' ? 'bg-amber-500 text-white' :
                 ticket.status === 'blocked' ? 'bg-rose-500 text-white' :
                 ticket.status === 'solved' ? 'bg-emerald-500 text-white' : 'bg-slate-400 text-white'
               )}>
                 {ticket.status}
               </Badge>
            </div>
          </div>

          <div className="bg-slate-50/50 rounded-2xl p-4 mb-4">
             <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
          </div>

          {ticket.adminResponse && (
            <div className="bg-blue-50/50 rounded-2xl p-4 border border-blue-100">
               <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-3 w-3 text-blue-600" />
                  <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Resolution / Admin Response</span>
               </div>
               <p className="text-xs font-medium text-slate-700 leading-relaxed italic">{ticket.adminResponse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
