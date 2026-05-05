'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isUp: boolean;
  };
  color?: 'blue' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  icon,
  trend,
  color = 'blue',
  className
}: StatCardProps) {
  const colorMap = {
    blue: 'text-accent-600 bg-accent-50 border-accent-100',
    emerald: 'text-success-700 bg-success-50 border-success-50',
    amber: 'text-amber-700 bg-amber-50 border-amber-100',
    rose: 'text-error-700 bg-error-50 border-error-50',
    slate: 'text-neutral-700 bg-neutral-50 border-neutral-100',
  };

  return (
    <Card className={cn(
      "relative overflow-hidden border-none shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:-translate-y-1 group bg-white rounded-2xl",
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "p-3 rounded-xl transition-transform duration-500 group-hover:scale-110",
            colorMap[color]
          )}>
            {icon}
          </div>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
              trend.isUp ? "text-success-700 bg-success-50" : "text-error-700 bg-error-50"
            )}>
              {trend.value}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-neutral-900 tracking-tight">{value}</h3>
          {subValue && (
            <p className="text-xs font-medium text-neutral-400 mt-1">{subValue}</p>
          )}
        </div>
        
        {/* Subtle decorative element */}
        <div className={cn(
          "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-[0.03] transition-transform duration-700 group-hover:scale-150",
          color === 'blue' ? 'bg-accent-600' : 
          color === 'emerald' ? 'bg-success-700' :
          color === 'amber' ? 'bg-amber-700' :
          color === 'rose' ? 'bg-error-700' : 'bg-neutral-700'
        )} />
      </CardContent>
    </Card>
  );
}

export function ReportSectionHeader({ title, subtitle, action, className }: { title: string; subtitle?: string; action?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8", className)}>
      <div className="space-y-1">
        <h2 className="text-xl font-bold text-neutral-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className="h-12 w-12 rounded-2xl border-4 border-neutral-100 border-t-accent-600 animate-spin" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.02)]" />
        ))}
      </div>
      <div className="bg-white border border-neutral-100 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="bg-neutral-50/50 p-6 border-b border-neutral-100">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-6 border-b border-neutral-100 last:border-0">
            <Skeleton className="h-8 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function EmptyReportState({ 
  title, 
  description, 
  icon 
}: { 
  title: string; 
  description: string; 
  icon?: React.ReactNode 
}) {
  const defaultIcon = <FileText className="h-12 w-12" />;
  
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center animate-in fade-in zoom-in duration-500">
      <div className="mb-6 p-6 bg-neutral-50 rounded-3xl text-neutral-400">
        {icon && React.isValidElement(icon) 
          ? React.cloneElement(icon as React.ReactElement<any>, { className: "h-12 w-12" }) 
          : defaultIcon
        }
      </div>
      <h3 className="text-lg font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-sm text-neutral-500 max-w-xs mx-auto leading-relaxed">{description}</p>
    </div>
  );
}

export function ReportContainer({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn(
      "mx-auto w-full max-w-[1600px] space-y-8 animate-in fade-in duration-700",
      className
    )}>
      {children}
    </div>
  );
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className={cn("flex items-center justify-between px-8 py-4 bg-white border-t border-neutral-100", className)}>
      <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
        Page {currentPage} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-neutral-200 text-neutral-400 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

import { ChevronLeft, ChevronRight } from 'lucide-react';
