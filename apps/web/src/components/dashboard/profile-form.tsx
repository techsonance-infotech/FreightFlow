'use client';

import React, { useRef, useState } from 'react';
import { User, Mail, Phone, Shield, Camera, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileFormProps {
  initialData: {
    name: string;
    email: string;
    phone: string;
    role: string;
    avatarUrl?: string | null;
  };
}

export function ProfileForm({ initialData }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(initialData.avatarUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast.success('Avatar updated locally. Save to persist changes.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 lg:p-12">
      <div className="flex flex-col lg:flex-row gap-16">
        {/* Left: Avatar & Summary */}
        <div className="flex flex-col items-center gap-6 lg:w-72 shrink-0">
          <div className="relative group">
            <div 
              className="h-40 w-40 rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-5xl font-black shadow-2xl ring-[12px] ring-blue-50 overflow-hidden"
              onClick={handleAvatarClick}
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                initialData.name.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              type="button"
              onClick={handleAvatarClick}
              className="absolute -bottom-2 -right-2 h-12 w-12 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-500 hover:text-blue-600 hover:scale-110 transition-all z-10"
            >
              <Camera className="h-6 w-6" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
          <div className="text-center">
            <h3 className="text-2xl font-black text-slate-900">{initialData.name}</h3>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600 mt-2 bg-blue-50 px-4 py-1.5 rounded-full inline-block">
              {initialData.role.replace('_', ' ')}
            </p>
          </div>
        </div>

        {/* Right: Forms */}
        <div className="flex-1 space-y-12">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-black text-slate-900">Personal Information</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8 max-w-4xl">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    name="name"
                    defaultValue={initialData.name}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                  <input 
                    readOnly
                    value={initialData.email}
                    className="w-full pl-12 pr-12 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-slate-400 font-bold cursor-not-allowed shadow-inner"
                  />
                  <Shield className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                </div>
                <p className="text-[10px] text-slate-400 ml-1 italic leading-relaxed">Email is verified and cannot be changed manually.</p>
              </div>

              <div className="space-y-3 lg:col-span-1">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                  <input 
                    name="phone"
                    defaultValue={initialData.phone}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-bold text-slate-700 shadow-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="pt-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-md text-center md:text-left">
              <h4 className="text-base font-black text-slate-900">Finalize Changes</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">Please ensure all details are correct. Updating your name will change your dashboard greeting.</p>
            </div>
            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-blue-200 hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              {loading ? 'Updating...' : 'Save Changes'}
            </button>
          </section>
        </div>
      </div>
    </form>
  );
}
