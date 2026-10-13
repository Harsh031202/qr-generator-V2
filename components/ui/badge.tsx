"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info" | "subtle" | "outline";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "primary",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20 dark:text-[#a3a6ff]",
    primary: "bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20 dark:text-[#a3a6ff]",
    success: "bg-[#e8fadf] text-[#71dd37] dark:bg-[#71dd37]/20",
    warning: "bg-[#fff2d6] text-[#ffab00] dark:bg-[#ffab00]/20",
    danger: "bg-[#ffe0db] text-[#ff3e1d] dark:bg-[#ff3e1d]/20",
    info: "bg-[#d7f5fc] text-[#03c3ec] dark:bg-[#03c3ec]/20",
    subtle: "bg-canvas text-[#697a8d] dark:text-[#a3a8c8] border border-border-subtle",
    outline: "bg-transparent text-[#696cff] border border-[#696cff]",
  };

  const dotVariants = {
    default: "bg-[#696cff]",
    primary: "bg-[#696cff]",
    success: "bg-[#71dd37]",
    warning: "bg-[#ffab00]",
    danger: "bg-[#ff3e1d]",
    info: "bg-[#03c3ec]",
    subtle: "bg-[#8592a3]",
    outline: "bg-[#696cff]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-semibold rounded-full select-none tracking-tight transition-all",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotVariants[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
