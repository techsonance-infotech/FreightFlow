'use client';

import React, { useState } from 'react';
import { Building2, Save, X, Loader2, MapPin, Phone, Mail, ShieldCheck, Hash } from 'lucide-react';
import { updateCompany } from '@/app/actions/settings/organizations';
import { toast } from 'sonner';

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
}

export function CompanyEditForm({ 
  company, 
  onClose, 
  onComplete 
}: { 
  company: Company; 
  onClose: () => void;
  onComplete: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    try {
      await updateCompany(company.id, formData);
      toast.success('Organization details updated successfully');
      onComplete();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 max-h-[80vh] overflow-y-auto custom-scrollbar">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Identity */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">Basic Identity</h4>
          <div className="grid grid-cols-1 gap-5">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Company Name</label>
              <input 
                name="name" 
                type="text" 
                defaultValue={company.name}
                required 
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Email</label>
                <input 
                  name="email" 
                  type="email" 
                  defaultValue={company.email || ''}
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                />
              </div>
              <div className="grid gap-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Phone</label>
                <input 
                  name="phone" 
                  type="tel" 
                  defaultValue={company.phone || ''}
                  className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* Location Details */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">Registered Address</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="md:col-span-3 grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Address</label>
              <textarea 
                name="address" 
                rows={2}
                defaultValue={company.address || ''}
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all resize-none" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">City</label>
              <input 
                name="city" 
                type="text" 
                defaultValue={company.city || ''}
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State</label>
              <input 
                name="state" 
                type="text" 
                defaultValue={company.state || ''}
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pincode</label>
              <input 
                name="pincode" 
                type="text" 
                defaultValue={company.pincode || ''}
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        </section>

        {/* Tax & Compliance */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 ml-1">Tax & Compliance</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN Number</label>
              <input 
                name="gstin" 
                type="text" 
                defaultValue={company.gstin || ''}
                placeholder="27AABCT1332L1ZT"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 uppercase focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Income Tax PAN</label>
              <input 
                name="pan" 
                type="text" 
                defaultValue={company.pan || ''}
                placeholder="ABCDE1234F"
                className="w-full h-12 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 uppercase focus:bg-white focus:border-blue-500 outline-none transition-all" 
              />
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-50">
          <button 
            type="button"
            onClick={onClose}
            className="px-6 py-3 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-10 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
