import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
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
      "inline-flex items-center justify-center font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none rounded-md";

    const variants = {
      primary:
        "bg-accent text-accent-foreground hover:bg-accent-hover active:opacity-90 shadow-subtle",
      secondary:
        "bg-surface text-foreground hover:bg-surface-hover active:bg-surface-active border border-border-default shadow-subtle",
      outline:
        "bg-transparent text-foreground hover:bg-surface-hover border border-border-default active:bg-surface-active",
      ghost:
        "bg-transparent text-foreground-secondary hover:text-foreground hover:bg-surface-hover active:bg-surface-active",
      danger:
        "bg-status-danger text-white hover:opacity-95 active:opacity-90 shadow-subtle",
    };

    const sizes = {
      sm: "h-8 px-2.5 text-xs gap-1.5",
      md: "h-9 px-3.5 text-sm gap-2",
      lg: "h-10 px-4 text-sm gap-2.5",
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
