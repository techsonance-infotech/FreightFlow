import React from 'react';
import { prisma } from '@freightflow/db';
import { getAdminSession } from '@/app/actions/admin/auth';
import { redirect, notFound } from 'next/navigation';
import { 
  Home, ChevronRight, MessageSquare, 
  Building2, User, Key, 
  ArrowLeft, Zap
} from 'lucide-react';
import Link from 'next/link';
import { AdminChat } from '@/components/admin/admin-chat';
import { ShadowModeButton } from '@/components/admin/shadow-mode-button';

export default async function AdminTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) {
    redirect('/admin/login');
  }

  const { id } = await params;
  const request = await prisma.licenseRequest.findUnique({
    where: { id },
    include: {
      tenant: true,
      user: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        include: { 
          sender: { select: { name: true, role: true } },
          admin: { select: { email: true, role: true } }
        }
      }
    }
  });

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-6 py-4 rounded-2xl border border-slate-100 shadow-sm w-fit">
        <Link href="/admin/dashboard" className="hover:text-blue-600 transition-all flex items-center gap-2">
          <Home className="h-3.5 w-3.5" />
          Home
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-200" />
        <Link href="/admin/support" className="hover:text-blue-600 transition-all">
          Support Desk
        </Link>
        <ChevronRight className="h-3 w-3 text-slate-200" />
        <span className="text-blue-600">{request.tenant.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin/support" className="h-16 w-16 bg-white border border-slate-100 rounded-[1.5rem] flex items-center justify-center hover:border-blue-100 hover:text-blue-600 transition-all shadow-sm group">
            <ArrowLeft className="h-6 w-6 text-slate-400 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div className="flex flex-col gap-2">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter">{request.tenant.name}</h1>
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="h-3.5 w-3.5 text-blue-500" /> {request.user.name.toUpperCase()}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-100" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap className="h-3.5 w-3.5" /> {request.planType.toUpperCase()} REQUEST
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ShadowModeButton tenantId={request.tenantId} />
        </div>
      </div>

      {/* Main Chat Area */}
      <AdminChat request={request as any} adminId={session.id} />
    </div>
  );
}
