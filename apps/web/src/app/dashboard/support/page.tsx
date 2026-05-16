import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getMyTickets } from '@/app/actions/support-tickets';
import { TicketForm } from '@/components/support/ticket-form';
import { TicketList } from '@/components/support/ticket-list';
import { 
  Shield, MessageSquare, LogOut, LayoutDashboard, 
  HelpCircle, Bug, ShieldCheck, History, Info
} from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function SupportPage({ searchParams }: any) {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  const { category } = await searchParams;
  const myTickets = await getMyTickets();

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20">
      {/* Dynamic Support Header */}
      <div className="flex flex-col md:flex-row items-center justify-between bg-white px-8 py-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="flex items-center gap-5 mb-4 md:mb-0">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-lg shadow-blue-200">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">FreightFlow Help Center</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mt-1">Enterprise Resolution & License Portal</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
              <LayoutDashboard className="h-4 w-4" />
              Return Home
           </Link>
        </div>
      </div>

      <Tabs defaultValue={category === 'license' ? 'new' : 'overview'} className="space-y-10">
        <div className="flex justify-center">
          <TabsList className="bg-white border border-slate-100 p-1 rounded-2xl h-14 shadow-sm">
            <TabsTrigger value="overview" className="rounded-xl px-8 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Overview</TabsTrigger>
            <TabsTrigger value="new" className="rounded-xl px-8 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">New Request</TabsTrigger>
            <TabsTrigger value="history" className="rounded-xl px-8 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">My Tickets</TabsTrigger>
            <TabsTrigger value="faq" className="rounded-xl px-8 font-bold data-[state=active]:bg-blue-600 data-[state=active]:text-white">Help & FAQ</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-10">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <SupportCard 
                icon={<HelpCircle className="h-6 w-6" />}
                title="Portal Help"
                desc="Assistance with operational modules and platform usage."
                color="blue"
              />
              <SupportCard 
                icon={<Bug className="h-6 w-6" />}
                title="Bug Report"
                desc="Report technical issues or UI glitches to our engineers."
                color="rose"
              />
              <SupportCard 
                icon={<ShieldCheck className="h-6 w-6" />}
                title="License & Billing"
                desc="Manage subscriptions, keys, and renewal requests."
                color="emerald"
              />
           </div>

           <div className="bg-blue-900 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 max-w-2xl">
                 <h2 className="text-3xl font-black tracking-tight mb-4">Direct Support Excellence</h2>
                 <p className="text-blue-100 font-medium leading-relaxed opacity-80">
                    Our technical support team is standing by to ensure your logistics operations never stop. 
                    From license renewals to feature requests, log a ticket and track its progress in real-time.
                 </p>
                 <div className="flex items-center gap-6 mt-10">
                    <div className="flex -space-x-3">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="h-10 w-10 rounded-full border-2 border-blue-900 bg-blue-700 flex items-center justify-center text-[10px] font-bold">
                            SA
                         </div>
                       ))}
                    </div>
                    <p className="text-xs font-bold text-blue-200">5+ Super Admins Online</p>
                 </div>
              </div>
              <div className="absolute top-0 right-0 h-full w-1/3 bg-blue-800/20 translate-x-10 skew-x-12" />
              <Shield className="absolute bottom-[-20%] right-10 h-64 w-64 text-blue-800/30 rotate-12" />
           </div>
        </TabsContent>

        <TabsContent value="new">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                 <TicketForm defaultCategory={category} />
              </div>
              <div className="lg:col-span-4 space-y-6">
                 <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <Info className="h-8 w-8 text-blue-400 mb-6" />
                    <h3 className="text-lg font-black mb-3">Support SLA</h3>
                    <ul className="space-y-4">
                       <li className="flex gap-3 text-xs">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span className="opacity-70 font-medium">Critical issues: 2-4 hours response time.</span>
                       </li>
                       <li className="flex gap-3 text-xs">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span className="opacity-70 font-medium">Standard help: 12-24 hours.</span>
                       </li>
                       <li className="flex gap-3 text-xs">
                          <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                          <span className="opacity-70 font-medium">License activations: Instant to 2 hours.</span>
                       </li>
                    </ul>
                 </div>
              </div>
           </div>
        </TabsContent>

        <TabsContent value="history" className="max-w-4xl mx-auto">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <History className="h-6 w-6 text-slate-400" />
                 <h2 className="text-xl font-black text-slate-900 tracking-tight">Your Support History</h2>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{myTickets.length} Tickets Found</p>
           </div>
           <TicketList tickets={myTickets} />
        </TabsContent>

        <TabsContent value="faq">
           {/* Placeholder for FAQ */}
           <div className="bg-white rounded-[3rem] p-12 text-center border border-slate-100">
              <HelpCircle className="h-12 w-12 text-blue-500 mx-auto mb-6" />
              <h2 className="text-2xl font-black text-slate-900">Search Our Knowledge Base</h2>
              <p className="text-slate-500 mt-2 max-w-md mx-auto">Instant answers to common questions about LRs, Fleet, and Accounting.</p>
              <div className="mt-8 max-w-lg mx-auto h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center px-6">
                 <p className="text-slate-400 font-bold italic">Search functionality coming soon...</p>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SupportCard({ icon, title, desc, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
       <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]}`}>
          {icon}
       </div>
       <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
       <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
