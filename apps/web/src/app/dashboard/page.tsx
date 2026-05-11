import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, Package, IndianRupee, 
  AlertCircle, Activity, Calendar
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
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';
import { redirect } from 'next/navigation';
import { DashboardChartsLazy } from '@/components/dashboard/dashboard-charts-lazy';

export default async function ExecutiveDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const { tenantId, companyId } = session.user;

  // Simultaneous Server-Side Data Fetching (Fastest Method)
  const [kpis, trend] = await Promise.all([
    ReportEngine.getDashboardKPIs(tenantId, companyId),
    ReportEngine.getRevenueTrend(tenantId, companyId),
  ]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent uppercase">
            Command Center
          </h2>
          <p className="text-slate-500 font-medium mt-1">
            Real-time operational overview for <span className="text-blue-600">FreightFlow</span>
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

      {/* KPI Row - Rendered instantly on server */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      {/* Heavy Charts - Lazy Loaded on Client */}
      <Suspense fallback={<Skeleton className="h-[450px] w-full rounded-3xl" />}>
        <DashboardChartsLazy kpis={kpis} trend={trend} />
      </Suspense>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4" /> {/* Spacer for chart layout alignment if needed */}
        <div className="lg:col-span-3 space-y-6">
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
