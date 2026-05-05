'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { exportToCSV, exportToExcel, exportToPDF } from '@/lib/export-utils';

interface VehicleHistoryProps {
  vehicle: any;
  onClose: () => void;
}

export function VehicleHistory({ vehicle, onClose }: VehicleHistoryProps) {
  const [activeTab, setActiveTab] = useState<'assignments' | 'fuel' | 'maintenance'>('assignments');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchHistory = async () => {
    if (!vehicle?.id) return;
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (debouncedSearch) query.append('search', debouncedSearch);
      if (fromDate) query.append('fromDate', fromDate);
      if (toDate) query.append('toDate', toDate);

      const response = await fetch(`/api/v1/masters/vehicles/${vehicle.id}/assignments?${query.toString()}`);
      const result = await response.json();
      if (response.ok) {
        setAssignments(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch assignment history');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error loading assignment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'assignments' && vehicle?.id) {
      fetchHistory();
    }
  }, [debouncedSearch, fromDate, toDate, activeTab, vehicle?.id]);

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    const exportData = assignments.map(a => ({
      'Assigned At': new Date(a.assignedAt).toLocaleDateString(),
      'Unassigned At': a.unassignedAt ? new Date(a.unassignedAt).toLocaleDateString() : 'Active',
      'Driver Name': a.labour?.name || 'Unknown',
      'Phone': a.labour?.phone || '-'
    }));

    const filename = `Vehicle_Assignments_${vehicle.regNo}_${new Date().toISOString().split('T')[0]}`;

    if (format === 'csv') {
      exportToCSV(exportData, filename);
    } else if (format === 'excel') {
      exportToExcel(exportData, filename);
    } else {
      const headers = ['Assigned At', 'Unassigned At', 'Driver Name', 'Phone'];
      const pdfData = exportData.map(a => [a['Assigned At'], a['Unassigned At'], a['Driver Name'], a.Phone]);
      exportToPDF(headers, pdfData, filename, `Assignment Timeline: ${vehicle.regNo}`);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white">
      {/* Header */}
      <div className="p-8 border-b border-slate-50 bg-slate-50/30">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 rounded-3xl bg-blue-600 flex items-center justify-center text-4xl shadow-2xl shadow-blue-200">
              {vehicle.type === 'Trailer' ? '🚛' : '🚚'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{vehicle.regNo}</h2>
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border ${
                  vehicle.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {vehicle.status}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="text-blue-500">⚙️</span> {vehicle.make} {vehicle.model}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="text-blue-500">⛽</span> {vehicle.fuelType}
                </span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-100">
                  <span className="text-blue-500">🏢</span> {vehicle.ownership}
                </span>
                {vehicle.rcUrl && (
                  <a href={vehicle.rcUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors">
                    <span>📄</span> RC DOC
                  </a>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl h-12 w-12 hover:bg-slate-100 text-slate-400">✕</Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8">
          {[
            { id: 'assignments', label: 'Assignment History', icon: '👤' },
            { id: 'fuel', label: 'Fuel Logs', icon: '⛽' },
            { id: 'maintenance', label: 'Maintenance Hub', icon: '🛠️' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' 
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 bg-slate-50/10">
        {activeTab === 'assignments' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Search drivers..." 
                  value={search} 
                  onChange={(e) => setSearch(e.target.value)} 
                  className="w-64 bg-white border-slate-200 h-11 rounded-xl shadow-sm"
                  icon="🔍"
                />
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                  <input 
                    type="date" 
                    value={fromDate} 
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
                  />
                  <span className="text-slate-300 font-black">→</span>
                  <input 
                    type="date" 
                    value={toDate} 
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-black uppercase p-2 outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => handleExport('csv')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">CSV</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">Excel</Button>
                <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="rounded-xl border-slate-200 text-slate-500 font-black text-[10px] uppercase h-9">PDF</Button>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Assigned At</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Driver Info</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Unassigned At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">Loading...</td>
                    </tr>
                  ) : assignments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-24 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <span className="text-4xl mb-4">📜</span>
                          <p className="text-xs font-black uppercase tracking-widest">No Assignment History</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    assignments.map((a) => (
                      <tr key={a.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-5">
                          <p className="text-xs font-black text-slate-900">{new Date(a.assignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(a.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs shadow-inner">👤</div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{a.labour?.name || 'Unknown'}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{a.labour?.phone || '-'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                            !a.unassignedAt ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {!a.unassignedAt ? 'Currently Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {a.unassignedAt ? (
                            <>
                              <p className="text-xs font-black text-slate-600">{new Date(a.unassignedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{new Date(a.unassignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </>
                          ) : (
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-8 border-t border-slate-50 bg-white rounded-[40px] border border-slate-100 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-12">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Total Assignments</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{assignments.length}</p>
                </div>
                <div className="h-10 w-px bg-slate-100" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Unique Drivers</p>
                  <p className="text-2xl font-black text-blue-600 mt-1">
                    {new Set(assignments.map(a => a.labourId)).size}
                  </p>
                </div>
              </div>
              <Button onClick={onClose} className="rounded-2xl h-14 px-10 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:bg-blue-700 shadow-xl shadow-blue-100">Close Registry</Button>
            </div>
          </div>
        )}

        {activeTab === 'fuel' && (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in slide-in-from-bottom-4">
            <span className="text-5xl mb-6">⛽</span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Fuel Log Integration</h3>
            <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs">Detailed fuel consumption and efficiency analysis for {vehicle.regNo} will be displayed here.</p>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="flex flex-col items-center justify-center p-20 text-center animate-in fade-in slide-in-from-bottom-4">
            <span className="text-5xl mb-6">🛠️</span>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Maintenance History</h3>
            <p className="text-sm text-slate-400 mt-2 font-medium max-w-xs">Full service records, breakdowns and repair costs for {vehicle.regNo} will be visible here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
