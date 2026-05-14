import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, TrendingDown, Package, IndianRupee, 
  AlertCircle, Calendar, ShieldCheck, CheckCircle2, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { SystemPulse } from '@/components/dashboard/system-pulse';
import { DashboardActions } from '@/components/dashboard/dashboard-actions';
import { ActionCommandCenter } from '@/components/dashboard/action-command-center';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ComplianceCalendarWidget } from '@/components/dashboard/compliance-widget';
import { TodayLRWidget } from '@/components/dashboard/TodayLRWidget';
import { TodayPalletWidget } from '@/components/dashboard/TodayPalletWidget';
import { getSession } from '@/lib/auth-utils';
import { ReportEngine } from '@/services/report-engine';
import { redirect } from 'next/navigation';
import { DashboardChartsLazy } from '@/components/dashboard/dashboard-charts-lazy';
import { RouteIntelligenceWidget } from '@/components/dashboard/route-intelligence-widget';
import Link from 'next/link';

export default async function ExecutiveDashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/login');
  }

  const kpis = await ReportEngine.getDashboardKPIs(session.user.tenantId, session.user.companyId || '');
  const trend = kpis.revenueTrend;

  return (
    <div className="p-10 space-y-10 bg-[#f8fafc] min-h-screen">
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Mission Control</h1>
           <p className="text-slate-500 font-bold mt-1 uppercase tracking-[0.2em] text-[10px]">Production Operational Analytics • {format(new Date(), 'dd MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-3">
           <SystemPulse />
           <DashboardActions kpis={kpis} />
        </div>
      </div>

      {/* Quick Action Center */}
      <ActionCommandCenter />

      {/* High-Level KPI Matrix */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Today's LRs"
          value={kpis?.todayLrs || 0}
          trend={kpis?.lrsTrend}
          icon={<Package className="h-4 w-4" />}
          color="blue"
          footer="Active Shipments"
          link="/dashboard/orders"
        />
        <KPICard
          title="Daily Revenue"
          value={`₹${((kpis?.todayRevenue || 0) / 100).toLocaleString()}`}
          trend={kpis?.revenueTrend}
          icon={<IndianRupee className="h-4 w-4" />}
          color="emerald"
          footer="Gross Collections"
          link="/dashboard/accounts/ledger"
        />
        <KPICard
          title="Receivables"
          value={`₹${((kpis?.outstandingReceivables || 0) / 100).toLocaleString()}`}
          badge={`${kpis?.overdueCount || 0} Overdue`}
          icon={<AlertCircle className="h-4 w-4" />}
          color="amber"
          footer="Outstanding"
          link="/dashboard/accounting/ar"
        />
        <KPICard
          title="Doc Alerts"
          value={kpis?.expiringDocsCount || 0}
          icon={<ShieldCheck className="h-4 w-4" />}
          color="rose"
          footer="Next 30 Days"
          link="/dashboard/compliance"
        />
      </div>

      {/* Operational Highlights Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Main Operational Column */}
        <div className="lg:col-span-8 space-y-10">
           <TodayLRWidget />
           <TodayPalletWidget />
           <RouteIntelligenceWidget routes={kpis?.routeIntelligence} />
        </div>

        {/* Intelligence & Status Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <FinancialPulseWidget kpis={kpis} />
           <ActivityFeed data={kpis?.recentActivity} />
           <ComplianceCalendarWidget data={kpis?.compliance} />
           <MissionSettlementWidget kpis={kpis} />
        </div>
      </div>

      {/* Analytics & Intelligence Suite */}
      <div className="mt-10 space-y-10">
        <Suspense fallback={<Skeleton className="h-[500px] w-full rounded-[3rem]" />}>
           <DashboardChartsLazy kpis={kpis} trend={kpis?.revenueTrendSeries} view="analytics" />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-[3rem]" />}>
           <DashboardChartsLazy kpis={kpis} trend={kpis?.revenueTrendSeries} view="intelligence" />
        </Suspense>
      </div>
    </div>
  );
}

function MissionSettlementWidget({ kpis }: any) {
  const pendingCount = kpis?.pendingSettlements || 0;
  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
       <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
                <ShieldCheck className="h-5 w-5 text-blue-600" />
             </div>
             <div>
                <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Settlement Monitor</CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Audit Queue</p>
             </div>
          </div>
       </CardHeader>
       <CardContent className="p-8 pt-4 space-y-4">
          <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending PODs</p>
                <p className="text-xl font-black text-slate-900">{pendingCount} Missions</p>
             </div>
             <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
             </div>
          </div>
          <Link href="/dashboard/trips/pod">
            <Button variant="ghost" className="w-full text-blue-600 font-black uppercase tracking-widest text-[10px] hover:bg-blue-50 rounded-xl py-6">
               Start Batch Audit
            </Button>
          </Link>
       </CardContent>
    </Card>
  );
}

function FinancialPulseWidget({ kpis }: any) {
  const revenue = kpis?.todayRevenue || 0;
  const receivables = kpis?.outstandingReceivables || 0;
  const total = revenue + receivables;
  const revenuePct = total > 0 ? (revenue / total) * 100 : 0;
  const receivablesPct = total > 0 ? (receivables / total) * 100 : 0;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden">
       <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 rounded-2xl bg-emerald-50 flex items-center justify-center border border-emerald-100">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
             </div>
             <div>
                <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Financial Pulse</CardTitle>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Cash Flow Health</p>
             </div>
          </div>
       </CardHeader>
       <CardContent className="p-8 pt-4 space-y-6">
          <div className="space-y-2">
             <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-slate-500">
                <span>Collections</span>
                <span className="text-slate-900">₹{(revenue / 100).toLocaleString()}</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${Math.max(5, revenuePct)}%` }} />
             </div>
          </div>
          <div className="space-y-2">
             <div className="flex justify-between text-xs font-bold uppercase tracking-tight text-slate-500">
                <span>Receivables</span>
                <span className="text-slate-900">₹{(receivables / 100).toLocaleString()}</span>
             </div>
             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${Math.max(5, receivablesPct)}%` }} />
             </div>
          </div>
          <Link href="/dashboard/accounting/ledger">
            <Button variant="outline" className="w-full h-11 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50">
               Open Ledger
            </Button>
          </Link>
       </CardContent>
    </Card>
  );
}

function KPICard({ title, value, trend, badge, icon, color, footer, link }: any) {
  const colorMap: any = {
    blue: 'border-l-blue-500 text-blue-600 bg-blue-50/30',
    emerald: 'border-l-emerald-500 text-emerald-600 bg-emerald-50/30',
    amber: 'border-l-amber-500 text-amber-600 bg-amber-50/30',
    rose: 'border-l-rose-500 text-rose-600 bg-rose-50/30',
  };

  const Content = (
    <Card className={`relative overflow-hidden transition-all hover:shadow-lg border-none border-l-4 ${colorMap[color]} shadow-[0_8px_30px_rgb(0,0,0,0.03)] bg-white/80 backdrop-blur-sm rounded-2xl h-full cursor-pointer`}>
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

  if (link) {
    return <Link href={link}>{Content}</Link>;
  }

  return Content;
}
