import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { redirect } from 'next/navigation';
import { getMyLicenseRequest } from '@/app/actions/license-request';
import { LicenseChat } from '@/components/license/license-chat';
import { Shield, MessageSquare, LogOut, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { verifyTenantLicense } from '@/lib/license-utils';

export default async function SupportPage() {
  const session = await getSession();
  if (!session || !session.user) {
    redirect('/login');
  }

  const initialRequest = await getMyLicenseRequest();
  const licenseStatus = await verifyTenantLicense(session.user.tenantId);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Isolated Header */}
      <div className="flex items-center justify-between bg-white px-8 py-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">License Support</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Super Admin Channel</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {licenseStatus.valid && (
            <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          )}
          <form action="/api/auth/logout" method="POST">
             <button type="submit" className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                <LogOut className="h-4 w-4" />
                Sign Out
             </button>
          </form>
        </div>
      </div>

      {/* Chat Component */}
      <LicenseChat initialRequest={initialRequest as any} />
    </div>
  );
}
