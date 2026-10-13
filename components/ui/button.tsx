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
      "inline-flex items-center justify-center font-semibold transition-all duration-200 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-lg active:scale-[0.98]";

    const variants = {
      primary:
        "bg-[#696cff] text-white hover:bg-[#5f61e6] active:bg-[#5659e0] shadow-md shadow-[#696cff]/25 hover:shadow-lg hover:shadow-[#696cff]/35",
      secondary:
        "bg-surface text-[#566a7f] dark:text-[#cfd3ec] hover:bg-canvas hover:text-[#696cff] active:bg-canvas-subtle border border-border-default shadow-sm",
      outline:
        "bg-transparent text-[#696cff] hover:bg-[#696cff] hover:text-white border border-[#696cff] active:bg-[#5f61e6]",
      ghost:
        "bg-transparent text-[#566a7f] dark:text-[#cfd3ec] hover:text-[#696cff] hover:bg-[#e7e7ff]/50 dark:hover:bg-[#696cff]/15",
      danger:
        "bg-[#ff3e1d] text-white hover:bg-[#e6381a] shadow-md shadow-[#ff3e1d]/25",
      success:
        "bg-[#71dd37] text-white hover:bg-[#64c431] shadow-md shadow-[#71dd37]/25",
      info:
        "bg-[#03c3ec] text-white hover:bg-[#02afd4] shadow-md shadow-[#03c3ec]/25",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-9 px-4 text-xs gap-2",
      lg: "h-11 px-5 text-sm gap-2.5",
      icon: "h-9 w-9 p-0",
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
