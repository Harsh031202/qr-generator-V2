"use client";

import * as React from "react";
import { CheckCircle2, AlertTriangle, ShieldCheck, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

interface QRContrastGaugeProps {
  contrastRatio: number;
  fgColor: string;
  bgColor: string;
  onApplyTheme: (fg: string, bg: string) => void;
}

const COLOR_PRESETS = [
  { name: "Sneat Purple", fg: "#696cff", bg: "#ffffff" },
  { name: "Monochrome Dark", fg: "#1e293b", bg: "#ffffff" },
  { name: "Emerald Green", fg: "#059669", bg: "#ffffff" },
  { name: "Ocean Cyan", fg: "#0284c7", bg: "#ffffff" },
  { name: "Amber Gold", fg: "#b45309", bg: "#ffffff" },
  { name: "Inverted Dark", fg: "#ffffff", bg: "#232333" },
];

export function QRContrastGauge({
  contrastRatio,
  fgColor,
  bgColor,
  onApplyTheme,
}: QRContrastGaugeProps) {
  // Clamp ratio between 1 and 21 for gauge calculation
  const clampedRatio = Math.min(Math.max(contrastRatio, 1), 21);
  const percentage = Math.round(((clampedRatio - 1) / 20) * 100);

  const isOptimal = contrastRatio >= 4.5;
  const isFair = contrastRatio >= 3.0 && contrastRatio < 4.5;

  const strokeColor = isOptimal
    ? "#71dd37"
    : isFair
    ? "#ffab00"
    : "#ff3e1d";

  return (
    <div className="rounded-xl border border-border-subtle bg-canvas/40 p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="h-4 w-4 text-[#696cff]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#566a7f] dark:text-white">
            Camera Readability & Contrast
          </span>
        </div>
        <span
          className={cn(
            "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
            isOptimal
              ? "bg-[#e8fadf] text-[#71dd37] dark:bg-[#71dd37]/20"
              : isFair
              ? "bg-[#fff2d6] text-[#ffab00] dark:bg-[#ffab00]/20"
              : "bg-[#ffe0db] text-[#ff3e1d] dark:bg-[#ff3e1d]/20"
          )}
        >
          {isOptimal ? "Optimal" : isFair ? "Fair" : "Low Contrast"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Radial Circular Gauge (inspired by Sneat growth gauge) */}
        <div className="sm:col-span-5 flex flex-col items-center justify-center">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              {/* Background Track */}
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke="var(--border-subtle)"
                strokeWidth="8"
                strokeDasharray="3 5"
              />
              {/* Animated Progress Arc */}
              <circle
                cx="60"
                cy="60"
                r="46"
                fill="none"
                stroke={strokeColor}
                strokeWidth="8"
                strokeDasharray="289"
                strokeDashoffset={289 - (289 * percentage) / 100}
                strokeLinecap="round"
                className="transition-all duration-700 ease-out"
              />
            </svg>

            {/* Center Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-lg font-extrabold tracking-tight text-[#566a7f] dark:text-white">
                {contrastRatio.toFixed(1)}:1
              </span>
              <span className="text-[10px] font-bold text-[#8592a3] uppercase tracking-wider">
                Ratio
              </span>
            </div>
          </div>

          <p className="mt-1 text-[11px] text-[#697a8d] dark:text-[#a3a8c8] font-medium text-center">
            {isOptimal
              ? "100% Camera Scannable"
              : isFair
              ? "Readable in Good Light"
              : "May Fail on Cameras"}
          </p>
        </div>

        {/* Color Palette Presets (Right) */}
        <div className="sm:col-span-7 flex flex-col justify-center space-y-2">
          <label className="text-[11px] font-semibold text-[#8592a3]">
            Curated Color Palettes
          </label>
          <div className="grid grid-cols-2 gap-2">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onApplyTheme(preset.fg, preset.bg)}
                className="flex items-center gap-2 p-1.5 rounded-lg border border-border-subtle bg-surface hover:bg-canvas hover:border-[#696cff] transition-all text-left text-xs group"
              >
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-subtle overflow-hidden">
                  <span
                    className="h-full w-1/2"
                    style={{ backgroundColor: preset.fg }}
                  />
                  <span
                    className="h-full w-1/2"
                    style={{ backgroundColor: preset.bg }}
                  />
                </div>
                <span className="text-[11px] font-medium text-[#566a7f] dark:text-[#cfd3ec] truncate group-hover:text-[#696cff]">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
