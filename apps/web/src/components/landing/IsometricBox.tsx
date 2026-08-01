'use client';

import React from 'react';

interface IsometricBoxProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function IsometricBox({ className = '', style = {} }: IsometricBoxProps) {
  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`w-full h-auto ${className}`}
      style={style}
    >
      {/* Blueprint thin gray line illustration */}
      <g stroke="#94A3B8" strokeWidth="1.25" strokeLinejoin="round" strokeLinecap="round" fill="none">
        {/* Box Body - Left Side */}
        <polygon points="100,240 250,330 250,470 100,380" fill="#F8FAFC" fillOpacity="0.3" />

        {/* Box Body - Right Side */}
        <polygon points="250,330 400,240 400,380 250,470" fill="#F1F5F9" fillOpacity="0.3" />

        {/* Inside Interior Void */}
        <polygon points="100,240 250,150 400,240 250,330" fill="#E2E8F0" fillOpacity="0.25" />

        {/* Top Open Flap - Left Outer */}
        <polygon points="100,240 250,330 180,370 30,280" fill="#FFFFFF" fillOpacity="0.4" />

        {/* Top Open Flap - Right Outer */}
        <polygon points="250,330 400,240 470,280 320,370" fill="#FFFFFF" fillOpacity="0.4" />

        {/* Top Open Flap - Back Left */}
        <polygon points="100,240 250,150 180,110 30,200" fill="#F8FAFC" fillOpacity="0.4" />

        {/* Top Open Flap - Back Right */}
        <polygon points="250,150 400,240 470,200 320,110" fill="#F8FAFC" fillOpacity="0.4" />

        {/* Handling Icons Line Art */}
        <path d="M160,300 L160,330 M180,310 L180,340 M200,320 L200,350" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
        
        {/* Fragile Glass Wireframe Symbol */}
        <path d="M140,310 L155,310 L150,335 L145,335 Z M147.5,335 L147.5,345 M140,345 L155,345" stroke="#94A3B8" strokeWidth="1" />

        {/* Upward Arrows */}
        <path d="M185,340 L185,320 M180,325 L185,320 L190,325" stroke="#94A3B8" strokeWidth="1" />
        <path d="M200,348 L200,328 M195,333 L200,328 L205,333" stroke="#94A3B8" strokeWidth="1" />
      </g>
    </svg>
  );
}
