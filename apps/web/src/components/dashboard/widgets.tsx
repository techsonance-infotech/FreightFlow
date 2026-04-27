'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: string;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color: string;
  bg: string;
}

export function StatCard({ label, value, subValue, icon, trend, color, bg }: StatCardProps) {
  return (
    <div 
      className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
      style={{ borderLeft: `6px solid ${color}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-slate-400 mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-black tracking-tight" style={{ color }}>
              {value}
            </h3>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                trend.isUp ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {trend.isUp ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {subValue && (
            <p className="mt-2 text-xs font-semibold text-slate-500">
              {subValue}
            </p>
          )}
        </div>
        <div 
          className="flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6"
          style={{ background: bg }}
        >
          {icon}
        </div>
      </div>
      
      {/* Decorative element */}
      <div 
        className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform duration-500 group-hover:scale-150"
        style={{ background: color }}
      />
    </div>
  );
}

export function RecentActivity({ title, icon, children }: { title: string, icon: string, children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-50 px-6 py-5 bg-slate-50/30">
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <h3 className="text-base font-black tracking-tight text-slate-900">{title}</h3>
        </div>
        <button className="text-[11px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors">
          View All →
        </button>
      </div>
      <div className="p-0">
        {children}
      </div>
    </div>
  );
}

export function ModuleGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children}
    </div>
  );
}

export function ModuleCard({ title, description, icon, path, color }: { title: string, description: string, icon: string, path: string, color: string }) {
  return (
    <a 
      href={path}
      className="group flex flex-col p-6 rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-blue-200 hover:-translate-y-1"
    >
      <div 
        className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <h4 className="text-sm font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{title}</h4>
      <p className="text-xs font-medium text-slate-500 leading-relaxed">{description}</p>
      
      <div className="mt-auto pt-4 flex items-center text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-blue-500 transition-colors">
        Enter Module <span className="ml-1 transition-transform duration-300 group-hover:translate-x-1">→</span>
      </div>
    </a>
  );
}
