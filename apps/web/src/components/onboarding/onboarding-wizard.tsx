'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { saveCompanyDetails, saveComplianceDetails, skipOnboarding, completeOnboarding } from '@/app/actions/onboarding';
import {
  Building2,
  FileCheck2,
  Check,
  ChevronRight,
  Loader2,
  Upload,
  SkipForward,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

// ─── Step Indicator ─────────────────────────────────────────
function StepIndicator({ currentStep, steps }: { currentStep: number; steps: { label: string; icon: React.ReactNode }[] }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <div
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
              idx === currentStep
                ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25'
                : idx < currentStep
                  ? 'bg-success-50 text-success-700 border border-success-200'
                  : 'bg-neutral-100 text-neutral-400 border border-neutral-200'
            }`}
          >
            {idx < currentStep ? (
              <Check className="h-4 w-4" />
            ) : (
              step.icon
            )}
            <span className="hidden sm:inline">{step.label}</span>
            <span className="sm:hidden">{idx + 1}</span>
          </div>
          {idx < steps.length - 1 && (
            <ChevronRight className={`h-4 w-4 ${idx < currentStep ? 'text-success-500' : 'text-neutral-300'}`} />
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
      className="h-11 px-6 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
    >
      {pending ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Saving…
        </>
      ) : (
        <>
          {label}
          <ChevronRight className="h-4 w-4" />
        </>
      )}
    </button>
  );
}

// ─── Step 1: Company Details ────────────────────────────────
function CompanyDetailsStep({
  userEmail,
  onComplete,
  initialData,
}: {
  userEmail: string;
  onComplete: () => void;
  initialData: any;
}) {
  const [state, formAction] = useActionState(saveCompanyDetails, null);

  // Auto-advance on success
  if (state?.success) {
    setTimeout(onComplete, 500);
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-accent-50 rounded-xl flex items-center justify-center">
          <Building2 className="h-5 w-5 text-accent-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Company Details</h2>
          <p className="text-xs text-neutral-400">All fields are mandatory for registration</p>
        </div>
      </div>

      <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="md:col-span-2 grid gap-1.5">
          <label htmlFor="ob-companyName" className="text-sm font-medium text-neutral-700">
            Company Name <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-companyName"
            name="companyName"
            type="text"
            placeholder="e.g. Shree Shivay Roadlines Pvt. Ltd."
            defaultValue={initialData?.name || ""}
            required
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2 grid gap-1.5">
          <label htmlFor="ob-address" className="text-sm font-medium text-neutral-700">
            Business Address <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ob-address"
            name="address"
            rows={2}
            required
            defaultValue={initialData?.address || ""}
            placeholder="Complete registered office address"
            className="w-full px-4 py-2.5 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors resize-none"
          />
        </div>

        {/* City */}
        <div className="grid gap-1.5">
          <label htmlFor="ob-city" className="text-sm font-medium text-neutral-700">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-city"
            name="city"
            type="text"
            required
            defaultValue={initialData?.city || ""}
            placeholder="e.g. Mumbai"
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* State */}
        <div className="grid gap-1.5">
          <label htmlFor="ob-state" className="text-sm font-medium text-neutral-700">
            State <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-state"
            name="state"
            type="text"
            required
            defaultValue={initialData?.state || ""}
            placeholder="e.g. Maharashtra"
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Pincode */}
        <div className="grid gap-1.5">
          <label htmlFor="ob-pincode" className="text-sm font-medium text-neutral-700">
            Pincode <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-pincode"
            name="pincode"
            type="text"
            required
            pattern="\d{6}"
            maxLength={6}
            defaultValue={initialData?.pincode || ""}
            placeholder="6-digit pincode"
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Company Email */}
        <div className="grid gap-1.5">
          <label htmlFor="ob-companyEmail" className="text-sm font-medium text-neutral-700">
            Company Email <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-companyEmail"
            name="companyEmail"
            type="email"
            required
            defaultValue={initialData?.email || userEmail}
            placeholder="info@company.com"
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Company Phone */}
        <div className="grid gap-1.5">
          <label htmlFor="ob-companyPhone" className="text-sm font-medium text-neutral-700">
            Company Phone <span className="text-red-500">*</span>
          </label>
          <input
            id="ob-companyPhone"
            name="companyPhone"
            type="tel"
            required
            pattern="\d{10}"
            maxLength={10}
            defaultValue={initialData?.phone || ""}
            placeholder="10-digit mobile number"
            className="w-full h-11 px-4 bg-white border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors"
          />
        </div>

        {/* Error */}
        {state?.error && (
          <div className="md:col-span-2 flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 text-sm px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 text-red-500" />
            {state.error}
          </div>
        )}

        {/* Actions */}
        <div className="md:col-span-2 flex justify-end mt-2">
          <StepSubmitButton label="Save & Continue" />
        </div>
      </form>
    </div>
  );
}

// ─── Step 2: Compliance & Documents ─────────────────────────
function ComplianceStep({ onComplete, onBack, initialData }: { onComplete: () => void; onBack: () => void; initialData: any }) {
  const [state, formAction] = useActionState(saveComplianceDetails, null);
  const [complianceType, setComplianceType] = useState<'gst' | 'pan'>(initialData?.gstin ? 'gst' : 'pan');
  
  // File names for UI
  const [regFileName, setRegFileName] = useState<string | null>(null);
  const [gstFileName, setGstFileName] = useState<string | null>(null);
  const [panFileName, setPanFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<{ pan?: string; gst?: string }>({});

  if (state?.success) {
    setTimeout(onComplete, 500);
  }

  const validatePan = (value: string) => {
    if (!value) return "PAN is required";
    if (!/^[A-Z]{5}\d{4}[A-Z]{1}$/i.test(value)) return "Invalid PAN format (e.g. ABCDE1234F)";
    return null;
  };

  const validateGst = (value: string) => {
    if (!value) return "GSTIN is required";
    if (!/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/i.test(value)) return "Invalid GSTIN format";
    return null;
  };

  const validateFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) return "File size must be less than 2MB";
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowed.includes(file.type)) return "Only PDF, PNG, and JPG files are allowed";
    return null;
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <FileCheck2 className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Compliance & Documents</h2>
          <p className="text-xs text-neutral-400">All documents are mandatory for verification</p>
        </div>
      </div>

      <form 
        action={formAction} 
        className="grid gap-6"
        onSubmit={(e) => {
          const panErr = validatePan((e.currentTarget.elements.namedItem('panNumber') as HTMLInputElement).value);
          const gstErr = complianceType === 'gst' ? validateGst((e.currentTarget.elements.namedItem('gstNumber') as HTMLInputElement).value) : null;
          
          if (panErr || gstErr) {
            e.preventDefault();
            setFieldErrors({ pan: panErr || undefined, gst: gstErr || undefined });
          }
        }}
      >
        {/* Compliance Type Toggle */}
        <input type="hidden" name="complianceType" value={complianceType} />
        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-neutral-700">Tax Registration Type <span className="text-red-500">*</span></label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setComplianceType('gst')}
              className={`h-12 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                complianceType === 'gst'
                  ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
              }`}
            >
              GST Registered
            </button>
            <button
              type="button"
              onClick={() => setComplianceType('pan')}
              className={`h-12 rounded-xl text-sm font-medium border-2 transition-all duration-200 ${
                complianceType === 'pan'
                  ? 'border-accent-500 bg-accent-50 text-accent-700 shadow-sm'
                  : 'border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300'
              }`}
            >
              Non-GST (PAN Only)
            </button>
          </div>
        </div>

        {/* GST & PAN Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <label htmlFor="ob-panNumber" className="text-sm font-medium text-neutral-700">PAN Number <span className="text-red-500">*</span></label>
            <input
              id="ob-panNumber"
              name="panNumber"
              type="text"
              required
              defaultValue={initialData?.pan || ""}
              placeholder="e.g. ABCDE1234F"
              maxLength={10}
              onBlur={(e) => {
                const error = validatePan(e.target.value);
                setFieldErrors(prev => ({ ...prev, pan: error || undefined }));
              }}
              onChange={(e) => {
                if (fieldErrors.pan) setFieldErrors(prev => ({ ...prev, pan: undefined }));
              }}
              className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors uppercase ${fieldErrors.pan ? 'border-red-500' : 'border-neutral-200'}`}
            />
            {fieldErrors.pan && <p className="text-[10px] font-semibold text-red-500">{fieldErrors.pan}</p>}
          </div>

          {complianceType === 'gst' && (
            <div className="grid gap-1.5 animate-in slide-in-from-right-2">
              <label htmlFor="ob-gstNumber" className="text-sm font-medium text-neutral-700">GSTIN <span className="text-red-500">*</span></label>
              <input
                id="ob-gstNumber"
                name="gstNumber"
                type="text"
                required
                defaultValue={initialData?.gstin || ""}
                placeholder="e.g. 27AABCT1332L1ZT"
                maxLength={15}
                onBlur={(e) => {
                  const error = validateGst(e.target.value);
                  setFieldErrors(prev => ({ ...prev, gst: error || undefined }));
                }}
                onChange={(e) => {
                  if (fieldErrors.gst) setFieldErrors(prev => ({ ...prev, gst: undefined }));
                }}
                className={`w-full h-11 px-4 bg-white border rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:ring-2 focus:ring-accent-400/40 focus:border-accent-500 transition-colors uppercase ${fieldErrors.gst ? 'border-red-500' : 'border-neutral-200'}`}
              />
              {fieldErrors.gst && <p className="text-[10px] font-semibold text-red-500">{fieldErrors.gst}</p>}
            </div>
          )}
        </div>

        {/* Mandatory Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Registration Certificate */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Registration Certificate <span className="text-red-500">*</span></label>
            <label htmlFor="regDoc" className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${regFileName ? 'border-success-300 bg-success-50' : 'border-neutral-200 bg-white hover:border-accent-400'}`}>
              <Upload className={`h-6 w-6 mb-1 ${regFileName ? 'text-success-500' : 'text-neutral-300'}`} />
              <p className="text-[10px] text-center px-2 truncate max-w-full">{regFileName || "Upload Registration"}</p>
              <input id="regDoc" name="regDoc" type="file" required className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const error = validateFile(file);
                  if (error) { setFileError(error); e.target.value = ''; }
                  else { setRegFileName(file.name); setFileError(null); }
                }
              }} />
            </label>
          </div>

          {/* PAN Card */}
          <div className="grid gap-1.5">
            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">PAN Card <span className="text-red-500">*</span></label>
            <label htmlFor="panDoc" className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${panFileName ? 'border-success-300 bg-success-50' : 'border-neutral-200 bg-white hover:border-accent-400'}`}>
              <Upload className={`h-6 w-6 mb-1 ${panFileName ? 'text-success-500' : 'text-neutral-300'}`} />
              <p className="text-[10px] text-center px-2 truncate max-w-full">{panFileName || "Upload PAN Card"}</p>
              <input id="panDoc" name="panDoc" type="file" required className="hidden" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const error = validateFile(file);
                  if (error) { setFileError(error); e.target.value = ''; }
                  else { setPanFileName(file.name); setFileError(null); }
                }
              }} />
            </label>
          </div>

          {/* GST Certificate (Conditional) */}
          {complianceType === 'gst' && (
            <div className="grid gap-1.5 md:col-span-2 animate-in fade-in">
              <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">GST Certificate <span className="text-red-500">*</span></label>
              <label htmlFor="gstDoc" className={`flex flex-col items-center justify-center h-28 border-2 border-dashed rounded-xl cursor-pointer transition-all ${gstFileName ? 'border-success-300 bg-success-50' : 'border-neutral-200 bg-white hover:border-accent-400'}`}>
                <Upload className={`h-6 w-6 mb-1 ${gstFileName ? 'text-success-500' : 'text-neutral-300'}`} />
                <p className="text-[10px] text-center px-2 truncate max-w-full">{gstFileName || "Upload GST Certificate"}</p>
                <input id="gstDoc" name="gstDoc" type="file" required className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const error = validateFile(file);
                    if (error) { setFileError(error); e.target.value = ''; }
                    else { setGstFileName(file.name); setFileError(null); }
                  }
                }} />
              </label>
            </div>
          )}
        </div>

        {/* Global Error Reporting */}
        {(state?.error || fileError) && (
          <div className="flex items-center gap-2 bg-error-50 border border-error-500/20 text-error-700 text-sm px-4 py-3 rounded-lg animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            <p>{state?.error || fileError}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={onBack}
            className="h-11 px-5 text-sm font-medium text-neutral-500 hover:text-neutral-700 flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <StepSubmitButton label="Save & Finish" />
        </div>
      </form>
    </div>
  );
}

// ─── Completion Step ────────────────────────────────────────
function CompletionStep() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-10 text-center transition-all duration-300 animate-in zoom-in-95">
      <div className="w-20 h-20 bg-success-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <Check className="h-10 w-10 text-success-500" />
      </div>
      <h2 className="text-2xl font-bold text-neutral-900 mb-2">Onboarding Complete!</h2>
      <p className="text-sm text-neutral-500 max-w-md mx-auto mb-8">
        Your transport business is now registered on FreightFlow. You can start creating LRs and managing your fleet immediately.
      </p>
      <form action={completeOnboarding}>
        <button
          type="submit"
          className="h-12 px-8 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-accent-500/25 transition-all duration-200 flex items-center gap-2 mx-auto"
        >
          Enter Dashboard
          <ChevronRight className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}

// ─── Main Wizard ────────────────────────────────────────────
export function OnboardingWizard({ 
  tenantName, 
  userEmail, 
  initialData 
}: { 
  tenantName: string; 
  userEmail: string; 
  initialData?: any;
}) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { label: 'Company Details', icon: <Building2 className="h-4 w-4" /> },
    { label: 'Compliance', icon: <FileCheck2 className="h-4 w-4" /> },
  ];

  return (
    <div>
      <StepIndicator currentStep={currentStep} steps={steps} />

      {/* Skip button */}
      {currentStep < 2 && (
        <div className="flex justify-end mb-4">
          <form action={skipOnboarding}>
            <button
              type="submit"
              className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1.5 transition-colors"
            >
              <SkipForward className="h-3.5 w-3.5" />
              Skip for now
            </button>
          </form>
        </div>
      )}

      {/* Step Content */}
      <div className="transition-all duration-300">
        {currentStep === 0 && (
          <CompanyDetailsStep
            userEmail={userEmail}
            onComplete={() => setCurrentStep(1)}
            initialData={initialData}
          />
        )}
        {currentStep === 1 && (
          <ComplianceStep
            onComplete={() => setCurrentStep(2)}
            onBack={() => setCurrentStep(0)}
            initialData={initialData}
          />
        )}
        {currentStep === 2 && <CompletionStep />}
      </div>
    </div>
  );
}
