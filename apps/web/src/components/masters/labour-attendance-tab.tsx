'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AttendanceTabProps {
  labourId: string;
}

export function AttendanceTab({ labourId }: AttendanceTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM');
      const response = await fetch(`/api/v1/masters/labour/attendance?labourId=${labourId}&month=${monthStr}`);
      if (response.ok) {
        setAttendance(await response.json());
      }
    } catch (error) {
      toast.error('Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handleMarkAttendance = async (date: Date, status: string) => {
    try {
      const response = await fetch('/api/v1/masters/labour/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          labourId,
          date: format(date, 'yyyy-MM-dd'),
          status,
        }),
      });
      if (response.ok) {
        toast.success(`Marked as ${status}`);
        fetchAttendance();
      }
    } catch (error) {
      toast.error('Error marking attendance');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Attendance Calendar</h3>
        <div className="flex items-center gap-4 bg-slate-50 p-1.5 rounded-xl border border-slate-100">
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="h-8 w-8 p-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-black uppercase tracking-widest text-slate-900 w-32 text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="bg-slate-50 p-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
        ))}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-white p-4" />
        ))}
        {days.map(day => {
          const record = attendance.find(a => isSameDay(new Date(a.date), day));
          return (
            <div key={day.toString()} className="bg-white p-4 min-h-[100px] hover:bg-slate-50 transition-colors group">
              <p className="text-xs font-black text-slate-400 group-hover:text-blue-600 transition-colors">{format(day, 'd')}</p>
              <div className="mt-2 space-y-1">
                {record ? (
                  <span className={`block text-[8px] font-black uppercase tracking-wider py-1 text-center rounded-md ${
                    record.status === 'Present' ? 'bg-green-50 text-green-600 border border-green-100' :
                    record.status === 'HalfDay' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                    'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {record.status}
                  </span>
                ) : (
                  <div className="flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleMarkAttendance(day, 'Present')} className="text-[7px] font-black bg-slate-100 hover:bg-green-500 hover:text-white px-1.5 py-1 rounded transition-colors uppercase">P</button>
                    <button onClick={() => handleMarkAttendance(day, 'HalfDay')} className="text-[7px] font-black bg-slate-100 hover:bg-orange-500 hover:text-white px-1.5 py-1 rounded transition-colors uppercase">H</button>
                    <button onClick={() => handleMarkAttendance(day, 'Absent')} className="text-[7px] font-black bg-slate-100 hover:bg-red-500 hover:text-white px-1.5 py-1 rounded transition-colors uppercase">A</button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between bg-blue-50 p-4 rounded-2xl border border-blue-100">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Present</p>
            <p className="text-lg font-black text-blue-600">{attendance.filter(a => a.status === 'Present').length}</p>
          </div>
          <div className="h-8 w-px bg-blue-100" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Half Days</p>
            <p className="text-lg font-black text-blue-600">{attendance.filter(a => a.status === 'HalfDay').length}</p>
          </div>
          <div className="h-8 w-px bg-blue-100" />
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Absent</p>
            <p className="text-lg font-black text-red-500">{attendance.filter(a => a.status === 'Absent').length}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-400">Working Days</p>
          <p className="text-lg font-black text-slate-900">
            {attendance.filter(a => a.status === 'Present').length + (attendance.filter(a => a.status === 'HalfDay').length * 0.5)}
          </p>
        </div>
      </div>
    </div>
  );
}
