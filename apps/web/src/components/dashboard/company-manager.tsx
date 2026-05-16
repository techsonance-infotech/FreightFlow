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
  userRole: string;
}

import Link from 'next/link';

export function CompanyManager({ companies, currentCompanyId, userRole }: CompanyManagerProps) {
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(
    companies.find(c => c.id === currentCompanyId) || companies[0] || null
  );
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
        {(userRole === 'tenant_owner' || userRole === 'fleet_owner' || userRole === 'business_owner') && (
          <Link 
            href="/dashboard/settings/organizations/new"
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Establish New Organization
          </Link>
        )}
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
                  ? "bg-blue-50/30 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800 shadow-sm" 
                  : isEnabled
                    ? "bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-md"
                    : "bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 opacity-60 grayscale-[0.4]"
              )}
            >
              <div className="absolute top-5 right-6">
                {isEnabled ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-500 dark:text-rose-400 border border-rose-100 dark:border-rose-800">
                    <XCircle className="h-3 w-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Deactivated</span>
                  </div>
                )}
              </div>

              <div className={cn(
                "h-16 w-16 shrink-0 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner transition-transform group-hover:scale-105",
                isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-100 dark:shadow-none" : isEnabled ? "bg-slate-100 dark:bg-slate-800 text-slate-400" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
              )}>
                {company.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className={cn("text-lg font-black truncate tracking-tight", isEnabled ? "text-slate-900 dark:text-slate-100" : "text-slate-400")}>{company.name}</h3>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[8px] font-black uppercase tracking-tighter">Current Workspace</span>
                  )}
                </div>
                <div className={cn("flex flex-wrap items-center gap-y-2 gap-x-4 mt-1.5 text-[11px] font-bold", isEnabled ? "text-slate-400 dark:text-slate-500" : "text-slate-300 dark:text-slate-600")}>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {isEnabled ? (company.city || 'Pending') : 'Restricted'}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> GST: {isEnabled ? (company.gstin || 'None') : '••••'}</span>
                  <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                  <span className="uppercase tracking-tight">{isEnabled ? `${company._count.vehicles} Vehicles • ${company._count.employees} Staff` : 'Resources Offline'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                {isEnabled ? (
                  <>
                    <Link 
                      href={isActive ? `/dashboard/settings/organization` : `/dashboard/settings/organizations/new?id=${company.id}&mode=view`}
                      className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      View
                    </Link>
                    <Link 
                      href={isActive ? `/dashboard/settings/organization` : `/dashboard/settings/organizations/new?id=${company.id}&mode=edit`}
                      className="px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all border border-slate-100 dark:border-slate-700"
                    >
                      Edit
                    </Link>
                    {!isActive && (
                      <button 
                        onClick={() => handleSwitchRequest(company)}
                        disabled={loading === company.id}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200"
                      >
                        {loading === company.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRightLeft className="h-3.5 w-3.5" />}
                        Switch
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-50/50 text-rose-400 text-[9px] font-black uppercase tracking-[0.2em] border border-rose-100/50 mr-2">
                    Access Denied
                  </div>
                )}
                
                <button 
                  onClick={() => handleToggle(company.id, isEnabled)}
                  disabled={isActive}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all",
                    isActive ? "opacity-30 cursor-not-allowed border-slate-200 text-slate-400" : 
                    isEnabled ? "border-rose-100 text-rose-400 hover:bg-rose-50" : "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                  )}
                >
                  {isEnabled ? 'Disable' : 'Enable Organization'}
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


