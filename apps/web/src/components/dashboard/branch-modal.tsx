'use client';

import React, { useState } from 'react';
import { 
  Store, X, Save, MapPin, 
  Trash2, ShieldCheck, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { createBranch, updateBranch, deleteBranch } from '@/app/actions/settings/branches';

interface BranchModalProps {
  branch?: any;
  onClose: () => void;
}

export function BranchModal({ branch, onClose }: BranchModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(branch || {
    name: '',
    address: '',
    stateCode: '',
  });

  const isEdit = !!branch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await updateBranch(branch.id, formData);
        toast.success('Branch updated successfully');
      } else {
        await createBranch(formData);
        toast.success('Branch created successfully');
      }
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteBranch(branch.id);
      toast.success('Branch deleted successfully');
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between px-10 py-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
              <Store className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              {isEdit ? 'Configure Branch' : 'Establish Branch'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Mumbai North, Warehouse A"
                className="h-14 rounded-2xl bg-slate-50 border-none px-6 font-black text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Branch Address</label>
              <Textarea 
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Complete address for this location"
                className="min-h-[100px] rounded-2xl bg-slate-50 border-none px-6 py-4 font-bold text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">State Code</label>
              <Input 
                value={formData.stateCode}
                onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                placeholder="e.g. 27 for Maharashtra"
                className="h-12 rounded-xl bg-slate-50 border-none px-4 font-bold text-sm text-slate-700 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
              />
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-blue-50 border border-blue-100 flex gap-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
            <p className="text-[11px] leading-relaxed text-blue-700 font-medium">
              Branch locations are used to segment inventory, staff, and financial records for localized reporting.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between">
            {isEdit ? (
              <Button 
                type="button" 
                onClick={handleDelete}
                variant="ghost" 
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-black text-[10px] uppercase tracking-widest gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Terminate Branch
              </Button>
            ) : <div />}

            <div className="flex gap-4">
              <Button type="button" variant="ghost" onClick={onClose} className="font-black text-[10px] uppercase tracking-widest text-slate-400">Cancel</Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 gap-2"
              >
                {loading ? <div className="h-4 w-4 animate-spin border-2 border-white/20 border-t-white rounded-full" /> : <Save className="h-4 w-4" />}
                {isEdit ? 'Save Changes' : 'Establish Node'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
