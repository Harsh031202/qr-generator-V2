"use client";

import * as React from "react";
import {
  Download,
  Copy,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
  AlertTriangle,
  Info,
  Sparkles,
  QrCode,
  Share2,
  RefreshCw,
  Eye,
  Zap,
} from "lucide-react";

import type { QRContentType, QRPatternStyle, QRErrorCorrection } from "@/types/qr";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { QR_TYPE_HANDLERS } from "@/lib/qr/content-registry";
import { validateHexColor, isHighDensityPayload } from "@/lib/validation/qr-validators";
import {
  generateQRSvg,
  generateQRPngDataUrl,
  downloadFile,
  downloadDataUrl,
  getContrastRatio,
} from "@/lib/qr/generator";

import {
  FlatGlobeIcon,
  FlatDocumentIcon,
  FlatWifiIcon,
  FlatVCardIcon,
  FlatEmailIcon,
  FlatUpiIcon,
  FlatQrStudioIcon,
} from "@/components/ui/flaticon-icons";

import { UrlForm } from "@/components/editor/url-form";
import { TextForm } from "@/components/editor/text-form";
import { WifiForm } from "@/components/editor/wifi-form";
import { VCardForm } from "@/components/editor/vcard-form";
import { EmailForm } from "@/components/editor/email-form";
import { UpiForm } from "@/components/editor/upi-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { QRContrastGauge } from "./qr-contrast-gauge";
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { id: "url", label: "Website URL", icon: FlatGlobeIcon, desc: "Link to any webpage" },
  { id: "text", label: "Plain Text", icon: FlatDocumentIcon, desc: "Message or note" },
  { id: "wifi", label: "Wi-Fi Access", icon: FlatWifiIcon, desc: "Auto-connect network" },
  { id: "vcard", label: "Contact Card", icon: FlatVCardIcon, desc: "Digital business card" },
  { id: "email", label: "Direct Email", icon: FlatEmailIcon, desc: "Pre-filled email" },
  { id: "upi", label: "UPI Payment", icon: FlatUpiIcon, desc: "Instant transfer" },
] as const;

const PATTERNS: { id: QRPatternStyle; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
];

const ECC_OPTIONS: { id: QRErrorCorrection; label: string; desc: string }[] = [
  { id: "L", label: "L", desc: "7% recovery" },
  { id: "M", label: "M", desc: "15% recovery" },
  { id: "Q", label: "Q", desc: "25% recovery" },
  { id: "H", label: "H", desc: "30% recovery" },
];

const SAMPLE_PRESETS: { label: string; type: keyof QRContentPayloadMap; apply: () => Partial<QRContentPayloadMap> }[] = [
  {
    label: "Demo Portfolio",
    type: "url",
    apply: () => ({ url: { url: "https://github.com" } }),
  },
  {
    label: "Guest Wi-Fi",
    type: "wifi",
    apply: () => ({ wifi: { ssid: "CoffeeShop_5G", password: "superguestpass", security: "WPA", hidden: false } }),
  },
  {
    label: "Executive vCard",
    type: "vcard",
    apply: () => ({
      vcard: {
        firstName: "Alex",
        lastName: "Morgan",
        phone: "+1 555-0199",
        email: "alex.morgan@company.com",
        organization: "Acme Tech",
        title: "Product Director",
        url: "https://example.com",
      },
    }),
  },
];

interface QRGeneratorViewProps {
  onSaveToHistory?: (item: { type: string; payload: string; svg: string; timestamp: number }) => void;
}

export function QRGeneratorView({ onSaveToHistory }: QRGeneratorViewProps) {
  const [selectedType, setSelectedType] = React.useState<keyof QRContentPayloadMap>("url");

  const [contents, setContents] = React.useState<QRContentPayloadMap>({
    url: { url: "https://github.com" },
    text: { text: "Hello from modern QR Studio!" },
    wifi: { ssid: "Studio_WiFi_5G", password: "supersecretpass", security: "WPA", hidden: false },
    vcard: {
      firstName: "Alex",
      lastName: "Rivera",
      phone: "+1 555-0199",
      email: "alex@example.com",
      organization: "QR Studio",
      title: "Lead Engineer",
      url: "https://example.com",
    },
    email: {
      to: "contact@example.com",
      subject: "Hello from QR Studio",
      body: "Hi, I scanned your QR code and wanted to connect.",
    },
    upi: {
      pa: "merchant@upi",
      pn: "QR Studio Store",
      am: "150.00",
      tn: "Payment for order #84686",
      cu: "INR",
    },
  });

  const [pattern, setPattern] = React.useState<QRPatternStyle>("square");
  const [ecc, setEcc] = React.useState<QRErrorCorrection>("M");
  const [margin, setMargin] = React.useState(3);
  const [fgColor, setFgColor] = React.useState("#1e293b");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [pngResolution, setPngResolution] = React.useState<number>(1024);

  // Animation & generating state
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [qrRenderKey, setQrRenderKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);

  const currentHandler = QR_TYPE_HANDLERS[selectedType];
  const currentData = contents[selectedType];

  const validation = React.useMemo(() => {
    return currentHandler.validate(currentData as never);
  }, [currentHandler, currentData]);

  const encodedPayload = React.useMemo(() => {
    if (!validation.isValid) return "";
    try {
      return currentHandler.encode(currentData as never);
    } catch {
      return "";
    }
  }, [currentHandler, currentData, validation.isValid]);

  const summary = React.useMemo(() => {
    return currentHandler.getSummary(currentData as never);
  }, [currentHandler, currentData]);

  const isDense = React.useMemo(() => {
    return isHighDensityPayload(encodedPayload.length);
  }, [encodedPayload]);

  const contrastRatio = React.useMemo(() => {
    if (validateHexColor(fgColor) && validateHexColor(bgColor)) {
      return getContrastRatio(fgColor, bgColor);
    }
    return 21;
  }, [fgColor, bgColor]);

  // Real-time client-side generation with smooth animation feedback
  React.useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      if (!encodedPayload || !validation.isValid) {
        setSvgMarkup("");
        setIsGenerating(false);
        return;
      }

      try {
        const svg = await generateQRSvg(encodedPayload, {
          errorCorrection: ecc,
          margin,
          foregroundColor: fgColor,
          backgroundColor: bgColor,
          pattern,
        });

        if (!isCancelled) {
          setSvgMarkup(svg);
          setQrRenderKey((k) => k + 1);
          setIsGenerating(false);

          if (onSaveToHistory) {
            onSaveToHistory({
              type: selectedType,
              payload: encodedPayload,
              svg,
              timestamp: Date.now(),
            });
          }
        }
      } catch {
        if (!isCancelled) {
          setSvgMarkup("");
          setIsGenerating(false);
        }
      }
    }, 180); // Smooth 180ms generating pulse

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [encodedPayload, validation.isValid, ecc, margin, fgColor, bgColor, pattern, selectedType, onSaveToHistory]);

  const handleDownloadSvg = async () => {
    if (!encodedPayload || !validation.isValid || isExporting) return;
    setIsExporting(true);
    try {
      const svg = await generateQRSvg(encodedPayload, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        pattern,
      });
      const filename = `qr-${selectedType}-${Date.now()}.svg`;
      downloadFile(svg, filename, "image/svg+xml");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPng = async () => {
    if (!encodedPayload || !validation.isValid || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateQRPngDataUrl(encodedPayload, pngResolution, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      const filename = `qr-${selectedType}-${pngResolution}px-${Date.now()}.png`;
      downloadDataUrl(dataUrl, filename);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopy = async () => {
    if (!encodedPayload || !validation.isValid) return;
    try {
      const dataUrl = await generateQRPngDataUrl(encodedPayload, 512, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      try {
        await navigator.clipboard.writeText(encodedPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {}
    }
  };

  const renderActiveForm = () => {
    switch (selectedType) {
      case "url":
        return (
          <UrlForm
            value={contents.url}
            onChange={(val) => setContents((prev) => ({ ...prev, url: val }))}
          />
        );
      case "text":
        return (
          <TextForm
            value={contents.text}
            onChange={(val) => setContents((prev) => ({ ...prev, text: val }))}
          />
        );
      case "wifi":
        return (
          <WifiForm
            value={contents.wifi}
            onChange={(val) => setContents((prev) => ({ ...prev, wifi: val }))}
          />
        );
      case "vcard":
        return (
          <VCardForm
            value={contents.vcard}
            onChange={(val) => setContents((prev) => ({ ...prev, vcard: val }))}
          />
        );
      case "email":
        return (
          <EmailForm
            value={contents.email}
            onChange={(val) => setContents((prev) => ({ ...prev, email: val }))}
          />
        );
      case "upi":
        return (
          <UpiForm
            value={contents.upi}
            onChange={(val) => setContents((prev) => ({ ...prev, upi: val }))}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Split Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 items-start">
        {/* LEFT COLUMN: Controls & Input Forms (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Card 1: Content Type Selector with Rich Flaticon Icons */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <FlatQrStudioIcon size={34} />
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#566a7f] dark:text-white tracking-tight">
                    Select QR Content Type
                  </h2>
                  <p className="text-xs text-[#8592a3]">
                    Choose what happens when someone scans your QR code
                  </p>
                </div>
              </div>

              {/* Sample Presets Quick Pills */}
              <div className="hidden sm:flex items-center gap-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedType(preset.type);
                      setContents((prev) => ({ ...prev, ...preset.apply() }));
                    }}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#696cff] bg-[#e7e7ff]/70 hover:bg-[#696cff] hover:text-white transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rich Flaticon-Style Content Type Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-5">
              {CONTENT_TYPES.map((type) => {
                const IconComponent = type.icon;
                const isActive = selectedType === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedType(type.id as keyof QRContentPayloadMap)}
                    className={cn(
                      "relative flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-200 select-none interactive-spring group",
                      isActive
                        ? "border-[#696cff] bg-[#e7e7ff]/50 dark:bg-[#696cff]/20 text-[#696cff] shadow-md shadow-[#696cff]/20 scale-103 font-bold ring-2 ring-[#696cff]/30"
                        : "border-border-subtle bg-canvas/30 hover:bg-surface text-[#566a7f] dark:text-[#cfd3ec] hover:border-[#b4bdc6]"
                    )}
                  >
                    <div className="transition-transform duration-300 group-hover:scale-115 mb-2">
                      <IconComponent size={34} />
                    </div>
                    <span className="text-xs tracking-tight">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Input Form Container with Smooth Focus Transition */}
            <div className="mt-6 pt-5 border-t border-border-subtle">
              {renderActiveForm()}
            </div>
          </div>

          {/* Card 2: Appearance & Customization */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border-subtle">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d7f5fc] text-[#03c3ec] dark:bg-[#03c3ec]/20 shadow-sm">
                <Sliders className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#566a7f] dark:text-white tracking-tight">
                  Appearance & Customization
                </h3>
                <p className="text-xs text-[#8592a3]">
                  Fine-tune module geometry, quiet zone, and color contrast
                </p>
              </div>
            </div>

            {/* Pattern Style & Error Correction Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Pattern Style */}
              <div>
                <Label hint="Module shape">Pattern Style</Label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-canvas border border-border-subtle mt-1.5">
                  {PATTERNS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPattern(p.id)}
                      className={cn(
                        "py-2 text-xs font-semibold rounded-lg transition-all duration-200 text-center active:scale-95",
                        pattern === p.id
                          ? "bg-[#696cff] text-white shadow-md shadow-[#696cff]/30 font-bold"
                          : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff]"
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error Correction */}
              <div>
                <Label hint="Reed-Solomon recovery">Error Correction</Label>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-canvas border border-border-subtle mt-1.5">
                  {ECC_OPTIONS.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEcc(e.id)}
                      title={e.desc}
                      className={cn(
                        "py-2 text-xs font-semibold rounded-lg transition-all duration-200 text-center active:scale-95",
                        ecc === e.id
                          ? "bg-[#696cff] text-white shadow-md shadow-[#696cff]/30 font-bold"
                          : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff]"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quiet Zone Padding Slider */}
            <div className="pt-2">
              <Slider
                label="Quiet Zone (Padding Margin)"
                value={margin}
                min={1}
                max={6}
                step={1}
                unit=" modules"
                onChange={setMargin}
              />
            </div>

            {/* Color Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border-subtle">
              <div>
                <Label hint="Pattern foreground">Foreground Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-border-subtle p-0.5 bg-surface cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    aria-label="Pick foreground color"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    mono
                    className="uppercase"
                  />
                </div>
              </div>

              <div>
                <Label hint="Background surface">Background Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border border-border-subtle p-0.5 bg-surface cursor-pointer shadow-sm hover:scale-105 transition-transform"
                    aria-label="Pick background color"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    mono
                    className="uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Contrast Ratio Circular Gauge */}
            <div className="pt-2">
              <QRContrastGauge
                contrastRatio={contrastRatio}
                fgColor={fgColor}
                bgColor={bgColor}
                onApplyTheme={(fg, bg) => {
                  setFgColor(fg);
                  setBgColor(bg);
                }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Preview & Actions (5 cols, sticky) */}
        <div className="lg:col-span-5 flex flex-col gap-5 sticky top-24">
          <div
            className={cn(
              "rounded-2xl border border-border-subtle bg-surface p-6 sm:p-7 shadow-sm transition-all duration-300 hover:shadow-md flex flex-col items-center relative overflow-hidden",
              isGenerating && "animate-generating-glow"
            )}
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#696cff]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#566a7f] dark:text-white">
                  Live Preview
                </span>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20 animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Generating...
                  </span>
                ) : validation.isValid && svgMarkup ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#e8fadf] text-[#71dd37] dark:bg-[#71dd37]/20">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#ffe0db] text-[#ff3e1d] dark:bg-[#ff3e1d]/20">
                    Incomplete
                  </span>
                )}
                <span className="font-mono text-[11px] text-[#8592a3]">
                  Vector SVG
                </span>
              </div>
            </div>

            {/* Live QR Render Frame with Animated Laser Beam & Reveal */}
            <div className="relative flex items-center justify-center w-full aspect-square max-w-[340px] rounded-2xl border border-border-subtle bg-canvas p-6 shadow-inner overflow-hidden transition-all duration-300 group hover:shadow-md">
              {/* Laser Scanner Beam (Active when generating) */}
              {isGenerating && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent shadow-[0_0_12px_3px_#00f2fe] pointer-events-none z-20 animate-laser" />
              )}

              {validation.isValid && svgMarkup ? (
                <div
                  key={qrRenderKey}
                  className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full rounded-xl shadow-sm transition-transform duration-300 group-hover:scale-103 animate-qr-reveal"
                  dangerouslySetInnerHTML={{ __html: svgMarkup }}
                />
              ) : (
                <div className="text-center p-6 flex flex-col items-center justify-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-[#8592a3]">
                    <Info className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-[#566a7f] font-semibold mt-1">
                    Enter valid content to generate QR
                  </p>
                  {validation.error && (
                    <p className="text-[11px] text-[#ff3e1d] max-w-[200px]">
                      {validation.error}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Density Notice if applicable */}
            {isDense && validation.isValid && (
              <div className="w-full mt-3.5 p-3 rounded-xl border border-[#ffab00]/30 bg-[#fff2d6]/50 text-[#ffab00] text-xs flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-[11px] leading-tight font-medium">
                  High payload density: Export at 1024px+ for reliable scanning at a distance.
                </span>
              </div>
            )}

            {/* Encoded payload info box */}
            <div className="w-full mt-4 p-3 rounded-xl bg-canvas border border-border-subtle text-xs">
              <div className="flex items-center justify-between text-[#8592a3] mb-1 text-[11px]">
                <span>Encoded Content</span>
                <span className="font-mono text-[#696cff] font-semibold">
                  {encodedPayload ? `${encodedPayload.length} chars` : "0 chars"}
                </span>
              </div>
              <div className="font-mono text-[#566a7f] dark:text-[#cfd3ec] text-xs truncate">
                {summary || "—"}
              </div>
            </div>

            {/* PNG Resolution Selector */}
            <div className="w-full mt-4 flex items-center justify-between text-xs">
              <span className="text-[#8592a3] font-medium">PNG Resolution</span>
              <div className="flex items-center gap-1">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setPngResolution(res)}
                    className={cn(
                      "px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold transition-all duration-200 active:scale-95",
                      pngResolution === res
                        ? "bg-[#696cff] text-white shadow-sm"
                        : "text-[#8592a3] hover:text-[#566a7f] hover:bg-canvas"
                    )}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            {/* Export Actions Grid with Shimmer & Spring Effects */}
            <div className="w-full grid grid-cols-2 gap-2.5 mt-3">
              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload || isExporting}
                onClick={handleDownloadPng}
                className="relative overflow-hidden w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#696cff] hover:bg-[#5f61e6] text-white text-xs font-bold shadow-md shadow-[#696cff]/30 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-98 group"
              >
                <div className="absolute inset-0 w-1/2 h-full bg-white/20 skew-x-[-20deg] pointer-events-none -translate-x-full group-hover:animate-shimmer" />
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>

              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload || isExporting}
                onClick={handleDownloadSvg}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl border border-[#696cff] text-[#696cff] hover:bg-[#696cff] hover:text-white text-xs font-bold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-98 shadow-sm"
              >
                <Download className="h-4 w-4" />
                <span>Export SVG</span>
              </button>
            </div>

            {/* Clipboard Copy Button */}
            <div className="w-full mt-2.5">
              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload}
                onClick={handleCopy}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-border-subtle bg-surface text-xs font-semibold text-[#566a7f] dark:text-[#cfd3ec] hover:bg-canvas transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none active:scale-98",
                  copied && "text-[#71dd37] border-[#71dd37] bg-[#e8fadf]/40 font-bold"
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-[#71dd37] animate-bounce" />
                    <span>Copied Image to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[#8592a3]" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Architecture Notice */}
          <div className="rounded-2xl border border-border-subtle bg-surface p-4 text-xs shadow-sm">
            <div className="flex items-center gap-2 mb-1 text-[#71dd37] font-bold">
              <Shield className="h-4 w-4" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="text-[#8592a3] text-[11px] leading-relaxed">
              QR matrix generation and visual styling occur strictly inside your web browser. No URL, Wi-Fi password, or personal vCard data is ever transmitted across the network.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
