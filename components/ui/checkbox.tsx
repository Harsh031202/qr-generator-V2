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
    <div
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "flex items-start gap-3 select-none p-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800/80 shadow-[2px_2px_0px_#000] hover:bg-slate-50 dark:hover:bg-slate-800 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
    >
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
          className={cn(
            "h-5 w-5 rounded-lg border-2 border-black dark:border-zinc-600 transition-all flex items-center justify-center shadow-[1px_1px_0px_#000]",
            checked
              ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black border-black dark:border-black font-black"
              : "bg-slate-100 dark:bg-slate-900"
          )}
        >
          {checked && <Check className="h-3.5 w-3.5 stroke-[3.5]" />}
        </div>
      </div>

      {label ? (
        <div className="flex flex-col text-xs">
          <label
            htmlFor={inputId}
            className={cn(
              "font-black text-black dark:text-white cursor-pointer leading-tight",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
          {description ? (
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mt-0.5">
              {description}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
