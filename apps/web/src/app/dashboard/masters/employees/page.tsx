'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, User, Briefcase, IndianRupee, 
  ShieldCheck, MoreHorizontal, Edit3, Trash2,
  Filter, ChevronRight, UserPlus, Users, 
  ArrowUpRight, Download, Eye, Check, AlertCircle
} from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { EmployeeForm } from '@/components/masters/employee-form';
import { EmployeeDetailView } from '@/components/masters/employee-detail-view';
import { EmployeeTransactionModal } from '@/components/masters/employee-transaction-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function EmployeesMasterPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [search, setSearch] = useState('');

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

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEdit = (emp: any) => {
    setSelectedEmployee(emp);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    try {
      const res = await fetch(`/api/v1/masters/employees/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Employee deleted successfully');
        fetchEmployees();
      } else {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      toast.error('Deletion failed');
    }
  };

  const handleSuccess = () => {
    setShowModal(false);
    setSelectedEmployee(null);
    fetchEmployees();
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.empCode?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20 px-8 py-8">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
           <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Users className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employee Directory</h1>
          </div>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest ml-15">Universal Command Center for Workforce & Compliance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => { setSelectedEmployee(null); setShowModal(true); }} 
            className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-100 active:scale-95 transition-all group rounded-2xl font-black uppercase tracking-widest text-[11px]"
          >
            <UserPlus className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
            Add New Employee
          </Button>
        </div>
      </div>

      {/* 2. Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <MetricCard 
          title="Active Staff" 
          value={employees.filter(e => e.status === 'active').length.toString()} 
          sub="On-duty Personnel" 
          icon={<Users className="h-4 w-4 text-blue-500" />} 
        />
        <MetricCard 
          title="Compliance Score" 
          value={`${Math.round((employees.filter(e => e.panUrl && e.aadharUrl).length / (employees.length || 1)) * 100)}%`} 
          sub="Verified Vault" 
          icon={<ShieldCheck className="h-4 w-4 text-emerald-500" />} 
        />
        <MetricCard 
          title="Monthly Liability" 
          value={`₹${((employees.reduce((acc, curr) => acc + (curr.salaryStructure?.basic || 0), 0) / 100) / 100000).toFixed(1)}L`} 
          sub="Estimated Payroll" 
          icon={<IndianRupee className="h-4 w-4 text-slate-900" />} 
        />
        <MetricCard 
          title="Growth Rate" 
          value="+12%" 
          sub="Last 30 Days" 
          icon={<ArrowUpRight className="h-4 w-4 text-blue-500" />} 
        />
      </div>

      <div className="space-y-6">
        {/* 3. Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              placeholder="Search by name, ID, or phone..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-4 bg-slate-50/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" 
            />
          </div>
          <div className="flex gap-2 border-l border-slate-100 pl-4 h-12 items-center">
             <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-[10px] font-black uppercase tracking-widest">
              <Download className="h-3.5 w-3.5 mr-2" />
              Export Registry
            </Button>
          </div>
        </div>

        {/* 4. List */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Designation</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Joining Date</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Compliance</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-50 border border-slate-100" />
                        <div className="space-y-2">
                          <div className="h-3 w-32 bg-slate-100 rounded-lg" />
                          <div className="h-2.5 w-16 bg-slate-50 rounded-lg" />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="space-y-2">
                        <div className="h-3 w-24 bg-slate-100 rounded-lg" />
                        <div className="h-2.5 w-20 bg-slate-50 rounded-lg" />
                      </div>
                    </td>
                    <td className="px-8 py-5"><div className="h-4 w-24 bg-slate-100 rounded-lg" /></td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="h-6 w-10 bg-slate-50 rounded-lg" />
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right"><div className="h-9 w-32 bg-slate-50 rounded-xl ml-auto" /></td>
                  </tr>
                ))
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-40">
                      <span className="text-4xl">👥</span>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-900">No Employee Records Found</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black text-xs border border-slate-100">
                        {emp.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">{emp.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.empCode || 'TEMP'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{emp.designation || 'Staff'}</td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">{emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <ComplianceBadge label="PAN" active={!!emp.pan} />
                      <ComplianceBadge label="ADR" active={!!emp.aadharNo} />
                      <ComplianceBadge label="BNK" active={!!emp.bankAccount} />
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                      <button 
                        onClick={() => { setSelectedEmployee(emp); setShowDetailView(true); }}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-blue-600 hover:text-white transition-all text-xs shadow-sm"
                        title="View Ledger"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => { setSelectedEmployee(emp); setShowTransactionModal(true); }}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-emerald-500 hover:text-white transition-all text-xs shadow-sm"
                        title="Record Transaction"
                      >
                        <IndianRupee className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEdit(emp)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-blue-500 hover:text-white transition-all text-xs shadow-sm"
                        title="Edit Profile"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(emp.id)}
                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-white border border-slate-100 hover:bg-rose-500 hover:text-white transition-all text-xs shadow-sm"
                        title="Delete Record"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Form Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => { setShowModal(false); setSelectedEmployee(null); }}
        title={selectedEmployee ? "Edit Employee Profile" : "Register New Employee"}
        size="lg"
      >
        <EmployeeForm 
          initialData={selectedEmployee} 
          onSuccess={handleSuccess} 
          onCancel={() => { setShowModal(false); setSelectedEmployee(null); }} 
        />
      </Modal>

      {/* Detailed Side Panel View */}
      <EmployeeDetailView 
        employee={selectedEmployee} 
        isOpen={showDetailView}
        onClose={() => setShowDetailView(false)} 
      />

      {/* Transaction Modal */}
      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Record Financial Transaction"
        size="md"
      >
        {selectedEmployee && (
          <EmployeeTransactionModal 
            employeeId={selectedEmployee.id}
            onSuccess={() => { setShowTransactionModal(false); fetchEmployees(); }}
            onCancel={() => setShowTransactionModal(false)}
          />
        )}
      </Modal>
    </div>
  );
}

function MetricCard({ title, value, sub, icon }: any) {
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-24 w-24' })}
      </div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
            {icon}
          </div>
          <ArrowUpRight className="h-4 w-4 text-slate-200 group-hover:text-blue-500 transition-colors" />
        </div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{title}</p>
        <p className="text-[9px] font-bold text-slate-300 uppercase mt-0.5 italic">{sub}</p>
      </div>
    </div>
  );
}

function ComplianceBadge({ label, active }: { label: string, active: boolean }) {
  return (
    <div className={cn(
      "px-1.5 py-0.5 rounded-md text-[7px] font-black uppercase tracking-tighter flex items-center gap-1 border",
      active ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100 grayscale"
    )}>
      <span className="text-[8px] font-black leading-none">{label}</span>
      {active ? <Check className="h-2 w-2 mt-0.5" /> : <AlertCircle className="h-2 w-2 mt-0.5" />}
    </div>
  );
}
