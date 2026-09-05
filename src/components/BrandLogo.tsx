import React from 'react';

interface BrandLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = false,
  className = ''
}) => {
  const pixelSizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 80
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Radar Pulse Vector Emblem */}
      <div 
        className="relative shrink-0 flex items-center justify-center rounded-full p-0.5 shadow-lg shadow-cyan-950/40"
        style={{ width: pixelSizes, height: pixelSizes }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Metallic Gunmetal Rim Gradient */}
            <radialGradient id="metalRim" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="45%" stopColor="#1e293b" />
              <stop offset="85%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Inner Metallic Disc */}
            <radialGradient id="innerDisc" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="70%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </radialGradient>

            {/* Neon Cyan Glow Filter */}
            <filter id="cyanGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#00f0ff" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#0284c7" floodOpacity="0.5" />
            </filter>

            {/* Neon Emerald Glow Filter */}
            <filter id="greenGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#10b981" floodOpacity="0.8" />
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#059669" floodOpacity="0.5" />
            </filter>

            {/* Metallic Text Gradient */}
            <linearGradient id="metalText" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="40%" stopColor="#cbd5e1" />
              <stop offset="60%" stopColor="#94a3b8" />
              <stop offset="100%" stopColor="#475569" />
            </linearGradient>
          </defs>

          {/* Outer Beveled Metallic Ring */}
          <circle cx="50" cy="50" r="46" fill="url(#metalRim)" stroke="#64748b" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="44" stroke="#020617" strokeWidth="1" />

          {/* Inner Radar Background */}
          <circle cx="50" cy="50" r="42" fill="url(#innerDisc)" />

          {/* Concentric Radar Grid Rings */}
          <circle cx="50" cy="50" r="34" stroke="#334155" strokeWidth="1" opacity="0.7" />
          <circle cx="50" cy="50" r="23" stroke="#334155" strokeWidth="1" opacity="0.7" />
          <circle cx="50" cy="50" r="12" stroke="#334155" strokeWidth="1" opacity="0.7" />

          {/* Radar Reticle Crosshair Lines */}
          <line x1="50" y1="8" x2="50" y2="92" stroke="#334155" strokeWidth="1.5" />
          <line x1="8" y1="50" x2="92" y2="50" stroke="#334155" strokeWidth="1.5" />

          {/* Bottom Reticle Notch Marker */}
          <path d="M47 92 H53 V96 H47 Z" fill="#475569" />

          {/* Glowing Green Radar Sweep Arc (Top Right Sector) */}
          <path
            d="M 50 8 A 42 42 0 0 1 92 50"
            fill="none"
            stroke="#10b981"
            strokeWidth="3.2"
            strokeLinecap="round"
            filter="url(#greenGlow)"
          />

          {/* Radar Sweep Line to ~1:30 position */}
          <line
            x1="50"
            y1="50"
            x2="80"
            y2="20"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeLinecap="round"
            filter="url(#greenGlow)"
          />

          {/* Center Radar Pivot Dot */}
          <circle cx="50" cy="50" r="4.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" filter="url(#cyanGlow)" />

          {/* Glowing Cyan Pulse Waveform (ECG / Radar Heartbeat) */}
          <path
            d="M 8 50 L 32 50 L 39 30 L 49 70 L 59 40 L 67 50 L 92 50"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#cyanGlow)"
          />
        </svg>
      </div>

      {/* Optional Matching Metallic "MONITORING" Brand Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <span 
            className="font-black tracking-wide text-sm sm:text-base leading-none select-none drop-shadow-md flex items-baseline gap-1"
            style={{
              background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 45%, #94a3b8 70%, #64748b 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)'
            }}
          >
            <span>Monitoring</span>
            <span className="text-[10px] sm:text-[11px] font-medium lowercase tracking-normal text-slate-400">by rmvn</span>
          </span>
          <span className="text-[10px] tracking-widest text-cyan-400/80 font-mono font-bold uppercase mt-0.5">
            CCTV System
          </span>
        </div>
      )}
    </div>
  );
};
