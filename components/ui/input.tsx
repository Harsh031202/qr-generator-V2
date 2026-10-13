"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  mono?: boolean;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      error,
      mono = false,
      startAdornment,
      endAdornment,
      type = "text",
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative flex items-center w-full">
        {startAdornment ? (
          <div className="absolute left-3 flex items-center pointer-events-none text-[#8592a3] select-none">
            {startAdornment}
          </div>
        ) : null}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-10 px-3.5 py-2 text-sm rounded-lg bg-surface text-[#566a7f] dark:text-[#cfd3ec] border transition-all duration-200",
            "placeholder:text-[#a1acb8]",
            "focus:outline-none focus:border-[#696cff] focus:ring-4 focus:ring-[#696cff]/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[#ff3e1d] focus:border-[#ff3e1d] focus:ring-4 focus:ring-[#ff3e1d]/15"
              : "border-border-default hover:border-[#b4bdc6]",
            startAdornment ? "pl-9" : "",
            endAdornment ? "pr-9" : "",
            mono && "font-mono text-xs",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-3 flex items-center text-[#8592a3] select-none">
            {endAdornment}
          </div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
