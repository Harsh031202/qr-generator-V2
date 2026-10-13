"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  ScanLine,
  Upload,
  CheckCircle2,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Camera,
  ShieldCheck,
} from "lucide-react";
import { FlatQrStudioIcon } from "@/components/ui/flaticon-icons";
import { cn } from "@/lib/utils";

export function QRScannerView() {
  const [result, setResult] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const processImageFile = (file: File) => {
    setIsScanning(true);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = img.width;
          canvas.height = img.height;
          if (!ctx) {
            setError("Could not initialize canvas context");
            setIsScanning(false);
            return;
          }
          ctx.drawImage(img, 0, 0, img.width, img.height);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code && code.data) {
            setResult(code.data);
          } else {
            setError("No QR code detected in this image. Please ensure the QR is clear and well-lit.");
          }
        } catch {
          setError("Failed to process the uploaded image.");
        } finally {
          setIsScanning(false);
        }
      };
      img.onerror = () => {
        setError("Invalid image file format.");
        setIsScanning(false);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const isUrl = result && (result.startsWith("http://") || result.startsWith("https://"));

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <FlatQrStudioIcon size={38} />
            <div>
              <h2 className="text-lg font-bold text-[#566a7f] dark:text-white">
                Client-Side QR Scanner
              </h2>
              <p className="text-xs text-[#8592a3]">
                Drop or upload any image to decode QR payload instantly with zero server upload
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#71dd37] bg-[#e8fadf] dark:bg-[#71dd37]/20">
            <ShieldCheck className="h-4 w-4" />
            <span>Local Decoder</span>
          </div>
        </div>

        {/* Dropzone Container with Laser Animation */}
        <div className="mt-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#696cff]/40 bg-[#696cff]/5 p-10 text-center cursor-pointer transition-all duration-200 hover:border-[#696cff] hover:bg-[#696cff]/10 group overflow-hidden"
          >
            {/* Laser Scan line on drag/scan */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent shadow-[0_0_12px_3px_#00f2fe] pointer-events-none z-20 animate-laser" />
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processImageFile(e.target.files[0]);
                }
              }}
            />

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-surface text-[#696cff] shadow-md shadow-[#696cff]/20 group-hover:scale-110 transition-transform">
              <Upload className="h-7 w-7" />
              {isScanning && (
                <span className="absolute inset-0 rounded-2xl border-2 border-[#696cff] animate-ping" />
              )}
            </div>

            <h3 className="mt-4 text-sm font-bold text-[#566a7f] dark:text-white">
              {isScanning ? "Decoding QR Matrix..." : "Drop QR Code Image Here"}
            </h3>
            <p className="mt-1 text-xs text-[#8592a3]">
              or click anywhere to browse from your device
            </p>
            <span className="mt-3 inline-block px-3 py-1 rounded-md text-[11px] font-mono text-[#697a8d] bg-surface border border-border-subtle shadow-sm">
              PNG, JPG, WebP, SVG screenshots
            </span>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-5 flex items-center gap-2.5 p-3.5 rounded-xl bg-[#ffe0db] text-[#ff3e1d] text-xs font-semibold animate-fade-in">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Decoded Result Card */}
        {result && (
          <div className="mt-6 rounded-2xl border border-border-subtle bg-canvas p-5 space-y-3.5 animate-fade-in shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#71dd37] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                Decoded Content
              </span>
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setError(null);
                }}
                className="text-xs text-[#8592a3] hover:text-[#566a7f] flex items-center gap-1 font-medium transition-colors"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Scan Another Code
              </button>
            </div>

            <div className="p-4 rounded-xl bg-surface border border-border-subtle font-mono text-xs text-[#566a7f] dark:text-white break-all select-all shadow-sm">
              {result}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleCopyResult}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#696cff] text-white text-xs font-bold shadow-md shadow-[#696cff]/25 hover:bg-[#5f61e6] transition-all active:scale-95"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#71dd37] animate-bounce" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Decoded Text</span>
                  </>
                )}
              </button>

              {isUrl && (
                <a
                  href={result}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border-subtle bg-surface text-xs font-bold text-[#566a7f] dark:text-white hover:bg-canvas transition-all shadow-sm active:scale-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open URL in New Tab</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
