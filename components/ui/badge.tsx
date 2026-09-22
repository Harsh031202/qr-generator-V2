import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "outline" | "subtle";
  dot?: boolean;
}

export function Badge({
  className,
  variant = "default",
  dot = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-surface-active text-foreground border border-border-default",
    subtle: "bg-surface text-foreground-secondary border border-border-subtle",
    success:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20",
    warning:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20",
    danger:
      "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20",
    outline: "bg-transparent text-foreground-secondary border border-border-subtle",
  };

  const dotVariants = {
    default: "bg-foreground-muted",
    subtle: "bg-foreground-faint",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    outline: "bg-foreground-muted",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full select-none tracking-tight",
        variants[variant],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", dotVariants[variant])}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
