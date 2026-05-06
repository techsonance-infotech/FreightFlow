import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { TeamManager } from '@/components/dashboard/team-manager';

export default async function TeamSettingsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  // Verify user has permission (Owner, Admin, or HR Manager)
  const adminRoles = ['owner', 'admin', 'tenant_owner', 'super_admin', 'hr_manager'];
  if (!adminRoles.includes(session.user.role)) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-2xl font-black text-slate-900">Access Restricted</h2>
        <p className="text-slate-500 mt-2">Only Business Owners, Administrators, and HR Managers can manage team members.</p>
      </div>
    );
  }

  const users = await prisma.user.findMany({
    where: { companyId: session.user.companyId },
    include: {
      branch: {
        select: { name: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const branches = await prisma.branch.findMany({
    where: { companyId: session.user.companyId, isActive: true },
    select: { id: true, name: true }
  });

  return (
    <div className="bg-white min-h-screen">
      <TeamManager 
        users={JSON.parse(JSON.stringify(users))} 
        branches={branches} 
        currentUserId={session.user.id}
      />
    </div>
  );
}
