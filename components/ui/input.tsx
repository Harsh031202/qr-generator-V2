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
          <div className="absolute left-3.5 flex items-center pointer-events-none text-black dark:text-zinc-300 font-bold select-none z-10">
            {startAdornment}
          </div>
        ) : null}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-11 px-3.5 py-2.5 text-sm font-bold rounded-xl",
            "bg-slate-50 dark:bg-slate-800/90 text-black dark:text-white",
            "border-2 border-black dark:border-zinc-700",
            "shadow-[2px_2px_0px_#000] focus:shadow-[3.5px_3.5px_0px_#000] active:shadow-[1px_1px_0px_#000]",
            "transition-all duration-150",
            "placeholder:text-slate-400 dark:placeholder:text-zinc-500 placeholder:font-medium",
            "focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-black dark:focus:border-[#c084fc]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-[#ff3e1d] bg-red-50/60 dark:bg-red-950/20 focus:border-[#ff3e1d]"
              : "",
            startAdornment ? "pl-10" : "",
            endAdornment ? "pr-10" : "",
            mono && "font-mono text-xs font-bold",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-3.5 flex items-center text-black dark:text-zinc-300 font-bold select-none z-10">
            {endAdornment}
          </div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
