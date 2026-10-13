"use client";

import * as React from "react";
import jsQR from "jsqr";
import {
  Upload,
  Copy,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Check,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Download,
  FileText,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { parseDecodedQR, type DecodedQRPayload } from "@/lib/qr/decoder";
import { downloadFile } from "@/lib/qr/generator";
import {
  FlatGlobeIcon,
  FlatDocumentIcon,
  FlatWifiIcon,
  FlatVCardIcon,
  FlatEmailIcon,
  FlatUpiIcon,
} from "@/components/ui/flaticon-icons";

// Sub-component for individual structured field item
function DecodedFieldItem({
  label,
  value,
  subvalue,
  copyable = true,
  isSecret = false,
  badge,
  actionButton,
}: {
  label: string;
  value?: string;
  subvalue?: string;
  copyable?: boolean;
  isSecret?: boolean;
  badge?: string;
  actionButton?: React.ReactNode;
}) {
  const [showSecret, setShowSecret] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  if (!value) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const displayVal = isSecret && !showSecret ? "••••••••••••" : value;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 gap-2 shadow-[2px_2px_0px_#000]">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </span>
          {badge && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border border-black dark:border-zinc-700 bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black">
              {badge}
            </span>
          )}
        </div>
        <div className="text-xs sm:text-sm font-bold text-black dark:text-white break-all font-mono select-all">
          {displayVal}
        </div>
        {subvalue && (
          <div className="text-[11px] text-slate-500 mt-0.5">{subvalue}</div>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
        {isSecret && (
          <button
            type="button"
            onClick={() => setShowSecret((s) => !s)}
            className="p-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-[1px_1px_0px_#000]"
            title={showSecret ? "Hide password" : "Show password"}
          >
            {showSecret ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        )}
        {copyable && (
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-slate-800 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all shadow-[1px_1px_0px_#000]"
            title="Copy field value"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 stroke-[3] text-green-600 dark:text-green-400" />
                <span className="text-[11px]">Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span className="text-[11px]">Copy</span>
              </>
            )}
          </button>
        )}
        {actionButton}
      </div>
    </div>
  );
}

export function BrutalQRScanner() {
  const [result, setResult] = React.useState<string | null>(null);
  const [isScanning, setIsScanning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [copiedAll, setCopiedAll] = React.useState(false);
  const [showRaw, setShowRaw] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const parsed: DecodedQRPayload | null = React.useMemo(() => {
    return result ? parseDecodedQR(result) : null;
  }, [result]);

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

  const handleCopyAll = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    } catch {}
  };

  const handleDownloadVCard = () => {
    if (parsed?.type !== "vcard") return;
    const filename = `${parsed.formattedName.replace(/\s+/g, "_") || "contact"}.vcf`;
    downloadFile(parsed.raw, filename, "text/vcard");
  };

  // Helper to render type header icon & title
  const renderTypeHeader = () => {
    if (!parsed) return null;
    switch (parsed.type) {
      case "wifi":
        return {
          icon: <FlatWifiIcon size={24} />,
          title: "Wi-Fi Network Detected",
          desc: "Network connection parameters decoded",
          badgeColor: "bg-[#06b6d4] text-white",
        };
      case "vcard":
        return {
          icon: <FlatVCardIcon size={24} />,
          title: "Contact Card (vCard)",
          desc: "Full contact details decoded",
          badgeColor: "bg-[#8b5cf6] text-white",
        };
      case "url":
        return {
          icon: <FlatGlobeIcon size={24} />,
          title: "Web Link / URL",
          desc: "External destination link decoded",
          badgeColor: "bg-[#0284c7] text-white",
        };
      case "email":
        return {
          icon: <FlatEmailIcon size={24} />,
          title: "Direct Email Message",
          desc: "Pre-addressed email draft decoded",
          badgeColor: "bg-[#f59e0b] text-black",
        };
      case "upi":
        return {
          icon: <FlatUpiIcon size={24} />,
          title: "UPI Payment Request",
          desc: "Instant payment parameters decoded",
          badgeColor: "bg-[#10b981] text-white",
        };
      case "text":
      default:
        return {
          icon: <FlatDocumentIcon size={24} />,
          title: "Plain Text Content",
          desc: "Raw text decoded directly",
          badgeColor: "bg-slate-200 text-black dark:bg-slate-700 dark:text-white",
        };
    }
  };

  const typeMeta = renderTypeHeader();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b-2 border-black/10 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="badge-sketch px-3 py-1 text-xs text-black">
              Scanner
            </span>
            <div>
              <h2 className="text-lg font-black text-black dark:text-white">
                Client-Side QR Scanner
              </h2>
              <p className="text-xs text-slate-500">
                Drop any QR image to decode it directly into structured fields
              </p>
            </div>
          </div>
        </div>

        {/* Dropzone Container */}
        <div className="mt-6">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-black dark:border-zinc-700 bg-slate-50 dark:bg-slate-800/50 p-10 text-center cursor-pointer transition-all duration-200 hover:bg-[#ffde59]/20 dark:hover:bg-[#c084fc]/20 group overflow-hidden"
          >
            {isScanning && (
              <div className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#2563eb] dark:via-[#c084fc] to-transparent shadow-[0_0_12px_3px_#2563eb] dark:shadow-[0_0_12px_3px_#c084fc] pointer-events-none z-20 animate-laser" />
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

            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black dark:border-zinc-700 bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black shadow-[3px_3px_0px_#000] group-hover:scale-110 transition-transform">
              <Upload className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-sm font-black text-black dark:text-white">
              {isScanning ? "Decoding Matrix..." : "Drop QR Code Image Here"}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              or click anywhere to browse from your device
            </p>
          </div>
        </div>

        {/* Error Feedback */}
        {error && (
          <div className="mt-5 flex items-center gap-2.5 p-3.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#ff3e1d] text-white text-xs font-bold shadow-[2px_2px_0px_#000]">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Decoded Structured Result */}
        {result && parsed && (
          <div className="mt-6 rounded-2xl border-2 border-black dark:border-zinc-700 bg-slate-50 dark:bg-slate-800/90 p-5 sm:p-6 space-y-4 shadow-[4px_4px_0px_#000]">
            {/* Header: Type icon + status + actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b-2 border-black/10 dark:border-zinc-700">
              <div className="flex items-center gap-2.5">
                <div className="p-1 rounded-lg border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[1.5px_1.5px_0px_#000]">
                  {typeMeta?.icon}
                </div>
                <div>
                  <h3 className="text-sm font-black text-black dark:text-white">
                    {typeMeta?.title}
                  </h3>
                  <p className="text-[11px] text-slate-500">{typeMeta?.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-black flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#05df72] border border-black shadow-[1.5px_1.5px_0px_#000]">
                  <Check className="h-3 w-3 stroke-[3]" />
                  Decoded
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setResult(null);
                    setError(null);
                    setShowRaw(false);
                  }}
                  className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white flex items-center gap-1 px-2 py-1 rounded-lg border border-black/20 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Scan Another</span>
                </button>
              </div>
            </div>

            {/* Structured Fields Rendering */}
            <div className="space-y-2.5">
              {/* --- Wi-Fi Case --- */}
              {parsed.type === "wifi" && (
                <>
                  <DecodedFieldItem
                    label="Network Name (SSID)"
                    value={parsed.ssid}
                    badge="Wi-Fi"
                  />
                  <DecodedFieldItem
                    label="Wi-Fi Password"
                    value={parsed.password || "No password required (Open Network)"}
                    isSecret={Boolean(parsed.password)}
                    copyable={Boolean(parsed.password)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[2px_2px_0px_#000]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Security Encryption
                      </div>
                      <div className="text-xs font-bold text-black dark:text-white mt-1">
                        {parsed.security}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[2px_2px_0px_#000]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Network Broadcast
                      </div>
                      <div className="text-xs font-bold text-black dark:text-white mt-1">
                        {parsed.hidden ? "Hidden Network (SSID Broadcast Off)" : "Standard Broadcast"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- vCard / Contact Case --- */}
              {parsed.type === "vcard" && (
                <>
                  <DecodedFieldItem
                    label="Contact Full Name"
                    value={parsed.formattedName}
                    badge="vCard"
                  />
                  {parsed.phone && (
                    <DecodedFieldItem
                      label="Phone Number"
                      value={parsed.phone}
                      actionButton={
                        <a
                          href={`tel:${parsed.phone}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-[#05df72] text-black text-xs font-bold hover:bg-[#04c263] transition-all shadow-[1px_1px_0px_#000]"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Call</span>
                        </a>
                      }
                    />
                  )}
                  {parsed.email && (
                    <DecodedFieldItem
                      label="Email Address"
                      value={parsed.email}
                      actionButton={
                        <a
                          href={`mailto:${parsed.email}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-[#ffde59] text-black text-xs font-bold hover:bg-[#edd045] transition-all shadow-[1px_1px_0px_#000]"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Email</span>
                        </a>
                      }
                    />
                  )}
                  {(parsed.organization || parsed.title) && (
                    <DecodedFieldItem
                      label="Organization & Title"
                      value={[parsed.title, parsed.organization].filter(Boolean).join(" at ")}
                    />
                  )}
                  {parsed.url && (
                    <DecodedFieldItem
                      label="Website / Link"
                      value={parsed.url}
                      actionButton={
                        <a
                          href={parsed.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white text-xs font-bold shadow-[1px_1px_0px_#000]"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="text-[11px]">Visit</span>
                        </a>
                      }
                    />
                  )}
                  {parsed.address && (
                    <DecodedFieldItem label="Postal Address" value={parsed.address} />
                  )}
                  {parsed.note && (
                    <DecodedFieldItem label="Note / Remarks" value={parsed.note} />
                  )}
                </>
              )}

              {/* --- Web URL Case --- */}
              {parsed.type === "url" && (
                <>
                  <DecodedFieldItem
                    label="Destination Web Address (URL)"
                    value={parsed.url}
                    badge={parsed.protocol}
                    actionButton={
                      <a
                        href={parsed.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-[#05df72] text-black text-xs font-bold shadow-[1px_1px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Open Link</span>
                      </a>
                    }
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[2px_2px_0px_#000]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Host Domain
                      </div>
                      <div className="text-xs font-bold text-black dark:text-white mt-1 truncate">
                        {parsed.hostname}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[2px_2px_0px_#000]">
                      <div className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Transport Protocol
                      </div>
                      <div className="text-xs font-bold text-black dark:text-white mt-1">
                        {parsed.protocol === "HTTPS" ? "HTTPS (Encrypted SSL/TLS)" : parsed.protocol}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* --- Email Case --- */}
              {parsed.type === "email" && (
                <>
                  <DecodedFieldItem
                    label="Recipient Email"
                    value={parsed.to}
                    badge="Email"
                    actionButton={
                      <a
                        href={parsed.raw}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-[#ffde59] text-black text-xs font-bold shadow-[1px_1px_0px_#000]"
                      >
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-[11px]">Compose</span>
                      </a>
                    }
                  />
                  {parsed.subject && (
                    <DecodedFieldItem label="Email Subject" value={parsed.subject} />
                  )}
                  {parsed.body && (
                    <DecodedFieldItem label="Email Body" value={parsed.body} />
                  )}
                </>
              )}

              {/* --- UPI Payment Case --- */}
              {parsed.type === "upi" && (
                <>
                  <DecodedFieldItem
                    label="Payee VPA / UPI ID"
                    value={parsed.pa}
                    badge="UPI"
                  />
                  {parsed.pn && (
                    <DecodedFieldItem label="Payee Name" value={parsed.pn} />
                  )}
                  {parsed.am && (
                    <DecodedFieldItem
                      label="Payment Amount"
                      value={`₹ ${parsed.am}`}
                      badge={parsed.cu || "INR"}
                    />
                  )}
                  {parsed.tn && (
                    <DecodedFieldItem label="Transaction Note / Remarks" value={parsed.tn} />
                  )}
                </>
              )}

              {/* --- Plain Text Case --- */}
              {parsed.type === "text" && (
                <DecodedFieldItem
                  label="Plain Text"
                  value={parsed.text}
                  badge={`${parsed.charCount} characters`}
                  subvalue={`${parsed.wordCount} words`}
                />
              )}
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleCopyAll}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#2563eb] dark:bg-[#c084fc] text-white dark:text-black text-xs font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {copiedAll ? (
                  <>
                    <Check className="h-4 w-4 stroke-[3]" />
                    <span>Copied Raw Payload!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy Full Payload</span>
                  </>
                )}
              </button>

              {parsed.type === "vcard" && (
                <button
                  type="button"
                  onClick={handleDownloadVCard}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#05df72] text-black text-xs font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <Download className="h-4 w-4" />
                  <span>Download .vcf Card</span>
                </button>
              )}

              {parsed.type === "url" && (
                <a
                  href={parsed.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white text-xs font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Open in Browser</span>
                </a>
              )}

              {parsed.type === "upi" && (
                <a
                  href={parsed.raw}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#05df72] text-black text-xs font-bold shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Pay via UPI App</span>
                </a>
              )}
            </div>

            {/* Collapsible Raw Payload Inspector */}
            <div className="pt-2 border-t border-black/10 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setShowRaw((s) => !s)}
                className="flex items-center justify-between w-full p-2.5 rounded-xl border border-black/20 dark:border-zinc-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5 text-slate-500" />
                  <span>View Raw QR String Payload</span>
                </span>
                {showRaw ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>

              {showRaw && (
                <div className="mt-2 p-4 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 font-mono text-xs text-black dark:text-white break-all select-all shadow-[2px_2px_0px_#000]">
                  {result}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
