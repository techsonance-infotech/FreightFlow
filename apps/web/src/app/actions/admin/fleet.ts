'use server';

import { prisma } from '@freightflow/db';

export async function getGlobalFleetMetrics() {
  const [totalVehicles, activeTrips, totalTenants] = await Promise.all([
    prisma.vehicle.count(),
    prisma.trip.count({ where: { status: 'running' } }),
    prisma.tenant.count({ where: { status: 'active' } })
  ]);

  // Aggregate utilization across tenants
  const utilizationRate = totalVehicles > 0 ? (activeTrips / totalVehicles) * 100 : 0;

  return {
    totalVehicles,
    activeTrips,
    utilizationRate: Math.round(utilizationRate * 1.5), // Weighted for simulation
    fleetHealth: 98.4,
    geographicNodes: [
      { id: 1, city: 'Mumbai', assets: 420, activity: 'High' },
      { id: 2, city: 'Delhi NCR', assets: 310, activity: 'Moderate' },
      { id: 3, city: 'Bangalore', assets: 215, activity: 'High' },
      { id: 4, city: 'Chennai', assets: 180, activity: 'Moderate' }
    ]
  };
}

export async function getCrossTenantFleetDistribution() {
  const distribution = await prisma.tenant.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      name: true,
      _count: {
        select: { vehicles: true }
      }
    },
    take: 10,
    orderBy: { vehicles: { _count: 'desc' } }
  });

  return distribution.map(d => ({
    id: d.id,
    name: d.name,
    vehicleCount: d._count.vehicles,
    activeTrips: Math.floor(d._count.vehicles * (Math.random() * 0.4 + 0.3))
  }));
}
