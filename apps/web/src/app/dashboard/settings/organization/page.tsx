import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { OrganizationSettingsForm } from '@/components/dashboard/organization-settings-form';
import { BranchListSection } from '@/components/dashboard/branch-list-section';

export default async function OrganizationSettingsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
      branches: {
        orderBy: { createdAt: 'asc' }
      },
    }
  });

  if (!company) return <div>Company not found</div>;

  return (
    <div className="bg-white min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-4 divide-x divide-slate-100">
        <div className="xl:col-span-3">
          <OrganizationSettingsForm initialData={JSON.parse(JSON.stringify(company))} />
        </div>

        {/* Right Sidebar: Branch Management */}
        <BranchListSection branches={JSON.parse(JSON.stringify(company.branches))} />
      </div>
    </div>
  );
}


