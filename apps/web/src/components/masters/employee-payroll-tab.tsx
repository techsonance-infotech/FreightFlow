'use client';

import React from 'react';
import { IndianRupee, Landmark, ShieldCheck, History, ArrowDownToLine, Receipt, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmployeePayrollTabProps {
  employee: any;
}

export function EmployeePayrollTab({ employee }: EmployeePayrollTabProps) {
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`/api/v1/masters/employees/${employee.id}/payroll-history`);
        const data = await res.json();
        setHistory(data.data || []);
      } catch (e) {
        console.error('Failed to fetch payroll history');
      } finally {
        setLoading(false);
      }
    };
    if (employee?.id) fetchHistory();
  }, [employee?.id]);

  const formatAmount = (paise: number) => {
    return (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 mb-6">
            <Landmark className="h-6 w-6" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monthly Basic</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{(employee.salaryStructure?.basic / 100 || 0).toLocaleString()}</p>
          <div className="flex items-center gap-2 mt-4">
             <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">Active</span>
             <span className="text-[10px] font-bold text-slate-300">Effective from 01 Apr 2024</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Monthly ESI/PF</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">
            ₹{((((employee.salaryStructure?.basic || 0) * 0.12) + ((employee.salaryStructure?.basic || 0) * 0.0075)) / 100).toLocaleString()}
          </p>
          <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-widest">Statutory Deductions (Calculated)</p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white mb-6">
            <IndianRupee className="h-6 w-6" />
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Take Home</h4>
          <p className="text-3xl font-black text-slate-900 mt-2">₹{(( (employee.salaryStructure?.basic || 0) - ((employee.salaryStructure?.basic || 0) * 0.12) - ((employee.salaryStructure?.basic || 0) * 0.0075) ) / 100).toLocaleString()}</p>
          <p className="text-[10px] font-bold text-slate-300 mt-4 uppercase tracking-widest">Approximate Calculation</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Payroll Disbursement History</h3>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-20 text-center animate-pulse text-slate-400 font-black uppercase tracking-widest text-xs">Synchronizing history...</div>
          ) : history.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Month / Year</th>
                  <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Net Paid</th>
                  <th className="px-10 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((run) => (
                  <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-10 py-5">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Calendar className="h-5 w-5" />
                         </div>
                         <div>
                            <p className="text-sm font-black text-slate-900">{run.run?.month}/{run.run?.year}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase">Settled on {new Date(run.run?.processedAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-10 py-5 text-right font-black text-emerald-600">
                      {formatAmount(run.netPay)}
                    </td>
                    <td className="px-10 py-5 text-right">
                       <Button variant="ghost" className="h-10 rounded-xl px-4 text-[9px] font-black uppercase tracking-widest text-blue-600">
                          <ArrowDownToLine className="h-3 w-3 mr-2" /> Download Slip
                       </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-20 text-center flex flex-col items-center gap-6 opacity-40">
              <div className="h-20 w-20 rounded-[2rem] bg-slate-50 flex items-center justify-center">
                <History className="h-10 w-10 text-slate-200" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-slate-900">No Disbursement History</p>
                <p className="text-[10px] font-bold text-slate-400 mt-2">Salary runs will appear here after payroll processing</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex items-center justify-between overflow-hidden relative group">
        <div className="absolute right-0 top-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
          <Receipt className="h-40 w-40" />
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black tracking-tight">Full & Final Settlement</h3>
          <p className="text-slate-400 text-xs font-bold mt-2 uppercase tracking-widest">Initiate resignation or termination settlement</p>
        </div>
        <Button className="relative z-10 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-2xl">
          Start Settlement
        </Button>
      </div>
    </div>
  );
}
