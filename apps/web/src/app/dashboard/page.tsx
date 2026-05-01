'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Package, IndianRupee, Truck, 
  Users, AlertCircle, ArrowUpRight, Activity, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { SystemPulse } from '@/components/dashboard/system-pulse';
import { ActionCommandCenter } from '@/components/dashboard/action-command-center';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ComplianceCalendarWidget } from '@/components/dashboard/compliance-widget';
import { TodayLRWidget } from '@/components/dashboard/TodayLRWidget';
import { TodayPalletWidget } from '@/components/dashboard/TodayPalletWidget';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/v1/reports/dashboard-kpis');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const { kpis, trend } = data || {};

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase">
            Command Center
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Real-time operational overview for <span className="text-blue-600">FreightFlow Pro</span>
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <SystemPulse status="online" />
          <Badge variant="outline" className="px-4 py-2 text-xs font-bold uppercase tracking-widest bg-white shadow-sm border-slate-200 text-slate-600 rounded-xl">
            <Calendar className="mr-2 h-3.5 w-3.5 text-blue-500" />
            {format(new Date(), 'EEEE, dd MMMM yyyy')}
          </Badge>
        </div>
      </div>

      {/* Quick Action Center */}
      <ActionCommandCenter />

      {/* KPI Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* ... existing KPI cards ... */}
        <KPICard 
          title="Today's LRs" 
          value={kpis?.todayLrs || 0} 
          trend={kpis?.lrsTrend} 
          icon={<Package className="h-5 w-5 text-blue-500" />}
          color="blue"
          footer="from yesterday"
        />
        <KPICard 
          title="Today's Revenue" 
          value={`₹${((kpis?.todayRevenue || 0) / 100).toLocaleString()}`} 
          trend={kpis?.revenueTrend} 
          icon={<IndianRupee className="h-5 w-5 text-emerald-500" />}
          color="emerald"
          footer="vs daily average"
        />
        <KPICard 
          title="Outstanding (AR)" 
          value={`₹${((kpis?.outstandingReceivables || 0) / 100).toLocaleString()}`} 
          badge={`${kpis?.overdueCount || 0} OVERDUE`}
          icon={<Activity className="h-5 w-5 text-amber-500" />}
          color="amber"
          footer="pending collection"
        />
        <KPICard 
          title="Compliance Alerts" 
          value={kpis?.expiringDocsCount || 0} 
          badge="ACTION REQUIRED"
          icon={<AlertCircle className="h-5 w-5 text-rose-500" />}
          color="rose"
          footer="docs expiring in 30d"
        />
      </div>

      {/* Operational Widgets Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <TodayLRWidget />
        <TodayPalletWidget />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        {/* Left Column: Analytics & Financial Insights */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Revenue Performance</CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-wider">Last 6 Months Trend</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  REVENUE
                </div>
              </div>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} 
                      tickFormatter={(value) => `₹${value/1000}k`} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                      labelStyle={{ fontSize: '10px', fontWeight: '800', marginBottom: '4px', color: '#64748b' }}
                      formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Top Customers</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider">By Revenue Share</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {kpis?.topCustomers?.map((customer: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-black text-slate-500">
                      {idx + 1}
                    </div>
                    <span className="text-sm font-bold text-slate-700">{customer.name}</span>
                  </div>
                  <span className="text-sm font-black text-blue-600">₹{(customer.revenue / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Fleet & Intelligence */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/70 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Fleet Status</CardTitle>
              <CardDescription className="text-xs font-medium uppercase tracking-wider">Real-time Utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'On Trip', value: kpis?.fleetUtilization?.onTrip || 0 },
                        { name: 'Idle', value: kpis?.fleetUtilization?.idle || 0 },
                        { name: 'Service', value: kpis?.fleetUtilization?.maintenance || 0 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#10b981" />
                      <Cell fill="#f43f5e" />
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <StatusItem label="On Trip" value={kpis?.fleetUtilization?.onTrip} color="bg-blue-500" />
                <StatusItem label="Idle" value={kpis?.fleetUtilization?.idle} color="bg-emerald-500" />
                <StatusItem label="Service" value={kpis?.fleetUtilization?.maintenance} color="bg-rose-500" />
              </div>
            </CardContent>
          </Card>

          <ActivityFeed />
          <ComplianceCalendarWidget />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, trend, badge, icon, color, footer }: any) {
  const colorMap: any = {
    blue: 'border-l-blue-500 text-blue-600 bg-blue-50/30',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-50/30',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50/30',
    rose: 'border-l-rose-500 text-rose-600 bg-rose-50/30',
  };

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg border-none border-l-4 ${colorMap[color]} shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white/80 backdrop-blur-sm rounded-2xl`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</CardTitle>
        <div className="p-2 bg-white rounded-xl shadow-sm">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-slate-900">{value}</div>
        <div className="mt-2 flex items-center gap-2">
          {trend !== undefined && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center ${trend >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {trend >= 0 ? <TrendingUp className="mr-1 h-2.5 w-2.5" /> : <TrendingDown className="mr-1 h-2.5 w-2.5" />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700">
              {badge}
            </span>
          )}
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{footer}</span>
        </div>
      </CardContent>
    </Card>
  );
}

function StatusItem({ label, value, color }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`h-1.5 w-8 rounded-full ${color}`} />
      <span className="text-[10px] font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-sm font-black text-slate-700">{value || 0}</span>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <Skeleton className="h-10 w-[250px] rounded-xl" />
        <Skeleton className="h-8 w-[180px] rounded-xl" />
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="lg:col-span-4 h-[450px] rounded-3xl" />
        <div className="lg:col-span-3 space-y-6">
          <Skeleton className="h-[280px] rounded-3xl" />
          <Skeleton className="h-[280px] rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

