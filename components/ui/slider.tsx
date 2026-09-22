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
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  onChange,
  unit = "",
  label,
  className,
  disabled,
  ...props
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={cn("w-full flex flex-col gap-1.5 select-none", className)}>
      {label ? (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-foreground">{label}</span>
          <span className="font-mono text-foreground-secondary text-[11px]">
            {value}
            {unit}
          </span>
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
            "w-full h-1.5 rounded-full appearance-none bg-canvas-subtle border border-border-subtle cursor-pointer focus:outline-none",
            "accent-accent-primary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          style={{
            background: `linear-gradient(to right, var(--accent-primary) 0%, var(--accent-primary) ${percentage}%, var(--border-default) ${percentage}%, var(--border-default) 100%)`,
          }}
          {...props}
        />
      </div>
    </div>
  );
}
