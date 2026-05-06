'use client';

import React from 'react';
import { 
  Building2, Mail, Globe, MapPin, 
  Phone, MessageCircle, Code2, Zap, 
  Shield, Users2, Rocket, Heart,
  ShieldCheck, Cpu, Globe2, Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export function AboutSection() {
  const businessInfo = {
    name: "TechSonance InfoTech LLP",
    tagline: "Where Innovation Finds Its Resonance",
    description: "TechSonance InfoTech LLP is a leading software development company specializing in custom enterprise solutions and mission-critical logistics systems. Our flagship platform, FreightFlow, is a testament to our commitment to transforming complex business challenges into elegant, high-performance software. With expertise spanning cloud architecture, real-time data processing, and user-centric design, we partner with industry leaders to build scalable solutions that drive growth and operational excellence.",
    address: "UG-15, Palladium Plaza, VIP Road, Vesu, Surat, Gujarat - 395007, India",
    email: "info@techsonance.co.in",
    phone: "+91 91731 01711",
    website: "https://www.techsonance.co.in",
    whatsapp: "919173101711",
    whatsappDisplay: "+91 91731 01711"
  };

  const projectInfo = {
    name: "FreightFlow",
    version: "2.0.0-pro",
    status: "Production Ready",
    tech: ["Next.js 15", "Prisma ORM", "PostgreSQL", "Tailwind CSS", "TurboRepo"]
  };

  return (
    <div className="space-y-16 p-8 lg:p-12 animate-in fade-in duration-1000 max-w-7xl mx-auto">
      {/* Hero Section - Blue Theme */}
      <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-16 md:p-24 text-white shadow-2xl shadow-blue-900/20">
        <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
           <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl -mr-48 -mt-48 animate-pulse"></div>
           <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl -ml-48 -mb-48 animate-pulse duration-5000"></div>
        </div>

        <div className="relative z-10 text-center space-y-10">
          <div className="mb-4 inline-block p-4 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-2xl">
             <div className="relative h-20 w-56">
                <Image
                  src="/logo.png"
                  alt="FreightFlow Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
             </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic">
              {projectInfo.name}
            </h1>
            <div className="flex items-center justify-center gap-3">
               <span className="px-4 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/30 text-[10px] font-black uppercase tracking-widest text-blue-300">
                  Version {projectInfo.version}
               </span>
               <span className="px-4 py-1.5 rounded-full bg-emerald-600/30 border border-emerald-400/30 text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  {projectInfo.status}
               </span>
            </div>
          </div>
          <p className="text-xl md:text-2xl text-blue-100/70 font-medium max-w-3xl mx-auto leading-relaxed">
            Every Trip. Every Rupee. Every Mile — In Control.
          </p>
        </div>
      </div>

      {/* About Section */}
      <div className="grid lg:grid-cols-5 gap-12 items-start">
        <Card className="lg:col-span-3 p-12 bg-white shadow-xl rounded-[3rem] border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32 transition-transform group-hover:scale-150 duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-14 w-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-xl shadow-blue-100">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">The Architect</h2>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{businessInfo.name}</p>
              </div>
            </div>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {businessInfo.description}
            </p>
            
            <div className="mt-12 pt-12 border-t border-slate-50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Platform Capabilities</h3>
              <div className="grid grid-cols-2 gap-4">
                {["Trip Management", "Financial Intelligence", "Fleet Compliance", "Tyre Tracking", "POD Auditing", "Payroll Hub"].map((m, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-500 font-medium text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                    {m}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-12 border-t border-slate-50 grid grid-cols-2 md:grid-cols-4 gap-8">
               {projectInfo.tech.map((t, i) => (
                 <div key={i} className="flex flex-col gap-2">
                    <div className="h-1 bg-blue-600 rounded-full w-full opacity-10"></div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t}</span>
                 </div>
               ))}
            </div>
          </div>
        </Card>

        {/* Contact Quick Links */}
        <div className="lg:col-span-2 space-y-6">
           <ContactCard 
              icon={<MapPin className="h-6 w-6" />} 
              label="Surat HQ" 
              value={businessInfo.address} 
           />
           <ContactCard 
              icon={<Mail className="h-6 w-6" />} 
              label="Email Support" 
              value={businessInfo.email} 
              href={`mailto:${businessInfo.email}`}
           />
           <ContactCard 
              icon={<Globe2 className="h-6 w-6" />} 
              label="Web Portal" 
              value="www.techsonance.co.in" 
              href={businessInfo.website}
           />
           
           <div className="pt-6">
              <Link href={`https://wa.me/${businessInfo.whatsapp}`} target="_blank">
                <Button className="w-full h-20 rounded-3xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl shadow-emerald-100 flex items-center justify-between px-8 group transition-all">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                      <MessageCircle className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Instant Connect</p>
                      <p className="text-lg font-black tracking-tight">WhatsApp Support</p>
                    </div>
                  </div>
                  <ChevronRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
           </div>
        </div>
      </div>

      {/* Core Values / Features */}
      <div className="grid md:grid-cols-3 gap-8 pt-12">
        <ValueCard icon={<ShieldCheck />} title="Enterprise Security" desc="Bank-grade encryption and multi-tenant isolation." />
        <ValueCard icon={<Cpu />} title="Advanced Stack" desc="Built with Next.js 15 and server-side optimization." />
        <ValueCard icon={<Rocket />} title="Scalable Architecture" desc="Engineered to grow with your fleet size." />
      </div>

      {/* Corporate Logo Section */}
      <div className="pt-12 text-center border-t border-slate-100">
        <div className="flex flex-col items-center gap-6">
          <div className="relative h-12 w-48 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
             <Image src="/techsonance-logo.png" alt="TechSonance" fill className="object-contain" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactCard({ icon, label, value, href }: any) {
  return (
    <div className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex items-start gap-6 h-full">
      <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-blue-50 text-blue-600 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        {href ? (
          <Link 
            href={href} 
            target="_blank" 
            className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors break-words block leading-relaxed"
          >
            {value}
          </Link>
        ) : (
          <p className="text-sm font-bold text-slate-700 leading-relaxed break-words">{value}</p>
        )}
      </div>
    </div>
  );
}

function ValueCard({ icon, title, desc }: any) {
  return (
    <Card className="p-10 rounded-[3rem] bg-slate-50/50 border-none shadow-none text-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
      <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-8 shadow-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {React.cloneElement(icon, { className: "h-8 w-8" })}
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm font-medium text-slate-500 leading-relaxed">{desc}</p>
    </Card>
  );
}

function ChevronRight(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
