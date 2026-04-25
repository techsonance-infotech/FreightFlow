'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportViewer } from '@/components/reports/report-viewer';
import { toast } from 'sonner';

export default function TransportReportsPage() {
  const [loading, setLoading] = useState(false);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);

  const fetchVehiclePnL = async (filters?: any) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: 'vehicle-pnl', ...filters });
      const res = await fetch(`/api/v1/reports/transport?${params}`);
      const data = await res.json();
      setVehicleData(data || []);
    } catch (error) {
      toast.error('Failed to load vehicle report');
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteProfit = async (filters?: any) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: 'route-profit', ...filters });
      const res = await fetch(`/api/v1/reports/transport?${params}`);
      const data = await res.json();
      setRouteData(data || []);
    } catch (error) {
      toast.error('Failed to load route report');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val / 100);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transport MIS</h2>
      </div>

      <Tabs defaultValue="vehicle" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicle">Vehicle-wise P&L</TabsTrigger>
          <TabsTrigger value="route">Route Profitability</TabsTrigger>
          <TabsTrigger value="fuel" disabled>Fuel Consumption</TabsTrigger>
        </TabsList>

        <TabsContent value="vehicle" className="space-y-4">
          <ReportViewer
            title="Vehicle Profit & Loss"
            subtitle="Freight revenue vs Fuel and Maintenance costs"
            data={vehicleData}
            isLoading={loading}
            onFilterChange={fetchVehiclePnL}
            columns={[
              { key: 'regNo', label: 'Vehicle No' },
              { key: 'model', label: 'Model' },
              { key: 'revenue', label: 'Revenue', format: (v) => formatCurrency(v) },
              { key: 'expenses', label: 'Expenses', format: (v) => <span className="text-red-500">{formatCurrency(v)}</span> },
              { key: 'netProfit', label: 'Net Profit', format: (v) => <span className={v > 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>{formatCurrency(v)}</span> },
              { key: 'margin', label: 'Margin %', format: (v) => <span>{v.toFixed(1)}%</span> },
            ]}
          />
        </TabsContent>

        <TabsContent value="route" className="space-y-4">
          <ReportViewer
            title="Route Profitability"
            subtitle="Performance by Origin-Destination pairs"
            data={routeData}
            isLoading={loading}
            onFilterChange={fetchRouteProfit}
            columns={[
              { key: 'route', label: 'Route (From - To)' },
              { key: 'orderCount', label: 'Trips' },
              { key: 'revenue', label: 'Total Revenue', format: (v) => formatCurrency(v) },
              { key: 'avgRevenue', label: 'Avg / Trip', format: (v) => formatCurrency(v) },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
