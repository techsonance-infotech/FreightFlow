'use client';

import React, { useState } from 'react';
import { 
  Building2, Plus, CheckCircle2, XCircle, 
  ArrowRightLeft, ShieldCheck, MapPin, Loader2, 
  X, Hash, Phone, Globe, Eye, FileText, LayoutDashboard,
  Calendar, Mail, ArrowRight, Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { toggleCompanyStatus } from '@/app/actions/settings/organizations';
import { requestCompanySwitchOtp, verifyCompanySwitchOtp } from '@/app/actions/auth/otp';
import { CompanySetupWizard } from './company-setup-wizard';
import { CompanyEditForm } from './company-edit-form';
import { OtpModal } from '../auth/otp-modal';

interface Company {
  id: string;
  name: string;
  gstin: string | null;
  pan: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
  createdAt: any;
  _count: {
    vehicles: number;
    employees: number;
  };
}

interface CompanyManagerProps {
  companies: Company[];
  currentCompanyId: string;
}

import Link from 'next/link';

export function CompanyManager({ companies, currentCompanyId }: CompanyManagerProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [switchingTo, setSwitchingTo] = useState<Company | null>(null);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleSwitchRequest = async (company: Company) => {
    setLoading(company.id);
    try {
      toast.loading('Requesting security code...', { id: 'switch' });
      await requestCompanySwitchOtp(company.id);
      setSwitchingTo(company);
      setShowOtpModal(true);
      toast.success('Security code sent to your email', { id: 'switch' });
    } catch (err: any) {
      toast.error(err.message || 'Failed to request OTP', { id: 'switch' });
    } finally {
      setLoading(null);
    }
  };

  const handleOtpVerify = async (otp: string) => {
    if (!switchingTo) return;
    try {
      toast.loading('Verifying and switching context...', { id: 'verify' });
      await verifyCompanySwitchOtp(switchingTo.id, otp);
      toast.success('Workspace switched successfully', { id: 'verify' });
      // Refresh to reload all data in the new context
      window.location.href = '/dashboard';
    } catch (err: any) {
      toast.error(err.message || 'Verification failed', { id: 'verify' });
      throw err;
    }
  };

  const handleResendOtp = async () => {
    if (!switchingTo) return;
    await requestCompanySwitchOtp(switchingTo.id);
    toast.success('A new security code has been sent');
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      toast.loading('Updating status...', { id: 'toggle' });
      await toggleCompanyStatus(id, !currentStatus);
      toast.success(`Organization ${!currentStatus ? 'enabled' : 'disabled'}`, { id: 'toggle' });
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message, { id: 'toggle' });
    }
  };

  return (
    <div className="space-y-10 px-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Organizations</h2>
          <p className="text-sm text-slate-500 mt-1">Manage multiple business entities under your tenant account.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add New Company
        </button>
      </div>

      {/* Company List */}
      <div className="grid grid-cols-1 gap-4">
        {companies.map((company) => {
          const isActive = company.id === currentCompanyId;
          const isEnabled = company.isActive;

          return (
            <div 
              key={company.id} 
              className={cn(
                "group relative flex flex-col md:flex-row md:items-center gap-6 p-5 rounded-3xl border transition-all duration-300",
                isActive 
                  ? "bg-blue-50/30 border-blue-200 shadow-sm" 
                  : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md"
              )}
            >
              <div className="absolute top-5 right-6">
                {isEnabled ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-400 border border-slate-100">
                    <XCircle className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Disabled</span>
                  </div>
                )}
              </div>

              <div className={cn(
                "h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:scale-105",
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-slate-100 text-slate-400"
              )}>
                {company.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-black text-slate-900 truncate tracking-tight">{company.name}</h3>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[8px] font-black uppercase tracking-tighter">Current Workspace</span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4 mt-1.5 text-slate-400 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {company.city || 'Pending'}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> GST: {company.gstin || 'None'}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="uppercase tracking-tight">{company._count.vehicles} Vehicles • {company._count.employees} Staff</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <Link 
                  href={`/dashboard/settings/organization?id=${company.id}`}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100"
                >
                  View
                </Link>
                <Link 
                  href={`/dashboard/settings/organization?id=${company.id}&edit=true`}
                  className="px-4 py-2 rounded-xl bg-slate-50 text-blue-600 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all border border-slate-100"
                >
                  Edit
                </Link>
                {!isActive && isEnabled && (
                  <button 
                    onClick={() => handleSwitchRequest(company)}
                    disabled={loading === company.id}
                    className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
                  >
                    {loading === company.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRightLeft className="h-3.5 w-3.5" />}
                    Switch
                  </button>
                )}
                <button 
                  onClick={() => handleToggle(company.id, isEnabled)}
                  disabled={isActive}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all",
                    isActive ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-400" : 
                    isEnabled ? "border-rose-100 text-rose-400 hover:bg-rose-50" : "border-emerald-100 text-emerald-500 hover:bg-emerald-50"
                  )}
                >
                  {isEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODALS --- */}

      {/* OTP Verification Modal */}
      <OtpModal 
        isOpen={showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setSwitchingTo(null);
        }}
        onVerify={handleOtpVerify}
        onResend={handleResendOtp}
        title="Authorize Switch"
        description={`A security code has been sent to verify your request to switch to ${switchingTo?.name}.`}
      />

      {/* Add Company Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                  <Building2 className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Establish Organization</h2>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <X className="h-5 w-5 text-slate-300" />
              </button>
            </div>

            <CompanySetupWizard 
              onComplete={() => {
                toast.success('Organization established successfully!');
                setIsAddModalOpen(false);
                window.location.reload();
              }}
              onClose={() => setIsAddModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components (reused)
function PopupSection({ title, children }: any) {
  return (
    <div className="space-y-5">
      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">{title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function PopupItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-white hover:border-blue-100 transition-all">
      <div className="h-9 w-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'h-4 w-4' })}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">{label}</p>
        <p className="text-[13px] font-black text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}

function PopupStat({ label, value, unit }: any) {
  return (
    <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100/50 text-center shadow-inner">
      <p className="text-[9px] font-black uppercase tracking-widest text-blue-500/60 mb-1.5">{label}</p>
      <div className="text-2xl font-black text-blue-600 leading-none">{value}</div>
      <p className="text-[8px] font-bold text-blue-400 uppercase mt-1">{unit}</p>
    </div>
  );
}


