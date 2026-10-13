"use client";

import * as React from "react";
import {
  Download,
  Copy,
  CheckCircle2,
  Check,
  AlertTriangle,
  Info,
  RefreshCw,
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
} from "@/lib/qr/generator";
import { parseDecodedQR } from "@/lib/qr/decoder";

import {
  FlatGlobeIcon,
  FlatDocumentIcon,
  FlatWifiIcon,
  FlatVCardIcon,
  FlatEmailIcon,
  FlatUpiIcon,
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
import { cn } from "@/lib/utils";

const CONTENT_TYPES = [
  { id: "url", label: "Website URL", icon: FlatGlobeIcon },
  { id: "text", label: "Plain Text", icon: FlatDocumentIcon },
  { id: "wifi", label: "Wi-Fi Access", icon: FlatWifiIcon },
  { id: "vcard", label: "Contact Card", icon: FlatVCardIcon },
  { id: "email", label: "Direct Email", icon: FlatEmailIcon },
  { id: "upi", label: "UPI Payment", icon: FlatUpiIcon },
] as const;

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
    label: "Coffee Wi-Fi",
    type: "wifi",
    apply: () => ({ wifi: { ssid: "Cafe_Free_WiFi", password: "welcomeguest", security: "WPA", hidden: false } }),
  },
  {
    label: "Digital vCard",
    type: "vcard",
    apply: () => ({
      vcard: {
        firstName: "Alex",
        lastName: "Morgan",
        phone: "+1 555-0199",
        email: "alex@company.com",
        organization: "Acme Design",
        title: "Product Lead",
        url: "https://example.com",
      },
    }),
  },
];

export interface HistoryItemPayload {
  id?: string;
  type: string;
  payload: string;
  svg: string;
  timestamp: number;
  data?: any;
  pattern?: QRPatternStyle;
  fgColor?: string;
  bgColor?: string;
  ecc?: QRErrorCorrection;
  margin?: number;
}

interface BrutalQRGeneratorProps {
  onSaveToHistory?: (item: HistoryItemPayload) => void;
  loadItem?: HistoryItemPayload | null;
  onClearLoadedItem?: () => void;
}

export function BrutalQRGenerator({
  onSaveToHistory,
  loadItem,
  onClearLoadedItem,
}: BrutalQRGeneratorProps) {
  const [selectedType, setSelectedType] = React.useState<keyof QRContentPayloadMap>("url");

  const [contents, setContents] = React.useState<QRContentPayloadMap>({
    url: { url: "https://github.com" },
    text: { text: "Hello from QR Studio!" },
    wifi: { ssid: "Studio_WiFi_5G", password: "superguestpass", security: "WPA", hidden: false },
    vcard: {
      firstName: "Alex",
      lastName: "Rivera",
      phone: "+1 555-0199",
      email: "alex@example.com",
      organization: "Acme Studio",
      title: "Lead Designer",
      url: "https://example.com",
    },
    email: {
      to: "contact@example.com",
      subject: "Hello from QR Studio",
      body: "Hi, I scanned your QR code and wanted to connect.",
    },
    upi: {
      pa: "merchant@upi",
      pn: "Store Checkout",
      am: "150.00",
      tn: "Payment for order",
      cu: "INR",
    },
  });

  const pattern: QRPatternStyle = "square";
  const [ecc, setEcc] = React.useState<QRErrorCorrection>("M");
  const [margin, setMargin] = React.useState(3);
  const [fgColor, setFgColor] = React.useState("#000000");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [pngResolution, setPngResolution] = React.useState<number>(1024);

  // Generating, background pre-rendering & buttery smooth reveal states
  const [isGenerating, setIsGenerating] = React.useState(true);
  const [isRevealed, setIsRevealed] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [renderTicket, setRenderTicket] = React.useState(0);
  const [waterRippleKey, setWaterRippleKey] = React.useState(0);
  const [copied, setCopied] = React.useState(false);
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);
  const qrContainerRef = React.useRef<HTMLDivElement>(null);

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

  // Load item from history for editing
  React.useEffect(() => {
    if (!loadItem) return;

    if (loadItem.type in contents) {
      setSelectedType(loadItem.type as keyof QRContentPayloadMap);
    }

    if (loadItem.data) {
      setContents((prev) => ({
        ...prev,
        [loadItem.type]: {
          ...(prev[loadItem.type as keyof QRContentPayloadMap] as object),
          ...loadItem.data,
        },
      }));
    } else if (loadItem.payload) {
      const decoded = parseDecodedQR(loadItem.payload);
      if (decoded.type in contents) {
        setSelectedType(decoded.type as keyof QRContentPayloadMap);
        if (decoded.type === "wifi") {
          setContents((prev) => ({
            ...prev,
            wifi: {
              ssid: decoded.ssid,
              password: decoded.password || "",
              security: (decoded.security || "WPA") as "WPA" | "WEP" | "nopass",
              hidden: decoded.hidden || false,
            },
          }));
        } else if (decoded.type === "url") {
          setContents((prev) => ({
            ...prev,
            url: { url: decoded.url },
          }));
        } else if (decoded.type === "email") {
          setContents((prev) => ({
            ...prev,
            email: {
              to: decoded.to,
              subject: decoded.subject || "",
              body: decoded.body || "",
            },
          }));
        } else if (decoded.type === "upi") {
          setContents((prev) => ({
            ...prev,
            upi: {
              pa: decoded.pa,
              pn: decoded.pn || "",
              am: decoded.am || "",
              tn: decoded.tn || "",
              cu: decoded.cu || "INR",
            },
          }));
        } else if (decoded.type === "text") {
          setContents((prev) => ({
            ...prev,
            text: { text: decoded.raw },
          }));
        } else if (decoded.type === "vcard") {
          setContents((prev) => ({
            ...prev,
            vcard: {
              firstName: decoded.firstName || decoded.formattedName,
              lastName: decoded.lastName || "",
              phone: decoded.phone || "",
              email: decoded.email || "",
              organization: decoded.organization || "",
              title: decoded.title || "",
              url: decoded.url || "",
            },
          }));
        }
      }
    }

    if (loadItem.fgColor) setFgColor(loadItem.fgColor);
    if (loadItem.bgColor) setBgColor(loadItem.bgColor);
    if (loadItem.ecc) setEcc(loadItem.ecc);
    if (loadItem.margin !== undefined) setMargin(loadItem.margin);

    if (onClearLoadedItem) {
      onClearLoadedItem();
    }
  }, [loadItem, onClearLoadedItem, contents]);

  // Real-time client-side generation (renders in background first)
  React.useEffect(() => {
    let isCancelled = false;
    setIsGenerating(true);
    setIsRevealed(false);
    setIsAnimating(false);

    const timer = setTimeout(async () => {
      if (!encodedPayload || !validation.isValid) {
        setSvgMarkup("");
        setIsGenerating(false);
        setIsRevealed(false);
        setIsAnimating(false);
        return;
      }

      try {
        const svg = await generateQRSvg(encodedPayload, {
          errorCorrection: ecc,
          margin,
          foregroundColor: fgColor,
          backgroundColor: bgColor,
          pattern,
          animate: true,
        });

        if (!isCancelled) {
          // Mount SVG in background (stays hidden and non-animating until layout finishes)
          setSvgMarkup(svg);
          setRenderTicket((t) => t + 1);

          if (onSaveToHistory) {
            // Generate clean static SVG without any animation classes for export/history
            generateQRSvg(encodedPayload, {
              errorCorrection: ecc,
              margin,
              foregroundColor: fgColor,
              backgroundColor: bgColor,
              pattern,
              animate: false,
            }).then((staticSvg) => {
              if (!isCancelled && onSaveToHistory) {
                onSaveToHistory({
                  type: selectedType,
                  payload: encodedPayload,
                  svg: staticSvg,
                  timestamp: Date.now(),
                  data: currentData,
                  pattern,
                  fgColor,
                  bgColor,
                  ecc,
                  margin,
                });
              }
            });
          }
        }
      } catch {
        if (!isCancelled) {
          setSvgMarkup("");
          setIsGenerating(false);
          setIsRevealed(false);
          setIsAnimating(false);
        }
      }
    }, 150);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [encodedPayload, validation.isValid, ecc, margin, fgColor, bgColor, pattern, selectedType, onSaveToHistory, currentData]);

  // Offscreen layout measurement & buttery-smooth fluid reveal
  React.useLayoutEffect(() => {
    if (!svgMarkup || !validation.isValid) {
      setIsRevealed(false);
      setIsAnimating(false);
      return;
    }

    let isCancelled = false;
    const cleanups: (() => void)[] = [];

    // Force browser layout engine to calculate module bounding boxes & dimensions behind the scenes
    if (qrContainerRef.current) {
      void qrContainerRef.current.offsetHeight;
    }

    // Double requestAnimationFrame ensures DOM layout, style resolution, and GPU composite layers are ready
    const raf1 = requestAnimationFrame(() => {
      if (isCancelled) return;
      const raf2 = requestAnimationFrame(() => {
        if (isCancelled) return;
        // Background rendering complete: reveal container without stutter
        setIsRevealed(true);
        setIsGenerating(false);
        setWaterRippleKey((k) => k + 1);

        // On the very next animation frame, trigger the fluid radial ripple animation
        const raf3 = requestAnimationFrame(() => {
          if (isCancelled) return;
          setIsAnimating(true);
        });
        cleanups.push(() => cancelAnimationFrame(raf3));
      });
      cleanups.push(() => cancelAnimationFrame(raf2));
    });
    cleanups.push(() => cancelAnimationFrame(raf1));

    return () => {
      isCancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [svgMarkup, renderTicket, validation.isValid]);

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
        pattern,
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
        pattern,
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
    <div className="w-full select-none">
      {/* 2-Column Split Workspace with Neo-Brutalist Styling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Controls & Input Forms (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-7">
          {/* Card 1: Content Type Selector & Active Form */}
          <div className="rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[5px_5px_0px_#000]">
            {/* Header with Wobbly Sketch Badge */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b-2 border-black/10 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <span className="badge-sketch px-3 py-1 text-xs text-black">
                  Step 1
                </span>
                <h3 className="text-lg font-black tracking-tight text-black dark:text-white">
                  Choose Content Type
                </h3>
              </div>

              {/* Sample Presets */}
              <div className="flex items-center gap-1.5">
                {SAMPLE_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedType(preset.type);
                      setContents((prev) => ({ ...prev, ...preset.apply() }));
                    }}
                    className="px-2.5 py-1 text-[11px] font-bold rounded-lg border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                  >
                    ★ {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Tiles with Rich Flaticon Icons & Neo-Brutalist Borders */}
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
                      "flex flex-col items-center justify-center p-3 rounded-xl border-2 border-black dark:border-zinc-700 text-center transition-all duration-150 group",
                      isActive
                        ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black dark:border-purple-300 shadow-[4px_4px_0px_#000] font-black translate-x-[-2px] translate-y-[-2px]"
                        : "bg-white dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 shadow-[2px_2px_0px_#000] hover:bg-slate-50 dark:hover:bg-slate-700 hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    )}
                  >
                    <div className="transition-transform duration-200 group-hover:scale-110 mb-2">
                      <IconComponent size={32} />
                    </div>
                    <span className="text-xs tracking-tight font-bold">{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Input Form */}
            <div className="mt-6 pt-5 border-t-2 border-black/10 dark:border-zinc-800">
              {renderActiveForm()}
            </div>
          </div>

          {/* Card 2: Appearance & Geometry Controls */}
          <div className="rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[5px_5px_0px_#000] space-y-6">
            <div className="flex items-center gap-2.5 pb-4 border-b-2 border-black/10 dark:border-zinc-800">
              <span className="badge-sketch px-3 py-1 text-xs text-black bg-[#05df72]">
                Step 2
              </span>
              <h3 className="text-lg font-black tracking-tight text-black dark:text-white">
                Customize Appearance & Colors
              </h3>
            </div>

            {/* Error Correction & Quiet Zone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-end">
              {/* Error Correction */}
              <div>
                <Label hint="Reed-Solomon recovery">Error Correction</Label>
                <div className="grid grid-cols-4 gap-1 p-1 rounded-xl border-2 border-black dark:border-zinc-700 bg-slate-100 dark:bg-slate-800 mt-1.5">
                  {ECC_OPTIONS.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      onClick={() => setEcc(e.id)}
                      title={e.desc}
                      className={cn(
                        "py-2 text-xs font-bold rounded-lg transition-all text-center",
                        ecc === e.id
                          ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black dark:border-purple-300 border-2 border-black shadow-[2px_2px_0px_#000]"
                          : "text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiet Zone Padding Slider */}
              <div>
                <Slider
                  label="Quiet Zone (Padding Margin)"
                  value={margin}
                  min={1}
                  max={6}
                  step={1}
                  onChange={setMargin}
                />
              </div>
            </div>

            {/* Color Pickers with Neo-Brutalist Border Styling */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t-2 border-black/10 dark:border-zinc-800">
              <div>
                <Label hint="Foreground pattern color">Pattern Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border-2 border-black dark:border-zinc-700 p-0.5 bg-white cursor-pointer shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform"
                    aria-label="Pick foreground color"
                  />
                  <Input
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    mono
                    className="uppercase font-bold border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>

              <div>
                <Label hint="Background surface color">Background Color</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="h-10 w-12 rounded-xl border-2 border-black dark:border-zinc-700 p-0.5 bg-white cursor-pointer shadow-[2px_2px_0px_#000] hover:scale-105 transition-transform"
                    aria-label="Pick background color"
                  />
                  <Input
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    mono
                    className="uppercase font-bold border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live QR Preview & Actions (5 cols, sticky, styled like "Today's course" card in screenshot) */}
        <div className="lg:col-span-5 flex flex-col gap-6 sticky top-6">
          <div className="rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-[6px_6px_0px_#000] flex flex-col items-center relative overflow-hidden">
            {/* Header matching "Today's course" card */}
            <div className="w-full flex items-center justify-between pb-4 mb-4 border-b-2 border-black/10 dark:border-zinc-800">
              <span className="text-sm font-black text-black dark:text-white">
                Today&apos;s QR Code
              </span>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black dark:border-purple-400 border-2 border-black shadow-[1.5px_1.5px_0px_#000] animate-pulse">
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    Generating
                  </span>
                ) : validation.isValid && svgMarkup ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#05df72] text-black border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                    <Check className="h-3 w-3 stroke-[3]" />
                    Ready
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-[#ff3e1d] text-white border-2 border-black shadow-[1.5px_1.5px_0px_#000]">
                    Incomplete
                  </span>
                )}
              </div>
            </div>

            {/* Live QR Render Frame with Circular Ripple Animation */}
            <div className="relative flex items-center justify-center w-full aspect-square max-w-[320px] rounded-2xl border-2 border-black dark:border-zinc-700 bg-slate-50 dark:bg-slate-800/80 p-6 shadow-inner overflow-hidden">
              {!validation.isValid ? (
                <div className="text-center p-6 flex flex-col items-center justify-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-white border-2 border-black flex items-center justify-center text-slate-500 shadow-[2px_2px_0px_#000]">
                    <Info className="h-6 w-6" />
                  </div>
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-bold mt-1">
                    Enter valid content to generate QR
                  </p>
                  {validation.error && (
                    <div className="mt-2 px-3 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-black text-xs max-w-[260px] text-center shadow-[2px_2px_0px_#000]">
                      {validation.error}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Fluid Circular Ripple Wave Rings Radiating from Center */}
                  {isRevealed && isAnimating && (
                    <div
                      key={`ripple-${waterRippleKey}`}
                      className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden"
                    >
                      <div
                        className="absolute w-20 h-20 rounded-full border-2 border-[#2563eb]/40 dark:border-[#c084fc]/50 animate-water-ripple"
                        style={{ animationDelay: "0s" }}
                      />
                      <div
                        className="absolute w-20 h-20 rounded-full border-2 border-[#ffde59]/60 dark:border-[#c084fc]/30 animate-water-ripple"
                        style={{ animationDelay: "0.12s" }}
                      />
                      <div
                        className="absolute w-20 h-20 rounded-full border border-black/15 dark:border-white/20 animate-water-ripple"
                        style={{ animationDelay: "0.22s" }}
                      />
                    </div>
                  )}

                  {/* Rendered in background (opacity-0) until layout is ready, then revealed buttery-smooth */}
                  <div
                    ref={qrContainerRef}
                    className={cn(
                      "w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full rounded-xl relative z-10 transition-opacity duration-75",
                      isRevealed ? "opacity-100" : "opacity-0 pointer-events-none",
                      isAnimating && "qr-animating"
                    )}
                    dangerouslySetInnerHTML={{ __html: svgMarkup }}
                  />
                </>
              )}
            </div>

            {/* Density Notice */}
            {isDense && validation.isValid && (
              <div className="w-full mt-3.5 p-3 rounded-xl border-2 border-black dark:border-amber-700/60 bg-[#ffde59] dark:bg-amber-950/40 text-black dark:text-amber-300 text-xs flex items-center gap-2 shadow-[2px_2px_0px_#000]">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-[11px] leading-tight font-bold">
                  High payload density: Export at 1024px+ for distant camera scans.
                </span>
              </div>
            )}

            {/* Encoded payload info readout */}
            <div className="w-full mt-4 p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border-2 border-black dark:border-zinc-700 text-xs shadow-[2px_2px_0px_#000]">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-1 text-[11px] font-bold">
                <span>Payload Content</span>
              </div>
              <div className="font-mono text-black dark:text-white text-xs truncate font-bold">
                {summary || "—"}
              </div>
            </div>

            {/* PNG Resolution Selector */}
            <div className="w-full mt-4 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-700 dark:text-slate-300">PNG Resolution</span>
              <div className="flex items-center gap-1.5">
                {[512, 1024, 2048].map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setPngResolution(res)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-mono font-black border-2 border-black dark:border-zinc-700 transition-all",
                      pngResolution === res
                        ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black shadow-[2px_2px_0px_#000]"
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {res}px
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons: Solid Neo-Brutalist Tactile Buttons */}
            <div className="w-full grid grid-cols-2 gap-3 mt-4">
              {/* Blue Download PNG Button (matching "Sign up For Free" in screenshot) */}
              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload || isExporting || isGenerating}
                onClick={handleDownloadPng}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] dark:bg-[#c084fc] dark:hover:bg-[#a855f7] text-white dark:text-black text-xs font-black border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="h-4 w-4" />
                <span>Download PNG</span>
              </button>

              {/* Mint Green Export SVG Button */}
              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload || isExporting || isGenerating}
                onClick={handleDownloadSvg}
                className="w-full flex items-center justify-center gap-2 py-3 px-3 rounded-xl bg-[#05df72] hover:bg-[#04c263] text-black text-xs font-black border-2 border-black dark:border-zinc-700 shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
              >
                <Download className="h-4 w-4" />
                <span>Export SVG</span>
              </button>
            </div>

            {/* Copy to Clipboard Button */}
            <div className="w-full mt-3">
              <button
                type="button"
                disabled={!validation.isValid || !encodedPayload || isGenerating}
                onClick={handleCopy}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-800 text-black dark:text-white text-xs font-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none",
                  copied && "bg-[#ffde59] dark:bg-[#c084fc] dark:text-black"
                )}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-black animate-bounce" />
                    <span>Copied Image to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span>Copy to Clipboard</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
