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
          <div className="absolute left-2.5 flex items-center pointer-events-none text-foreground-muted select-none">
            {startAdornment}
          </div>
        ) : null}
        <input
          ref={ref}
          type={type}
          className={cn(
            "w-full h-9 px-3 py-1.5 text-sm rounded-md bg-surface text-foreground border transition-colors",
            "placeholder:text-foreground-faint",
            "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-accent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            error
              ? "border-status-danger focus:border-status-danger focus:ring-status-danger"
              : "border-border-default hover:border-border-hover",
            startAdornment ? "pl-9" : "",
            endAdornment ? "pr-9" : "",
            mono && "font-mono text-xs",
            className
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute right-2.5 flex items-center text-foreground-muted select-none">
            {endAdornment}
          </div>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
