'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { triggerDemoModal } from '@/hooks/useDemoModal';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP fade in
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('@/lib/gsap');
      if (navRef.current) {
        gsap.fromTo(
          navRef.current,
          { y: -60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.1 }
        );
      }
    };
    loadGSAP();
  }, []);

  const navLinks = [
    { href: '/#features', label: 'Industries' },
    { href: '/#pricing', label: 'Pricing' },
    { href: '/security', label: 'Resources' },
    { href: '/login', label: 'Sign In' },
  ];

  return (
    <nav
      ref={navRef}
      id="main-nav"
      style={{ opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-md p-1.5 transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/favicon_io/android-chrome-512x512.png"
                alt="FreightFlow Logo"
                width={24}
                height={24}
                className="object-contain filter brightness-200"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-900 font-extrabold text-base tracking-tight leading-none">
                FreightFlow
              </span>
              <span className="text-[8px] text-blue-600 font-extrabold tracking-wider uppercase mt-0.5 leading-none">
                Indian Logistics SaaS
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-slate-600 hover:text-slate-900 text-sm font-semibold transition-colors duration-200"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={triggerDemoModal}
              className="text-white text-xs font-bold px-5 py-2.5 rounded-full bg-[#1E3A8A] hover:bg-[#1E40AF] transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
            >
              Book a Demo
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-slate-800 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 py-4 px-4 mt-2 rounded-2xl shadow-xl space-y-3">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-slate-700 hover:text-slate-900 text-sm font-semibold py-1.5 transition-colors"
              >
                {label}
              </Link>
            ))}
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  triggerDemoModal();
                }}
                className="text-center text-white py-2.5 rounded-xl bg-[#1E3A8A] text-xs font-bold shadow-md cursor-pointer"
              >
                Book a Demo
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
