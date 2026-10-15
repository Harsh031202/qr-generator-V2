"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, AlertCircle } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateUrl } from "@/lib/validation/qr-validators";

interface UrlFormProps {
  value: QRContentPayloadMap["url"];
  onChange: (val: QRContentPayloadMap["url"]) => void;
}

export function UrlForm({ value, onChange }: UrlFormProps) {
  const [touched, setTouched] = React.useState(false);
  const validation = React.useMemo(() => validateUrl(value.url), [value.url]);
  const showError = touched && !validation.isValid && Boolean(validation.error);

  const applyPrefix = (prefix: string) => {
    let current = value.url.trim();
    if (!current) {
      onChange({ url: prefix });
      return;
    }
    // Remove existing http/https prefix if present
    current = current.replace(/^https?:\/\//i, "");
    onChange({ url: `${prefix}${current}` });
    setTouched(true);
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label required hint="http:// or https://">
            Website URL
          </Label>
        </div>

        <Input
          value={value.url}
          onChange={(e) => {
            setTouched(true);
            onChange({ url: e.target.value });
          }}
          onBlur={() => setTouched(true)}
          placeholder="https://example.com"
          mono
          error={showError ? validation.error : undefined}
          startAdornment={<Globe className="h-4 w-4" />}
        />

        {/* Quick Protocol Selector Pills */}
        <div className="flex items-center gap-1.5 mt-2.5">
          <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 mr-1 select-none">
            Prefix:
          </span>
          {["https://", "http://"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => applyPrefix(p)}
              className="px-2.5 py-1 text-[11px] font-mono font-bold rounded-lg border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white shadow-[1.5px_1.5px_0px_#000] hover:bg-[#ffde59] dark:hover:bg-[#c084fc] hover:text-black dark:hover:text-black active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              {p}
            </button>
          ))}
        </div>

        {showError ? (
          <div
            className="mt-3 px-3 py-2 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>{validation.error}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
