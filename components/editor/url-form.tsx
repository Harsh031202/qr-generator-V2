"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe } from "lucide-react";
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

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label required hint="http:// or https://">
          Website URL
        </Label>
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
          autoFocus
        />
        {showError ? (
          <p className="mt-1.5 text-xs text-status-danger" role="alert">
            {validation.error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
