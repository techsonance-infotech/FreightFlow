'use client';

import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface DashboardChartsProps {
  trend: any[];
  kpis: any;
}

export function DashboardCharts({ trend, kpis }: DashboardChartsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
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
                    tickFormatter={(value: number) => `₹${value/1000}k`} 
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
      </div>
    </div>
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
