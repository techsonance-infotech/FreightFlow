import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { CompanyManager } from '@/components/dashboard/company-manager';

export default async function ManageOrganizationsPage() {
  const session = await getSession();
  if (!session || !session.user) redirect('/login');

  const companies = await prisma.company.findMany({
    where: { tenantId: session.user.tenantId },
    orderBy: { createdAt: 'asc' },
    include: {
      _count: {
        select: { vehicles: true, employees: true }
      }
    }
  });

  return (
    <div className="p-4 md:p-8 lg:p-12">
      <CompanyManager 
        companies={companies.map(c => ({
          ...c,
          _count: {
            vehicles: c._count.vehicles,
            employees: c._count.employees
          }
        }))} 
        currentCompanyId={session.user.companyId || ''} 
        userRole={session.user.role}
      />
    </div>
  );
}
