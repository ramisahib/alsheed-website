import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
}

export function AlSheedLogoIcon({ className = "w-11 h-11 drop-shadow" }: LogoProps) {
  return (
    <svg viewBox="0 0 100 100" className={className}>
      <polygon points="48,5 95,92 18,92" fill="#DC2626" />
      <polygon points="45,18 78,85 10,85" fill="#2563EB" stroke="#fff" strokeWidth="2.5" />
      <path
        d="M33 48v32M40 80V55M47 38v42M55 38v42M63 70h-8M63 55v25"
        fill="none"
        stroke="#fff"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlSheedLogo({
  subtitle = "للاستثمار والتطوير العقاري",
  title = "شركة الشيد",
  isEnglish = false,
}: {
  subtitle?: string;
  title?: string;
  isEnglish?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 shrink-0 group">
      <AlSheedLogoIcon className="w-11 h-11 drop-shadow group-hover:scale-105 transition-transform" />
      <div className="leading-tight">
        <div className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
          {isEnglish ? "Al-Sheed Real Estate" : title}
        </div>
        <div className="text-[10px] font-bold text-[#DC2626] tracking-wide">
          {isEnglish ? "Investment & Development" : subtitle}
        </div>
      </div>
    </div>
  );
}
