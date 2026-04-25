'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/masters/employee-form';
import { toast } from 'sonner';

export default function EmployeesMasterPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/masters/employees');
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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-brand-900">Employee Directory</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Manage staff, drivers, and their salary structures</p>
        </div>
        <Button onClick={() => { setSelectedEmployee(null); setShowForm(true); }} className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg">
          Add New Employee
        </Button>
      </div>

      {showForm ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-xl animate-in slide-in-from-top duration-500">
          <EmployeeForm 
            initialData={selectedEmployee} 
            onSuccess={handleSuccess} 
            onCancel={() => { setShowForm(false); setSelectedEmployee(null); }} 
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/50">
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Designation</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Basic Pay</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Statutory</th>
                  <th className="px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm font-bold text-slate-400 uppercase tracking-widest">
                      No employees registered yet
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-black text-brand-700">{emp.name}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{emp.empCode}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-600">{emp.designation || '-'}</td>
                      <td className="px-6 py-4 text-sm font-black text-slate-900">
                        ₹{((emp.salaryStructure?.basic || 0) / 100).toLocaleString('en-IN')}
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Monthly Basic</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          {emp.salaryStructure?.pfApplicable && <span className="px-1.5 py-0.5 rounded bg-blue-50 text-[9px] font-black text-blue-600 uppercase">PF</span>}
                          {emp.salaryStructure?.esiApplicable && <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-[9px] font-black text-emerald-600 uppercase">ESI</span>}
                          {!emp.salaryStructure?.pfApplicable && !emp.salaryStructure?.esiApplicable && <span className="text-[9px] font-bold text-slate-300 uppercase">No Deductions</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(emp)}
                          className="text-[11px] font-black text-brand-600 uppercase tracking-widest hover:underline"
                        >
                          Edit Profile
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
