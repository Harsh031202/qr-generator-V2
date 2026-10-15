"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, User, Tag, AlertCircle } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateUpi } from "@/lib/validation/qr-validators";

interface UpiFormProps {
  value: QRContentPayloadMap["upi"];
  onChange: (val: QRContentPayloadMap["upi"]) => void;
}

export function UpiForm({ value, onChange }: UpiFormProps) {
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  const validation = React.useMemo(() => validateUpi(value), [value]);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const paError = touchedFields.pa ? validation.fieldErrors?.pa : undefined;
  const amError = touchedFields.am ? validation.fieldErrors?.am : undefined;

  return (
    <div className="flex flex-col gap-4">
      {/* UPI ID (VPA) */}
      <div>
        <Label required hint="username@bank">
          UPI ID (Virtual Payment Address)
        </Label>
        <Input
          value={value.pa}
          onChange={(e) => {
            markTouched("pa");
            onChange({ ...value, pa: e.target.value });
          }}
          onBlur={() => markTouched("pa")}
          placeholder="business@okaxis"
          mono
          startAdornment={<CreditCard className="h-4 w-4" />}
          error={paError}
        />
        {paError ? (
          <div
            className="mt-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
            <span>{paError}</span>
          </div>
        ) : null}
      </div>

      {/* Payee Name & Amount */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <Label hint="Optional recipient name">Payee Name</Label>
          <Input
            value={value.pn || ""}
            onChange={(e) => onChange({ ...value, pn: e.target.value })}
            placeholder="Acme Store"
            startAdornment={<User className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label hint="Optional (INR)">Requested Amount</Label>
          <Input
            type="number"
            min="0.01"
            step="0.01"
            value={value.am || ""}
            onChange={(e) => {
              markTouched("am");
              onChange({ ...value, am: e.target.value });
            }}
            onBlur={() => markTouched("am")}
            placeholder="0.00"
            mono
            error={amError}
            startAdornment={<span className="font-sans text-xs font-black">₹</span>}
          />
          {amError ? (
            <div
              className="mt-2 px-3 py-1.5 rounded-xl border-2 border-black dark:border-red-900 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 font-bold text-xs shadow-[2px_2px_0px_#000] flex items-center gap-2"
              role="alert"
            >
              <AlertCircle className="h-4 w-4 shrink-0 stroke-[2.5]" />
              <span>{amError}</span>
            </div>
          ) : null}
        </div>
      </div>

      {/* Transaction Note */}
      <div>
        <Label hint="Optional note or reference">Transaction Note</Label>
        <Input
          value={value.tn || ""}
          onChange={(e) => onChange({ ...value, tn: e.target.value })}
          placeholder="Invoice #1042 / Coffee"
          startAdornment={<Tag className="h-4 w-4" />}
        />
      </div>

      <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 mt-1">
        Generates a standard Unified Payments Interface (UPI) URI. Compatible with Google Pay, PhonePe, Paytm, and banking apps.
      </p>
    </div>
  );
}
