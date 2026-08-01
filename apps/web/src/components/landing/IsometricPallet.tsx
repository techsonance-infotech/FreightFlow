'use client';

import React from 'react';

interface IsometricPalletProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function IsometricPallet({ className = '', style = {} }: IsometricPalletProps) {
  return (
    <svg
      viewBox="0 0 600 450"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className}`}
      style={style}
    >
      {/* Blueprint thin gray line illustration */}
      <g stroke="#94A3B8" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" fill="none">
        {/* Bottom Stringers & Blocks Base */}
        <polygon points="120,290 160,310 160,335 120,315" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="160,310 210,285 210,310 160,335" fill="#F1F5F9" fillOpacity="0.3" />

        <polygon points="270,365 310,385 310,410 270,390" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="310,385 360,360 360,385 310,410" fill="#F1F5F9" fillOpacity="0.3" />

        <polygon points="420,290 460,310 460,335 420,315" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="460,310 510,285 510,310 460,335" fill="#F1F5F9" fillOpacity="0.3" />

        {/* Middle Cross Beams */}
        <polygon points="100,280 300,380 300,300 100,200" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="300,380 520,270 520,250 300,360" fill="#F1F5F9" fillOpacity="0.3" />
        <polygon points="100,200 300,300 520,190 320,90" fill="#FFFFFF" fillOpacity="0.4" />

        {/* Top Slats */}
        <polygon points="110,205 150,225 370,115 330,95" fill="#FFFFFF" fillOpacity="0.5" />
        <polygon points="110,205 150,225 150,237 110,217" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="150,225 370,115 370,127 150,237" fill="#F1F5F9" fillOpacity="0.3" />

        <polygon points="160,230 200,250 420,140 380,120" fill="#FFFFFF" fillOpacity="0.5" />
        <polygon points="160,230 200,250 200,262 160,242" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="200,250 420,140 420,152 200,262" fill="#F1F5F9" fillOpacity="0.3" />

        <polygon points="210,255 250,275 470,165 430,145" fill="#FFFFFF" fillOpacity="0.5" />
        <polygon points="210,255 250,275 250,287 210,267" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="250,275 470,165 470,177 250,287" fill="#F1F5F9" fillOpacity="0.3" />

        <polygon points="260,280 300,300 520,190 480,170" fill="#FFFFFF" fillOpacity="0.5" />
        <polygon points="260,280 300,300 300,312 260,292" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="300,300 520,190 520,202 300,312" fill="#F1F5F9" fillOpacity="0.3" />

        {/* Blueprint construction guide lines */}
        <path d="M150,237 L150,270 M200,262 L200,295 M250,287 L250,320 M300,312 L300,345" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
