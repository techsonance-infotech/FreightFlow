'use client';

import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Inbox, Pencil, Trash2 } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: {
    page: number;
    total: number;
    limit: number;
    onPageChange: (page: number) => void;
    onLimitChange?: (limit: number) => void;
  };
}

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  loading,
  onEdit,
  onDelete,
  pagination,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                {columns.map((col, idx) => (
                  <th key={idx} className={`px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 ${col.className}`}>
                    {col.header}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {columns.map((col, j) => (
                      <td key={j} className={cn("px-6 py-5", col.className)}>
                        <div className="space-y-2">
                          <div className="h-3 w-2/3 bg-slate-100 rounded-lg" />
                          <div className="h-2.5 w-1/2 bg-slate-50 rounded-lg" />
                        </div>
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-slate-50 rounded-xl" />
                          <div className="h-8 w-8 bg-slate-50 rounded-xl" />
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="px-6 py-20 text-center">
                    <Inbox className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No records found</p>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <tr key={row.id || rowIdx} className="hover:bg-slate-50 transition-colors group">
                    {columns.map((col, colIdx) => (
                      <td key={colIdx} className={`px-6 py-4 text-sm font-medium text-slate-600 ${col.className}`}>
                        {typeof col.accessor === 'function' ? col.accessor(row) : (row[col.accessor] as React.ReactNode)}
                      </td>
                    ))}
                    {(onEdit || onDelete) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {onEdit && (
                            <Button variant="ghost" size="icon" onClick={() => onEdit(row)} className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {onDelete && (
                            <Button variant="ghost" size="icon" onClick={() => onDelete(row)} className="h-8 w-8 text-red-600 hover:bg-red-50">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && (
          <div className="flex items-center justify-between border-t border-slate-50 bg-slate-50/30 px-6 py-4">
            <div className="flex items-center gap-6">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Showing <span className="text-slate-900">{Math.min(data.length, pagination.limit)}</span> of <span className="text-slate-900">{pagination.total}</span> Records
              </p>
              
              {pagination.onLimitChange && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-300">Show</span>
                  <select 
                    value={pagination.limit}
                    onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
                    className="bg-transparent text-[11px] font-black text-slate-600 outline-none cursor-pointer hover:text-blue-600 transition-colors"
                  >
                    {[10, 25, 50, 100].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.page <= 1}
                onClick={() => pagination.onPageChange(pagination.page - 1)}
              >
                Previous
              </Button>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-[10px] font-black text-white shadow-lg">
                {pagination.page}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={data.length < pagination.limit}
                onClick={() => pagination.onPageChange(pagination.page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
