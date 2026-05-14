'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Truck, User, 
  MapPin, Calendar, Clock, ArrowRight,
  Eye, CheckCircle2, TrendingUp, Wallet,
  Download, X, ChevronDown, Package,
  Loader2, AlertCircle, RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { exportToCSV } from '@/lib/export-utils';
import { VALID_STATUS_TRANSITIONS } from '@freightflow/shared';

// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

interface TripStats {
  activeTrips: number;
  inTransit: number;
  deliveredMtd: number;
  totalAdvancesMtd: number;
  outstandingExposure: number;
}

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [masters, setMasters] = useState({ vehicles: [], drivers: [] });
  const [stats, setStats] = useState<TripStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [statusActionId, setStatusActionId] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch KPI stats
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch('/api/v1/trips?stats=true');
      const data = await res.json();
      setStats(data.data);
    } catch { /* silent */ } finally {
      setStatsLoading(false);
    }
  };

  // Fetch trips
  const fetchTrips = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
      if (status) params.set('status', status);
      if (debouncedSearch) params.set('q', debouncedSearch);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (vehicleId) params.set('vehicleId', vehicleId);
      if (driverId) params.set('driverId', driverId);

      const res = await fetch(`/api/v1/trips?${params}`);
      const data = await res.json();
      setTrips(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
      setSelectedIds([]);
    } catch {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  }, [status, debouncedSearch, dateFrom, dateTo, pageSize, vehicleId, driverId]);

  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const [vehicles, drivers] = await Promise.all([
          fetch('/api/v1/masters/vehicles?limit=100').then(r => r.json()),
          fetch('/api/v1/masters/drivers?limit=100').then(r => r.json()),
        ]);
        setMasters({
          vehicles: vehicles.data || [],
          drivers: drivers.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch masters', error);
      }
    };
    fetchMasters();
  }, []);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchTrips(); }, [fetchTrips]);

  // Status transition
  const handleStatusChange = async (tripId: string, newStatus: string) => {
    try {
      setTransitioning(true);
      const res = await fetch(`/api/v1/trips/${tripId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update status');
      }
      toast.success(`Trip status updated to ${newStatus.replace('_', ' ')}`);
      setStatusActionId(null);
      fetchTrips(meta.page);
      fetchStats();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setTransitioning(false);
    }
  };

  // Export
  const handleExport = () => {
    const exportData = trips.map((t: any) => ({
      'Trip ID': `TR-${t.id.slice(0, 6).toUpperCase()}`,
      'Vehicle': t.vehicle?.regNo || '',
      'Driver': t.driver?.employee?.name || t.driver?.name || '',
      'From': t.fromLocation,
      'To': t.toLocation,
      'LR Count': t._count?.orders || 0,
      'Advance (₹)': (t.advanceAmount / 100).toFixed(2),
      'Status': t.status,
      'Departure': t.departureAt ? format(new Date(t.departureAt), 'dd/MM/yyyy HH:mm') : '',
      'Created': format(new Date(t.createdAt), 'dd/MM/yyyy'),
    }));
    exportToCSV(exportData, `trips_export_${format(new Date(), 'yyyyMMdd')}`);
    toast.success('Trips exported successfully');
  };

  // Toggle all selection
  const toggleAll = (checked: boolean) => {
    setSelectedIds(checked ? trips.map((t: any) => t.id) : []);
  };

  const activeFilterCount = [status, dateFrom, dateTo, debouncedSearch, vehicleId, driverId].filter(Boolean).length;

  const clearFilters = () => {
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setSearchQuery('');
    setVehicleId('');
    setDriverId('');
    setShowFilters(false);
  };

  const getStatusStyle = (s: string) => {
    switch (s) {
      case 'created': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'loaded': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'in_transit': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'delivered': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'settled': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatCurrency = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', {
      style: 'currency', currency: 'INR', maximumFractionDigits: 0,
    });
  };

  const formatCompact = (paise: number) => {
    const val = paise / 100;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
    return `₹${val.toFixed(0)}`;
  };

  const getDriverName = (trip: any) => trip.driver?.employee?.name || trip.driver?.name || 'N/A';

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Trip Operations</h1>
          <p className="text-slate-500 font-medium">Manage fleet missions, advances, and trip settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 border-2 border-slate-100 rounded-xl hover:bg-slate-50 transition-all font-bold text-xs uppercase tracking-widest text-slate-600"
          >
            <Download className="h-4 w-4" /> Export
          </button>
          <Link
            href="/dashboard/trips/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-600/20 text-sm uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" /> Dispatch New Trip
          </Link>
        </div>
      </div>

      {/* KPI Cards — Live Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Trips', icon: TrendingUp, color: 'blue', value: stats?.activeTrips, badge: null },
          { label: 'In Transit', icon: Clock, color: 'amber', value: stats?.inTransit, badge: null },
          { label: 'Delivered (MTD)', icon: CheckCircle2, color: 'green', value: stats?.deliveredMtd, badge: null },
          { label: 'Total Advances', icon: Wallet, color: 'purple', value: stats ? formatCompact(stats.totalAdvancesMtd) : null, badge: stats ? `${formatCompact(stats.outstandingExposure)} O/S` : null },
        ].map((kpi, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className={`p-2 bg-${kpi.color}-50 rounded-lg text-${kpi.color}-600`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              {kpi.badge && (
                <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">{kpi.badge}</span>
              )}
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{kpi.label}</p>
            {statsLoading ? (
              <div className="h-8 w-16 bg-slate-100 rounded-lg animate-pulse mt-1" />
            ) : (
              <h3 className="text-2xl font-black text-slate-900 mt-1">{kpi.value ?? 0}</h3>
            )}
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Trip ID, Vehicle No, Driver, or Route..."
              className="w-full pl-10 pr-4 py-2.5 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <select 
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              className="px-4 py-2.5 border-none bg-slate-50 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/10"
            >
              <option value="">All Statuses</option>
              <option value="created">Created</option>
              <option value="loaded">Loaded</option>
              <option value="in_transit">In Transit</option>
              <option value="delivered">Delivered</option>
              <option value="settled">Settled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 border-none bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all relative"
            >
              <Filter className="h-4 w-4" />
              More Filters
              {activeFilterCount > 1 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="px-3 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all">
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4 border-t border-slate-50 animate-in slide-in-from-top-2 duration-200">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver</label>
              <select value={driverId} onChange={(e) => setDriverId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                <option value="">All Drivers</option>
                {masters.drivers.map((d: any) => <option key={d.id} value={d.id}>{d.employee?.name || d.name} ({d.employee?.empCode || d.empId || 'N/A'})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vehicle</label>
              <select value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                <option value="">All Vehicles</option>
                {masters.vehicles.map((v: any) => <option key={v.id} value={v.id}>{v.regNo}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date From</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date To</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page Size</label>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-blue-600/10">
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center justify-between shadow-lg shadow-blue-600/20 animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-black">{selectedIds.length}</span>
            <span className="text-sm font-bold">trips selected</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handleExport} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Export Selected
            </button>
            <button onClick={() => setSelectedIds([])} className="px-4 py-2 bg-white/10 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Trips Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-4 py-4 text-left w-10">
                  <input type="checkbox" checked={selectedIds.length === trips.length && trips.length > 0}
                    onChange={(e) => toggleAll(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20" />
                </th>
                <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-[10px]">Trip Mission</th>
                <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-[10px]">Fleet Details</th>
                <th className="px-4 py-4 text-left font-black uppercase tracking-widest text-[10px]">Route Info</th>
                <th className="px-4 py-4 text-center font-black uppercase tracking-widest text-[10px]">LR Count</th>
                <th className="px-4 py-4 text-right font-black uppercase tracking-widest text-[10px]">Advance</th>
                <th className="px-4 py-4 text-center font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-4 py-4 text-right w-20"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-20">
                    <td colSpan={8} className="px-4"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className="h-12 w-12 opacity-10" />
                      <p className="font-bold">{debouncedSearch || status ? 'No trips match your filters' : 'No active trips found'}</p>
                      {debouncedSearch || status ? (
                        <button onClick={clearFilters} className="text-blue-600 font-black hover:underline text-xs uppercase tracking-widest flex items-center gap-1">
                          <RotateCcw className="h-3 w-3" /> Clear Filters
                        </button>
                      ) : (
                        <Link href="/dashboard/trips/new" className="text-blue-600 font-black hover:underline text-xs uppercase tracking-widest">Start First Trip</Link>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((trip: any) => {
                  const nextStatuses = VALID_STATUS_TRANSITIONS[trip.status] || [];
                  return (
                    <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-4 py-5">
                        <input type="checkbox" checked={selectedIds.includes(trip.id)}
                          onChange={(e) => {
                            setSelectedIds(e.target.checked ? [...selectedIds, trip.id] : selectedIds.filter(id => id !== trip.id));
                          }}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600/20" />
                      </td>
                      <td className="px-4 py-5 cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                        <div className="font-black text-slate-900 flex items-center gap-2">
                          TR-{trip.id.slice(0, 6).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 font-bold flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {trip.departureAt ? format(new Date(trip.departureAt), 'dd MMM, HH:mm') : 'Not Started'}
                        </div>
                      </td>
                      <td className="px-4 py-5 cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Truck className="h-3.5 w-3.5 text-blue-600" />
                          {trip.vehicle?.regNo}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {getDriverName(trip)}
                        </div>
                      </td>
                      <td className="px-4 py-5 cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                        <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                          <MapPin className="h-3 w-3 text-red-500" />
                          {trip.fromLocation}
                          <ArrowRight className="h-3 w-3 text-slate-300" />
                          {trip.toLocation}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-center cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-xs border border-blue-100">
                          {trip._count?.orders || 0}
                        </span>
                      </td>
                      <td className="px-4 py-5 text-right cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                        <div className="font-black text-slate-900">{formatCurrency(trip.advanceAmount)}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center justify-end gap-1">
                          <Wallet className="h-2.5 w-2.5" /> Driver Advance
                        </div>
                      </td>
                      <td className="px-4 py-5">
                        <div className="flex justify-center relative">
                          <button
                            onClick={(e) => { e.stopPropagation(); setStatusActionId(statusActionId === trip.id ? null : trip.id); }}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(trip.status)} hover:shadow-md transition-all flex items-center gap-1`}
                          >
                            {trip.status.replace('_', ' ')}
                            {nextStatuses.length > 0 && <ChevronDown className="h-3 w-3" />}
                          </button>
                          {/* Status dropdown */}
                          {statusActionId === trip.id && nextStatuses.length > 0 && (
                            <div className="absolute top-full mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[160px] animate-in fade-in slide-in-from-top-1 duration-150">
                              {nextStatuses.map((ns: string) => (
                                <button key={ns} disabled={transitioning}
                                  onClick={(e) => { e.stopPropagation(); handleStatusChange(trip.id, ns); }}
                                  className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-50">
                                  {transitioning ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowRight className="h-3 w-3 text-slate-400" />}
                                  Mark as {ns.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-5 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          {trip.status === 'delivered' && (
                            <Link href={`/dashboard/trips/${trip.id}/settle`}
                              className="px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-600 hover:text-white rounded-xl transition-all font-black text-[9px] uppercase tracking-widest flex items-center gap-1 border border-green-100 shadow-sm"
                            >
                              <TrendingUp className="h-3 w-3" /> Settle
                            </Link>
                          )}
                          <Link href={`/dashboard/trips/${trip.id}`}
                            className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-blue-600 inline-flex">
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
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
            Showing {trips.length} of {meta.total} {meta.total === 1 ? 'result' : 'results'} · Page {meta.page} of {meta.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => fetchTrips(meta.page - 1)}
              className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
            >Prev</button>
            <button
              disabled={meta.page >= meta.totalPages}
              onClick={() => fetchTrips(meta.page + 1)}
              className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
            >Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
