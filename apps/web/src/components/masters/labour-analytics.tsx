'use client';

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { format, subMonths, startOfMonth } from 'date-fns';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export function LabourAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/v1/masters/labour/analytics');
        if (response.ok) setData(await response.json());
      } catch (error) {
        console.error('Error fetching analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="p-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Generating insights...</div>;
  if (!data) return null;

  // Process monthly trend
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const d = subMonths(new Date(), i);
    const monthStr = format(d, 'MMM');
    const monthStart = startOfMonth(d);
    
    const amount = data.monthlyExpenses
      .filter((e: any) => format(new Date(e.date), 'MMM yyyy') === format(d, 'MMM yyyy'))
      .reduce((sum: number, e: any) => sum + (e._sum.amount || 0), 0);
      
    return { name: monthStr, amount: amount / 100 };
  }).reverse();

  // Process skill distribution
  const skillData = data.skillDistribution.map((s: any) => ({
    name: s.skillCategory || 'Uncategorized',
    value: s._count.id
  }));

  return (
    <div className="space-y-10 p-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trend Chart */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Labour Cost Trend (Last 6 Months)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} dx={-10} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                />
                <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={4} dot={{ r: 6, fill: '#2563eb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Skill Category Pie */}
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Worker Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillData}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillData.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Advance Tracking */}
      <div className="bg-slate-900 text-white p-10 rounded-[40px] shadow-2xl shadow-slate-200">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-8">Top Advances Outstanding</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {data.topAdvances.map((adv: any, i: number) => (
            <div key={adv.name} className="relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <span className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-black border-4 border-slate-900">
                #{i+1}
              </span>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{adv.name}</p>
              <p className="text-xl font-black">₹{(adv.amount / 100).toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
