'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, Search, Filter, Truck, User, 
  MapPin, Calendar, Clock, ArrowRight,
  MoreHorizontal, Eye, CheckCircle2, AlertCircle,
  TrendingUp, Wallet, Receipt
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function TripListPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const fetchTrips = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/trips?page=${page}&limit=10${status ? `&status=${status}` : ''}`);
      const data = await res.json();
      setTrips(data.data || []);
      setMeta(data.meta || { total: 0, page: 1, limit: 10, totalPages: 1 });
    } catch (error) {
      toast.error('Failed to fetch trips');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, [status]);

  const getStatusStyle = (status: string) => {
    switch (status) {
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
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">Trip Operations</h1>
          <p className="text-slate-500 font-medium">Manage fleet missions, advances, and trip settlements</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/trips/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-600/20 text-sm uppercase tracking-wider"
          >
            <Plus className="h-4 w-4" />
            Dispatch New Trip
          </Link>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><TrendingUp className="h-5 w-5" /></div>
            <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12%</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Trips</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">24</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Clock className="h-5 w-5" /></div>
            <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">Avg 4.2d</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">In Transit</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">18</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle2 className="h-5 w-5" /></div>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">98.4%</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Delivered (MTD)</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">142</h3>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Wallet className="h-5 w-5" /></div>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-2 py-0.5 rounded-full">₹24K O/S</span>
          </div>
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Advances</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">₹ 4.8L</h3>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Trip ID, Vehicle No, or Driver..."
            className="w-full pl-10 pr-4 py-2.5 border-none bg-slate-50 rounded-xl focus:ring-2 focus:ring-blue-600/10 transition-all text-sm font-medium"
          />
        </div>
        <div className="flex gap-2">
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2.5 border-none bg-slate-50 rounded-xl text-sm font-bold text-slate-600 focus:ring-2 focus:ring-blue-600/10"
          >
            <option value="">All Statuses</option>
            <option value="created">Created</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
            <option value="settled">Settled</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2.5 border-none bg-slate-50 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-100 transition-all">
            <Filter className="h-4 w-4" />
            More Filters
          </button>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/50 text-slate-400 border-b border-slate-100">
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Trip Mission</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Fleet Details</th>
                <th className="px-6 py-4 text-left font-black uppercase tracking-widest text-[10px]">Route Info</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">LR Count</th>
                <th className="px-6 py-4 text-right font-black uppercase tracking-widest text-[10px]">Advance</th>
                <th className="px-6 py-4 text-center font-black uppercase tracking-widest text-[10px]">Status</th>
                <th className="px-6 py-4 text-right w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse h-20">
                    <td colSpan={7} className="px-6"><div className="h-10 bg-slate-50 rounded-xl w-full"></div></td>
                  </tr>
                ))
              ) : trips.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <Truck className="h-12 w-12 opacity-10" />
                      <p className="font-bold">No active trips found</p>
                      <Link href="/dashboard/trips/new" className="text-blue-600 font-black hover:underline text-xs uppercase tracking-widest">Start First Trip</Link>
                    </div>
                  </td>
                </tr>
              ) : (
                trips.map((trip: any) => (
                  <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/dashboard/trips/${trip.id}`}>
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900 flex items-center gap-2">
                        TR-{trip.id.slice(0, 4).toUpperCase()}
                        <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-black">ID</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-1 font-bold flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {trip.departureAt ? format(new Date(trip.departureAt), 'dd MMM, HH:mm') : 'Not Started'}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-blue-600" />
                        {trip.vehicle?.regNo}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-medium flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {trip.driver?.name}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                        <MapPin className="h-3 w-3 text-red-500" />
                        {trip.fromLocation}
                        <ArrowRight className="h-3 w-3 text-slate-300" />
                        {trip.toLocation}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1 font-bold">
                        En-route Mission
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-black text-xs border border-blue-100">
                        {trip._count.orders}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="font-black text-slate-900">{formatCurrency(trip.advanceAmount)}</div>
                      <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center justify-end gap-1">
                        <Wallet className="h-2.5 w-2.5" />
                        Driver Advance
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(trip.status)}`}>
                          {trip.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100">
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Mission {trips.length} of {meta.total} Result
          </p>
          <div className="flex gap-2">
            <button
              disabled={meta.page === 1}
              onClick={() => fetchTrips(meta.page - 1)}
              className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              Prev
            </button>
            <button
              disabled={meta.page === meta.totalPages}
              onClick={() => fetchTrips(meta.page + 1)}
              className="px-4 py-2 text-xs font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all uppercase tracking-widest"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
