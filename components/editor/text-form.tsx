"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
          <Label required className="mb-0">
            Plain Text Content
          </Label>
          <span className="font-mono text-[11px] text-foreground-muted">
            {value.text.length} chars
          </span>
        </div>

        <Textarea
          value={value.text}
          onChange={(e) => {
            setTouched(true);
            onChange({ text: e.target.value });
          }}
          onBlur={() => setTouched(true)}
          placeholder="Enter any text, notes, or instructions..."
          className="min-h-[120px]"
          error={showError ? validation.error : undefined}
        />

        {showError ? (
          <p className="mt-1.5 text-xs text-status-danger" role="alert">
            {validation.error}
          </p>
        ) : isDense ? (
          <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
            This QR contains a lot of data and may be harder to scan at smaller sizes.
          </p>
        ) : (
          <p className="mt-1.5 text-[11px] text-foreground-muted">
            Supports Unicode, multi-line text, and special symbols.
          </p>
        )}
      </div>
    </div>
  );
}
