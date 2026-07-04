'use client';

import Link from 'next/link';

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Changelog', href: '#' },
  ],
  Company: [
    { label: 'About', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ],
  Support: [
    { label: 'Documentation', href: 'https://docs.freightflow.com' },
    { label: 'Support', href: '#' },
    { label: 'Status', href: '#' },
    { label: 'API Reference', href: '#' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Service', href: '#' },
    { label: 'Cookie Policy', href: '#' },
    { label: 'License', href: '#' },
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
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-ff-teal-500 to-ff-teal-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">F</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">
                Freight<span className="text-ff-amber-500">Flow</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Every Trip. Every Rupee. Every Mile — In Control.
              <br />
              Logistics & Supply Chain Intelligence for Indian transport businesses.
            </p>

            {/* Corporate Info */}
            <div className="text-white/40 text-xs space-y-1 mb-6 font-mono">
              <p>TechSonance InfoTech LLP</p>
              <p className="leading-relaxed">Regd: 401, Sapphire Chambers, Baner, Pune - 411045</p>
              <p>GSTIN: 27AAACT9011J1ZX</p>
              <p>CIN: U72900MH2026PTC390888</p>
            </div>

            {/* Contact */}
            <div className="space-y-2">
              <a
                href="mailto:support@freightflow.com"
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <svg className="w-4 h-4 text-ff-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@freightflow.com
              </a>
              <a
                href="https://docs.freightflow.com"
                className="flex items-center gap-2 text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                <svg className="w-4 h-4 text-ff-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                docs.freightflow.com
              </a>
            </div>

            {/* Compliance badges */}
            <div className="flex flex-wrap gap-2 mt-6">
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
                    <a
                      href={href}
                      className="text-white/50 hover:text-white text-sm transition-colors duration-200"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm text-center sm:text-left">
            FreightFlow © 2026+ · Logistics & Supply Chain Intelligence
          </p>
          <p className="text-white/20 text-sm text-center sm:text-right">
            Proudly built by{' '}
            <span className="text-white/40 font-medium">TechSonance InfoTech LLP</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
