'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Loader2, User, Shield, 
  CheckCircle2, AlertCircle, Zap,
  Building2, Users, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createLicenseRequest, sendSupportMessage } from '@/app/actions/license-request';
import { toast } from 'sonner';

interface Message {
  id: string;
  message: string;
  isAction: boolean;
  createdAt: any;
  sender?: { name: string; role: string } | null;
  admin?: { email: string; role: string } | null;
}

interface LicenseRequest {
  id: string;
  planType: string;
  status: string;
  messages: Message[];
}

interface LicenseChatProps {
  initialRequest: LicenseRequest | null;
}

const PLANS = [
  { id: 'starter', name: 'Starter', price: '₹4,999/mo', icon: <Building2 className="h-5 w-5" />, features: ['Up to 5 Users', 'Up to 10 Vehicles', 'Basic Reporting'] },
  { id: 'pro', name: 'Professional', price: '₹9,999/mo', icon: <Truck className="h-5 w-5" />, features: ['Unlimited Users', 'Up to 50 Vehicles', 'Advanced Analytics'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', icon: <Shield className="h-5 w-5" />, features: ['Custom Fleet Size', 'Priority Support', 'Full Integration'] },
];

export function LicenseChat({ initialRequest }: LicenseChatProps) {
  const [request, setRequest] = useState<LicenseRequest | null>(initialRequest);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [request?.messages]);

  const handleRequestLicense = async (planId: string) => {
    setIsLoading(true);
    try {
      const res = await createLicenseRequest(planId);
      if (res.success) {
        toast.success('License request submitted!');
        // Ideally we'd fetch the full request here, but for now we'll reload
        window.location.reload();
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !request) return;

    const text = message.trim();
    setMessage('');
    
    try {
      const res = await sendSupportMessage(request.id, text);
      if (!res.success) {
        toast.error('Failed to send message');
      }
    } catch (err) {
      toast.error('Connection error');
    }
  };

  if (!request) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
            <div className="h-14 w-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              {plan.icon}
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2">{plan.name}</h3>
            <div className="text-2xl font-black text-blue-600 mb-6">{plan.price}</div>
            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-slate-500 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => handleRequestLicense(plan.id)}
              disabled={isLoading}
              className="w-full h-12 bg-slate-900 hover:bg-blue-600 rounded-xl font-bold"
            >
              Select Plan
            </Button>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden flex flex-col h-[600px]">
      {/* Chat Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 tracking-tight">Active Request: {request.planType.toUpperCase()}</h3>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Support Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
            request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
          )}>
            Status: {request.status}
          </span>
        </div>
      </div>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {request.messages.map((msg) => {
          const isSystem = msg.isAction;
          const isAdmin = !!msg.admin;
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-slate-50 px-4 py-2 rounded-full border border-slate-100 flex items-center gap-2">
                  <Zap className="h-3 w-3 text-amber-500" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{msg.message}</span>
                </div>
              </div>
            );
          }

          return (
            <div key={msg.id} className={cn(
              "flex flex-col max-w-[80%]",
              isAdmin ? "self-start" : "self-end items-end"
            )}>
              <div className={cn(
                "p-4 rounded-2xl shadow-sm border",
                isAdmin 
                  ? "bg-white border-slate-100 text-slate-700 rounded-tl-none" 
                  : "bg-blue-600 border-blue-600 text-white rounded-tr-none"
              )}>
                <p className="text-sm font-bold leading-relaxed">{msg.message}</p>
              </div>
              <span className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2">
                {isAdmin ? 'Super Admin' : 'You'} • {isMounted ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="p-6 border-t border-slate-50">
        <form onSubmit={handleSendMessage} className="flex gap-4">
          <Input 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="flex-1 h-12 bg-slate-50 border-slate-100 rounded-xl font-bold"
          />
          <Button 
            type="submit" 
            disabled={!message.trim()}
            className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
