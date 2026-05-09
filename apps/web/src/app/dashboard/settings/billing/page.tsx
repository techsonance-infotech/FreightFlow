import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { BillingDashboard } from '@/components/dashboard/billing-settings';

export default async function BillingPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.tenantId) redirect('/dashboard');

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId },
    include: {
      modules: true,
      licenseKeys: { orderBy: { issuedAt: 'desc' }, take: 1 },
    },
  });

  // Get real usage counts
  const [userCount, vehicleCount] = await Promise.all([
    prisma.user.count({ where: { tenantId: session.user.tenantId, isActive: true } }),
    prisma.vehicle.count({ where: { tenantId: session.user.tenantId } }),
  ]);

  const license = tenant?.licenseKeys?.[0];
  const enabledModules = tenant?.modules?.filter(m => m.isEnabled)?.length || 0;

  const billingData = {
    plan: tenant?.plan || 'starter',
    status: tenant?.status || 'active',
    licenseExpiresAt: tenant?.licenseExpiresAt?.toISOString() || null,
    createdAt: tenant?.createdAt?.toISOString() || null,
    usage: {
      users: userCount,
      maxUsers: license?.maxUsers || 5,
      vehicles: vehicleCount,
      maxVehicles: license?.maxVehicles || 10,
      modules: enabledModules,
      totalModules: tenant?.modules?.length || 0,
    },
  };

  return <BillingDashboard data={billingData} />;
}
