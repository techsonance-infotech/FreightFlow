'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface RouteIntelligenceWidgetProps {
  routes: any[];
}

export function RouteIntelligenceWidget({ routes }: RouteIntelligenceWidgetProps) {
  const hasData = routes && routes.length > 0;

  return (
    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 bg-white overflow-hidden transition-all hover:shadow-2xl">
      <CardHeader className="p-8 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
              <MapPin className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Route Performance</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">High-Yield Destinations</CardDescription>
            </div>
          </div>
          <Link href="/dashboard/reports/routes">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-4">
        <div className="space-y-6">
          {hasData ? routes.map((route, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-100 group-hover:text-blue-600 transition-colors">
                  0{idx + 1}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-700 uppercase tracking-tight">{route.name || 'Local'}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Corridor</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-black text-slate-900">₹{((route.amount || 0) / 1000).toFixed(1)}k</p>
                <div className="flex items-center gap-1 justify-end">
                   <TrendingUp className="h-3 w-3 text-emerald-500" />
                   <p className="text-[10px] font-black text-emerald-500 uppercase">Growth</p>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-10 text-center">
               <MapPin className="h-10 w-10 text-slate-200 mx-auto mb-3" />
               <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Route Data Available</p>
            </div>
          )}
        </div>

        <Link href="/dashboard/trips/new">
          <Button className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-6 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-200">
            Optimize Lane Dispatch
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
