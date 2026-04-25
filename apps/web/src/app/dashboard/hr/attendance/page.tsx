'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function AttendancePage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchData();
  }, [date]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch all employees
      const empRes = await fetch('/api/v1/masters/employees');
      const empData = await empRes.json();
      
      // 2. Fetch existing attendance for the date
      const attRes = await fetch(`/api/v1/hr/attendance?date=${date}`);
      const attData = await attRes.json();
      
      setEmployees(empData.data || []);
      
      const attMap: Record<string, string> = {};
      (attData.data || []).forEach((a: any) => {
        attMap[a.employeeId] = a.status;
      });
      
      // Default to 'present' for employees without records
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

    const loadingToast = toast.loading('Saving attendance...');
    try {
      const res = await fetch('/api/v1/hr/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, entries })
      });
      
      if (res.ok) {
        toast.success('Attendance saved successfully', { id: loadingToast });
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save attendance', { id: loadingToast });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">Daily Attendance</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Mark attendance for employees and drivers</p>
        </div>
        <div className="flex items-center gap-3">
          <input 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold shadow-sm"
          />
          <Button onClick={handleSave} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Code</th>
                <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                    No active employees found
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-black text-brand-700">{emp.name}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{emp.empCode || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        {['present', 'absent', 'half_day', 'leave'].map((status) => (
                          <label key={status} className="flex flex-col items-center gap-1 cursor-pointer group">
                            <input 
                              type="radio" 
                              name={`att-${emp.id}`} 
                              value={status} 
                              checked={attendance[emp.id] === status}
                              onChange={() => handleStatusChange(emp.id, status)}
                              className="hidden peer"
                            />
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black uppercase transition-all
                              ${attendance[emp.id] === status 
                                ? (status === 'present' ? 'bg-emerald-100 border-emerald-500 text-emerald-700' :
                                   status === 'absent' ? 'bg-rose-100 border-rose-500 text-rose-700' :
                                   status === 'half_day' ? 'bg-amber-100 border-amber-500 text-amber-700' :
                                   'bg-blue-100 border-blue-500 text-blue-700')
                                : 'border-slate-100 bg-white text-slate-300 group-hover:border-slate-300'
                              }
                            `}>
                              {status === 'present' ? 'P' : status === 'absent' ? 'A' : status === 'half_day' ? 'H' : 'L'}
                            </div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                              {status.replace('_', ' ')}
                            </span>
                          </label>
                        ))}
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
  );
}
