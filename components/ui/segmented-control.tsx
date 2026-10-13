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
        "inline-flex items-center p-1 rounded-xl bg-canvas border border-border-subtle select-none gap-1",
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
              "relative flex items-center justify-center gap-1.5 font-semibold transition-all duration-200 rounded-lg focus-visible:z-10",
              size === "sm" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-xs",
              fullWidth && "flex-1",
              isSelected
                ? "bg-[#696cff] text-white shadow-sm shadow-[#696cff]/20 font-bold"
                : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff] hover:bg-surface/70",
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
