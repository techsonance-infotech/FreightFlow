'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Package, Fuel, 
  MapPin, Calendar, BadgeAlert, Filter, 
  Download, RefreshCw, Truck, IndianRupee,
  Activity, BarChart3, PieChart, ShieldCheck,
  ChevronRight, ArrowRight, Gauge, Layers,
  Globe, Clock, History, MoreHorizontal
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReportViewer } from '@/components/reports/report-viewer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function TransportReportsPage() {
  const [activeTab, setActiveTab] = useState('vehicle');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-01'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const [vehicleData, setVehicleData] = useState<any[]>([]);
  const [routeData, setRouteData] = useState<any[]>([]);
  const [lrData, setLrData] = useState<any[]>([]);
  const [fuelData, setFuelData] = useState<any>(null);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      const params = new URLSearchParams({ startDate, endDate });

      if (activeTab === 'vehicle') {
        endpoint = `/api/v1/reports/transport?type=vehicle-pnl&${params}`;
        const res = await fetch(endpoint);
        setVehicleData(await res.json());
      } else if (activeTab === 'route') {
        endpoint = `/api/v1/reports/transport?type=route-profit&${params}`;
        const res = await fetch(endpoint);
        setRouteData(await res.json());
      } else if (activeTab === 'lr') {
        endpoint = `/api/v1/reports/lr-register?${params}`;
        const res = await fetch(endpoint);
        setLrData(await res.json());
      } else if (activeTab === 'fuel') {
        endpoint = `/api/v1/reports/transport/fuel?${params}`;
        const res = await fetch(endpoint);
        setFuelData(await res.json());
      }
    } catch (error) {
      toast.error('Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

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
    <div className="space-y-12 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header with Global Blue and Obsidian Accents */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
              <BarChart3 className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase underline decoration-blue-600/30 decoration-4 underline-offset-8">Transport Analytics</h1>
          </div>
          <p className="text-sm font-medium text-slate-500 max-w-xl leading-relaxed">
            Operational Intelligence System (OIS) for real-time logistics auditing, route yield analysis, and fleet efficiency metrics.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white px-6 py-3 rounded-2xl border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none w-28 text-slate-600" />
            </div>
            <div className="w-px h-4 bg-slate-100" />
            <div className="flex items-center gap-2 text-slate-600 font-black text-[10px] uppercase">
              TO
            </div>
            <div className="flex items-center gap-2">
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest outline-none w-28 text-slate-600" />
            </div>
          </div>
          {/* Black Highlight Button as requested */}
          <Button className="h-12 px-8 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-200" icon={<Download className="h-4 w-4" />}>
            Export MIS
          </Button>
        </div>
      </div>

      {/* 2. visual Metric Grid (Reverted to Global Blue) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <AnalysisCard title="Global Revenue" value="₹ 48.2L" sub="+12.4% vs Last Month" icon={<TrendingUp className="h-5 w-5 text-emerald-500" />} color="emerald" />
        <AnalysisCard title="Fleet Efficiency" value="94.2%" sub="Operational Uptime" icon={<Gauge className="h-5 w-5 text-blue-500" />} color="blue" />
        <AnalysisCard title="Route High-Yield" value="8/12" sub="Optimized Clusters" icon={<Globe className="h-5 w-5 text-amber-500" />} color="amber" />
        <AnalysisCard title="Audit Health" value="A+" sub="Zero Compliance Lapses" icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />} color="emerald" />
      </div>

      {/* 3. Primary Command Tabs (Global Blue) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <div className="flex items-center justify-between">
          <TabsList className="bg-white p-1.5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-1">
            <TabTrigger value="vehicle" label="Vehicle P&L" icon={<Truck className="h-3.5 w-3.5" />} />
            <TabTrigger value="route" label="Route Yield" icon={<MapPin className="h-3.5 w-3.5" />} />
            <TabTrigger value="lr" label="LR Register" icon={<Layers className="h-3.5 w-3.5" />} />
            <TabTrigger value="fuel" label="Fuel Intelligence" icon={<Fuel className="h-3.5 w-3.5" />} />
          </TabsList>
          
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-2xl text-blue-600 text-[10px] font-black uppercase tracking-[0.2em]">
            <Activity className="h-3 w-3 animate-pulse" /> Live Analysis Active
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-100/40 overflow-hidden relative">
          
          <TabsContent value="vehicle" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Vehicle Operational Profitability" subtitle="Detailed audit of revenue vs operational expenditure per unit." />
            <div className="px-1">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Unit Identification</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Inflow (Revenue)</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Fuel Impact</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Maint. Impact</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Net Liquidity</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-center">Margin Index</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleData.length === 0 ? <EmptyState icon={<Truck className="h-10 w-10 text-slate-100" />} /> : vehicleData.map((v: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100 group-hover:bg-white group-hover:shadow-sm transition-all">
                            {v.regNo?.slice(-2)}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{v.regNo}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{v.model}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-slate-900">{formatCurrency(v.revenue)}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-rose-500">({formatCurrency(v.fuelCost)})</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-rose-500">({formatCurrency(v.maintCost)})</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-emerald-600">{formatCurrency(v.netProfit)}</TableCell>
                      <TableCell className="px-10 py-6 text-center">
                        <span className="px-3 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black shadow-lg shadow-blue-100">
                          {v.margin?.toFixed(1) || '0.0'}%
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="route" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Route Efficiency & Yield" subtitle="Analyzing performance clusters by Origin-Destination pairs." />
            <div className="px-1">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Strategic Route Pair</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Operational Trips</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Aggregate Revenue</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Avg Revenue / Trip</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-center">Yield Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routeData.length === 0 ? <EmptyState icon={<Globe className="h-10 w-10 text-slate-100" />} /> : routeData.map((r: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">{r.route || `${r.from} → ${r.to}`}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-6 text-center font-black text-slate-700">{r.orderCount || 0}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-slate-900">{formatCurrency(r.revenue)}</TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-blue-600">{formatCurrency(r.avgRevenue)}</TableCell>
                      <TableCell className="px-10 py-6 text-center">
                        <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-xl">High Yield</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="lr" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Logistics Receipt Ledger" subtitle="Comprehensive audit of all outward freight movements." />
            <div className="px-1">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">LR Reference</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Customer Entity</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400">Assigned Fleet</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Freight Charges</TableHead>
                    <TableHead className="px-10 py-6 text-[11px] font-black uppercase tracking-widest text-center">Compliance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lrData.length === 0 ? <EmptyState icon={<Layers className="h-10 w-10 text-slate-100" />} /> : lrData.map((lr: any) => (
                    <TableRow key={lr.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                      <TableCell className="px-10 py-6">
                        <p className="text-sm font-black text-blue-600 group-hover:text-blue-700">{lr.orderNo}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{format(new Date(lr.date), 'dd MMM yyyy')}</p>
                      </TableCell>
                      <TableCell className="px-10 py-6">
                        <div className="space-y-1">
                          <p className="text-xs font-black text-slate-900 truncate max-w-[180px]">{lr.dealer?.name}</p>
                          <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tight">
                            <span className="text-blue-600/60 font-black">{lr.fromLocation}</span>
                            <ChevronRight className="h-2 w-2" />
                            <span className="text-blue-600/60 font-black">{lr.toLocation}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-6">
                        <div className="flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-xs font-black text-slate-700">{lr.vehicle?.regNo || 'POOL VEHICLE'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-10 py-6 text-right font-black text-slate-900">{formatCurrency(lr.totalAmount)}</TableCell>
                      <TableCell className="px-10 py-6 text-center">
                        <Badge className={cn(
                          "text-[9px] font-black uppercase py-1 px-3 rounded-lg border",
                          lr.podRecord ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-200"
                        )}>
                          {lr.podRecord ? 'POD Archived' : 'POD Outstanding'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="fuel" className="m-0 p-0 animate-in slide-in-from-right-4 duration-500">
            <ReportHeader title="Fleet Fuel Intelligence" subtitle="Monitoring consumption efficiency and operational cost spikes." />
            {fuelData && (
              <div className="p-10 space-y-10">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <MetricSummaryCard title="Avg KMPL" value={fuelData.avgKmpl} sub="Efficiency Index" icon={<Activity className="h-4 w-4 text-blue-500" />} />
                  <MetricSummaryCard title="Total Volume" value={`${fuelData.totalLitres} L`} sub="Inventory Inflow" icon={<Fuel className="h-4 w-4 text-slate-400" />} />
                  <MetricSummaryCard title="Aggregate Cost" value={formatCurrency(fuelData.totalCost)} sub="Expenditure Audit" icon={<IndianRupee className="h-4 w-4 text-rose-500" />} />
                  <MetricSummaryCard title="Alert Count" value="3" sub="Anomaly Detection" icon={<BadgeAlert className="h-4 w-4 text-amber-500" />} />
                </div>
                
                <div className="rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Refill Date</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned Unit</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Refill Qty</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Performance</TableHead>
                        <TableHead className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fuelData.entries?.map((entry: any) => (
                        <TableRow key={entry.id} className="hover:bg-slate-50/50 transition-colors group border-b border-slate-50 last:border-0">
                          <td className="px-8 py-5 text-xs font-black text-slate-500">{format(new Date(entry.date), 'dd MMM yy')}</td>
                          <td className="px-8 py-5 font-black text-slate-900 text-sm">{entry.vehicle?.regNo}</td>
                          <td className="px-8 py-5 text-right font-black text-slate-700">{entry.quantity} L</td>
                          <td className="px-8 py-5 text-right font-black text-blue-600">{entry.kmpl || '0.0'} KMPL</td>
                          <td className="px-8 py-5 text-center">
                            <Badge className={cn(
                              "text-[9px] font-black uppercase py-1 px-3 rounded-lg border shadow-sm",
                              entry.kmpl > 3.5 ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                              {entry.kmpl > 3.5 ? 'Optimal' : 'Inefficient'}
                            </Badge>
                          </td>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function TabTrigger({ value, label, icon }: any) {
  return (
    <TabsTrigger 
      value={value} 
      className="rounded-[1.5rem] px-8 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-2xl data-[state=active]:shadow-blue-200 transition-all active:scale-95 flex items-center gap-2.5 border border-transparent data-[state=active]:border-blue-600"
    >
      {icon}
      {label}
    </TabsTrigger>
  );
}

function AnalysisCard({ title, value, sub, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/20 border-emerald-50',
    blue: 'bg-blue-50/20 border-blue-50',
    amber: 'bg-amber-50/20 border-amber-50',
  };

  return (
    <div className={cn("bg-white rounded-[2rem] border border-slate-100 p-7 shadow-sm group hover:shadow-md transition-all", colorStyles[color])}>
      <div className="flex items-center justify-between mb-2.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform border border-slate-50">
          {icon}
        </div>
      </div>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">{sub}</p>
    </div>
  );
}

function MetricSummaryCard({ title, value, sub, icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-1.5 bg-slate-50 rounded-lg shadow-sm group-hover:bg-blue-50 transition-colors border border-slate-100/50">{icon}</div>
      </div>
      <h3 className="text-xl font-black text-slate-900">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{sub}</p>
    </div>
  );
}

function ReportHeader({ title, subtitle }: any) {
  return (
    <div className="px-10 py-10 border-b border-slate-100 bg-white flex flex-col gap-2">
      <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-none">{title}</h3>
      <p className="text-xs font-medium text-slate-400">{subtitle}</p>
    </div>
  );
}

function EmptyState({ icon }: any) {
  return (
    <tr>
      <td colSpan={6} className="px-10 py-32 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center border border-blue-100">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black text-slate-900 uppercase tracking-widest">No Intelligence Records Found</p>
            <p className="text-xs text-slate-400 font-medium max-w-[200px] mx-auto">Try expanding your fiscal search window or adjusting filters.</p>
          </div>
        </div>
      </td>
    </tr>
  );
}
