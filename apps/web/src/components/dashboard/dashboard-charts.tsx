'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface DashboardChartsProps {
  trend: any[];
  kpis: any;
  view?: 'analytics' | 'intelligence';
}

export function DashboardCharts({ trend, kpis, view }: DashboardChartsProps) {
  if (view === 'analytics') {
    return (
      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <RevenueTrend trend={trend} />
        </div>
        <div className="lg:col-span-4">
          <FleetStatus kpis={kpis} />
        </div>
      </div>
    );
  }

  if (view === 'intelligence') {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <IntelligenceChart title="Total Revenue Share" description="Overall Market Presence" data={kpis?.customerIntelligence?.total} color="#3b82f6" />
        <IntelligenceChart title="Box LR Analytics" description="PTL/Box Based Yield" data={kpis?.customerIntelligence?.box} color="#10b981" />
        <IntelligenceChart title="Pallet Operations" description="Inventory Distribution" data={kpis?.customerIntelligence?.pallet} color="#f59e0b" />
      </div>
    );
  }

  return null;
}

function RevenueTrend({ trend }: { trend: any[] }) {
  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[3rem] overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-8">
        <div>
          <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Revenue Performance</CardTitle>
          <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Operational Yield (Last 6 Months)</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 rounded-xl text-[10px] font-black text-blue-600 border border-blue-100">
            <Activity className="h-3.5 w-3.5" />
            LIVE TREND
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0">
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
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} tickFormatter={(value: number) => `₹${value/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function FleetStatus({ kpis }: { kpis: any }) {
  return (
    <Card className="h-full border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[3rem] overflow-hidden">
      <CardHeader className="p-8 pb-4">
        <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Fleet Status</CardTitle>
        <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Utilization</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'On Trip', value: kpis?.fleetUtilization?.onTrip || 0 },
                  { name: 'Idle', value: kpis?.fleetUtilization?.idle || 0 },
                  { name: 'Service', value: kpis?.fleetUtilization?.maintenance || 0 },
                ]}
                cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={8} dataKey="value" stroke="none"
              >
                <Cell fill="#3b82f6" />
                <Cell fill="#10b981" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 space-y-2">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-blue-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase">On Trip</span>
              </div>
              <span className="text-[10px] font-black text-slate-900">{kpis?.fleetUtilization?.onTrip || 0} Vehicles</span>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="h-2 w-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black text-slate-500 uppercase">Idle</span>
              </div>
              <span className="text-[10px] font-black text-slate-900">{kpis?.fleetUtilization?.idle || 0} Vehicles</span>
           </div>
        </div>
      </CardContent>
    </Card>
  );
}
function IntelligenceChart({ title, description, data, color }: any) {
  const hasData = data && data.length > 0;
  const COLORS = [color, '#94a3b8', '#cbd5e1', '#e2e8f0', '#f1f5f9'];

  return (
    <Card className="border-none shadow-xl shadow-slate-200/50 bg-white/70 backdrop-blur-sm rounded-[2.5rem] overflow-hidden transition-all hover:shadow-2xl">
      <CardHeader className="pb-0 p-8">
        <CardTitle className="text-sm font-black uppercase tracking-tight truncate">{title}</CardTitle>
        <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-8 pt-0">
        <div className="flex flex-col xl:flex-row items-center gap-6">
          <div className="h-[180px] w-full xl:w-[180px] shrink-0">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="amount"
                    stroke="none"
                  >
                    {data.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', padding: '12px' }}
                    formatter={(value: any) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-300">
                <Activity className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40 text-center">Awaiting Data</p>
              </div>
            )}
          </div>
          
          <div className="flex-1 space-y-3 w-full">
            {hasData ? data.slice(0, 4).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-[10px] font-black text-slate-600 uppercase truncate max-w-[140px]">{item.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-900 tracking-tighter">₹{(item.amount / 1000).toFixed(1)}k</span>
              </div>
            )) : (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-4 bg-slate-50 rounded-lg animate-pulse w-full" />
                ))}
              </div>
            )}
          </div>
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
