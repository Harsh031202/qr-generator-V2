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
      <div className="flex items-center justify-between mb-1.5">
        <label
          ref={ref}
          className={cn(
            "text-xs font-medium text-foreground select-none flex items-center gap-1",
            className
          )}
          {...props}
        >
          {children}
          {required ? (
            <span className="text-status-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
        {hint ? (
          <span className="text-[11px] text-foreground-muted font-normal">
            {hint}
          </span>
        ) : null}
      </div>
    );
  }
);

Label.displayName = "Label";
