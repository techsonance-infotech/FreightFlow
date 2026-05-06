import React from 'react';
import { prisma } from '@freightflow/db';
import { 
  MessageSquare, Clock, Filter, 
  Search, ArrowRight, User, 
  Building2, Zap
} from 'lucide-react';
import Link from 'next/link';

export default async function AdminSupportPage() {
  const requests = await prisma.licenseRequest.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      tenant: { select: { name: true } },
      user: { select: { name: true, email: true } },
      _count: { select: { messages: true } }
    }
  });

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-white tracking-tighter">Support Desk</h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Processing {requests.length} License Requests</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              placeholder="Search tickets..." 
              className="pl-12 h-12 w-80 bg-slate-900 border-slate-800 text-white rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((request) => (
          <Link 
            key={request.id} 
            href={`/admin/support/${request.id}`}
            className="group block bg-slate-900/30 border border-slate-900 hover:border-blue-600 rounded-[2.5rem] p-8 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8">
                <div className="h-16 w-16 bg-slate-800 rounded-3xl flex items-center justify-center font-black text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-2xl font-black text-white tracking-tight">{request.tenant.name}</h3>
                    <span className={cn(
                      "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                      request.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    )}>
                      {request.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-500">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                      <User className="h-3 w-3" /> {request.user.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                      <Building2 className="h-3 w-3" /> Requested {request.planType.toUpperCase()} Plan
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest">
                      <Clock className="h-3 w-3" /> Updated {new Date(request.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xl font-black text-white">{request._count.messages}</p>
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Messages</p>
                </div>
                <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center group-hover:translate-x-2 transition-transform">
                  <ArrowRight className="h-6 w-6 text-slate-400 group-hover:text-white" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {requests.length === 0 && (
          <div className="bg-slate-900/30 border border-slate-900 rounded-[2.5rem] p-20 flex flex-col items-center text-center">
            <div className="h-20 w-20 bg-slate-800 rounded-3xl flex items-center justify-center mb-6">
              <Zap className="h-10 w-10 text-slate-600" />
            </div>
            <h3 className="text-2xl font-black text-white">No Active Tickets</h3>
            <p className="text-slate-500 font-bold mt-2">When tenants request license upgrades, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
