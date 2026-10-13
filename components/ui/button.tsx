"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "info";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold tracking-tight select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-xl border-2 border-black dark:border-zinc-700 transition-all duration-150 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none";

    const variants = {
      primary:
        "bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#c084fc] dark:hover:bg-[#a855f7] text-white dark:text-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]",
      secondary:
        "bg-white dark:bg-slate-800 text-black dark:text-white shadow-[3px_3px_0px_#000] hover:bg-slate-50 dark:hover:bg-slate-700 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]",
      outline:
        "bg-transparent text-black dark:text-white shadow-[2px_2px_0px_#000] hover:bg-black/5 dark:hover:bg-white/5",
      ghost:
        "border-transparent shadow-none hover:border-black dark:hover:border-zinc-700 hover:shadow-[2px_2px_0px_#000] text-black dark:text-white",
      danger:
        "bg-[#ff3e1d] hover:bg-[#e03517] text-white shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]",
      success:
        "bg-[#05df72] hover:bg-[#04c263] text-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]",
      info:
        "bg-[#ffde59] hover:bg-[#fed633] text-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-xs gap-2",
      lg: "h-12 px-5 text-sm gap-2.5",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent mr-1.5" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
