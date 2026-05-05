'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Wallet, User, TrendingDown, AlertTriangle,
  Filter, Search, Plus, Download, X, ArrowRight,
  RotateCcw, ArrowDown, Users, Calendar, Truck,
  Loader2, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { AdvanceModal } from '@/components/trips/AdvanceModal';
import { RecoveryModal } from '@/components/trips/RecoveryModal';
import { exportToCSV } from '@/lib/export-utils';

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

interface AdvanceStats {
  disbursedMtd: number;
  totalRecovered: number;
  outstandingExposure: number;
  pendingRecoveryCount: number;
}

export default function DriverAdvancesPage() {
  const [advances, setAdvances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdvanceStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [selectedAdvance, setSelectedAdvance] = useState<any>(null);

  // View toggle
  const [view, setView] = useState<'ledger' | 'summary'>('ledger');
  const [driverSummary, setDriverSummary] = useState<any[]>([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/v1/trips/advances?stats=true');
      const data = await res.json();
      setStats(data.data);
    } catch { /* silent */ } finally { setStatsLoading(false); }
  };

  const fetchAdvances = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      if (modeFilter) params.set('mode', modeFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);

      const res = await fetch(`/api/v1/trips/advances?${params}`);
      const data = await res.json();
      setAdvances(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch { toast.error('Failed to fetch advances'); } finally { setLoading(false); }
  }, [debouncedSearch, statusFilter, modeFilter, dateFrom, dateTo, pageSize]);

  const fetchDriverSummary = async () => {
    try {
      setSummaryLoading(true);
      const res = await fetch('/api/v1/trips/advances?summary=true');
      const data = await res.json();
      setDriverSummary(data.data || []);
    } catch { toast.error('Failed to fetch summary'); } finally { setSummaryLoading(false); }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { if (view === 'ledger') fetchAdvances(); }, [fetchAdvances, view]);
  useEffect(() => { if (view === 'summary') fetchDriverSummary(); }, [view]);

  const handleRefresh = () => { fetchStats(); if (view === 'ledger') fetchAdvances(); else fetchDriverSummary(); };
  const activeFilterCount = [statusFilter, modeFilter, dateFrom, dateTo, debouncedSearch].filter(Boolean).length;
  const clearFilters = () => { setStatusFilter(''); setModeFilter(''); setDateFrom(''); setDateTo(''); setSearchQuery(''); setShowFilters(false); };

  const formatCurrency = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
  const formatCompact = (paise: number) => {
    const val = paise / 100;
    if (val >= 100000) return `₹${(val / 100000).toFixed(2)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const handleExport = () => {
    const data = advances.map((a: any) => ({
      'Date': format(new Date(a.date), 'dd/MM/yyyy'),
      'Driver': a.driver?.employee?.name || '',
      'Emp Code': a.driver?.employee?.empCode || '',
      'Trip': a.trip ? `TR-${a.trip.id.slice(0, 6).toUpperCase()}` : 'Standalone',
      'Mode': a.mode,
      'Amount (₹)': (a.amount / 100).toFixed(2),
      'Recovered (₹)': (a.recoveredAmount / 100).toFixed(2),
      'Outstanding (₹)': ((a.amount - a.recoveredAmount) / 100).toFixed(2),
      'Status': a.status,
    }));
    exportToCSV(data, `advance_ledger_${format(new Date(), 'yyyyMMdd')}`);
    toast.success('Exported successfully');
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'recovered': return 'bg-green-50 text-green-600 border-green-100';
      case 'partially_recovered': return 'bg-blue-50 text-blue-600 border-blue-100';
      default: return 'bg-amber-50 text-amber-600 border-amber-100';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Driver Advance Ledger</h1>
          <p className="text-slate-500 font-medium">Monitor disbursements, recoveries, and outstanding balances</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-600">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setShowAdvanceModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-600/20 text-sm uppercase tracking-wider">
            <Plus className="h-4 w-4" /> Record Advance
          </button>
        </div>
      </div>

      {/* KPI Cards — Live */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Disbursed (MTD)', icon: Wallet, color: 'blue', value: stats ? formatCompact(stats.disbursedMtd) : null },
          { label: 'Total Recovered', icon: TrendingDown, color: 'green', value: stats ? formatCompact(stats.totalRecovered) : null },
          { label: 'Outstanding Exposure', icon: AlertTriangle, color: 'red', value: stats ? formatCompact(stats.outstandingExposure) : null, highlight: true },
          { label: 'Pending Recovery', icon: Users, color: 'purple', value: stats?.pendingRecoveryCount },
        ].map((kpi, i) => (
          <div key={i} className={`bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden`}>
            <div className={`p-3 bg-${kpi.color}-50 rounded-2xl text-${kpi.color}-600 w-fit mb-4`}><kpi.icon className="h-6 w-6" /></div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            {statsLoading ? (
              <div className="h-8 w-20 bg-slate-100 rounded-lg animate-pulse mt-1" />
            ) : (
              <h3 className={`text-2xl font-black mt-1 ${kpi.highlight ? 'text-red-600' : 'text-slate-900'}`}>{kpi.value ?? 0}</h3>
            )}
            {kpi.highlight && <div className="absolute right-0 top-0 h-full w-2 bg-red-500/10" />}
          </div>
        ))}
      </div>

      {/* View Toggle + Search/Filters */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex items-center justify-between">
            {/* View Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {[{ id: 'ledger', label: 'Ledger View' }, { id: 'summary', label: 'Driver Summary' }].map((v) => (
                <button key={v.id} onClick={() => setView(v.id as any)}
                  className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${view === v.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                  {v.label}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-xl transition-all">Clear Filters</button>
            )}
          </div>

          {view === 'ledger' && (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Driver or Trip..."
                  className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-600/10" />
                {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-slate-400"><X className="h-4 w-4" /></button>}
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/10">
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="partially_recovered">Partial</option>
                <option value="recovered">Recovered</option>
              </select>
              <select value={modeFilter} onChange={(e) => setModeFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/10">
                <option value="">All Modes</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-all relative">
                <Filter className="h-5 w-5" />
                {activeFilterCount > 1 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[8px] font-black rounded-full flex items-center justify-center">{activeFilterCount}</span>}
              </button>
            </div>
          )}

          {showFilters && view === 'ledger' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date From</label>
                <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date To</label>
                <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Size</label>
                <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700">
                  <option value={10}>10</option><option value={25}>25</option><option value={50}>50</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Ledger Table */}
        {view === 'ledger' && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-left">Date</th>
                    <th className="px-6 py-4 text-left">Driver</th>
                    <th className="px-6 py-4 text-left">Trip / Purpose</th>
                    <th className="px-6 py-4 text-center">Mode</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4 text-right">Recovered</th>
                    <th className="px-6 py-4 text-right">Outstanding</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4 text-right w-24">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse h-16"><td colSpan={9} className="px-6"><div className="h-8 bg-slate-50 rounded-xl" /></td></tr>
                    ))
                  ) : advances.length === 0 ? (
                    <tr><td colSpan={9} className="px-6 py-20 text-center text-slate-400 font-bold">
                      <div className="flex flex-col items-center gap-3">
                        <Wallet className="h-12 w-12 opacity-10" />
                        <p>{debouncedSearch || statusFilter ? 'No advances match your filters' : 'No advance records found'}</p>
                        {(debouncedSearch || statusFilter) && (
                          <button onClick={clearFilters} className="text-blue-600 font-black text-xs uppercase flex items-center gap-1"><RotateCcw className="h-3 w-3" /> Clear</button>
                        )}
                      </div>
                    </td></tr>
                  ) : (
                    advances.map((adv: any) => {
                      const outstanding = adv.amount - adv.recoveredAmount;
                      return (
                        <tr key={adv.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-600">{format(new Date(adv.date), 'dd MMM yyyy')}</td>
                          <td className="px-6 py-5">
                            <div className="font-black text-slate-900">{adv.driver?.employee?.name || 'N/A'}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{adv.driver?.employee?.empCode || ''}</div>
                          </td>
                          <td className="px-6 py-5">
                            {adv.trip ? (
                              <>
                                <div className="font-bold text-blue-600 text-xs">TR-{adv.trip.id.slice(0, 6).toUpperCase()}</div>
                                <div className="text-[10px] text-slate-400 font-medium">{adv.trip.fromLocation} → {adv.trip.toLocation}</div>
                              </>
                            ) : (
                              <div className="text-xs text-slate-500 font-medium italic">{adv.purpose || 'Standalone advance'}</div>
                            )}
                          </td>
                          <td className="px-6 py-5 text-center">
                            <span className="px-2 py-1 bg-slate-100 rounded text-[9px] font-black uppercase text-slate-500">{adv.mode}</span>
                          </td>
                          <td className="px-6 py-5 text-right font-black text-slate-900">{formatCurrency(adv.amount)}</td>
                          <td className="px-6 py-5 text-right font-bold text-green-600">{formatCurrency(adv.recoveredAmount)}</td>
                          <td className="px-6 py-5 text-right font-black text-amber-600">{outstanding > 0 ? formatCurrency(outstanding) : '—'}</td>
                          <td className="px-6 py-5 text-center">
                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(adv.status)}`}>
                              {adv.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {adv.status !== 'recovered' && (
                              <button onClick={() => { setSelectedAdvance(adv); setShowRecoveryModal(true); }}
                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-green-100 transition-all border border-green-100">
                                Recover
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Showing {advances.length} of {meta.total} · Page {meta.page} of {meta.totalPages}
              </p>
              <div className="flex gap-2">
                <button disabled={meta.page === 1} onClick={() => fetchAdvances(meta.page - 1)}
                  className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest">Prev</button>
                <button disabled={meta.page >= meta.totalPages} onClick={() => fetchAdvances(meta.page + 1)}
                  className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest">Next</button>
              </div>
            </div>
          </>
        )}

        {/* Driver Summary View */}
        {view === 'summary' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-left">Driver</th>
                  <th className="px-6 py-4 text-center">Total Advances</th>
                  <th className="px-6 py-4 text-right">Total Given</th>
                  <th className="px-6 py-4 text-right">Total Recovered</th>
                  <th className="px-6 py-4 text-right">Net Outstanding</th>
                  <th className="px-6 py-4 text-left">Last Advance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {summaryLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse h-16"><td colSpan={6} className="px-6"><div className="h-8 bg-slate-50 rounded-xl" /></td></tr>
                  ))
                ) : driverSummary.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-20 text-center text-slate-400 font-bold">No outstanding advances found</td></tr>
                ) : (
                  driverSummary.map((d: any) => (
                    <tr key={d.driverId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="font-black text-slate-900">{d.driverName}</div>
                        <div className="text-[10px] text-slate-400 font-bold">{d.empCode}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-xs border border-blue-100">
                          {d.totalAdvances}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900">{formatCurrency(d.totalGiven)}</td>
                      <td className="px-6 py-5 text-right font-bold text-green-600">{formatCurrency(d.totalRecovered)}</td>
                      <td className="px-6 py-5 text-right">
                        <span className="font-black text-red-600">{formatCurrency(d.netOutstanding)}</span>
                      </td>
                      <td className="px-6 py-5 font-bold text-slate-600">
                        {d.lastAdvanceDate ? format(new Date(d.lastAdvanceDate), 'dd MMM yyyy') : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <AdvanceModal isOpen={showAdvanceModal} onClose={() => setShowAdvanceModal(false)} onSuccess={handleRefresh} />
      <RecoveryModal isOpen={showRecoveryModal} onClose={() => setShowRecoveryModal(false)} onSuccess={handleRefresh} advance={selectedAdvance} />
    </div>
  );
}
