import React from 'react';
import { prisma } from '@freightflow/db';
import { getAdminSession } from '@/app/actions/admin/auth';
import { redirect } from 'next/navigation';
import { 
  Home, ChevronRight, MessageSquare, 
  Building2, User, Key, 
  ArrowLeft, Zap
} from 'lucide-react';
import Link from 'next/link';
import { AdminChat } from '@/components/admin/admin-chat';

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
    return <div className="text-white p-10 font-bold">Ticket not found</div>;
  }

  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-900 px-4 py-3 rounded-xl border border-slate-800 shadow-sm w-fit">
        <Link href="/admin/dashboard" className="hover:text-blue-500 transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/admin/support" className="hover:text-blue-500 transition-colors">
          Support Desk
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-medium text-blue-500">{request.tenant.name}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/support" className="h-12 w-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors">
            <ArrowLeft className="h-6 w-6 text-slate-400" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-black text-white tracking-tighter">{request.tenant.name}</h1>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <User className="h-3 w-3" /> {request.user.name}
              </span>
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-1">
                <Zap className="h-3 w-3" /> {request.planType.toUpperCase()} Request
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <AdminChat request={request as any} adminId={session.id} />
    </div>
  );
}
