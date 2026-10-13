"use client";

import * as React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
}

export function FlatGlobeIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <radialGradient id="globeSphere" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="45%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
        <linearGradient id="globeLand" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#16a34a" />
        </linearGradient>
        <clipPath id="globeClip">
          <circle cx="24" cy="24" r="19" />
        </clipPath>
      </defs>
      {/* Clipped Globe Content: Ocean & Landmasses */}
      <g clipPath="url(#globeClip)">
        <circle cx="24" cy="24" r="19" fill="url(#globeSphere)" />
        {/* Landmass shapes */}
        <path
          d="M14 16c2-4 7-6 11-5 2 1 4 4 3 6-1 2-4 3-5 5-1 3-3 4-6 4-3 0-5-2-4-5 1-2 0-3 1-5z"
          fill="url(#globeLand)"
          stroke="#000000"
          strokeWidth="1"
        />
        <path
          d="M26 27c3-1 6-4 9-2 2 1 3 4 2 6-1 2-4 3-6 4-3 1-5-1-6-3 0-2-1-4 1-5z"
          fill="url(#globeLand)"
          stroke="#000000"
          strokeWidth="1"
        />
        <path
          d="M12 28c2 2 4 4 3 7-1 2-3 4-5 3-2-1-2-4-1-6 1-2 2-3 3-4z"
          fill="url(#globeLand)"
          stroke="#000000"
          strokeWidth="1"
        />
        {/* Latitude / Longitude Overlay */}
        <ellipse cx="24" cy="24" rx="19" ry="8" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
        <ellipse cx="24" cy="24" rx="8" ry="19" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
      </g>
      {/* Crisp Solid Black Boundary Outline */}
      <circle cx="24" cy="24" r="19" stroke="#000000" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function FlatDocumentIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="docBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f1f5f9" />
        </linearGradient>
        <linearGradient id="docCorner" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      {/* Paper Sheet with Solid Black Boundary Outline */}
      <path
        d="M10 8a3 3 0 0 1 3-3h16l11 11v24a3 3 0 0 1-3 3H13a3 3 0 0 1-3-3V8z"
        fill="url(#docBg)"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Folded Corner with Solid Black Outline */}
      <path
        d="M29 5v8a3 3 0 0 0 3 3h8L29 5z"
        fill="url(#docCorner)"
        stroke="#000000"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Document Text Lines */}
      <rect x="16" y="21" width="16" height="3" rx="1.5" fill="#6366f1" stroke="#000000" strokeWidth="0.8" />
      <rect x="16" y="27" width="18" height="2.5" rx="1.25" fill="#94a3b8" />
      <rect x="16" y="32" width="13" height="2.5" rx="1.25" fill="#94a3b8" />
      {/* Accent Stamp with Black Outline */}
      <circle cx="32" cy="34" r="3.5" fill="#ffab00" stroke="#000000" strokeWidth="1.5" />
    </svg>
  );
}

export function FlatWifiIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="wifiWave" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <radialGradient id="wifiDot" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0369a1" />
        </radialGradient>
      </defs>

      {/* --- Outer Wave --- */}
      {/* Black boundary outline */}
      <path
        d="M7 16c9.4-9.4 24.6-9.4 34 0"
        stroke="#000000"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Inner wave fill */}
      <path
        d="M7 16c9.4-9.4 24.6-9.4 34 0"
        stroke="url(#wifiWave)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* --- Middle Wave --- */}
      {/* Black boundary outline */}
      <path
        d="M13 22c6.1-6.1 15.9-6.1 22 0"
        stroke="#000000"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Inner wave fill */}
      <path
        d="M13 22c6.1-6.1 15.9-6.1 22 0"
        stroke="url(#wifiWave)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* --- Inner Wave --- */}
      {/* Black boundary outline */}
      <path
        d="M19 28c2.8-2.8 7.2-2.8 10 0"
        stroke="#000000"
        strokeWidth="7"
        strokeLinecap="round"
      />
      {/* Inner wave fill */}
      <path
        d="M19 28c2.8-2.8 7.2-2.8 10 0"
        stroke="url(#wifiWave)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* --- Center Pulse Dot with Black Boundary Outline --- */}
      <circle cx="24" cy="36" r="5.5" fill="#000000" />
      <circle cx="24" cy="36" r="4" fill="url(#wifiDot)" />
      <circle cx="24" cy="36" r="1.5" fill="#ffffff" />
    </svg>
  );
}

export function FlatVCardIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="vcardBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
        <linearGradient id="vcardHeader" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <linearGradient id="phoneBadge" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Main Card Body with Solid Black Boundary Outline */}
      <rect
        x="7"
        y="5"
        width="34"
        height="38"
        rx="6"
        fill="url(#vcardBg)"
        stroke="#000000"
        strokeWidth="2.5"
      />

      {/* Header Ribbon with Lanyard Slot */}
      <path
        d="M7 11a6 6 0 0 1 6-6h22a6 6 0 0 1 6 6v3H7v-3z"
        fill="url(#vcardHeader)"
        stroke="#000000"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <rect x="20" y="7.5" width="8" height="2" rx="1" fill="#ffffff" stroke="#000000" strokeWidth="0.8" />

      {/* User Portrait Avatar with Black Outline */}
      <circle cx="24" cy="23" r="7.5" fill="url(#avatarGrad)" stroke="#000000" strokeWidth="1.5" />
      <circle cx="24" cy="20.5" r="3" fill="#ffffff" />
      <path d="M18.5 28.5c.6-2.5 2.8-4 5.5-4s4.9 1.5 5.5 4a7.5 7.5 0 0 1-11 0z" fill="#ffffff" />

      {/* Contact Name & Detail Lines */}
      <rect x="14" y="33" width="20" height="2.5" rx="1.25" fill="#6366f1" stroke="#000000" strokeWidth="0.8" />
      <rect x="17" y="37.5" width="14" height="2" rx="1" fill="#94a3b8" />

      {/* Floating Call/Phone Badge (Bottom Right) with Solid Black Boundary Outline */}
      <circle cx="36" cy="36" r="7" fill="url(#phoneBadge)" stroke="#000000" strokeWidth="2" />
      <path
        d="M33.8 33.2c-.3.3-.4.8-.3 1.2.4 1.2 1.4 2.4 2.6 3.1.4.2.9.2 1.3-.1l.9-.7c.3-.2.4-.6.2-.9l-.9-1.3c-.2-.3-.6-.4-.9-.2l-.4.3c-.5-.3-1-.8-1.3-1.3l.3-.4c.2-.3.1-.7-.2-.9l-1.3-.9c-.3-.2-.7-.1-.9.2l-.4.7z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function FlatEmailIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="envelopeBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="letterBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f8fafc" />
        </linearGradient>
      </defs>
      {/* Letter protruding with Black Outline */}
      <rect x="11" y="8" width="26" height="18" rx="2" fill="url(#letterBg)" stroke="#000000" strokeWidth="2" />
      <rect x="15" y="12" width="18" height="2" rx="1" fill="#6366f1" />
      <rect x="15" y="16" width="14" height="2" rx="1" fill="#94a3b8" />

      {/* Envelope Body with Solid Black Boundary Outline */}
      <rect x="6" y="16" width="36" height="24" rx="4" fill="url(#envelopeBg)" stroke="#000000" strokeWidth="2.5" />

      {/* Envelope Flap with Black Outline */}
      <path
        d="M6 18l18 13 18-13"
        stroke="#000000"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 18l18 13 18-13"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Floating Sparkle / Stamp with Black Outline */}
      <circle cx="34" cy="27" r="4" fill="#ef4444" stroke="#000000" strokeWidth="1.5" />
      <path d="M33 26l1 1 2-2" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export function FlatUpiIcon({ size = 32, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="cardGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <radialGradient id="coinGrad" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="100%" stopColor="#eab308" />
        </radialGradient>
      </defs>

      {/* Credit / Debit Card with Solid Black Boundary Outline */}
      <rect x="6" y="11" width="34" height="22" rx="4" fill="url(#cardGrad2)" stroke="#000000" strokeWidth="2.5" />

      {/* Card Magnetic Stripe */}
      <rect x="6" y="16" width="34" height="5" fill="#047857" stroke="#000000" strokeWidth="1" />

      {/* Smart Chip with Black Outline */}
      <rect x="11" y="24" width="6" height="5" rx="1.5" fill="#fde047" stroke="#000000" strokeWidth="1" />

      {/* Front Gold Coin with Solid Black Boundary Outline */}
      <circle cx="32" cy="28" r="9" fill="url(#coinGrad)" stroke="#000000" strokeWidth="2" />
      <circle cx="32" cy="28" r="6.5" stroke="#fef08a" strokeWidth="1" strokeDasharray="2 2" fill="none" />

      {/* Rupee / Currency Mark */}
      <path
        d="M30 25h4M30 27h3.5M31 29c1 1 2 3 3 3"
        stroke="#713f12"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function FlatQrStudioIcon({ size = 36, className, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="qrIconBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#696cff" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="url(#qrIconBg)" stroke="#000000" strokeWidth="2.5" />
      {/* QR Corner Eyes */}
      <rect x="10" y="10" width="10" height="10" rx="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
      <rect x="12" y="12" width="6" height="6" rx="1.5" fill="#696cff" />
      <rect x="28" y="10" width="10" height="10" rx="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
      <rect x="30" y="12" width="6" height="6" rx="1.5" fill="#696cff" />
      <rect x="10" y="28" width="10" height="10" rx="3" fill="#ffffff" stroke="#000000" strokeWidth="1" />
      <rect x="12" y="30" width="6" height="6" rx="1.5" fill="#696cff" />
      {/* Data Modules */}
      <rect x="24" y="24" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="30" y="24" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="24" y="30" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="34" y="30" width="4" height="4" rx="1" fill="#ffffff" />
      <rect x="30" y="34" width="4" height="4" rx="1" fill="#ffffff" />
      {/* Glowing Scan Ray */}
      <line x1="8" y1="24" x2="40" y2="24" stroke="#00f2fe" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}
