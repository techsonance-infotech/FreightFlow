'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, Clock, CheckCircle2, 
  AlertTriangle, ArrowRight, User,
  MessageSquare, ShieldAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateTicketStatus } from '@/app/actions/admin/support';
import { cn } from '@/lib/utils';

export function TicketRegistry({ tickets }: { tickets: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (ticketId: string, status: any) => {
    setLoading(ticketId);
    try {
      await updateTicketStatus(ticketId, status);
      toast.success(`Ticket status updated to ${status.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to update ticket status');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-16 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Sovereign Helpdesk</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Cross-Tenant Global Assistance Registry</p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            {tickets.filter(t => t.status === 'open').length} Open Nodes
          </span>
        </div>
      </div>

      <div className="space-y-6 relative z-10">
        {tickets.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
             <LifeBuoy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Helpdesk is Currently Clear</p>
          </div>
        ) : tickets.map((ticket) => (
          <div key={ticket.id} className="group flex flex-col p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-8">
                <div className="h-14 w-14 bg-white rounded-2xl border border-slate-100 flex items-center justify-center text-slate-300 shadow-sm group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                  <User className="h-7 w-7" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">{ticket.subject}</h4>
                  <div className="flex items-center gap-4 mt-1">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                       BY: {ticket.user.name} &bull; {ticket.tenant.name}
                     </p>
                     <span className={cn(
                       "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                       ticket.priority === 'critical' ? "bg-rose-50 text-rose-600 border-rose-100" :
                       ticket.priority === 'high' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                     )}>
                       {ticket.priority.toUpperCase()}
                     </span>
                  </div>
                </div>
              </div>

              <div className="flex bg-white p-1.5 rounded-xl border border-slate-100">
                 <StatusButton active={ticket.status === 'open'} onClick={() => handleStatusChange(ticket.id, 'open')}>OPEN</StatusButton>
                 <StatusButton active={ticket.status === 'in_progress'} onClick={() => handleStatusChange(ticket.id, 'in_progress')}>PROG</StatusButton>
                 <StatusButton active={ticket.status === 'resolved'} onClick={() => handleStatusChange(ticket.id, 'resolved')}>DONE</StatusButton>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8 ml-22">
              {ticket.description}
            </p>

            <div className="flex items-center justify-between pt-6 border-t border-slate-100 ml-22">
               <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <Clock className="h-4 w-4" />
                  Received {new Date(ticket.createdAt).toLocaleString()}
               </div>
               <button className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-black transition-all">
                  Respond to Node
                  <ArrowRight className="h-4 w-4" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusButton({ active, children, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-10 px-6 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
        active ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}
