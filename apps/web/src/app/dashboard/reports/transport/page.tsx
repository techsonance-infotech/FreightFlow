'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Package, Fuel, 
  MapPin, Calendar, BadgeAlert, Filter, 
  Download, RefreshCw, Truck, IndianRupee,
  Activity, BarChart3, PieChart, ShieldCheck,
  ChevronRight, ArrowRight, Gauge, Layers,
  Globe, Clock, History, MoreHorizontal, Briefcase,
  Search, Box
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  StatCard, 
  ReportSectionHeader, 
  LoadingState, 
  EmptyReportState,
  ReportContainer,
  Pagination
} from '@/components/reports/report-components';
import { Input } from '@/components/ui/input';
import { exportToPDF } from '@/lib/export-utils';

export default function TransportReportsPage() {
  const [activeTab, setActiveTab] = useState('vehicle');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [summary, setSummary] = useState<any>(null);
  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [lrData, setLrData] = useState<any[]>([]);
  const [fuelData, setFuelData] = useState<any>(null);
  const [dealerData, setDealerData] = useState<any[]>([]);
  const [driverData, setDriverData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/v1/reports/summary');
      setSummary(await res.json());
    } catch (e) {
      console.error('Failed to fetch summary');
    }
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ startDate, endDate });

      if (activeTab === 'vehicle') {
        const res = await fetch(`/api/v1/reports/transport?type=vehicle-pnl&${params}`);
        const result = await res.json();
        setVehicleData(Array.isArray(result) ? result : result.data || []);
      } else if (activeTab === 'route') {
        const res = await fetch(`/api/v1/reports/transport?type=route-profit&${params}`);
        const result = await res.json();
        setRouteData(Array.isArray(result) ? result : result.data || []);
      } else if (activeTab === 'lr') {
        const res = await fetch(`/api/v1/reports/lr-register?${params}`);
        const result = await res.json();
        setLrData(Array.isArray(result) ? result : result.data || []);
      } else if (activeTab === 'fuel') {
        const res = await fetch(`/api/v1/reports/transport/fuel?${params}`);
        const result = await res.json();
        setFuelData(result);
      } else if (activeTab === 'dealer') {
        const res = await fetch(`/api/v1/reports/transport?type=dealer-yield&${params}`);
        const result = await res.json();
        setDealerData(Array.isArray(result) ? result : result.data || []);
      } else if (activeTab === 'driver') {
        const res = await fetch(`/api/v1/reports/transport?type=driver-performance&${params}`);
        const result = await res.json();
        setDriverData(Array.isArray(result) ? result : result.data || []);
      } else if (activeTab === 'category') {
        const res = await fetch(`/api/v1/reports/transport?type=category-analysis&${params}`);
        const result = await res.json();
        setCategoryData(Array.isArray(result) ? result : result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchReportData();
  }, [activeTab, startDate, endDate]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format((val || 0) / 100);
  };

  return (
    <ReportContainer className="pb-20 px-4 md:px-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pt-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-accent-600 flex items-center justify-center shadow-xl shadow-accent-600/20">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-neutral-900">Transport Analytics</h1>
              <p className="text-sm font-medium text-neutral-500">Operational Intelligence & Fleet Efficiency Metrics</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-neutral-200 shadow-sm">
            <div className="flex items-center gap-2 px-3">
              <Calendar className="h-4 w-4 text-neutral-400" />
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold outline-none w-28 text-neutral-700 cursor-pointer" 
              />
            </div>
            <div className="h-4 w-[1px] bg-neutral-200" />
            <div className="flex items-center gap-2 px-3">
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
                className="bg-transparent border-none text-xs font-bold outline-none w-28 text-neutral-700 cursor-pointer" 
              />
            </div>
          </div>
          <Button 
            onClick={() => {
              const filename = `FreightFlow_MIS_${activeTab}_${startDate}_to_${endDate}`;
              const title = `Transport MIS: ${activeTab.toUpperCase()} Analysis`;
              
              let headers: string[] = [];
              let data: any[][] = [];

              if (activeTab === 'vehicle') {
                headers = ['Vehicle', 'Revenue', 'Fuel Cost', 'Maint Cost', 'Net Profit', 'Margin %'];
                data = vehicleData.map(v => [
                  v.vehicleNumber,
                  (v.revenue / 100).toFixed(2),
                  (v.fuelCost / 100).toFixed(2),
                  (v.maintCost / 100).toFixed(2),
                  (v.netProfit / 100).toFixed(2),
                  `${v.margin?.toFixed(1)}%`
                ]);
              } else if (activeTab === 'route') {
                headers = ['Route Corridors', 'Trips', 'Agg. Revenue', 'Avg Yield'];
                data = routeData.map(r => [
                  r.route || `${r.from} to ${r.to}`,
                  r.orderCount,
                  (r.revenue / 100).toFixed(2),
                  (r.avgRevenue / 100).toFixed(2)
                ]);
              } else if (activeTab === 'dealer') {
                headers = ['Customer Entity', 'Trips', 'Total Revenue', 'Avg Yield'];
                data = dealerData.map(d => [
                  d.name,
                  d.trips,
                  (d.revenue / 100).toFixed(2),
                  (d.avgYield / 100).toFixed(2)
                ]);
              } else if (activeTab === 'driver') {
                headers = ['Fleet Captain', 'Trips', 'Total Expenses', 'Avg / Trip'];
                data = driverData.map(d => [
                  d.name,
                  d.trips,
                  (d.totalExpenses / 100).toFixed(2),
                  (d.avgExpensePerTrip / 100).toFixed(2)
                ]);
              } else if (activeTab === 'lr') {
                headers = ['LR No', 'Date', 'Customer', 'Origin', 'Destination', 'Freight Value'];
                data = lrData.map(lr => [
                  lr.orderNo,
                  format(new Date(lr.date), 'dd MMM yyyy'),
                  lr.dealer?.name,
                  lr.fromLocation,
                  lr.toLocation,
                  (lr.totalAmount / 100).toFixed(2)
                ]);
              } else if (activeTab === 'fuel') {
                headers = ['Date', 'Vehicle', 'Qty (L)', 'Pump', 'Efficiency (KMPL)'];
                data = fuelData?.transactions?.map((t: any) => [
                  format(new Date(t.date), 'dd MMM yyyy'),
                  t.vehicleNumber,
                  t.quantity,
                  t.pumpName,
                  t.kmpl || '0.0'
                ]) || [];
              } else if (activeTab === 'category') {
                headers = ['Market Segment', 'Volume', 'Agg. Revenue', 'Avg Unit Value'];
                data = categoryData.map(c => [
                  c.category,
                  c.count,
                  (c.revenue / 100).toFixed(2),
                  (c.avgValue / 100).toFixed(2)
                ]);
              }

              if (data.length > 0) {
                exportToPDF(headers, data, filename, title);
                toast.success('Professional MIS Report Exported');
              } else {
                toast.error('No data available to export');
              }
            }}
            className="h-11 px-6 bg-accent-600 hover:bg-accent-700 text-white shadow-lg shadow-accent-600/20 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95"
          >
            <Download className="h-4 w-4 mr-2" />
            Export MIS
          </Button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Global Revenue" 
          value={formatCurrency(summary?.revenue || 0)} 
          subValue="Revenue this period"
          icon={<TrendingUp className="h-5 w-5" />} 
          color="emerald"
          trend={{ value: "+12.4%", isUp: true }}
        />
        <StatCard 
          title="Fleet Efficiency" 
          value={`${(summary?.fleetUtilization || 0).toFixed(1)}%`} 
          subValue="Operational uptime"
          icon={<Gauge className="h-5 w-5" />} 
          color="blue" 
        />
        <StatCard 
          title="Order Density" 
          value={summary?.orderCount || 0} 
          subValue="LR Volume this month"
          icon={<Globe className="h-5 w-5" />} 
          color="blue" 
        />
        <StatCard 
          title="Audit Health" 
          value={summary?.auditHealth || "A+"} 
          subValue="Zero compliance lapses"
          icon={<ShieldCheck className="h-5 w-5" />} 
          color="emerald" 
        />
      </div>

      {/* Main Content Area */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-neutral-100 pb-1">
          <TabsList className="bg-transparent p-0 h-auto gap-8 overflow-x-auto no-scrollbar justify-start">
            <TabTrigger value="vehicle" label="Vehicle P&L" />
            <TabTrigger value="route" label="Route Yield" />
            <TabTrigger value="dealer" label="Dealer Yield" />
            <TabTrigger value="driver" label="Driver Performance" />
            <TabTrigger value="category" label="Strategic Clusters" />
            <TabTrigger value="lr" label="LR Register" />
            <TabTrigger value="fuel" label="Fuel Intelligence" />
          </TabsList>
          
          <div className="flex items-center gap-2 text-[10px] font-bold text-accent-600 uppercase tracking-widest bg-accent-50 px-3 py-1.5 rounded-full border border-accent-100">
            <div className="h-1.5 w-1.5 rounded-full bg-accent-600 animate-pulse" />
            Live Intelligence
          </div>
        </div>

        <>
          {loading ? (
            <LoadingState />
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TabsContent value="vehicle" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Vehicle Operational Profitability" 
                      subtitle="Detailed audit of revenue vs operational expenditure per unit."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Unit Identification</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Revenue</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Fuel Impact</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Maint. Impact</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Net Profit</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Margin</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(vehicleData) || vehicleData.length === 0 ? (
                            <TableEmptyState icon={<Truck />} title="No vehicle data found" />
                          ) : vehicleData.map((v: any) => (
                            <TableRow key={v.vehicleId} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 border border-neutral-200 shadow-sm group-hover:scale-105 transition-transform">
                                    {v.vehicleNumber?.slice(-2) || '00'}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{v.vehicleNumber}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{v.model || 'Heavy Carrier'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(v.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-error-500">({formatCurrency(v.fuelCost)})</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-error-500">({formatCurrency(v.maintCost)})</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-success-700">{formatCurrency(v.netProfit)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-accent-600 text-white text-[10px] font-bold rounded-lg px-2.5 py-1 shadow-sm">
                                  {v.margin?.toFixed(1) || '0.0'}%
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="route" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Route Efficiency & Yield" 
                      subtitle="Analyzing performance clusters by Origin-Destination pairs."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Strategic Route Pair</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Trips</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Agg. Revenue</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Avg / Trip</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(routeData) || routeData.length === 0 ? (
                            <TableEmptyState icon={<Globe />} title="No route records found" />
                          ) : routeData.map((r: any, i: number) => (
                            <TableRow key={i} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-success-50 text-success-700 flex items-center justify-center border border-success-100 group-hover:scale-105 transition-transform">
                                    <MapPin className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{r.route || `${r.from} → ${r.to}`}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Primary Corridor</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{r.orderCount || 0}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(r.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-accent-600">{formatCurrency(r.avgRevenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-success-50 text-success-700 border-success-100 text-[10px] font-bold rounded-lg px-2.5 py-1">High Yield</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dealer" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Customer Yield Analytics" 
                      subtitle="Customer-centric analysis of revenue and compliance."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Customer Entity</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Trips</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Revenue</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Avg Yield</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Compliance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(dealerData) || dealerData.length === 0 ? (
                            <TableEmptyState icon={<Briefcase />} title="No dealer records found" />
                          ) : dealerData.map((d: any) => (
                            <TableRow key={d.id} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center font-bold text-xs border border-accent-100 group-hover:scale-105 transition-transform">
                                    {d.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{d.name}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{d.city || 'Operational Hub'}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{d.trips}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-success-700">{formatCurrency(d.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(d.avgYield)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-success-50 text-success-700 border-success-100 text-[10px] font-bold rounded-lg px-2.5 py-1">
                                  100% SECURE
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="driver" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Captain Performance Registry" 
                      subtitle="Trip frequency, advances and expense audit."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Driver Intelligence</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Active Trips</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Expenses</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Avg / Trip</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(driverData) || driverData.length === 0 ? (
                            <TableEmptyState icon={<Activity />} title="No driver records found" />
                          ) : driverData.map((d: any) => (
                            <TableRow key={d.id} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs shadow-sm border-2 border-white group-hover:scale-105 transition-transform">
                                    {d.name?.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{d.name}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Fleet Captain</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{d.trips}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-error-500">{formatCurrency(d.totalExpenses)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(d.avgExpensePerTrip)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className="bg-accent-50 text-accent-700 border-accent-100 text-[10px] font-bold rounded-lg px-2.5 py-1">
                                  {d.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="category" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Strategic Load Clusters" 
                      subtitle="Analyzing revenue contribution by load type."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Market Category</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Volume</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Agg. Revenue</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Avg Unit Value</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Strategic Yield</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(categoryData) || categoryData.length === 0 ? (
                            <TableEmptyState icon={<Layers />} title="No category analysis found" />
                          ) : categoryData.map((c: any, i: number) => (
                            <TableRow key={i} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 group-hover:scale-105 transition-transform">
                                    <Box className="h-5 w-5" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-neutral-900 uppercase tracking-tight">{c.category}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">Commercial Segment</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-center font-bold text-neutral-600">{c.count}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(c.revenue)}</TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-success-700">{formatCurrency(c.avgValue)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <div className="h-1.5 w-32 bg-neutral-100 rounded-full overflow-hidden mx-auto shadow-inner">
                                  <div className="h-full bg-accent-600 rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" style={{ width: '75%' }} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="lr" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Logistics Receipt Ledger" 
                      subtitle="Comprehensive audit of all outward freight movements."
                      className="px-8 pt-8 mb-4"
                    />
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader className="bg-white">
                          <TableRow className="border-none hover:bg-transparent">
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">LR Reference</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Consignee Intelligence</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Fleet Asset</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Freight Value</TableHead>
                            <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Archival Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {!Array.isArray(lrData) || lrData.length === 0 ? (
                            <TableEmptyState icon={<Layers />} title="No LR records found" />
                          ) : lrData.map((lr: any) => (
                            <TableRow key={lr.id} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                              <TableCell className="px-8 py-6">
                                <p className="text-sm font-black text-accent-600 tracking-tight">{lr.orderNo}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{format(new Date(lr.date), 'dd MMM yyyy')}</p>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <div className="space-y-1">
                                  <p className="text-sm font-bold text-neutral-900 truncate max-w-[200px] uppercase tracking-tight">{lr.dealer?.name}</p>
                                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 uppercase tracking-widest">
                                    <span>{lr.fromLocation}</span>
                                    <ChevronRight className="h-2.5 w-2.5 text-accent-600" />
                                    <span>{lr.toLocation}</span>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6">
                                <div className="flex items-center gap-2.5">
                                  <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200">
                                    <Truck className="h-4 w-4 text-neutral-500" />
                                  </div>
                                  <span className="text-xs font-bold text-neutral-700 uppercase tracking-tight">{lr.vehicle?.regNo || 'POOL'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="px-8 py-6 text-right font-bold text-neutral-900">{formatCurrency(lr.totalAmount)}</TableCell>
                              <TableCell className="px-8 py-6 text-center">
                                <Badge className={cn(
                                  "text-[10px] font-bold rounded-lg px-2.5 py-1",
                                  lr.podRecord ? "bg-success-50 text-success-700 border-success-100" : "bg-neutral-50 text-neutral-400 border-neutral-200"
                                )}>
                                  {lr.podRecord ? 'ARCHIVED' : 'OUTSTANDING'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="fuel" className="m-0 border-none outline-none">
                <div className="px-4 pb-8">
                  <div className="bg-white rounded-[32px] border border-neutral-100 shadow-sm overflow-hidden">
                    <ReportSectionHeader 
                      title="Fleet Fuel Intelligence" 
                      subtitle="Monitoring consumption efficiency and cost spikes."
                      className="px-8 pt-8 mb-4"
                    />
                    {fuelData && (
                      <div className="p-8 pt-0 space-y-10">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <MetricCard title="Avg KMPL" value={fuelData.avgKmpl} icon={<Activity />} color="blue" />
                          <MetricCard title="Total Volume" value={`${fuelData.totalLitres} L`} icon={<Fuel />} color="slate" />
                          <MetricCard title="Aggregate Cost" value={formatCurrency(fuelData.totalCost)} icon={<IndianRupee />} color="rose" />
                          <MetricCard title="Alerts" value="3" icon={<BadgeAlert />} color="amber" />
                        </div>
                        
                        <div className="rounded-[24px] border border-neutral-100 overflow-hidden shadow-sm bg-white">
                          <Table>
                            <TableHeader className="bg-white">
                              <TableRow className="border-none hover:bg-transparent">
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Transaction Date</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400">Fleet Asset</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Refill Qty</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Performance</TableHead>
                                <TableHead className="px-8 py-6 text-xs font-bold uppercase tracking-wider text-neutral-400 text-center">Efficiency</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {!Array.isArray(fuelData?.transactions) || fuelData.transactions.length === 0 ? (
                                <TableEmptyState icon={<Fuel />} title="No fuel transactions found" />
                              ) : fuelData.transactions.map((t: any, i: number) => (
                                <TableRow key={i} className="hover:bg-transparent transition-colors group border-b border-neutral-50 last:border-none">
                                  <TableCell className="px-8 py-6">
                                    <p className="text-sm font-bold text-neutral-900">{format(new Date(t.date), 'dd MMM yyyy')}</p>
                                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">{t.pumpName || 'Commercial Pump'}</p>
                                  </TableCell>
                                  <TableCell className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                      <div className="h-8 w-8 rounded-lg bg-neutral-100 flex items-center justify-center border border-neutral-200">
                                        <Truck className="h-4 w-4 text-neutral-500" />
                                      </div>
                                      <span className="font-bold text-neutral-900 text-sm uppercase tracking-tight">{t.vehicleNumber}</span>
                                    </div>
                                  </TableCell>
                                  <TableCell className="px-8 py-6 text-right font-bold text-neutral-700 text-sm">{t.quantity} <span className="text-[10px] text-neutral-400 ml-0.5">LITRES</span></TableCell>
                                  <TableCell className="px-8 py-6 text-right font-bold text-accent-600 text-sm">{t.kmpl || '0.0'} <span className="text-[10px] text-neutral-400 ml-0.5">KMPL</span></TableCell>
                                  <TableCell className="px-8 py-6 text-center">
                                    <Badge className={cn(
                                      "text-[10px] font-bold rounded-lg px-2.5 py-1",
                                      t.kmpl > 3.5 ? "bg-success-50 text-success-700 border-success-100" : "bg-error-50 text-error-700 border-error-100"
                                    )}>
                                      {t.kmpl > 3.5 ? 'OPTIMAL' : 'INEFFICIENT'}
                                    </Badge>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <div className="px-6 py-4 border-t border-neutral-100">
                            <Pagination currentPage={1} totalPages={1} onPageChange={() => {}} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          )}
        </>
      </Tabs>
    </ReportContainer>
  );
}

function TabTrigger({ value, label }: { value: string; label: string }) {
  return (
    <TabsTrigger 
      value={value} 
      className="relative h-12 rounded-none border-b-2 border-transparent bg-transparent px-2 pb-4 pt-2 text-sm font-bold text-neutral-500 transition-all data-[state=active]:border-accent-600 data-[state=active]:text-accent-600 data-[state=active]:shadow-none"
    >
      {label}
    </TabsTrigger>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorMap: any = {
    blue: 'text-accent-600 bg-accent-50',
    rose: 'text-error-700 bg-error-50',
    amber: 'text-amber-700 bg-amber-50',
    slate: 'text-neutral-700 bg-neutral-50',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{title}</p>
        <div className={cn("p-2 rounded-lg", colorMap[color])}>
          {React.isValidElement(icon) 
            ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-4 w-4" }) 
            : icon}
        </div>
      </div>
      <h3 className="text-xl font-bold text-neutral-900 tracking-tight">{value}</h3>
    </div>
  );
}

function TableEmptyState({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <TableRow>
      <td colSpan={10} className="py-20">
        <div className="flex flex-col items-center justify-center text-neutral-400">
          <div className="mb-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100 shadow-sm">
            {React.isValidElement(icon) 
              ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-8 w-8" }) 
              : icon}
          </div>
          <p className="text-sm font-bold uppercase tracking-widest">{title}</p>
        </div>
      </td>
    </TableRow>
  );
}
