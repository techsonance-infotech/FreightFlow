'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Truck, ShieldAlert, Wrench, Fuel, ArrowRight, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function FleetOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    vehicleCount: 0,
    expiringDocs: 0,
    activeMaintenance: 0,
    fuelAnomalyCount: 0,
    recentFuelEntries: [] as any[],
    recentDocs: [] as any[],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const [vRes, dRes, mRes, fRes] = await Promise.all([
        fetch('/api/v1/masters/vehicles'),
        fetch('/api/v1/fleet/documents?mode=expiring&days=30'),
        fetch('/api/v1/fleet/maintenance?status=in_progress'),
        fetch('/api/v1/fleet/fuel'),
      ]);

      const vehicles = await vRes.json();
      const expiringDocs = await dRes.json();
      const maintenance = await mRes.json();
      const fuel = await fRes.json();

      setStats({
        vehicleCount: Array.isArray(vehicles) ? vehicles.length : 0,
        expiringDocs: Array.isArray(expiringDocs) ? expiringDocs.length : 0,
        activeMaintenance: Array.isArray(maintenance) ? maintenance.length : 0,
        fuelAnomalyCount: (fuel.entries || []).filter((e: any) => e.isAnomaly).length,
        recentFuelEntries: (fuel.entries || []).slice(0, 5),
        recentDocs: Array.isArray(expiringDocs) ? expiringDocs.slice(0, 5) : [],
      });
    } catch (error) {
      console.error('Failed to load fleet stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fleet Control Center</h1>
          <p className="text-muted-foreground">Real-time overview of your vehicle fleet operations and compliance.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard/masters/vehicles">Manage Vehicles</Link>
          </Button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Vehicles</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.vehicleCount}</div>
            <p className="text-xs text-muted-foreground">Active in registry</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Expiring Docs</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.expiringDocs}</div>
            <p className="text-xs text-muted-foreground">Within next 30 days</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.activeMaintenance}</div>
            <p className="text-xs text-muted-foreground">Active job cards</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fuel Anomalies</CardTitle>
            <TrendingDown className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.fuelAnomalyCount}</div>
            <p className="text-xs text-muted-foreground">KMPL drops detected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Compliance Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Compliance Alerts</CardTitle>
              <CardDescription>Expiring documents</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/fleet/documents"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentDocs.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">All documents are up to date.</div>
            ) : (
              stats.recentDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{doc.vehicle?.regNo}</p>
                    <p className="text-xs text-muted-foreground uppercase">{doc.docType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">{format(new Date(doc.expiryDate), 'dd MMM')}</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Expires</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Maintenance Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Maintenance Status</CardTitle>
              <CardDescription>Active work orders</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/fleet/maintenance"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center h-[160px] text-center space-y-3">
              <div className="rounded-full bg-amber-50 p-3">
                <Wrench className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-sm font-medium">{stats.activeMaintenance} Vehicles in Workshop</p>
                <p className="text-xs text-muted-foreground mt-1">Monitor job card progress and mechanics.</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard/fleet/maintenance">View Workshops</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Fuel Performance Widget */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Fuel Performance</CardTitle>
              <CardDescription>Recent entries</CardDescription>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/fleet/fuel"><ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.recentFuelEntries.length === 0 ? (
              <div className="text-sm text-muted-foreground italic">No fuel entries logged yet.</div>
            ) : (
              stats.recentFuelEntries.map(entry => (
                <div key={entry.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{entry.vehicle?.regNo}</p>
                    <p className="text-xs text-muted-foreground">{entry.quantity} L @ ₹{entry.rate/100}/L</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={entry.isAnomaly ? "destructive" : "secondary"} className={!entry.isAnomaly ? "bg-emerald-50 text-emerald-700" : ""}>
                      {entry.kmpl} KMPL
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
