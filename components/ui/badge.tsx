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
    default: "bg-[#ffde59] text-black border-2 border-black dark:bg-[#c084fc] dark:text-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    primary: "bg-[#2563eb] text-white border-2 border-black dark:bg-[#c084fc] dark:text-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    success: "bg-[#05df72] text-black border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    warning: "bg-[#ffde59] text-black border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    danger: "bg-[#ff3e1d] text-white border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    info: "bg-[#38bdf8] text-black border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    subtle: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
    outline: "bg-white dark:bg-slate-900 text-black dark:text-white border-2 border-black dark:border-zinc-700 shadow-[1.5px_1.5px_0px_#000]",
  };

  const dotVariants = {
    default: "bg-black",
    primary: "bg-white dark:bg-black",
    success: "bg-black",
    warning: "bg-black",
    danger: "bg-white",
    info: "bg-black",
    subtle: "bg-black dark:bg-white",
    outline: "bg-black dark:bg-white",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-black rounded-lg select-none tracking-tight transition-all",
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
