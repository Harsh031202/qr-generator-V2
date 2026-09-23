import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  description,
  disabled,
  className,
  id,
  ...props
}: CheckboxProps) {
  const generatedId = React.useId();
  const inputId = id || generatedId;

  return (
    <div className={cn("flex items-start gap-2.5 select-none", className)}>
      <div className="relative flex items-center justify-center pt-0.5">
        <input
          id={inputId}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          className="peer sr-only"
          {...props}
        />
        <div
          onClick={() => !disabled && onCheckedChange(!checked)}
          className={cn(
            "h-4 w-4 rounded border transition-colors flex items-center justify-center cursor-pointer",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-1",
            checked
              ? "bg-accent text-accent-foreground border-accent"
              : "bg-surface border-border-default hover:border-border-hover",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {checked && <Check className="h-3 w-3 stroke-[2.5]" />}
        </div>
      </div>

      {label ? (
        <div className="flex flex-col text-xs">
          <label
            htmlFor={inputId}
            className={cn(
              "font-medium text-foreground cursor-pointer leading-tight",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
          {description ? (
            <span className="text-[11px] text-foreground-muted mt-0.5">
              {description}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
