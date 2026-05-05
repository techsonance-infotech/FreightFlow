'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar, Save, Users, CheckCircle2, 
  XCircle, Clock, AlertCircle, ChevronRight,
  Filter, Search, Download, History,
  CalendarDays, UserCheck, LayoutGrid, List,
  ChevronLeft, ArrowRight, Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [timeLogs, setTimeLogs] = useState<Record<string, { checkIn: string, checkOut: string }>>({});
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [designationFilter, setDesignationFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, designationFilter, branchFilter]);

  const currentMonth = useMemo(() => new Date(date), [date]);
  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    });
  }, [currentMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, attRes] = await Promise.all([
        fetch('/api/v1/masters/employees?limit=100'),
        fetch(`/api/v1/hr/attendance?date=${date}${viewMode === 'monthly' ? '&mode=monthly' : ''}`)
      ]);
      const empData = await empRes.json();
      const attData = await attRes.json();
      
      setEmployees(empData.data || []);
      
      if (viewMode === 'daily') {
        const attMap: Record<string, string> = {};
        const logMap: Record<string, { checkIn: string, checkOut: string }> = {};
        
        (attData.data || []).forEach((a: any) => {
          attMap[a.employeeId] = a.status;
          logMap[a.employeeId] = {
            checkIn: a.checkIn ? format(new Date(a.checkIn), 'HH:mm') : '09:00',
            checkOut: a.checkOut ? format(new Date(a.checkOut), 'HH:mm') : '18:00'
          };
        });
        
        const initialAtt = { ...attMap };
        const initialLogs = { ...logMap };
        
        (empData.data || []).forEach((e: any) => {
          if (!initialAtt[e.id]) initialAtt[e.id] = 'present';
          if (!initialLogs[e.id]) initialLogs[e.id] = { checkIn: '09:00', checkOut: '18:00' };
        });
        
        setAttendance(initialAtt);
        setTimeLogs(initialLogs);
      } else {
        setMonthlyData(attData.data || []);
      }
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, viewMode]);

  const handleStatusChange = (empId: string, status: string) => {
    setAttendance(prev => ({ ...prev, [empId]: status }));
  };

  const handleTimeChange = (empId: string, type: 'checkIn' | 'checkOut', value: string) => {
    setTimeLogs(prev => ({
      ...prev,
      [empId]: { ...prev[empId], [type]: value }
    }));
  };

  const handleSave = async () => {
    const entries = Object.entries(attendance).map(([employeeId, status]) => {
      const logs = timeLogs[employeeId];
      return {
        employeeId,
        status,
        checkIn: (status === 'present' || status === 'half_day') ? `${date}T${logs.checkIn}:00` : null,
        checkOut: (status === 'present' || status === 'half_day') ? `${date}T${logs.checkOut}:00` : null,
      };
    });

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
        if (viewMode === 'monthly') fetchData();
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to update ledger', { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(search.toLowerCase()) || 
                         emp.empCode?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || emp.status === statusFilter;
    const matchesDesignation = designationFilter === 'all' || emp.designation === designationFilter;
    const matchesBranch = branchFilter === 'all' || emp.branchId === branchFilter;
    
    return matchesSearch && matchesStatus && matchesDesignation && matchesBranch;
  });

  const designations = Array.from(new Set(employees.map(e => e.designation).filter(Boolean)));
  const branches = Array.from(new Set(employees.map(e => e.branch?.name).filter(Boolean)));

  const stats = {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent: Object.values(attendance).filter(s => s === 'absent').length,
    leave: Object.values(attendance).filter(s => s === 'leave').length,
  };

  const markAllPresent = () => {
    const newAtt = { ...attendance };
    employees.forEach(emp => {
      newAtt[emp.id] = 'present';
    });
    setAttendance(newAtt);
    toast.success('All employees marked as present');
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Code,Designation,Branch,Status\n"
      + filteredEmployees.map(e => `${e.name},${e.empCode || ''},${e.designation || ''},${e.branch?.name || ''},${e.status}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_registry_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. Header with View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Workforce Attendance</h1>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm font-medium text-slate-500">Universal time tracking and presence ledger</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-[1.25rem]">
            <button 
              onClick={() => { setViewMode('daily'); setSelectedEmployeeId(null); }}
              className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all", viewMode === 'daily' && !selectedEmployeeId ? "bg-white text-blue-600 shadow-lg shadow-blue-100" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="h-3.5 w-3.5" /> Daily
            </button>
            <button 
              onClick={() => { setViewMode('monthly'); setSelectedEmployeeId(null); }}
              className={cn("px-5 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all", viewMode === 'monthly' && !selectedEmployeeId ? "bg-white text-blue-600 shadow-lg shadow-blue-100" : "text-slate-400 hover:text-slate-600")}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Monthly
            </button>
          </div>
          
          <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden lg:block" />
          
          <input 
            type={viewMode === 'daily' ? "date" : "month"} 
            value={viewMode === 'daily' ? date : date.substring(0, 7)}
            onChange={(e) => setDate(e.target.value + (viewMode === 'monthly' ? '-01' : ''))}
            className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-xs font-black shadow-sm outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          
          {viewMode === 'daily' && !selectedEmployeeId ? (
            <div className="flex items-center gap-3">
              <Button 
                variant="outline"
                onClick={markAllPresent}
                className="h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest border-emerald-200 text-emerald-600 hover:bg-emerald-50"
              >
                Mark All Present
              </Button>
              <Button 
                onClick={handleSave} 
                loading={submitting}
                className="h-12 px-8 bg-blue-600 text-white hover:bg-blue-700 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-100"
              >
                <Save className="h-4 w-4 mr-2" /> Sync Ledger
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline"
              onClick={handleExport}
              className="h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest border-slate-200"
            >
              <Download className="h-4 w-4 mr-2" /> Export CSV
            </Button>
          )}
        </div>
      </div>

      {/* 2. Personal Attendance Section */}
      <PersonalAttendance />

      {/* 3. Stats and Global Actions */}
      {viewMode === 'daily' ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <MetricCard title="Total Staff" value={employees.length} icon={<Users className="h-5 w-5 text-blue-500" />} color="blue" />
            <MetricCard title="Present Today" value={stats.present} icon={<CheckCircle2 className="h-5 w-5 text-emerald-500" />} color="emerald" />
            <MetricCard title="On Leave" value={stats.leave} icon={<History className="h-5 w-5 text-amber-500" />} color="amber" />
            <MetricCard title="Absent" value={stats.absent} icon={<XCircle className="h-5 w-5 text-rose-500" />} color="rose" />
          </div>

          <div className="space-y-6">
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-50/50 p-4 rounded-[2rem] border border-slate-100">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or employee code..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full h-12 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
                />
              </div>
              
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select 
                value={designationFilter}
                onChange={(e) => setDesignationFilter(e.target.value)}
                className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              >
                <option value="all">All Designations</option>
                {designations.map(d => <option key={d} value={d}>{d}</option>)}
              </select>

              <select 
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 shadow-sm"
              >
                <option value="all">All Branches</option>
                {branches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <Button variant="ghost" onClick={() => { setSearch(''); setStatusFilter('all'); setDesignationFilter('all'); setBranchFilter('all'); }} className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600">
                Reset
              </Button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Team Member</th>
                      <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Status Toggle</th>
                      <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-center">In / Out Logs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      Array.from({ length: 10 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100" />
                              <div className="space-y-2">
                                <div className="h-3 w-32 bg-slate-100 rounded-lg" />
                                <div className="h-2.5 w-16 bg-slate-50 rounded-lg" />
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-2">
                              {Array.from({ length: 4 }).map((_, j) => (
                                <div key={j} className="h-8 w-16 bg-slate-50 rounded-xl border border-slate-100" />
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-5">
                            <div className="h-10 w-48 bg-slate-50 rounded-2xl mx-auto border border-slate-100" />
                          </td>
                        </tr>
                      ))
                    ) : filteredEmployees.length > 0 ? (
                      filteredEmployees.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((emp) => (
                        <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-4 cursor-pointer group/staff" onClick={() => { setViewMode('monthly'); setSelectedEmployeeId(emp.id); }}>
                              <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                {emp.name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-black text-slate-900 group-hover/staff:text-blue-600 flex items-center gap-2">
                                  {emp.name}
                                  <ChevronRight className="h-3 w-3 opacity-0 group-hover/staff:opacity-100 transition-all translate-x-[-4px] group-hover/staff:translate-x-0" />
                                </p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.empCode || 'TEMP'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-10 py-5">
                            <div className="flex items-center gap-2">
                              {['present', 'absent', 'half_day', 'leave'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => handleStatusChange(emp.id, status)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    attendance[emp.id] === status ? 
                                      status === 'present' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-100" :
                                      status === 'absent' ? "bg-rose-500 text-white shadow-lg shadow-rose-100" :
                                      status === 'half_day' ? "bg-amber-500 text-white shadow-lg shadow-amber-100" :
                                      "bg-blue-500 text-white shadow-lg shadow-blue-100"
                                    : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                                  )}
                                >
                                  {status.replace('_', ' ')}
                                </button>
                              ))}
                            </div>
                          </td>
                          <td className="px-10 py-5">
                            {(attendance[emp.id] === 'present' || attendance[emp.id] === 'half_day') ? (
                              <div className="flex items-center justify-center gap-2 animate-in zoom-in-95 duration-300">
                                <div className="flex flex-col items-center">
                                  <span className="text-[8px] font-black text-slate-300 uppercase mb-1">Check-in</span>
                                  <input 
                                    type="time" 
                                    value={timeLogs[emp.id]?.checkIn || '09:00'}
                                    onChange={(e) => handleTimeChange(emp.id, 'checkIn', e.target.value)}
                                    className="h-9 px-3 bg-slate-50 border-none rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-100"
                                  />
                                </div>
                                <ArrowRight className="h-3 w-3 text-slate-300 mt-4" />
                                <div className="flex flex-col items-center">
                                  <span className="text-[8px] font-black text-slate-300 uppercase mb-1">Check-out</span>
                                  <input 
                                    type="time" 
                                    value={timeLogs[emp.id]?.checkOut || '18:00'}
                                    onChange={(e) => handleTimeChange(emp.id, 'checkOut', e.target.value)}
                                    className="h-9 px-3 bg-slate-50 border-none rounded-xl text-xs font-black outline-none focus:ring-2 focus:ring-blue-100"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="text-center text-[10px] font-bold text-slate-300 uppercase italic">Timed Log Unavailable</div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-10 py-20 text-center">
                          <div className="max-w-xs mx-auto space-y-4">
                            <div className="h-16 w-16 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-300">
                              <Users className="h-8 w-8" />
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">No Employees Found</h3>
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">
                              You haven't registered any employees yet. Add team members to start tracking attendance and processing payroll.
                            </p>
                            <Button variant="outline" size="sm" className="rounded-xl font-black text-[10px] uppercase tracking-widest" onClick={() => window.location.href = '/dashboard/masters/employees'}>
                              Go to Employee Master
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {!loading && filteredEmployees.length > itemsPerPage && (
                <div className="px-10 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} Team Members
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="h-8 px-4 rounded-lg font-black text-[9px] uppercase border-slate-200 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.ceil(filteredEmployees.length / itemsPerPage) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={cn(
                            "h-8 w-8 rounded-lg text-[9px] font-black transition-all",
                            currentPage === i + 1 
                              ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                              : "bg-white text-slate-400 border border-slate-100 hover:bg-slate-50"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(filteredEmployees.length / itemsPerPage), prev + 1))}
                      disabled={currentPage === Math.ceil(filteredEmployees.length / itemsPerPage)}
                      className="h-8 px-4 rounded-lg font-black text-[9px] uppercase border-slate-200 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : selectedEmployeeId ? (
        /* 4. Single Employee Detailed History View */
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          {employees.filter(e => e.id === selectedEmployeeId).map(emp => {
            const empAttendance = monthlyData.filter(a => a.employeeId === emp.id);
            return (
              <div key={emp.id} className="space-y-6">
                <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 font-black">
                      {emp.name[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900">{emp.name}'s Attendance</h3>
                      <p className="text-sm font-medium text-slate-500">{format(currentMonth, 'MMMM yyyy')} • {emp.designation}</p>
                    </div>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedEmployeeId(null)} className="rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400">
                    Close History
                  </Button>
                </div>

                <div className="grid grid-cols-7 gap-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                  ))}
                  {monthDays.map((day, idx) => {
                    const record = empAttendance.find(a => isSameDay(new Date(a.date), day));
                    return (
                      <div key={day.toISOString()} className={cn(
                        "aspect-square rounded-3xl border border-slate-50 flex flex-col items-center justify-center gap-1 transition-all hover:scale-105",
                        record?.status === 'present' ? "bg-emerald-50 border-emerald-100 text-emerald-700" :
                        record?.status === 'absent' ? "bg-rose-50 border-rose-100 text-rose-700" :
                        record?.status === 'leave' ? "bg-blue-50 border-blue-100 text-blue-700" :
                        record?.status === 'half_day' ? "bg-amber-50 border-amber-100 text-amber-700" :
                        "bg-white text-slate-300"
                      )}>
                        <span className="text-[10px] font-black">{format(day, 'd')}</span>
                        {record && (
                          <span className="text-[8px] font-black uppercase tracking-tighter opacity-70">
                            {record.status === 'half_day' ? 'Half' : record.status}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 5. Monthly Registry View */
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-right-4 duration-500">
          <div className="px-10 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Monthly Team Registry</h3>
            <div className="flex items-center gap-3">
              <Search className="h-4 w-4 text-slate-300" />
              <input 
                placeholder="Search staff..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent border-none text-xs font-bold focus:ring-0 outline-none"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-slate-50/50 border-r border-slate-100 min-w-[200px] z-20">Staff Member</th>
                  {monthDays.map(day => (
                    <th key={day.toISOString()} className={cn(
                      "px-2 py-5 text-[9px] font-black uppercase tracking-tighter text-center min-w-[36px] border-r border-slate-100",
                      format(day, 'eee') === 'Sun' ? "text-rose-500 bg-rose-50/30" : "text-slate-400"
                    )}>
                      {format(day, 'd')}
                      <br />
                      <span className="opacity-50 font-medium">{format(day, 'eee')[0]}</span>
                    </th>
                  ))}
                  <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-center bg-blue-50/30 text-blue-600 sticky right-0 z-20 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">Sum</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map(emp => {
                  const empAttendance = monthlyData.filter(a => a.employeeId === emp.id);
                  const presentCount = empAttendance.filter(a => a.status === 'present').length;
                  
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-4 sticky left-0 bg-white border-r border-slate-100 z-10 group-hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedEmployeeId(emp.id)}>
                        <p className="text-xs font-black text-slate-900 group-hover:text-blue-600">{emp.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{emp.empCode || 'TEMP'}</p>
                      </td>
                      {monthDays.map(day => {
                        const record = empAttendance.find(a => isSameDay(new Date(a.date), day));
                        return (
                          <td key={day.toISOString()} className="p-0 border-r border-slate-50 group/day">
                            <div className={cn(
                              "h-10 w-full flex items-center justify-center transition-all",
                              record?.status === 'present' ? "bg-emerald-500/10 text-emerald-600" :
                              record?.status === 'absent' ? "bg-rose-500/10 text-rose-600" :
                              record?.status === 'leave' ? "bg-blue-500/10 text-blue-600" :
                              record?.status === 'half_day' ? "bg-amber-500/10 text-amber-600" :
                              format(day, 'eee') === 'Sun' ? "bg-slate-50" : ""
                            )}>
                              {record?.status === 'present' && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                              {record?.status === 'absent' && <span className="text-[9px] font-black">A</span>}
                              {record?.status === 'leave' && <span className="text-[9px] font-black">L</span>}
                              {record?.status === 'half_day' && <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                            </div>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center bg-blue-50/20 sticky right-0 z-10 shadow-[-4px_0_8px_rgba(0,0,0,0.02)]">
                        <span className="text-xs font-black text-blue-600">{presentCount}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* 6. Registry Legend */}
          <div className="px-10 py-5 bg-slate-50/30 border-t border-slate-100 flex flex-wrap gap-6 items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">Registry Legend:</p>
            <LegendItem color="bg-emerald-500" label="Present (Full Day)" />
            <LegendItem color="bg-amber-500" label="Half Day" />
            <LegendItem label="A" text="text-rose-600 font-black" label2="Absent" />
            <LegendItem label="L" text="text-blue-600 font-black" label2="Approved Leave" />
            <LegendItem color="bg-slate-50" label="Unmarked / Weekend" border />
          </div>
        </div>
      )}
    </div>
  );
}

function LegendItem({ color, label, label2, text, border }: any) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-4 w-4 rounded flex items-center justify-center text-[8px]",
        color,
        border && "border border-slate-200"
      )}>
        {label.length === 1 ? <span className={text}>{label}</span> : null}
      </div>
      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tight">{label2 || label}</span>
    </div>
  );
}

function PersonalAttendance() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('/api/v1/hr/attendance/me');
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error('Failed to fetch personal attendance', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleAction = async (action: 'check-in' | 'check-out') => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/hr/attendance/me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success(action === 'check-in' ? 'Successfully Punched In' : 'Successfully Punched Out');
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLinkProfile = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/v1/hr/attendance/me/setup', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      toast.success('Employee Profile Created Successfully');
      fetchStatus();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return (
    <div className="h-32 bg-slate-50 animate-pulse rounded-[2.5rem] border border-slate-100" />
  );

  if (!data?.employee) {
    return (
      <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="h-14 w-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Personal Attendance Not Linked</h3>
            <p className="text-sm font-medium text-slate-500 max-w-md">
              We couldn't find an employee profile linked to your account. Click below to automatically set up your presence tracking.
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          onClick={handleLinkProfile}
          loading={actionLoading}
          className="h-12 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200"
        >
          Link My Profile
        </Button>
      </div>
    );
  }

  const { attendance } = data;
  const isCheckedIn = !!attendance;
  const isCheckedOut = !!attendance?.checkOut;

  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-blue-200 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12 group-hover:rotate-45 transition-all duration-700">
        <Timer className="h-48 w-48" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
            <UserCheck className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">Your Daily Presence</h2>
            <p className="text-blue-100 text-sm font-medium opacity-80 uppercase tracking-widest text-[10px] mt-1">
              Logged in as {data.employee.name}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Check-In Time</p>
            <p className="text-lg font-black">{attendance?.checkIn ? format(new Date(attendance.checkIn), 'hh:mm a') : '--:--'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 min-w-[140px]">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Check-Out Time</p>
            <p className="text-lg font-black">{attendance?.checkOut ? format(new Date(attendance.checkOut), 'hh:mm a') : '--:--'}</p>
          </div>

          <div className="h-12 w-[1px] bg-white/20 mx-2 hidden md:block" />

          {!isCheckedIn ? (
            <Button 
              onClick={() => handleAction('check-in')} 
              loading={actionLoading}
              className="h-14 px-10 bg-white text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg"
            >
              Punch In Now
            </Button>
          ) : !isCheckedOut ? (
            <Button 
              onClick={() => handleAction('check-out')} 
              loading={actionLoading}
              className="h-14 px-10 bg-rose-500 text-white hover:bg-rose-600 font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg"
            >
              Punch Out
            </Button>
          ) : (
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 rounded-2xl">
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Attendance Completed</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon, color }: any) {
  const colorStyles: any = {
    emerald: 'bg-emerald-50/50 border-emerald-100',
    rose: 'bg-rose-50/50 border-rose-100',
    blue: 'bg-blue-50/50 border-blue-100',
  };

  return (
    <div className={cn("bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all", colorStyles[color] || "bg-white")}>
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
