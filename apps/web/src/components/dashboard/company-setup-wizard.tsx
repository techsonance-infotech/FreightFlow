'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { createCompanyInitial, updateCompanyCompliance } from '@/app/actions/settings/company-setup';
import {
  Building2, FileCheck2, Check, ChevronRight, Loader2, Upload, ArrowLeft, AlertCircle, X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Step Indicator ─────────────────────────────────────────
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: { label: string; icon: React.ReactNode }[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
              idx === currentStep
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200'
                : idx < currentStep
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : 'bg-slate-50 text-slate-400 border-slate-100'
            )}
          >
            {idx < currentStep ? <Check className="h-3 w-3" /> : step.icon}
            <span>{step.label}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight className={cn("h-4 w-4", idx < currentStep ? 'text-emerald-500' : 'text-slate-200')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Submit Button ──────────────────────────────────────────
function StepSubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : label}
      {!pending && <ChevronRight className="h-4 w-4" />}
    </button>
  );
}

// ─── Step 1: Company Details ────────────────────────────────
function CompanyDetailsStep({ onComplete }: { onComplete: (id: string) => void }) {
  const [state, formAction] = useActionState(createCompanyInitial, null);

  if (state?.success && state.companyId) {
    onComplete(state.companyId);
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
          <Building2 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Organization Profile</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Step 1 of 2: Basic Identity</p>
        </div>
      </div>

      <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="md:col-span-2 grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Company Name *</label>
          <input name="companyName" type="text" required placeholder="e.g. Shree Shivay Roadlines" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>
        <div className="md:col-span-2 grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Address *</label>
          <textarea name="address" rows={2} required placeholder="Registered office location" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City *</label>
          <input name="city" type="text" required placeholder="e.g. Mumbai" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State *</label>
          <input name="state" type="text" required placeholder="e.g. Maharashtra" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode *</label>
          <input name="pincode" type="text" required maxLength={6} placeholder="6-digit PIN" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Company Email *</label>
          <input name="companyEmail" type="email" required placeholder="info@company.com" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone *</label>
          <input name="phone" type="tel" required maxLength={10} placeholder="10-digit Mobile" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" />
        </div>

        {state?.error && (
          <div className="md:col-span-2 flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold px-4 py-3 rounded-xl">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </div>
        )}

        <div className="md:col-span-2 flex justify-end mt-4">
          <StepSubmitButton label="Save & Continue" />
        </div>
      </form>
    </div>
  );
}

// ─── Step 2: Compliance ─────────────────────────────────────
function ComplianceStep({ companyId, onComplete, onBack }: { companyId: string; onComplete: () => void; onBack: () => void }) {
  const [state, formAction] = useActionState(updateCompanyCompliance.bind(null, companyId), null);
  const [complianceType, setComplianceType] = useState<'gst' | 'pan'>('gst');
  
  const [regFileName, setRegFileName] = useState<string | null>(null);
  const [gstFileName, setGstFileName] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState<string | null>(null);

  if (state?.success) {
    onComplete();
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center">
          <FileCheck2 className="h-6 w-6 text-amber-600" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Compliance & Tax</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Step 2 of 2: Verification Documents</p>
        </div>
      </div>

      <form action={formAction} className="grid gap-6">
        <input type="hidden" name="complianceType" value={complianceType} />
        <div className="grid gap-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registration Type *</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setComplianceType('gst')} className={cn("h-12 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", complianceType === 'gst' ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200")}>GST Registered</button>
            <button type="button" onClick={() => setComplianceType('pan')} className={cn("h-12 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all", complianceType === 'pan' ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200")}>PAN Only</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Income Tax PAN *</label>
            <input name="panNumber" type="text" required placeholder="ABCDE1234F" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 uppercase focus:bg-white focus:border-blue-500 outline-none" />
          </div>
          {complianceType === 'gst' && (
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN Number *</label>
              <input name="gstNumber" type="text" required placeholder="27AABCT1332L1ZT" className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 uppercase focus:bg-white focus:border-blue-500 outline-none" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UploadZone id="regDoc" label="Registration Cert." fileName={regFileName} setFileName={setRegFileName} />
          <UploadZone id="panDoc" label="PAN Card Document" fileName={panFileName} setFileName={setPanFileName} />
          {complianceType === 'gst' && <div className="md:col-span-2"><UploadZone id="gstDoc" label="GST Certificate" fileName={gstFileName} setFileName={setGstFileName} /></div>}
        </div>

        {state?.error && (
          <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold px-4 py-3 rounded-xl">
            <AlertCircle className="h-4 w-4" /> {state.error}
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <button type="button" onClick={onBack} className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft className="h-4 w-4" /> Back</button>
          <StepSubmitButton label="Finish Registration" />
        </div>
      </form>
    </div>
  );
}

function UploadZone({ id, label, fileName, setFileName }: any) {
  return (
    <div className="grid gap-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label} *</label>
      <label htmlFor={id} className={cn("h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all", fileName ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-blue-50/30")}>
        <Upload className={cn("h-6 w-6 mb-2", fileName ? "text-emerald-500" : "text-slate-300")} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter px-4 text-center truncate w-full">{fileName || "Click to upload PDF/JPG"}</span>
        <input id={id} name={id} type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name || null)} />
      </label>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────
export function CompanySetupWizard({ onComplete, onClose }: { onComplete: () => void; onClose: () => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const steps = [
    { label: 'Profile', icon: <Building2 className="h-3.5 w-3.5" /> },
    { label: 'Compliance', icon: <FileCheck2 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="p-10">
      <StepIndicator currentStep={currentStep} steps={steps} />
      
      {currentStep === 0 && (
        <CompanyDetailsStep onComplete={(id) => {
          setCompanyId(id);
          setCurrentStep(1);
        }} />
      )}
      
      {currentStep === 1 && companyId && (
        <ComplianceStep 
          companyId={companyId} 
          onComplete={onComplete} 
          onBack={() => setCurrentStep(0)} 
        />
      )}
    </div>
  );
}
