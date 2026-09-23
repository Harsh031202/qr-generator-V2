"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Upload, X, AlertTriangle, Image as ImageIcon } from "lucide-react";
import type { QRLogoConfig } from "@/types/qr";

interface LogoUploadProps {
  logo?: QRLogoConfig;
  onChange: (logo?: QRLogoConfig) => void;
  errorCorrection: string;
}

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

export function LogoUpload({ logo, onChange, errorCorrection }: LogoUploadProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Please select a PNG, JPEG, WebP, or SVG image.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError("File exceeds the 2 MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onChange({
          dataUrl,
          filename: file.name,
          sizePercent: logo?.sizePercent || 20,
          hasPadding: logo?.hasPadding ?? true,
          paddingSize: 1,
        });
      }
    };
    reader.onerror = () => {
      setError("Failed to read the selected file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const isLargeLogo = (logo?.sizePercent || 20) > 22;
  const showEccRecommendation = Boolean(logo) && (errorCorrection === "L" || errorCorrection === "M");

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <Label hint="PNG, JPEG, WebP, SVG (max 2 MB)">Logo in Center</Label>
        {logo && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            className="text-xs text-status-danger hover:underline inline-flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Remove logo
          </button>
        )}
      </div>

      {!logo ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-4 border border-dashed rounded-lg cursor-pointer transition-colors ${
            dragActive
              ? "border-accent bg-surface-active"
              : "border-border-default hover:border-border-hover bg-canvas-subtle"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.webp,.svg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                processFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            <Upload className="h-3.5 w-3.5 text-foreground-muted" />
            <span>Upload or drag & drop a logo</span>
          </div>
          <span className="text-[11px] text-foreground-muted mt-0.5">
            Will be embedded in the center of the QR code
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-3 rounded-lg border border-border-subtle bg-canvas-subtle">
          {/* Logo Thumbnail Row */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded border border-border-subtle bg-surface p-1 flex items-center justify-center shrink-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo.dataUrl}
                alt={logo.filename}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-medium text-foreground truncate">
                {logo.filename}
              </span>
              <span className="text-[11px] text-foreground-muted">
                {logo.sizePercent}% of QR size
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs h-7 px-2"
            >
              Replace
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.svg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>

          {/* Size slider */}
          <div className="pt-1">
            <Slider
              label="Logo Size"
              value={logo.sizePercent}
              min={10}
              max={28}
              step={1}
              unit="%"
              onChange={(val) => onChange({ ...logo, sizePercent: val })}
            />
          </div>

          {/* Padding checkbox */}
          <div className="pt-1">
            <Checkbox
              checked={logo.hasPadding}
              onCheckedChange={(checked) => onChange({ ...logo, hasPadding: checked })}
              label="Logo Clearance Padding"
              description="Adds background whitespace separation between the logo and QR modules."
            />
          </div>

          {/* Warnings */}
          {isLargeLogo && (
            <div className="p-2 rounded border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="text-[11px]">
                A large logo may interfere with scanning on older devices.
              </span>
            </div>
          )}

          {showEccRecommendation && (
            <div className="text-[11px] text-foreground-muted bg-surface/50 p-2 rounded border border-border-subtle">
              💡 Tip: Consider using higher error correction (Q or H) to ensure the QR code remains readable with a logo.
            </div>
          )}
        </div>
      )}

      {error ? (
        <p className="text-xs text-status-danger mt-0.5" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
