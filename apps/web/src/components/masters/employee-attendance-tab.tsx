'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmployeeAttendanceTabProps {
  employeeId: string;
}

export function EmployeeAttendanceTab({ employeeId }: EmployeeAttendanceTabProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const monthStr = format(currentMonth, 'yyyy-MM-dd');
      const response = await fetch(`/api/v1/hr/attendance?employeeId=${employeeId}&mode=monthly&date=${monthStr}`);
      if (response.ok) {
        const json = await response.json();
        setAttendance(json.data || []);
      }
    } catch (error) {
      toast.error('Error fetching attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, employeeId]);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Attendance History</h3>
          <p className="text-sm font-bold text-slate-900 mt-1">{format(currentMonth, 'MMMM yyyy')}</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
          <Button variant="ghost" size="icon" onClick={prevMonth} className="h-9 w-9 rounded-xl hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="h-4 w-px bg-slate-100" />
          <Button variant="ghost" size="icon" onClick={nextMonth} className="h-9 w-9 rounded-xl hover:bg-slate-50">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="py-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">{d}</div>
        ))}
        {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-slate-50/30 rounded-[1.5rem] border border-dashed border-slate-100" />
        ))}
        {days.map(day => {
          const record = attendance.find(a => isSameDay(new Date(a.date), day));
          return (
            <div key={day.toString()} className={cn(
              "aspect-square rounded-[1.5rem] border p-4 transition-all relative group overflow-hidden",
              record ? (
                record.status === 'present' ? 'bg-emerald-50 border-emerald-100' :
                record.status === 'half_day' ? 'bg-amber-50 border-amber-100' :
                record.status === 'leave' ? 'bg-blue-50 border-blue-100' :
                'bg-rose-50 border-rose-100'
              ) : 'bg-white border-slate-100 hover:border-blue-200'
            )}>
              <p className={cn(
                "text-xs font-black",
                record ? "text-slate-900" : "text-slate-400"
              )}>{format(day, 'd')}</p>
              
              <div className="mt-2">
                {record ? (
                  <div className="space-y-2">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider",
                      record.status === 'present' ? 'bg-emerald-500 text-white' :
                      record.status === 'half_day' ? 'bg-amber-500 text-white' :
                      record.status === 'leave' ? 'bg-blue-500 text-white' :
                      'bg-rose-500 text-white'
                    )}>
                      {record.status === 'present' && <CheckCircle2 className="h-2 w-2" />}
                      {record.status === 'half_day' && <Clock className="h-2 w-2" />}
                      {record.status === 'leave' && <AlertCircle className="h-2 w-2" />}
                      {record.status === 'absent' && <XCircle className="h-2 w-2" />}
                      {record.status}
                    </div>
                    {record.checkIn && (
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                        {format(new Date(record.checkIn), 'hh:mm a')}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-1 h-1 rounded-full bg-slate-200" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-12">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Present</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {attendance.filter(a => a.status === 'present').length}
            </p>
          </div>
          <div className="h-10 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Half Days</p>
            <p className="text-2xl font-black text-amber-500 mt-1">
              {attendance.filter(a => a.status === 'half_day').length}
            </p>
          </div>
          <div className="h-10 w-px bg-slate-100" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Leaves/Absent</p>
            <p className="text-2xl font-black text-rose-500 mt-1">
              {attendance.filter(a => a.status === 'absent' || a.status === 'leave').length}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Performance</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
               <div 
                className="h-full bg-blue-600 transition-all duration-1000" 
                style={{ width: `${Math.round((attendance.filter(a => a.status === 'present').length / (days.length || 1)) * 100)}%` }} 
               />
            </div>
            <p className="text-sm font-black text-slate-900">
              {Math.round((attendance.filter(a => a.status === 'present').length / (days.length || 1)) * 100)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
