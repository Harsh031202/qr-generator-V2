"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
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
    <div className="flex flex-col gap-3.5">
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
          <p className="mt-1.5 text-xs text-status-danger" role="alert">
            {validation.error}
          </p>
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
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
}
