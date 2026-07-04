'use client';

import Nav from '@/components/landing/Nav';
import Footer from '@/components/landing/Footer';
import { useState } from 'react';
import { Mail, Phone, MapPin, CheckCircle2 } from 'lucide-react';

export default function ContactPage() {
  const [formState, setFormState] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormState({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <main className="overflow-x-hidden min-h-screen flex flex-col bg-[#050D1E]">
      <Nav />

      {/* Content Area */}
      <div 
        className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#050D1E]"
      >
        {/* Glowing blur blobs matching landing & about hero */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-12 left-1/4 w-[40vw] h-[40vw] rounded-full filter blur-[150px] opacity-[0.08]" style={{ background: '#2563EB' }} />
          <div className="absolute bottom-20 right-1/4 w-[35vw] h-[35vw] rounded-full filter blur-[120px] opacity-[0.05]" style={{ background: '#FFB300' }} />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Heading */}
          <div className="border-b border-white/10 pb-8 mb-12 text-center md:text-left space-y-4">
            <span className="inline-flex items-center text-ff-teal-300 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest bg-ff-teal-500/10 px-3.5 py-1.5 rounded-full border border-ff-teal-500/30 shadow-lg shadow-ff-teal-500/10">
              Get in Touch
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mt-4 mb-4">
              Contact Our Team
            </h1>
            <p className="text-white/70 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              Have questions about features, pricing, or custom enterprise solutions? We are here to help.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Contact Details */}
            <div className="space-y-8">
              <div className="bg-white/[0.01] border border-white/5 rounded-2xl p-8 space-y-6">
                <h2 className="text-xl font-bold text-white tracking-tight">Direct Connections</h2>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Mail className="w-5 h-5 text-ff-teal-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Support & Operations</h3>
                      <p className="text-xs text-white/50 mb-1">Response within 24 hours</p>
                      <a href="mailto:support@techsonance.co.in" className="text-ff-teal-400 text-sm hover:underline">
                        support@techsonance.co.in
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                    <Phone className="w-5 h-5 text-ff-teal-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Phone Support</h3>
                      <p className="text-xs text-white/50 mb-1">Mon-Sat, 9 AM - 6 PM IST</p>
                      <a href="tel:+919173101711" className="text-ff-teal-400 text-sm hover:underline">
                        +91 91731 01711
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 pt-4 border-t border-white/5">
                    <MapPin className="w-5 h-5 text-ff-teal-500 mt-1" />
                    <div>
                      <h3 className="text-sm font-bold text-white">Headquarters</h3>
                      <p className="text-xs text-white/50 mb-1">Techsonance InfoTech LLP</p>
                      <p className="text-white/70 text-sm leading-relaxed">
                        UG-15 Palladium Plaza, Vesu, Surat, Gujarat 395007, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-8">
              <h2 className="text-xl font-bold text-white tracking-tight mb-6">Send a Message</h2>
              {submitted ? (
                <div className="bg-ff-teal-500/10 border border-ff-teal-500/20 rounded-xl p-6 text-center space-y-3 flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-ff-teal-500" />
                  <h3 className="text-white font-bold text-base">Message Sent Successfully!</h3>
                  <p className="text-white/60 text-xs leading-relaxed">
                    Thank you for reaching out. A support coordinator will connect with you shortly.
                  </p>
                  <button 
                    onClick={() => setSubmitted(false)}
                    className="text-xs text-ff-teal-400 hover:underline mt-4 font-medium"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Full Name</label>
                    <input 
                      type="text" 
                      required 
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      placeholder="Your Name"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ff-teal-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Email Address</label>
                    <input 
                      type="email" 
                      required 
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      placeholder="you@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ff-teal-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Subject</label>
                    <input 
                      type="text" 
                      required 
                      value={formState.subject}
                      onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                      placeholder="Demo booking, billing queries, etc."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ff-teal-500/50 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">Message</label>
                    <textarea 
                      required 
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Briefly describe what we can help you with..."
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-ff-teal-500/50 transition-colors resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-ff-amber-500 hover:bg-ff-amber-600 text-ff-navy-950 font-bold text-sm py-3 rounded-lg transition-all duration-300 shadow-lg shadow-ff-amber-500/10 hover:shadow-ff-amber-500/20"
                  >
                    Submit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
