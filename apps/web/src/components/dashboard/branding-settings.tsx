'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Building2, Camera, Save, Loader2, FileText, Type, PenTool, 
  Hash, Globe, CheckCircle2, Info, Maximize2, CreditCard, 
  Palette, MessageCircle, QrCode, ShieldAlert, Droplets
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BrandingSettingsFormProps {
  initialData: {
    id: string;
    name: string;
    gstin: string | null;
    pan: string | null;
    address: string | null;
    logoUrl: string | null;
    signatureUrl: string | null;
    printHeader: string | null;
    printFooter: string | null;
    printTerms: string | null;
    // New Fields
    bankName: string | null;
    accountNo: string | null;
    ifscCode: string | null;
    branchName: string | null;
    primaryColor: string | null;
    whatsappNo: string | null;
    enableQrCode: boolean;
    enableWatermark: boolean;
    watermarkText: string | null;
  };
  isStudioMode?: boolean;
}

export function BrandingSettingsForm({ initialData, isStudioMode }: BrandingSettingsFormProps) {
  const [loading, setLoading] = useState(false);
  const [logo, setLogo] = useState<string | null>(initialData.logoUrl || null);
  const [signature, setSignature] = useState<string | null>(initialData.signatureUrl || null);
  
  // Real-time preview states
  const [previewName, setPreviewName] = useState(initialData.name);
  const [previewHeader, setPreviewHeader] = useState(initialData.printHeader || '');
  const [previewFooter, setPreviewFooter] = useState(initialData.printFooter || '');
  const [previewTerms, setPreviewTerms] = useState(initialData.printTerms || '');
  
  // Advanced preview states
  const [showPreview, setShowPreview] = useState(false);
  const [themeColor, setThemeColor] = useState(initialData.primaryColor || '#3b82f6');
  const [bankInfo, setBankInfo] = useState({
    name: initialData.bankName || '',
    account: initialData.accountNo || '',
    ifsc: initialData.ifscCode || ''
  });
  const [watermark, setWatermark] = useState({
    enabled: initialData.enableWatermark,
    text: initialData.watermarkText || 'ORIGINAL'
  });
  const [qrEnabled, setQrEnabled] = useState(initialData.enableQrCode);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'signature') => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        toast.error(`File "${file.name}" exceeds 1MB limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'logo') setLogo(reader.result as string);
        else setSignature(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      gstin: formData.get('gstin'),
      address: formData.get('address'),
      printHeader: formData.get('printHeader'),
      printFooter: formData.get('printFooter'),
      printTerms: formData.get('printTerms'),
      logoUrl: logo,
      signatureUrl: signature,
      // New fields
      bankName: formData.get('bankName'),
      accountNo: formData.get('accountNo'),
      ifscCode: formData.get('ifscCode'),
      branchName: formData.get('branchName'),
      primaryColor: themeColor,
      whatsappNo: formData.get('whatsappNo'),
      enableQrCode: qrEnabled,
      enableWatermark: watermark.enabled,
      watermarkText: watermark.text,
    };

    try {
      const response = await fetch('/api/v1/companies/branding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Professional Branding Synchronized!', {
          icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        });
      } else {
        throw new Error('Sync failed');
      }
    } catch (error) {
      toast.error('Failed to update branding cloud');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col xl:flex-row bg-white", isStudioMode ? "min-h-0" : "min-h-screen")}>
      {/* Configuration Form */}
      <form onSubmit={handleSubmit} className="flex-1 p-8 lg:p-12 space-y-16 border-r border-slate-100 max-w-5xl mx-auto">
        
        <div className="flex items-center justify-between gap-4 sticky top-0 bg-white/80 backdrop-blur-md py-4 z-20 border-b border-slate-50">
          <div className="flex items-center gap-3">
             <div className={cn("h-3 w-3 rounded-full animate-pulse", showPreview ? "bg-emerald-500" : "bg-slate-300")}></div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               Live Preview: {showPreview ? 'ACTIVE' : 'INACTIVE'}
             </p>
          </div>
          <button 
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={cn(
              "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
              showPreview 
                ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                : "bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100"
            )}
          >
            {showPreview ? <><Info className="h-3 w-3" /> Hide Preview</> : <><Maximize2 className="h-3 w-3" /> Show Live Preview</>}
          </button>
        </div>

        {!isStudioMode && (
          <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mb-8 animate-in slide-in-from-top-2 duration-500">
            <div className="flex items-center gap-3">
              <Maximize2 className="h-4 w-4 text-blue-600" />
              <p className="text-[11px] font-bold text-blue-600">Need more space? Use the Branding Studio for a full-screen experience with live preview.</p>
            </div>
            <Link 
              href="/dashboard/branding-studio"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
            >
              Open Studio
            </Link>
          </div>
        )}

        {/* 1. Visual & Theme */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Palette className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Visual Identity & Theme</h2>
              <p className="text-sm font-bold text-slate-400">Manage assets and corporate colors</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Logo */}
            <div className="group relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-3 block">Corporate Logo</label>
              <div 
                className="aspect-[3/2] w-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 group-hover:bg-blue-50/30 cursor-pointer shadow-inner"
                onClick={() => logoInputRef.current?.click()}
              >
                {logo ? (
                  <img src={logo} alt="Logo" className="h-full w-full object-contain p-8" />
                ) : (
                  <div className="text-center p-6">
                    <Building2 className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Select PNG/JPG</p>
                  </div>
                )}
              </div>
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} />
            </div>

            {/* Signature */}
            <div className="group relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-3 block">Authorized Signature</label>
              <div 
                className="aspect-[3/2] w-full rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-blue-300 group-hover:bg-blue-50/30 cursor-pointer shadow-inner"
                onClick={() => signInputRef.current?.click()}
              >
                {signature ? (
                  <img src={signature} alt="Signature" className="h-full w-full object-contain p-8" />
                ) : (
                  <div className="text-center p-6">
                    <PenTool className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Digital Sign</p>
                  </div>
                )}
              </div>
              <input type="file" ref={signInputRef} className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'signature')} />
            </div>
          </div>

          <div className="bg-slate-50 rounded-3xl p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <Droplets className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Brand Primary Color</p>
                <p className="text-[10px] font-bold text-slate-400">Used for document accents and headers</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border-4 border-white shadow-md overflow-hidden">
                <input 
                  type="color" 
                  value={themeColor} 
                  onChange={(e) => setThemeColor(e.target.value)}
                  className="h-[150%] w-[150%] -translate-x-[15%] -translate-y-[15%] cursor-pointer" 
                />
              </div>
              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{themeColor}</span>
            </div>
          </div>
        </div>

        {/* 2. Financial Settlement */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
              <CreditCard className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Financial Settlement</h2>
              <p className="text-sm font-bold text-slate-400">Bank details for document footers</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Bank Name</label>
              <input 
                name="bankName" 
                defaultValue={initialData.bankName || ''} 
                onChange={(e) => setBankInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. HDFC Bank Ltd" 
                className="premium-input-large" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Account Number</label>
              <input 
                name="accountNo" 
                defaultValue={initialData.accountNo || ''} 
                onChange={(e) => setBankInfo(prev => ({ ...prev, account: e.target.value }))}
                placeholder="50100XXXXXXXX" 
                className="premium-input-large" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">IFSC Code</label>
              <input 
                name="ifscCode" 
                defaultValue={initialData.ifscCode || ''} 
                onChange={(e) => setBankInfo(prev => ({ ...prev, ifsc: e.target.value }))}
                placeholder="HDFC000XXXX" 
                className="premium-input-large" 
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch Name</label>
              <input name="branchName" defaultValue={initialData.branchName || ''} placeholder="Main Branch, City" className="premium-input-large" />
            </div>
          </div>
        </div>

        {/* 3. Communication & QR */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
              <MessageCircle className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Communication & Smart-Tags</h2>
              <p className="text-sm font-bold text-slate-400">WhatsApp and QR configuration</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Support WhatsApp Number</label>
              <input name="whatsappNo" defaultValue={initialData.whatsappNo || ''} placeholder="+91 XXXXX XXXXX" className="premium-input-large" />
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 mt-6">
              <div className="h-10 w-10 rounded-xl bg-white shadow-sm flex items-center justify-center">
                <QrCode className={cn("h-5 w-5 transition-colors", qrEnabled ? "text-blue-600" : "text-slate-300")} />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Enable Smart QR Code</p>
                <p className="text-[9px] font-bold text-slate-400">Print UPI/Tracking QR on documents</p>
              </div>
              <button 
                type="button" 
                onClick={() => setQrEnabled(!qrEnabled)}
                className={cn("w-12 h-6 rounded-full p-1 transition-all duration-300", qrEnabled ? "bg-blue-600" : "bg-slate-200")}
              >
                <div className={cn("h-4 w-4 rounded-full bg-white transition-all shadow-sm", qrEnabled ? "translate-x-6" : "translate-x-0")}></div>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Document Watermarking */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-200">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Document Protection</h2>
              <p className="text-sm font-bold text-slate-400">Security and copy-protection settings</p>
            </div>
          </div>

          <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-900">Enable Copy Watermark</p>
                <p className="text-[10px] font-bold text-slate-400">Adds a diagonal translucent tag across the page</p>
              </div>
              <button 
                type="button" 
                onClick={() => setWatermark(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={cn("w-12 h-6 rounded-full p-1 transition-all duration-300", watermark.enabled ? "bg-rose-600" : "bg-slate-200")}
              >
                <div className={cn("h-4 w-4 rounded-full bg-white transition-all shadow-sm", watermark.enabled ? "translate-x-6" : "translate-x-0")}></div>
              </button>
            </div>
            
            {watermark.enabled && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Custom Watermark Text</label>
                <input 
                  name="watermarkText" 
                  value={watermark.text} 
                  onChange={(e) => setWatermark(prev => ({ ...prev, text: e.target.value }))}
                  className="premium-input-large" 
                />
              </div>
            )}
          </div>
        </div>

        {/* Legal & Address Info (Legacy but enhanced) */}
        <div className="space-y-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Print Layout & Terms</h2>
              <p className="text-sm font-bold text-slate-400">Core typography and legal text</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Name (Display)</label>
                <input name="name" defaultValue={initialData.name} onChange={(e) => setPreviewName(e.target.value)} className="premium-input-large" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN Number</label>
                <input name="gstin" defaultValue={initialData.gstin || ''} className="premium-input-large" />
              </div>
              <div className="md:col-span-2 space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Registered Address</label>
                <textarea name="address" rows={3} defaultValue={initialData.address || ''} className="premium-textarea-large" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tagline (Under Name)</label>
              <input name="printHeader" defaultValue={initialData.printHeader || ''} onChange={(e) => setPreviewHeader(e.target.value)} className="premium-input-large" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Standard Terms</label>
                <textarea name="printTerms" rows={6} defaultValue={initialData.printTerms || ''} onChange={(e) => setPreviewTerms(e.target.value)} className="premium-textarea-large text-[11px]" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Footer</label>
                <textarea name="printFooter" rows={6} defaultValue={initialData.printFooter || ''} onChange={(e) => setPreviewFooter(e.target.value)} className="premium-textarea-large text-[11px]" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-16 border-t border-slate-100 flex justify-end">
          <button 
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-4 h-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Save className="h-6 w-6" />}
            {loading ? 'SYNCHRONIZING BRAND ASSETS...' : 'PUBLISH CORPORATE BRANDING'}
          </button>
        </div>
      </form>

      {/* Real-time Document Preview (Conditional) */}
      {showPreview && (
        <aside className={cn(
          "bg-slate-50 p-12 shrink-0 overflow-y-auto sticky top-0 h-screen transition-all duration-700 animate-in slide-in-from-right-10",
          isStudioMode ? "flex w-[560px]" : "flex w-[480px]"
        )}>
          <div className="w-full space-y-8 relative">
            
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-4 w-4 text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Dynamic Preview</span>
            </div>

            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 min-h-[750px] flex flex-col relative overflow-hidden">
              
              {/* Watermark Overlay */}
              {watermark.enabled && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-[0.03] select-none rotate-[-45deg]">
                  <span className="text-[120px] font-black tracking-tighter uppercase whitespace-nowrap">{watermark.text}</span>
                </div>
              )}

              <div className="p-8 flex-1 flex flex-col">
                {/* Header */}
                <div 
                  className="pb-6 mb-6 flex items-start justify-between gap-4 border-b-2"
                  style={{ borderColor: themeColor }}
                >
                  <div className="flex-1">
                    <h3 
                      className="text-xl font-black uppercase leading-none break-words mb-2"
                      style={{ color: themeColor }}
                    >
                      {previewName || 'Company Name'}
                    </h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide italic">{previewHeader || 'Your tagline here'}</p>
                  </div>
                  <div className="h-16 w-16 shrink-0 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 overflow-hidden">
                    {logo ? <img src={logo} alt="Company Logo" className="h-full w-full object-contain p-2" /> : <Building2 className="h-6 w-6 text-slate-200" />}
                  </div>
                </div>

                {/* Fake Content Area */}
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                      <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                      <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 p-2 grid grid-cols-4 gap-2">
                      {Array(4).fill(0).map((_, i) => <div key={i} className="h-2 bg-slate-200 rounded"></div>)}
                    </div>
                    <div className="p-4 space-y-3">
                      {Array(3).fill(0).map((_, i) => <div key={i} className="h-3 bg-slate-50 rounded w-full"></div>)}
                    </div>
                  </div>

                  {/* QR Section (if enabled) */}
                  {qrEnabled && (
                    <div className="flex justify-center py-4">
                      <div className="h-24 w-24 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center">
                        <QrCode className="h-12 w-12 text-slate-200" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Bank & Terms Footer */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* Settlement Block */}
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase text-slate-400" style={{ color: themeColor }}>Settlement Details</p>
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-900">{bankInfo.name || 'Bank Name Not Set'}</p>
                        <p className="text-[8px] font-bold text-slate-500">A/C: {bankInfo.account || 'XXXXXXXXXXX'}</p>
                        <p className="text-[8px] font-bold text-slate-500">IFSC: {bankInfo.ifsc || 'XXXXXXX'}</p>
                      </div>
                    </div>
                    {/* Signature block */}
                    <div className="text-center">
                      <div className="h-16 w-full border border-slate-100 rounded-xl bg-slate-50/50 flex items-center justify-center mb-1 overflow-hidden">
                        {signature ? <img src={signature} alt="Authorized Signature" className="h-full w-full object-contain p-2" /> : <div className="text-[8px] text-slate-200">Authorized Sign</div>}
                      </div>
                      <p className="text-[8px] font-black uppercase tracking-wider text-slate-900">Authorized Signatory</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <p className="text-[7px] font-black uppercase text-slate-300">Terms</p>
                        <p className="text-[6px] text-slate-400 leading-tight line-clamp-3 italic">{previewTerms || 'Document terms...'}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[7px] font-black uppercase text-slate-300">Jurisdiction</p>
                        <p className="text-[6px] text-slate-400 leading-tight line-clamp-3">{previewFooter || 'Legal footer...'}</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div 
              className="p-6 rounded-[2rem] border transition-colors"
              style={{ backgroundColor: themeColor + '08', borderColor: themeColor + '20' }}
            >
              <h4 className="text-[11px] font-black uppercase tracking-widest mb-2" style={{ color: themeColor }}>Branding Wisdom</h4>
              <p className="text-[10px] leading-relaxed font-bold opacity-70" style={{ color: themeColor }}>
                Your primary color choice affects all accent borders and headers. Ensure your bank details are accurate to facilitate seamless freight settlement.
              </p>
            </div>
          </div>
        </aside>
      )}

      <style jsx global>{`
        .premium-input-large {
          width: 100%;
          padding: 1rem 1.5rem;
          border-radius: 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          font-weight: 800;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        .premium-input-large:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          outline: none;
        }
        .premium-textarea-large {
          width: 100%;
          padding: 1.25rem 1.5rem;
          border-radius: 1.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          font-weight: 700;
          font-size: 0.875rem;
          color: #1e293b;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          resize: none;
        }
        .premium-textarea-large:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.08);
          outline: none;
        }
      `}</style>
    </div>
  );
}
