"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateEmail } from "@/lib/validation/qr-validators";

interface EmailFormProps {
  value: QRContentPayloadMap["email"];
  onChange: (val: QRContentPayloadMap["email"]) => void;
}

export function EmailForm({ value, onChange }: EmailFormProps) {
  const [touched, setTouched] = React.useState(false);
  const validation = React.useMemo(() => validateEmail(value.to), [value.to]);
  const showError = touched && !validation.isValid && Boolean(validation.error);

  return (
    <div className="flex flex-col gap-4">
      {/* Recipient */}
      <div>
        <Label required hint="Recipient address">
          Send To
        </Label>
        <Input
          type="email"
          value={value.to}
          onChange={(e) => {
            setTouched(true);
            onChange({ ...value, to: e.target.value });
          }}
          onBlur={() => setTouched(true)}
          placeholder="hello@example.com"
          startAdornment={<Mail className="h-4 w-4" />}
          error={showError ? validation.error : undefined}
        />
        {showError ? (
          <div
            className="mt-2.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>{validation.error}</span>
          </div>
        ) : null}
      </div>

      {/* Subject */}
      <div>
        <Label hint="Optional">Email Subject</Label>
        <Input
          value={value.subject || ""}
          onChange={(e) => onChange({ ...value, subject: e.target.value })}
          placeholder="Inquiry / Feedback"
        />
      </div>

      {/* Message Body */}
      <div>
        <Label hint="Optional pre-filled message">Message Body</Label>
        <Textarea
          value={value.body || ""}
          onChange={(e) => onChange({ ...value, body: e.target.value })}
          placeholder="Type your default message here..."
          className="min-h-[110px]"
        />
      </div>
    </div>
  );
}
