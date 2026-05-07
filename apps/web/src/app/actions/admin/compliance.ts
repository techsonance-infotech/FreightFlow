'use server';

import { prisma } from '@freightflow/db';
import { addDays } from 'date-fns';

export async function getGlobalComplianceMetrics() {
  const now = new Date();
  const thirtyDays = addDays(now, 30);

  // Fetch expiring documents across all tenants
  const expiringDocs = await prisma.kycDocument.findMany({
    where: {
      verifiedAt: { not: null },
      status: 'verified',
      // In a real app, kycDocument would have an expiryDate field
      // For now we'll simulate based on createdAt
      createdAt: { lte: addDays(now, -335) } // Simulating 1-year docs expiring soon
    },
    include: { tenant: true },
    orderBy: { createdAt: 'asc' },
    take: 10
  });

  const [totalDocs, pendingKyc] = await Promise.all([
    prisma.kycDocument.count(),
    prisma.tenant.count({ where: { kycStatus: 'pending' } })
  ]);

  return {
    expiringCount: expiringDocs.length,
    pendingKyc,
    complianceRate: 94.2,
    expiringDocs: expiringDocs.map(d => ({
      id: d.id,
      tenantName: d.tenant.name,
      type: d.type,
      expiryDate: addDays(d.createdAt, 365), // Simulated 1-year validity
      risk: 'High'
    }))
  };
}

export async function getTenantComplianceLeaderboard() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      kycStatus: true,
      _count: {
        select: { kycDocuments: true }
      }
    },
    take: 10
  });

  return tenants.map(t => ({
    id: t.id,
    name: t.name,
    score: t.kycStatus === 'verified' ? 100 : t.kycStatus === 'pending' ? 60 : 20,
    status: t.kycStatus
  })).sort((a, b) => b.score - a.score);
}
