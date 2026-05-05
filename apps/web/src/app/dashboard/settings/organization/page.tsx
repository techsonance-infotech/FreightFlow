import React from 'react';
import { getSession } from '@/lib/auth-utils';
import { prisma } from '@freightflow/db';
import { Building2, MapPin, Hash, Globe, Plus, Store } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function OrganizationSettingsPage() {
  const session = await getSession();
  if (!session || !session.user || !session.user.companyId) redirect('/dashboard');

  const company = await prisma.company.findUnique({
    where: { id: session.user.companyId },
    include: {
      branches: true,
    }
  });

  if (!company) return <div>Company not found</div>;

  return (
    <div className="p-8 lg:p-12 space-y-12">
      {/* Company Header Card */}
      <div className="flex items-center gap-6 p-8 rounded-3xl bg-slate-900 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 -translate-y-1/2 translate-x-1/2">
          <Building2 className="h-64 w-64" />
        </div>
        <div className="h-24 w-24 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl font-black border border-white/20 z-10">
          {company.name.charAt(0).toUpperCase()}
        </div>
        <div className="z-10">
          <h2 className="text-2xl font-black tracking-tight">{company.name}</h2>
          <div className="flex items-center gap-4 mt-2 text-slate-400 text-sm font-bold">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {company.city}, {company.state}</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="flex items-center gap-1.5 uppercase tracking-widest text-xs">GST: {company.gstin || 'Pending'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* Left: General Info */}
        <div className="xl:col-span-2 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Hash className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Legal & Tax Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InfoField label="Company Legal Name" value={company.name} />
              <InfoField label="GST Registration Number" value={company.gstin} />
              <InfoField label="PAN Number" value={company.pan} />
              <InfoField label="Registration Date" value={company.createdAt.toLocaleDateString()} />
            </div>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-8">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Globe className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900">Business Address</h3>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Full Address</p>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{company.address || 'Not specified'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">City</p>
                  <p className="text-sm font-bold text-slate-700">{company.city}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Pincode</p>
                  <p className="text-sm font-bold text-slate-700">{company.pincode}</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right: Branches */}
        <aside className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Active Branches</h3>
            <button className="h-8 w-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:scale-110 active:scale-90 transition-all shadow-lg shadow-blue-100">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            {company.branches.map((branch, index) => (
              <div key={branch.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors shadow-sm">
                  <Store className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-slate-900 truncate">{branch.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{index === 0 ? 'Main Office' : 'Branch Office'}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string, value: string | null }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
      <div className="px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 text-slate-900 font-bold">
        {value || <span className="text-slate-300 italic">Not set</span>}
      </div>
    </div>
  );
}
