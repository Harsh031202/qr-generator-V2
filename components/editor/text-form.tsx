"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, AlertTriangle } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateText, isHighDensityPayload } from "@/lib/validation/qr-validators";

interface TextFormProps {
  value: QRContentPayloadMap["text"];
  onChange: (val: QRContentPayloadMap["text"]) => void;
}

export function TextForm({ value, onChange }: TextFormProps) {
  const [touched, setTouched] = React.useState(false);
  const validation = React.useMemo(() => validateText(value.text), [value.text]);
  const isDense = isHighDensityPayload(value.text.length);
  const showError = touched && !validation.isValid && Boolean(validation.error);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label required className="mb-0" hint="Multi-line supported">
            Plain Text Content
          </Label>
        </div>

        <Textarea
          value={value.text}
          onChange={(e) => {
            setTouched(true);
            onChange({ text: e.target.value });
          }}
          onBlur={() => setTouched(true)}
          placeholder="Enter any text, notes, or instructions..."
          className="min-h-[130px]"
          error={showError ? validation.error : undefined}
          autoFocus
        />

        {showError ? (
          <div
            className="mt-3 px-3 py-2 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>{validation.error}</span>
          </div>
        ) : isDense ? (
          <div className="mt-3 px-3 py-2 rounded-xl border-2 border-black dark:border-amber-700 bg-[#ffde59] dark:bg-amber-950/60 text-black dark:text-amber-200 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>This QR contains a lot of data and may require higher resolution or a closer scan.</span>
          </div>
        ) : (
          <p className="mt-2 text-xs font-bold text-slate-500 dark:text-zinc-400">
            Supports Unicode, multi-line text, emojis, and special symbols.
          </p>
        )}
      </div>
    </div>
  );
}
