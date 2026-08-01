'use client';

import React from 'react';

interface Company {
  id: string;
  name: string;
  subtitle?: string;
  logo: React.ReactNode;
}

const COMPANIES: Company[] = [
  {
    id: 'shree-shivay',
    name: 'SHREE SHIVAY',
    subtitle: 'TRANS LOGISTICS',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
          fill="url(#shivay-grad)"
          stroke="#1E4D8C"
          strokeWidth="1.5"
        />
        <path
          d="M16 7L23 11V21L16 25L9 21V11L16 7Z"
          fill="#1E3A8A"
          opacity="0.2"
        />
        <path
          d="M12 12C12 12 19 11 19 15C19 19 13 17 13 21C13 23 19 22 19 22"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-blue-600 dark:text-blue-400"
        />
        <circle cx="16" cy="16.5" r="1.5" fill="#F59E0B" />
        <defs>
          <linearGradient id="shivay-grad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="1" stopColor="#1E4D8C" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'aarambh-fx',
    name: 'AARAMBH FX',
    subtitle: 'FREIGHT EXCHANGE',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="3" width="26" height="26" rx="8" fill="url(#aarambh-grad)" stroke="#10B981" strokeWidth="1.2" />
        <path
          d="M10 20L16 9L22 20M12.5 16.5H19.5"
          stroke="#059669"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19 11L23 15M23 15L19 19M23 15H15"
          stroke="#0EA5E9"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient id="aarambh-grad" x1="3" y1="3" x2="29" y2="29" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10B981" stopOpacity="0.15" />
            <stop offset="1" stopColor="#0EA5E9" stopOpacity="0.25" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    id: 'saltbox',
    name: 'SALTBOX',
    subtitle: 'FULFILLMENT HUBS',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Isometric Box Top */}
        <path d="M16 4L27 10L16 16L5 10L16 4Z" fill="#818CF8" />
        {/* Isometric Box Left */}
        <path d="M5 10L16 16V28L5 22V10Z" fill="#4F46E5" />
        {/* Isometric Box Right */}
        <path d="M16 16L27 10V22L16 28V16Z" fill="#3730A3" />
        {/* Stylized S Cutout accent */}
        <path d="M13 12L19 15.5L16 17.5" stroke="#EEF2FF" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'nimbl-fleet',
    name: 'NIMBL FLEET',
    subtitle: 'SMART DISPATCH',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M4 22L12 6H18L10 22H4Z"
          fill="#F59E0B"
        />
        <path
          d="M13 22L21 6H27L19 22H13Z"
          fill="#D97706"
        />
        <path
          d="M8 14H24"
          stroke="#1E293B"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="23" cy="14" r="2.5" fill="#EF4444" />
      </svg>
    ),
  },
  {
    id: 'shippingtree',
    name: 'SHIPPINGTREE',
    subtitle: 'SUPPLY NETWORK',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="7" r="4" fill="#0D9488" />
        <circle cx="8" cy="22" r="3.5" fill="#14B8A6" />
        <circle cx="24" cy="22" r="3.5" fill="#2DD4BF" />
        <path
          d="M16 11V24M16 17L8 22M16 17L24 22"
          stroke="#0F766E"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M16 4L18 8H14L16 4Z"
          fill="#5EEAD4"
        />
      </svg>
    ),
  },
  {
    id: 'wsi-logistics',
    name: 'WSI LOGISTICS',
    subtitle: 'GLOBAL FREIGHT',
    logo: (
      <svg className="w-7 h-7 shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="16" cy="16" r="13" stroke="#1E293B" strokeWidth="1.5" fill="none" strokeDasharray="3 2" />
        <path
          d="M6 10L11 23L16 13L21 23L26 10"
          stroke="#2563EB"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M4 16H28"
          stroke="#3B82F6"
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
      </svg>
    ),
  },
];

export default function CompanyMarquee() {
  // Multiply list 4 times for seamless continuous infinite marquee scroll without jump
  const marqueeItems = [...COMPANIES, ...COMPANIES, ...COMPANIES, ...COMPANIES];

  return (
    <div className="w-full pt-4 max-w-5xl mx-auto">
      {/* Label */}
      <div className="text-center mb-3">
        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase">
          TRUSTED BY LEADING FLEETS & LOGISTICS POWERHOUSES
        </p>
      </div>

      {/* Marquee Wrapper with side gradient fades */}
      <div className="relative overflow-hidden py-2 select-none group">
        {/* Left Fade Overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAFAFC] via-[#FAFAFC]/80 to-transparent z-10 pointer-events-none" />

        {/* Right Fade Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAFAFC] via-[#FAFAFC]/80 to-transparent z-10 pointer-events-none" />

        {/* Scrolling Track */}
        <div className="flex w-max animate-marquee items-center gap-8 sm:gap-12 hover:[animation-play-state:paused] transition-all">
          {marqueeItems.map((company, index) => (
            <div
              key={`${company.id}-${index}`}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl border border-slate-200/40 bg-white/40 backdrop-blur-[2px] opacity-70 hover:opacity-100 hover:scale-105 hover:bg-white hover:border-slate-300 hover:shadow-md hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer shrink-0"
            >
              {company.logo}
              <div className="flex flex-col text-left">
                <span className="text-xs sm:text-sm font-extrabold text-slate-800 tracking-wider uppercase leading-none">
                  {company.name}
                </span>
                {company.subtitle && (
                  <span className="text-[9px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5 leading-none">
                    {company.subtitle}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
