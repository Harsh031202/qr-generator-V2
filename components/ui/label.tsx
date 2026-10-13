import * as React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  hint?: string;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, hint, children, ...props }, ref) => {
    return (
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <label
          ref={ref}
          className={cn(
            "text-xs font-black tracking-tight text-black dark:text-white select-none flex items-center gap-1.5",
            className
          )}
          {...props}
        >
          {children}
          {required ? (
            <span className="text-[#ff3e1d] font-black text-sm leading-none" aria-hidden="true" title="Required field">
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 font-mono">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Label.displayName = "Label";
