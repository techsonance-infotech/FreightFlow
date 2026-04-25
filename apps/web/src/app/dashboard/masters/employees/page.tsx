'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, User, Briefcase, IndianRupee, 
  ShieldCheck, MoreHorizontal, Edit3, Trash2,
  Filter, ChevronRight, UserPlus, Users, 
  ArrowUpRight, Download, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/masters/employee-form';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EmployeesMasterPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/masters/employees?limit=100');
      const data = await res.json();
      setEmployees(data.data || []);
    } catch (error) {
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setShowForm(true);
  };

  const handleSuccess = () => {
    setShowForm(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.empCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20 px-4">
      {/* 1. High-Impact Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Employee Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage corporate staff, operators, and salary structures</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={<Download className="h-4 w-4" />}>
            Export Registry
          </Button>
          <Button 
            onClick={() => { setSelectedEmployee(null); setShowForm(true); }} 
            className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 active:scale-95 transition-all group"
          >
            <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* 2. Visual Analytics Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Active Staff" value={employees.length.toString()} sub="Total Workforce" icon={<Users className="h-4 w-4 text-blue-500" />} />
        <MetricCard title="Onboarded (MTD)" value="12" sub="+3 from last month" icon={<UserPlus className="h-4 w-4 text-emerald-500" />} />
        <MetricCard title="Payroll Liability" value="₹ 14.5L" sub="Est. Monthly" icon={<IndianRupee className="h-4 w-4 text-slate-900" />} />
        <MetricCard title="Compliance" value="94%" sub="Docs Verified" icon={<ShieldCheck className="h-4 w-4 text-blue-500" />} />
      </div>

      {showForm ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-2xl shadow-slate-100/50 animate-in slide-in-from-top-4 duration-500 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-600" />
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{selectedEmployee ? 'Modify Profile' : 'Staff Registration'}</h3>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mt-1">Universal Employee Onboarding Hub</p>
            </div>
            <button onClick={() => { setShowForm(false); setSelectedEmployee(null); }} className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center font-black">✕</button>
          </div>
          <EmployeeForm 
            initialData={selectedEmployee} 
            onSuccess={handleSuccess} 
            onCancel={() => { setShowForm(false); setSelectedEmployee(null); }} 
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3. Search & Filter Command Bar */}
          <div className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
              <input 
                placeholder="Search staff by Name, ID, or Phone..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-11 pr-4 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" 
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>
                Departments
              </Button>
              <Button variant="outline" size="sm" icon={<Filter className="h-3.5 w-3.5" />}>
                Active Status
              </Button>
            </div>
          </div>

          {/* 4. Premium Employee Registry */}
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400">
                  <tr>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Team Member</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Assignment</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest">Remuneration</th>
                    <th className="px-10 py-5 text-[10px] font-black uppercase tracking-widest text-center">Benefits</th>
                    <th className="px-10 py-5 w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-10 py-6"><div className="h-12 bg-slate-50 rounded-2xl" /></td>
                      </tr>
                    ))
                  ) : filteredEmployees.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-10 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="h-10 w-10 text-slate-100" />
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No staff records found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-10 py-5">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100 shadow-sm group-hover:scale-105 transition-transform">
                              {emp.name.split(' ').map((n: string) => n[0]).join('')}
                            </div>
                            <div>
                              <p className="text-sm font-black text-slate-900">{emp.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.empCode || 'TEMP'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-5">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Briefcase className="h-3 w-3 text-slate-400" />
                              <span className="text-xs font-black text-slate-700">{emp.designation || 'General Staff'}</span>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-1">{emp.department || 'Operations'}</span>
                          </div>
                        </td>
                        <td className="px-10 py-5">
                          <div className="font-black text-slate-900">₹{((emp.salaryStructure?.basic || 0) / 100).toLocaleString('en-IN')}</div>
                          <div className="text-[9px] font-black text-blue-500 uppercase tracking-tighter mt-0.5">Core Settlement</div>
                        </td>
                        <td className="px-10 py-5">
                          <div className="flex justify-center gap-2">
                            {emp.salaryStructure?.pfApplicable ? (
                              <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-[9px] font-black text-blue-600 uppercase border border-blue-100">PF</span>
                            ) : null}
                            {emp.salaryStructure?.esiApplicable ? (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase border border-emerald-100">ESI</span>
                            ) : null}
                            {!emp.salaryStructure?.pfApplicable && !emp.salaryStructure?.esiApplicable && (
                              <span className="text-[9px] font-bold text-slate-300 uppercase italic">Basic Only</span>
                            )}
                          </div>
                        </td>
                        <td className="px-10 py-5 text-right">
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(emp)} className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-sm">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* 5. Modern Pagination */}
            <div className="px-10 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Page 1 of 4 <span className="mx-2 text-slate-200">|</span> 24 Members Total</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase">Previous</Button>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase">Next</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, sub, icon }: any) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
        <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-blue-50 transition-colors">
          {icon}
        </div>
      </div>
      <h3 className="text-xl font-black text-slate-900">{value}</h3>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1 italic">{sub}</p>
    </div>
  );
}
