import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ data: [] });
    }

    const tenantId = session.user.tenantId;
    const companyId = session.user.companyId;

    // Perform parallel searches for performance
    const [orders, vehicles, drivers, dealers, consignors, consignees] = await Promise.all([
      // Search LRs (Orders)
      prisma.order.findMany({
        where: {
          tenantId,
          companyId,
          OR: [
            { lrNo: { contains: query, mode: 'insensitive' } },
            { gstBillNo: { contains: query, mode: 'insensitive' } },
            { ewayBillNo: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, lrNo: true },
      }),
      // Search Vehicles
      prisma.vehicle.findMany({
        where: {
          tenantId,
          companyId,
          OR: [
            { regNo: { contains: query, mode: 'insensitive' } },
            { chassisNo: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, regNo: true },
      }),
      // Search Drivers
      prisma.driver.findMany({
        where: {
          tenantId,
          companyId,
          employee: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { phone: { contains: query, mode: 'insensitive' } },
            ],
          },
        },
        take: 5,
        include: {
          employee: {
            select: { name: true },
          },
        },
      }),
      // Search Dealers
      prisma.dealer.findMany({
        where: {
          tenantId,
          companyId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { gstin: { contains: query, mode: 'insensitive' } },
            { shortName: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true },
      }),
      // Search Consignors
      prisma.consignor.findMany({
        where: {
          tenantId,
          companyId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { gstin: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true },
      }),
      // Search Consignees
      prisma.consignee.findMany({
        where: {
          tenantId,
          companyId,
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { gstin: { contains: query, mode: 'insensitive' } },
            { phone: { contains: query, mode: 'insensitive' } },
          ],
        },
        take: 5,
        select: { id: true, name: true },
      }),
    ]);

    const results = [
      ...orders.map(o => ({ id: o.id, title: `LR #${o.lrNo}`, type: 'Order', href: `/dashboard/orders/${o.id}` })),
      ...vehicles.map(v => ({ id: v.id, title: v.regNo, type: 'Vehicle', href: `/dashboard/masters/vehicles?id=${v.id}` })),
      ...drivers.map(d => ({ id: d.id, title: d.employee.name, type: 'Driver', href: `/dashboard/masters/employees?id=${d.id}` })),
      ...dealers.map(de => ({ id: de.id, title: de.name, type: 'Dealer', href: `/dashboard/masters/dealers?id=${de.id}` })),
      ...consignors.map(c => ({ id: c.id, title: c.name, type: 'Consignor', href: `/dashboard/masters/consignors?id=${c.id}` })),
      ...consignees.map(c => ({ id: c.id, title: c.name, type: 'Consignee', href: `/dashboard/masters/consignees?id=${c.id}` })),
    ];

    return NextResponse.json({ data: results });
  } catch (error) {
    console.error('Global search failed:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
