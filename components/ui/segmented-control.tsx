"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SegmentOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
  ariaLabel?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  fullWidth = false,
  ariaLabel = "Options",
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center p-1 rounded-xl border-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-slate-800 select-none gap-1",
        fullWidth && "w-full",
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={option.disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 font-bold transition-all duration-150 rounded-lg text-center select-none",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs",
              fullWidth && "flex-1",
              isSelected
                ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black border-2 border-black dark:border-purple-300 shadow-[2px_2px_0px_#000] font-black"
                : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white border-2 border-transparent",
              option.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {option.icon ? (
              <span className="text-current shrink-0">{option.icon}</span>
            ) : null}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
