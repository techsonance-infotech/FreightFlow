import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { OrganizationSettingsForm } from '@/components/dashboard/organization-settings-form';
import { BranchListSection } from '@/components/dashboard/branch-list-section';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function OrganizationSettingsPage({
  searchParams
}: {
  searchParams: { id?: string }
}) {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  const companyId = searchParams.id || session.user.companyId;

  if (!companyId) redirect('/dashboard/settings/organizations');

  const company = await prisma.company.findFirst({
    where: { 
      id: companyId,
      tenantId: session.user.tenantId
    },
    include: {
      branches: {
        orderBy: { createdAt: 'asc' }
      },
    }
  });

  if (!company) return (
    <div className="p-20 text-center">
      <h2 className="text-xl font-bold text-slate-900">Organization not found</h2>
      <p className="text-slate-500 mt-2">The requested organization could not be found in your account.</p>
      <Link href="/dashboard/settings/organizations" className="inline-flex items-center gap-2 mt-6 text-blue-600 font-bold hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Organizations
      </Link>
    </div>
  );

  return (
    <div className="bg-transparent">
      <div className="px-8 pt-10 lg:px-12 lg:pt-12 relative z-10">
        <Link 
          href="/dashboard/settings/organizations" 
          className="inline-flex items-center gap-2.5 px-4 py-2 -ml-4 rounded-xl hover:bg-slate-100/50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 transition-all group"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
          Back to Organizations
        </Link>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-4 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
        <div className="xl:col-span-3">
          <OrganizationSettingsForm initialData={JSON.parse(JSON.stringify(company))} />
        </div>

        {/* Right Sidebar: Branch Management */}
        <div className="xl:col-span-1">
          <BranchListSection branches={JSON.parse(JSON.stringify(company.branches))} />
        </div>
      </div>
    </div>
  );
}


