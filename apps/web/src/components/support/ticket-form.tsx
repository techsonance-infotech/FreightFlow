'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send, HelpCircle, Bug, ShieldCheck, AlertTriangle } from 'lucide-react';
import { createSupportTicket } from '@/app/actions/support-tickets';

export function TicketForm({ defaultCategory = 'support' }: { defaultCategory?: string }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: defaultCategory,
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await createSupportTicket(formData);
      toast.success('Ticket submitted successfully! We will get back to you soon.');
      setFormData({
        subject: '',
        description: '',
        category: 'support',
        priority: 'medium',
      });
    } catch (error) {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-xl shadow-slate-100/30">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center border border-blue-100">
           <Send className="h-6 w-6 text-blue-600" />
        </div>
        <div>
           <h2 className="text-xl font-black text-slate-900 tracking-tight">Register Help Request</h2>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Support Channel</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
            <Select 
              value={formData.category} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="support">
                   <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-blue-500" />
                      <span>General Help & Support</span>
                   </div>
                </SelectItem>
                <SelectItem value="bug">
                   <div className="flex items-center gap-2">
                      <Bug className="h-4 w-4 text-rose-500" />
                      <span>Bug Report / Technical Issue</span>
                   </div>
                </SelectItem>
                <SelectItem value="license">
                   <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                      <span>License & Billing Support</span>
                   </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Priority</label>
            <Select 
              value={formData.priority} 
              onValueChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
            >
              <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-slate-100">
                <SelectValue placeholder="Select Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (Standard)</SelectItem>
                <SelectItem value="medium">Medium (Moderate)</SelectItem>
                <SelectItem value="high">High (Priority)</SelectItem>
                <SelectItem value="urgent">Urgent (Immediate Action)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
          <Input 
            placeholder="Brief title of the issue..."
            value={formData.subject}
            onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
            className="h-12 rounded-xl bg-slate-50 border-slate-100 focus:bg-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description</label>
          <Textarea 
            placeholder="Provide as much detail as possible. If it's a bug, please include steps to reproduce."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="min-h-[150px] rounded-xl bg-slate-50 border-slate-100 focus:bg-white"
          />
        </div>

        <Button 
          type="submit" 
          disabled={loading}
          className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-100"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Log Support Ticket'}
        </Button>
      </form>
    </div>
  );
}
