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
          "w-full px-3.5 py-3 text-sm font-bold rounded-xl",
          "bg-slate-50 dark:bg-slate-800/90 text-black dark:text-white",
          "border-2 border-black dark:border-zinc-700",
          "shadow-[2px_2px_0px_#000] focus:shadow-[3.5px_3.5px_0px_#000] active:shadow-[1px_1px_0px_#000]",
          "transition-all duration-150 resize-y min-h-[100px]",
          "placeholder:text-slate-400 dark:placeholder:text-zinc-500 placeholder:font-medium",
          "focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-black dark:focus:border-[#c084fc]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-[#ff3e1d] bg-red-50/60 dark:bg-red-950/20 focus:border-[#ff3e1d]"
            : "",
          mono && "font-mono text-xs font-bold leading-relaxed",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
