'use client';

import Link from 'next/link';
import Image from 'next/image';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '/changelog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy-policy' },
    { label: 'Terms of Service', href: '/terms-of-service' },
    { label: 'Cookie Policy', href: '/cookie-policy' },
    { label: 'License', href: '/license' },
  ],
};

export default function Footer() {
  return (
    <footer
      className="border-t border-ff-navy-700/50"
      style={{ background: '#0B1220' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main footer content */}
        <div className="py-16 grid grid-cols-2 md:grid-cols-6 gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-3">
            <Link href="/" className="flex items-center gap-3 mb-5 group">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border border-white/10 p-1.5 transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/favicon_io/android-chrome-512x512.png"
                  alt="FreightFlow Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-white font-bold text-base tracking-tight leading-none">
                  FreightFlow
                </span>
                <span className="text-[8px] text-white/50 font-bold tracking-wider uppercase mt-1 leading-none">
                  Account. Manage. Move Ahead.
                </span>
              </div>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Every Trip. Every Rupee. Every Mile — In Control.
              <br />
              Logistics & Supply Chain Intelligence for Indian transport businesses.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mb-6">
              <a
                href="https://x.com/techsonance_in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-ff-teal-400 hover:bg-ff-teal-500/10 hover:border-ff-teal-500/30 transition-all duration-200"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com/company/techsonance-infotech/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-ff-teal-400 hover:bg-ff-teal-500/10 hover:border-ff-teal-500/30 transition-all duration-200"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/techsonance_infotech/?igsh=MTZqNm04enMxaGZmbg%3D%3D#"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-ff-teal-400 hover:bg-ff-teal-500/10 hover:border-ff-teal-500/30 transition-all duration-200"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
              <a
                href="https://techsonance.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-ff-teal-400 hover:bg-ff-teal-500/10 hover:border-ff-teal-500/30 transition-all duration-200"
                aria-label="Website"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </a>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2">
              {['GST Ready', 'e-Way Bill', 'IRN e-Invoice', 'TDS 194C'].map((badge) => (
                <span
                  key={badge}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-ff-teal-500/30 text-ff-teal-500 bg-ff-teal-500/10"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">{category}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    {href.startsWith('/') ? (
                      <Link
                        href={href}
                        className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                      >
                        {label}
                      </Link>
                    ) : (
                      <a
                        href={href}
                        className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                      >
                        {label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar matching user image */}
        <div className="border-t border-white/5 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-sm text-white/50">
          <div className="space-y-1.5 font-sans">
            <p>
              Support:{' '}
              <a href="mailto:support@techsonance.co.in" className="text-white/70 hover:text-ff-teal-400 font-medium transition-colors">
                support@techsonance.co.in
              </a>{' '}
              | Phone:{' '}
              <a href="tel:+919173101711" className="text-white/70 hover:text-ff-teal-400 font-medium transition-colors">
                +91 91731 01711
              </a>
            </p>
            <p className="text-white/45 text-sm leading-relaxed">
              HQ: UG-15 Palladium Plaza, Vesu, Surat, Gujarat 395007, India
            </p>
          </div>

          <div className="space-y-1 md:text-right font-sans">
            <p>
              FreightFlow is a registered product of{' '}
              <a
                href="https://techsonance.co.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-ff-teal-400 font-medium transition-colors"
              >
                Techsonance InfoTech LLP
              </a>.
            </p>
            <p className="text-white/45 text-xs flex items-center md:justify-end gap-1.5">
              © 2026 FreightFlow. All rights reserved. | Made with ❤️ in India 🇮🇳
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
