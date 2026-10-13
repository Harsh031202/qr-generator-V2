"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
  label?: string;
  showValue?: boolean;
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  label,
  showValue = false,
  className,
  disabled,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full flex flex-col gap-1.5 select-none", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-black dark:text-white">{label}</span>
          {showValue && (
            <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
              {value}
              {unit}
            </span>
          )}
        </div>
      ) : null}
      <div className="relative flex items-center h-5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full h-2 rounded-full appearance-none bg-slate-200 dark:bg-slate-700 border-2 border-black dark:border-zinc-700 cursor-pointer focus:outline-none accent-black dark:accent-[#c084fc]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            background: `linear-gradient(to right, var(--slider-fill, #ffde59) 0%, var(--slider-fill, #ffde59) ${percentage}%, var(--slider-track, #e2e8f0) ${percentage}%, var(--slider-track, #e2e8f0) 100%)`,
          }}
          {...props}
        />
      </div>
    </div>
  );
}
