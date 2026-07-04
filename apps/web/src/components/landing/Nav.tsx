'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP fade in
  useEffect(() => {
    const loadGSAP = async () => {
      const { gsap } = await import('@/lib/gsap');
      if (navRef.current) {
        gsap.fromTo(navRef.current,
          { y: -80, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', delay: 0.2 }
        );
      }
    };
    loadGSAP();
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#security', label: 'Security' },
    { href: '#blog', label: 'Blog' },
    { href: '#about', label: 'About' },
  ];

  return (
    <nav
      ref={navRef}
      id="main-nav"
      style={{ opacity: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-ff-navy-950/80 backdrop-blur-xl border-b border-ff-navy-700/50 shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ff-navy-700 to-ff-navy-900 flex items-center justify-center border border-ff-navy-500/30 shadow-lg group-hover:shadow-ff-navy-500/25 transition-all duration-300">
              <span className="text-ff-amber-500 font-black text-lg leading-none">F</span>
            </div>
            <span className="text-white font-bold text-lg tracking-tight">
              Freight<span className="text-ff-amber-500">Flow</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors duration-200"
              >
                {label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-lg border border-white/10 hover:border-white/30 transition-all duration-200"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="text-ff-navy-950 text-sm font-bold px-5 py-2.5 rounded-lg bg-ff-amber-500 hover:bg-ff-amber-600 transition-all duration-300 shadow-lg shadow-ff-amber-500/20 hover:shadow-ff-amber-500/30 hover:-translate-y-0.5 transform"
            >
              Book a Demo
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-2 rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-ff-navy-950/95 backdrop-blur-xl border-t border-ff-navy-700/50 py-4 px-4 space-y-3">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="block text-white/70 hover:text-white text-base font-medium py-2 transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" className="text-center text-white/80 py-2.5 rounded-lg border border-white/20 text-sm font-medium">Login</Link>
              <Link href="/login" className="text-center text-ff-navy-950 py-2.5 rounded-lg bg-ff-amber-500 text-sm font-bold">Book a Demo</Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
