"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Mail, Building, Globe } from "lucide-react";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { validateVCard } from "@/lib/validation/qr-validators";

interface VCardFormProps {
  value: QRContentPayloadMap["vcard"];
  onChange: (val: QRContentPayloadMap["vcard"]) => void;
}

export function VCardForm({ value, onChange }: VCardFormProps) {
  const [touchedFields, setTouchedFields] = React.useState<Record<string, boolean>>({});

  const validation = React.useMemo(() => validateVCard(value), [value]);

  const markTouched = (field: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
  };

  const fnError = touchedFields.firstName ? validation.fieldErrors?.firstName : undefined;
  const emailError = touchedFields.email ? validation.fieldErrors?.email : undefined;
  const urlError = touchedFields.url ? validation.fieldErrors?.url : undefined;

  return (
    <div className="flex flex-col gap-3.5">
      {/* Name fields row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label required>First Name</Label>
          <Input
            value={value.firstName}
            onChange={(e) => {
              markTouched("firstName");
              onChange({ ...value, firstName: e.target.value });
            }}
            onBlur={() => markTouched("firstName")}
            placeholder="Jane"
            startAdornment={<User className="h-4 w-4" />}
            error={fnError}
          />
          {fnError ? (
            <p className="mt-1 text-xs text-status-danger" role="alert">
              {fnError}
            </p>
          ) : null}
        </div>

        <div>
          <Label hint="Optional">Last Name</Label>
          <Input
            value={value.lastName || ""}
            onChange={(e) => onChange({ ...value, lastName: e.target.value })}
            placeholder="Doe"
          />
        </div>
      </div>

      {/* Contact info row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label hint="Mobile / Work">Phone Number</Label>
          <Input
            type="tel"
            value={value.phone || ""}
            onChange={(e) => onChange({ ...value, phone: e.target.value })}
            placeholder="+1 555-0199"
            startAdornment={<Phone className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label hint="Personal / Work">Email Address</Label>
          <Input
            type="email"
            value={value.email || ""}
            onChange={(e) => {
              markTouched("email");
              onChange({ ...value, email: e.target.value });
            }}
            onBlur={() => markTouched("email")}
            placeholder="jane@example.com"
            startAdornment={<Mail className="h-4 w-4" />}
            error={emailError}
          />
          {emailError ? (
            <p className="mt-1 text-xs text-status-danger" role="alert">
              {emailError}
            </p>
          ) : null}
        </div>
      </div>

      {/* Organization and Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <Label hint="Company / Team">Organization</Label>
          <Input
            value={value.organization || ""}
            onChange={(e) => onChange({ ...value, organization: e.target.value })}
            placeholder="Acme Corp"
            startAdornment={<Building className="h-4 w-4" />}
          />
        </div>

        <div>
          <Label hint="Position">Job Title</Label>
          <Input
            value={value.title || ""}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="Lead Engineer"
          />
        </div>
      </div>

      {/* Website */}
      <div>
        <Label hint="Portfolio / Profile">Website</Label>
        <Input
          value={value.url || ""}
          onChange={(e) => {
            markTouched("url");
            onChange({ ...value, url: e.target.value });
          }}
          onBlur={() => markTouched("url")}
          placeholder="https://example.com"
          mono
          startAdornment={<Globe className="h-4 w-4" />}
          error={urlError}
        />
        {urlError ? (
          <p className="mt-1 text-xs text-status-danger" role="alert">
            {urlError}
          </p>
        ) : null}
      </div>
    </div>
  );
}
