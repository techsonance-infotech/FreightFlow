import React from 'react';
import { ModuleGrid, ModuleCard } from '@/components/dashboard/widgets';
import { Calendar, Palmtree, IndianRupee, Users } from 'lucide-react';

export default function HRHubPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-brand-900">HR & Payroll Command Center</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Manage employee attendance, leaves, and monthly payroll processing</p>
      </div>

      <ModuleGrid>
        <ModuleCard 
          title="Attendance Marking" 
          description="Daily and monthly attendance tracking for all staff" 
          icon={<Calendar className="h-6 w-6" />} 
          path="/dashboard/hr/attendance" 
          color="#1565C0" 
        />
        <ModuleCard 
          title="Leave Management" 
          description="Approve/reject leave requests and track balances" 
          icon={<Palmtree className="h-6 w-6" />} 
          path="/dashboard/hr/leaves" 
          color="#2E7D32" 
        />
        <ModuleCard 
          title="Payroll Processing" 
          description="Generate monthly payslips and statutory reports" 
          icon={<IndianRupee className="h-6 w-6" />} 
          path="/dashboard/hr/payroll" 
          color="#C62828" 
        />
        <ModuleCard 
          title="Employee Directory" 
          description="Master records, salary structures, and documents" 
          icon={<Users className="h-6 w-6" />} 
          path="/dashboard/masters/employees" 
          color="#F57F17" 
        />
      </ModuleGrid>

      {/* Quick Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Upcoming Renewals</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-black text-slate-800">DL Expiry: Rajesh Kumar</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Driver - HR-38-9012</p>
              </div>
              <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-full uppercase">In 5 Days</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-xs font-black text-slate-800">Insurance: MH-04-AB-1234</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TATA Prima 4028</p>
              </div>
              <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase">In 12 Days</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Pending Leave Requests</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-100">
              <div>
                <p className="text-xs font-black text-brand-700">Suresh Raina</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Casual Leave - 2 Days</p>
              </div>
              <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Review →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
