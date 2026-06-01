'use client';

import React, { useState } from 'react';
import { 
  AlertTriangle, Trash2, ShieldAlert, 
  ArrowRight, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { resetTenantTransactionalData } from '@/app/actions/admin/tenants';
import { useRouter } from 'next/navigation';

export function ResetOperations({ tenant }: { tenant: any }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const targetConfirmText = `RESET ${tenant.name.toUpperCase()}`;

  const handleReset = async () => {
    if (confirmText.toUpperCase() !== targetConfirmText) {
      toast.error('Confirmation string does not match');
      return;
    }

    setLoading(true);
    try {
      const res = await resetTenantTransactionalData(tenant.id);
      if (res.success) {
        toast.success('Tenant transactional data reset successfully');
        setIsOpen(false);
        setConfirmText('');
        router.refresh();
      } else {
        toast.error('Failed to reset tenant database');
      }
    } catch (error: any) {
      toast.error(error.message || 'An unexpected error occurred during database reset');
    } finally {
      setLoading(false);
    }
  };

  const deletedEntities = [
    'Orders (LRs) & Details',
    'Pallets (Outward / Inward / Return)',
    'Trips & Vehicle Dispatches',
    'Financials, Vouchers & Ledgers',
    'Billing & Tax Invoices (GST/TDS)',
    'Maintenance & Fuel Logs',
    'HR Attendance, Leaves & Payroll Logs',
    'Operational Logs & Caches'
  ];

  const preservedEntities = [
    'Tenant Profile & Settings',
    'Companies & Branches',
    'Dealers, Consignors & Consignees',
    'Vehicles, Drivers & Employees',
    'Pre-numbered Cheque Books',
    'Products & HSN/GST configurations',
    'Active User Accounts',
    'Modules and Permission structures'
  ];

  return (
    <div className="bg-slate-950 border border-red-500/20 rounded-[3rem] p-12 text-white relative overflow-hidden shadow-2xl shadow-red-950/10">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-16 border-b border-white/5 pb-10 relative z-10 gap-6">
        <div className="flex items-center gap-6">
          <div className="h-16 w-16 bg-red-950/40 border border-red-500/30 rounded-2xl flex items-center justify-center text-red-500 shadow-2xl shadow-red-500/20 rotate-3">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div>
            <h3 className="text-3xl font-black tracking-tighter text-red-500">Ecosystem Hard Reset</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mt-2">DANGEROUS & IRREVERSIBLE OPERATION</p>
          </div>
        </div>
        <div>
          <span className="px-4 py-2 bg-red-950/40 border border-red-500/30 rounded-xl text-[9px] font-black uppercase tracking-widest text-red-400 animate-pulse">
            RESTRICTED ACCESS
          </span>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl">
        <p className="text-slate-300 font-bold text-sm leading-relaxed mb-10">
          This operation resets all transactional histories for the selected tenant (<span className="text-white font-black">{tenant.name}</span>), preparing it for a clean workspace launch (e.g. fresh June 1st launch) while retaining all business masters, dealers, consignees, vehicles, employees, and users.
        </p>

        <Button 
          onClick={() => setIsOpen(true)}
          className="h-16 px-10 bg-red-950/40 border border-red-500/40 hover:bg-red-600 hover:border-red-600 text-red-400 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-4 transition-all active:scale-[0.98]"
        >
          Initialize Reset Protocol
          <ArrowRight className="h-5 w-5 animate-pulse" />
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal 
        isOpen={isOpen} 
        onClose={() => { if (!loading) setIsOpen(false); }} 
        title="Execute Ecosystem Hard Reset"
        size="lg"
      >
        <div className="space-y-8 text-slate-700">
          <div className="flex items-start gap-4 p-6 bg-red-50 border border-red-100 rounded-2xl text-red-800">
            <ShieldAlert className="h-6 w-6 shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm uppercase tracking-wider">Irreversible Action Alert</p>
              <p className="text-xs font-bold mt-1 text-red-700">
                All records marked for deletion will be permanently erased. There is no automated restore or database backup fallback for this action.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Will be Deleted */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Will Be Purged
              </p>
              <ul className="space-y-3">
                {deletedEntities.map((item, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <span className="text-red-500 font-bold shrink-0">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Will be Kept */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full" /> Will Be Preserved
              </p>
              <ul className="space-y-3">
                {preservedEntities.map((item, idx) => (
                  <li key={idx} className="text-xs font-bold text-slate-500 flex items-center gap-2">
                    <span className="text-emerald-500 font-bold shrink-0">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Type Confirmation */}
          <div className="border-t border-slate-100 pt-8 space-y-4">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
              To proceed, please type the confirmation code below:
            </label>
            <div className="p-4 bg-slate-100 rounded-xl font-mono text-center text-sm font-black text-slate-800 tracking-wider">
              {targetConfirmText}
            </div>
            <Input 
              placeholder={`Type "${targetConfirmText}" to unlock`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={loading}
              className="h-14 rounded-xl border-slate-200 focus:border-red-500 font-bold text-slate-900 placeholder:text-slate-300"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-4 border-t border-slate-100 pt-6">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              disabled={loading}
              className="h-14 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 active:scale-95"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              disabled={loading || confirmText.toUpperCase() !== targetConfirmText}
              className="h-14 px-10 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 transition-all active:scale-[0.98] disabled:opacity-30"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Purging Workspace...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Execute Reset Protocol
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
