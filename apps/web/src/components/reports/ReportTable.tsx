'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface Column {
  header: string;
  accessor: (row: any) => React.ReactNode;
  className?: string;
}

interface ReportTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
}

export default function ReportTable({ 
  columns, 
  data, 
  loading, 
  onRowClick,
  emptyMessage = "No transactions found for this period"
}: ReportTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-neutral-100">
            {columns.map((col, idx) => (
              <th 
                key={idx} 
                className={cn(
                  "px-6 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-400 whitespace-nowrap",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50/50">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j} className="px-6 py-6">
                    <Skeleton className="h-4 w-full rounded-lg" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-20 text-center">
                <div className="flex flex-col items-center">
                  <div className="h-16 w-16 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 text-2xl">
                    📪
                  </div>
                  <p className="text-sm font-black text-neutral-900 uppercase tracking-widest">{emptyMessage}</p>
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1">Adjust filters or create a new entry</p>
                </div>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr 
                key={row.id || idx} 
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "group transition-all duration-300",
                  onRowClick ? "cursor-pointer hover:bg-accent-50/30" : ""
                )}
              >
                {columns.map((col, colIdx) => (
                  <td 
                    key={colIdx} 
                    className={cn(
                      "px-6 py-6 text-sm font-medium text-neutral-600 transition-colors group-hover:text-neutral-900",
                      col.className
                    )}
                  >
                    {col.accessor(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
