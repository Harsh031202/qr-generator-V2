import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | boolean;
  mono?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, mono = false, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full px-3 py-2 text-sm rounded-md bg-surface text-foreground border transition-colors resize-y min-h-[90px]",
          "placeholder:text-foreground-faint",
          "focus:outline-none focus:border-border-focus focus:ring-1 focus:ring-accent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-status-danger focus:border-status-danger focus:ring-status-danger"
            : "border-border-default hover:border-border-hover",
          mono && "font-mono text-xs leading-relaxed",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
