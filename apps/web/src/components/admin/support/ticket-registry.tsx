'use client';

import React, { useState } from 'react';
import { 
  LifeBuoy, Clock, CheckCircle2, 
  AlertTriangle, ArrowRight, User,
  MessageSquare, ShieldAlert, RefreshCw, ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { updateTicketStatus } from '@/app/actions/admin/support';
import { cn } from '@/lib/utils';

import Link from 'next/link';

export function TicketRegistry({ tickets, licenseRequests = [] }: { tickets: any[], licenseRequests?: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [responseMode, setResponseMode] = useState<string | null>(null);
  const [adminReply, setAdminReply] = useState('');
  const [activeTab, setActiveTab] = useState<'tickets' | 'licenses'>('tickets');

  const handleStatusUpdate = async (ticketId: string, status: any) => {
    setLoading(ticketId);
    try {
      await updateTicketStatus(ticketId, { status, adminResponse: adminReply || undefined });
      toast.success(`Ticket marked as ${status.toUpperCase()}`);
      setResponseMode(null);
      setAdminReply('');
    } catch (error) {
      toast.error('Failed to update ticket');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[3.5rem] p-12 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-50/50 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-10 relative z-10">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 rotate-3">
            <MessageSquare className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Sovereign Helpdesk</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Cross-Tenant Global Assistance Registry</p>
          </div>
        </div>
        <div className="text-right flex items-center gap-4">
          <span className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-100">
            {tickets.filter(t => t.status === 'solved').length + licenseRequests.filter(r => r.status === 'approved').length} Resolved
          </span>
          <span className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest">
            {tickets.filter(t => t.status === 'open').length + licenseRequests.filter(r => r.status === 'pending').length} Open Nodes
          </span>
        </div>
      </div>

      {/* Elegant Segmented Tab Controller */}
      <div className="flex justify-start gap-4 mb-12 relative z-10 bg-slate-50 p-2 rounded-2xl w-fit border border-slate-100">
        <button
          onClick={() => setActiveTab('tickets')}
          className={cn(
            "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'tickets'
              ? "bg-white text-blue-600 shadow-md border border-slate-100"
              : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          Standard Tickets ({tickets.length})
        </button>
        <button
          onClick={() => setActiveTab('licenses')}
          className={cn(
            "px-8 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
            activeTab === 'licenses'
              ? "bg-white text-blue-600 shadow-md border border-slate-100"
              : "text-slate-400 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          Fulfillment Queue ({licenseRequests.length})
        </button>
      </div>

      <div className="space-y-6 relative z-10 animate-in fade-in duration-500">
        {activeTab === 'tickets' ? (
          tickets.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
               <LifeBuoy className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Platform Helpdesk is Currently Clear</p>
            </div>
          ) : tickets.map((ticket) => (
            <div key={ticket.id} className="group flex flex-col p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-8">
                  <div className={cn(
                    "h-14 w-14 rounded-2xl border flex items-center justify-center shadow-sm transition-all",
                    ticket.category === 'bug' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                    ticket.category === 'license' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-white text-blue-600 border-slate-100'
                  )}>
                    {ticket.category === 'bug' ? <ShieldAlert className="h-7 w-7" /> : 
                     ticket.category === 'license' ? <ShieldCheck className="h-7 w-7" /> : <User className="h-7 w-7" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{ticket.subject}</h4>
                      <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white">{ticket.category}</Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         BY: {ticket.user.name} &bull; {ticket.tenant.name}
                       </p>
                       <span className={cn(
                         "px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                         ticket.priority === 'urgent' ? "bg-rose-50 text-rose-600 border-rose-100" :
                         ticket.priority === 'high' ? "bg-amber-50 text-amber-600 border-amber-100" : "bg-blue-50 text-blue-600 border-blue-100"
                       )}>
                         {ticket.priority.toUpperCase()}
                       </span>
                    </div>
                  </div>
                </div>

                <div className="flex bg-white p-1.5 rounded-xl border border-slate-100 shadow-sm">
                   <StatusButton active={ticket.status === 'open'} color="blue" onClick={() => handleStatusUpdate(ticket.id, 'open')}>OPEN</StatusButton>
                   <StatusButton active={ticket.status === 'pending'} color="amber" onClick={() => handleStatusUpdate(ticket.id, 'pending')}>PEND</StatusButton>
                   <StatusButton active={ticket.status === 'blocked'} color="rose" onClick={() => handleStatusUpdate(ticket.id, 'blocked')}>BLOC</StatusButton>
                   <StatusButton active={ticket.status === 'solved'} color="emerald" onClick={() => handleStatusUpdate(ticket.id, 'solved')}>SOLV</StatusButton>
                </div>
              </div>

              <p className="text-sm font-bold text-slate-500 leading-relaxed mb-8 ml-22">
                {ticket.description}
              </p>

              {responseMode === ticket.id ? (
                <div className="ml-22 space-y-4 animate-in slide-in-from-top-2 duration-300">
                   <textarea 
                     placeholder="Enter resolution response or administrative note..."
                     className="w-full min-h-[100px] p-4 rounded-2xl bg-white border border-blue-100 focus:border-blue-300 focus:ring-4 focus:ring-blue-50 text-sm font-medium transition-all"
                     value={adminReply}
                     onChange={(e) => setAdminReply(e.target.value)}
                   />
                   <div className="flex items-center gap-3">
                      <Button 
                        onClick={() => handleStatusUpdate(ticket.id, ticket.status)}
                        disabled={!adminReply || loading === ticket.id}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest text-[10px]"
                      >
                        {loading === ticket.id ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm Response'}
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => setResponseMode(null)}
                        className="text-slate-400 font-bold uppercase tracking-widest text-[10px]"
                      >
                        Cancel
                      </Button>
                   </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 ml-22">
                   <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Clock className="h-4 w-4" />
                      Received {new Date(ticket.createdAt).toLocaleString()}
                   </div>
                   <button 
                     onClick={() => { setResponseMode(ticket.id); setAdminReply(ticket.adminResponse || ''); }}
                     className="h-12 px-8 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-4 hover:bg-black transition-all"
                   >
                      {ticket.adminResponse ? 'Update Response' : 'Respond to Node'}
                      <ArrowRight className="h-4 w-4" />
                   </button>
                </div>
              )}
            </div>
          ))
        ) : (
          licenseRequests.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
               <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fulfillment Queue is empty</p>
            </div>
          ) : licenseRequests.map((req) => (
            <div key={req.id} className="group flex flex-col p-8 bg-slate-50/50 hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-slate-100 transition-all duration-500">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-8">
                  <div className="h-14 w-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm">
                    <ShieldCheck className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">License Upgrade: {req.planType.toUpperCase()}</h4>
                      <Badge className={cn(
                        "text-[8px] font-black uppercase tracking-widest border",
                        req.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        req.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                      )}>
                        {req.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         BY: {req.user.name} &bull; {req.tenant.name}
                       </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/admin/support/${req.id}`}>
                    <Button className="bg-slate-900 hover:bg-black text-white px-6 h-12 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-slate-200">
                      <MessageSquare className="h-4 w-4" />
                      Chat & Resolve
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 ml-22 mt-2">
                 <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Clock className="h-4 w-4" />
                    Requested {new Date(req.createdAt).toLocaleString()}
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusButton({ active, children, onClick, color = 'blue' }: any) {
  const activeColors: any = {
    blue: "bg-blue-600 text-white shadow-lg shadow-blue-100",
    amber: "bg-amber-500 text-white shadow-lg shadow-amber-100",
    rose: "bg-rose-500 text-white shadow-lg shadow-rose-100",
    emerald: "bg-emerald-500 text-white shadow-lg shadow-emerald-100"
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "h-10 px-6 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
        active ? activeColors[color] : "text-slate-400 hover:bg-slate-50"
      )}
    >
      {children}
    </button>
  );
}
