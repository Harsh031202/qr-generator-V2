"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Wifi, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateWifi } from "@/lib/validation/qr-validators";

interface WifiFormProps {
  value: QRContentPayloadMap["wifi"];
  onChange: (val: QRContentPayloadMap["wifi"]) => void;
}

const SECURITY_OPTIONS = [
  { value: "WPA" as const, label: "WPA / WPA2" },
  { value: "WEP" as const, label: "WEP" },
  { value: "nopass" as const, label: "None (Open)" },
];

export function WifiForm({ value, onChange }: WifiFormProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  const validation = React.useMemo(() => validateWifi(value), [value]);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const ssidError = touchedFields.ssid ? validation.fieldErrors?.ssid : undefined;
  const passError = touchedFields.password ? validation.fieldErrors?.password : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* Network Name */}
      <div>
        <Label required hint="Max 32 characters">
          Network Name (SSID)
        </Label>
        <Input
          value={value.ssid}
          onChange={(e) => {
            markTouched("ssid");
            onChange({ ...value, ssid: e.target.value });
          }}
          onBlur={() => markTouched("ssid")}
          placeholder="e.g. Studio_5G"
          startAdornment={<Wifi className="h-4 w-4" />}
          error={ssidError}
          autoFocus
        />
        {ssidError ? (
          <div
            className="mt-2.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>{ssidError}</span>
          </div>
        ) : null}
      </div>

      {/* Security Type */}
      <div>
        <Label hint="Encryption protocol">Security Mode</Label>
        <SegmentedControl
          options={SECURITY_OPTIONS}
          value={value.security}
          onChange={(sec) => {
            onChange({
              ...value,
              security: sec,
              password: sec === "nopass" ? "" : value.password,
            });
          }}
          size="sm"
          fullWidth
        />
      </div>

      {/* Password (if not open) */}
      {value.security !== "nopass" && (
        <div>
          <Label required hint={value.security === "WPA" ? "8 - 63 characters" : "WEP key"}>
            Network Password
          </Label>
          <Input
            type={showPassword ? "text" : "password"}
            value={value.password || ""}
            onChange={(e) => {
              markTouched("password");
              onChange({ ...value, password: e.target.value });
            }}
            onBlur={() => markTouched("password")}
            placeholder="Enter Wi-Fi password"
            startAdornment={<Lock className="h-4 w-4" />}
            error={passError}
            endAdornment={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 rounded-lg border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white shadow-[1px_1px_0px_#000] hover:bg-slate-100 dark:hover:bg-slate-700 active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all flex items-center justify-center cursor-pointer"
                title={showPassword ? "Hide password" : "Show password"}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : (
                  <Eye className="h-3.5 w-3.5 stroke-[2.5]" />
                )}
              </button>
            }
          />
          {passError ? (
            <div
              className="mt-2.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span>{passError}</span>
            </div>
          ) : null}
        </div>
      )}

      {/* Hidden Network Checkbox */}
      <div className="pt-1">
        <Checkbox
          checked={Boolean(value.hidden)}
          onCheckedChange={(checked) => onChange({ ...value, hidden: checked })}
          label="Hidden Network"
          description="Check this if this network does not broadcast its SSID."
        />
      </div>
    </div>
  );
}
