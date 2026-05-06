import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { redirect } from 'next/navigation';
import { PodManager } from '@/components/dashboard/pod-manager';

export default async function PodDashboardPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const orders = await prisma.order.findMany({
    where: {
      companyId: session.user.companyId,
      status: {
        in: ['dispatched', 'delivered', 'completed', 'pod_rejected']
      }
    },
    include: {
      podRecord: true,
      dealer: { select: { name: true } },
      consignee: { select: { name: true } }
    },
    orderBy: { date: 'desc' }
  });

  return (
    <div className="p-8 lg:p-12">
      <PodManager orders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
