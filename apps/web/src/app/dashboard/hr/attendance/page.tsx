'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Save, Users, CheckCircle2, 
  XCircle, Clock, AlertCircle, ChevronRight,
  Filter, Search, Download, History,
  CalendarDays, UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        fetch('/api/v1/masters/employees?limit=100'),
        fetch(`/api/v1/hr/attendance?date=${date}`)
      ]);
      const empData = await empRes.json();
      const attData = await attRes.json();
      
      setEmployees(empData.data || []);
      const attMap: Record<string, string> = {};
      (attData.data || []).forEach((a: any) => {
        attMap[a.employeeId] = a.status;
      });
      
      const initialAtt = { ...attMap };
      (empData.data || []).forEach((e: any) => {
        if (!initialAtt[e.id]) initialAtt[e.id] = 'present';
      });
      setAttendance(initialAtt);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (empId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  };

  const handleSave = async () => {
    const entries = Object.entries(attendance).map(([employeeId, status]) => ({
      employeeId,
      status
    }));

    setSubmitting(true);
    const loadingToast = toast.loading('Synchronizing attendance ledger...');
    try {
      const res = await fetch('/api/v1/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, entries })
      });
      if (res.ok) {
        toast.success('Attendance ledger updated successfully', { id: loadingToast });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to update ledger', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const markAll = (status: string) => {
    const updated = { ...attendance };
    employees.forEach(e => updated[e.id] = status);
    setAttendance(updated);
    toast.info(`Marked all as ${status.replace('_', ' ')}`);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.empCode?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    leave: Object.values(attendance).filter(s => s === 'leave').length,
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Daily Attendance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Mark workforce presence and manage operational availability</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)}
              className="h-12 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-black shadow-sm outline-none focus:ring-4 focus:ring-blue-50 transition-all"
            />
          </div>
          <Button onClick={handleSave} loading={submitting} className="h-12 px-10 shadow-xl shadow-blue-200" icon={<Save className="h-4 w-4" />}>
            Commit Ledger
          </Button>
        </div>
      </div>

      {/* 2. Presence Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Present Today" value={stats.present.toString()} icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />} color="emerald" />
        <MetricCard title="Absent" value={stats.absent.toString()} icon={<XCircle className="h-4 w-4 text-rose-500" />} color="rose" />
        <MetricCard title="On Leave" value={stats.leave.toString()} icon={<Calendar className="h-4 w-4 text-blue-500" />} color="blue" />
        <MetricCard title="Attendance Rate" value={`${Math.round((stats.present / (employees.length || 1)) * 100)}%`} icon={<History className="h-4 w-4 text-slate-400" />} />
      </div>

      <div className="space-y-6">
        {/* 3. Global Actions Command Bar */}
        <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
            <input 
              placeholder="Filter members by name or employee code..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" 
            />
          </div>
          <div className="flex items-center gap-2 border-l border-slate-100 pl-4 ml-auto">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mr-2">Quick Actions:</p>
            <button onClick={() => markAll('present')} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors">All Present</button>
            <button onClick={() => markAll('absent')} className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-rose-100 transition-colors">All Absent</button>
          </div>
        </div>

        {/* 4. Ledger Grid / Table */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-slate-400">
                <tr>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Employee Profile</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Department</th>
                  <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-center">Presence Status Selection</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={3} className="px-10 py-8"><div className="h-10 bg-slate-50 rounded-2xl" /></td>
                    </tr>
                  ))
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-10 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="h-10 w-10 text-slate-100" />
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No workforce records available</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-10 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs border border-blue-100">
                            {emp.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{emp.name}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.empCode || 'TEMP'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-5">
                        <span className="text-xs font-black text-slate-500 uppercase tracking-tight">{emp.department || 'Operations'}</span>
                      </td>
                      <td className="px-10 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <AttendanceToggle 
                            active={attendance[emp.id] === 'present'} 
                            onClick={() => handleStatusChange(emp.id, 'present')}
                            label="Present"
                            icon={<CheckCircle2 className="h-3 w-3" />}
                            color="emerald"
                          />
                          <AttendanceToggle 
                            active={attendance[emp.id] === 'absent'} 
                            onClick={() => handleStatusChange(emp.id, 'absent')}
                            label="Absent"
                            icon={<XCircle className="h-3 w-3" />}
                            color="rose"
                          />
                          <AttendanceToggle 
                            active={attendance[emp.id] === 'half_day'} 
                            onClick={() => handleStatusChange(emp.id, 'half_day')}
                            label="Half Day"
                            icon={<Clock className="h-3 w-3" />}
                            color="amber"
                          />
                          <AttendanceToggle 
                            active={attendance[emp.id] === 'leave'} 
                            onClick={() => handleStatusChange(emp.id, 'leave')}
                            label="On Leave"
                            icon={<Calendar className="h-3 w-3" />}
                            color="blue"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function AttendanceToggle({ active, onClick, label, icon, color }: any) {
  const colorMap: any = {
    emerald: active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-white text-slate-400 hover:bg-emerald-50 hover:text-emerald-600',
    rose: active ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white text-slate-400 hover:bg-rose-50 hover:text-rose-600',
    amber: active ? 'bg-amber-500 text-white shadow-lg shadow-amber-100' : 'bg-white text-slate-400 hover:bg-amber-50 hover:text-amber-600',
    blue: active ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' : 'bg-white text-slate-400 hover:bg-blue-50 hover:text-blue-600',
  };

  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-100 transition-all active:scale-95 group",
        colorMap[color]
      )}
    >
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/50 border-emerald-100',
    rose: 'bg-rose-50/50 border-rose-100',
    blue: 'bg-blue-50/50 border-blue-100',
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all", colorStyles[color])}>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-1.5 bg-white rounded-lg shadow-sm">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900">{value}</h3>
    </div>
  );
}
