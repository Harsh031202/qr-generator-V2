"use client";

import * as React from "react";
import {
  Header,
  type WorkspaceTab,
} from "@/components/layout/header";
import { Shell } from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  SegmentedControl,
  type SegmentOption,
} from "@/components/ui/segmented-control";
import {
  Globe,
  FileText,
  Wifi,
  Contact,
  Mail,
  CreditCard,
  Download,
  Copy,
  CheckCircle2,
  Sliders,
  Shield,
  Layers,
  AlertTriangle,
  Info,
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

import { UrlForm } from "@/components/editor/url-form";
import { TextForm } from "@/components/editor/text-form";
import { WifiForm } from "@/components/editor/wifi-form";
import { VCardForm } from "@/components/editor/vcard-form";
import { EmailForm } from "@/components/editor/email-form";
import { UpiForm } from "@/components/editor/upi-form";

const CONTENT_TYPE_OPTIONS: SegmentOption<keyof QRContentPayloadMap>[] = [
  { value: "url", label: "URL", icon: <Globe className="h-3.5 w-3.5" /> },
  { value: "text", label: "Text", icon: <FileText className="h-3.5 w-3.5" /> },
  { value: "wifi", label: "Wi-Fi", icon: <Wifi className="h-3.5 w-3.5" /> },
  { value: "vcard", label: "Contact", icon: <Contact className="h-3.5 w-3.5" /> },
  { value: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" /> },
  { value: "upi", label: "UPI", icon: <CreditCard className="h-3.5 w-3.5" /> },
];

const PATTERN_STYLES: SegmentOption<QRPatternStyle>[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
];

const ECC_LEVELS: SegmentOption<QRErrorCorrection>[] = [
  { value: "L", label: "L (7%)" },
  { value: "M", label: "M (15%)" },
  { value: "Q", label: "Q (25%)" },
  { value: "H", label: "H (30%)" },
];

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = React.useState<WorkspaceTab>("create");
  const [selectedType, setSelectedType] = React.useState<keyof QRContentPayloadMap>("url");

  // Normalized content data storage per type
  const [contents, setContents] = React.useState<QRContentPayloadMap>({
    url: { url: "https://github.com" },
    text: { text: "Hello from QR Studio!" },
    wifi: { ssid: "Studio_WiFi", password: "", security: "WPA", hidden: false },
    vcard: {
      firstName: "Alex",
      lastName: "Rivera",
      phone: "+1 555-0199",
      email: "alex@example.com",
      organization: "QR Studio",
      title: "Product Lead",
      url: "https://example.com",
    },
    email: {
      to: "contact@example.com",
      subject: "Hello from QR Studio",
      body: "Hi, I scanned your QR code and wanted to connect.",
    },
    upi: {
      pa: "merchant@okaxis",
      pn: "QR Studio Store",
      am: "150.00",
      tn: "Payment for order",
      cu: "INR",
    },
  });

  // Global appearance settings (preserved across content types)
  const [pattern, setPattern] = React.useState<QRPatternStyle>("square");
  const [ecc, setEcc] = React.useState<QRErrorCorrection>("M");
  const [margin, setMargin] = React.useState(3);
  const [fgColor, setFgColor] = React.useState("#0f172a");
  const [bgColor, setBgColor] = React.useState("#ffffff");

  // Output states
  const [copied, setCopied] = React.useState(false);
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);

  // Active handler and validation
  const currentHandler = QR_TYPE_HANDLERS[selectedType];
  const currentData = contents[selectedType];

  const validation = React.useMemo(() => {
    return currentHandler.validate(currentData as never);
  }, [currentHandler, currentData]);

  // Compute normalized encoded payload string
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

  // Scannability density check
  const isDense = React.useMemo(() => {
    return isHighDensityPayload(encodedPayload.length);
  }, [encodedPayload]);

  // Contrast calculation
  const contrastRatio = React.useMemo(() => {
    if (validateHexColor(fgColor) && validateHexColor(bgColor)) {
      return getContrastRatio(fgColor, bgColor);
    }
    return 21;
  }, [fgColor, bgColor]);

  const isLowContrast = contrastRatio < 3.0;

  // Real-time client-side QR generation
  React.useEffect(() => {
    let isCancelled = false;

    async function updateQR() {
      if (!encodedPayload || !validation.isValid) {
        setSvgMarkup("");
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
        }
      } catch {
        if (!isCancelled) {
          setSvgMarkup("");
        }
      }
    }

    updateQR();

    return () => {
      isCancelled = true;
    };
  }, [encodedPayload, validation.isValid, ecc, margin, fgColor, bgColor, pattern]);

  // Client-side SVG download
  const handleDownloadSvg = async () => {
    if (!encodedPayload || !validation.isValid || isExporting) return;
    setIsExporting(true);
    try {
      const svg = await generateQRSvg(encodedPayload, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      const filename = `qr-${selectedType}-${Date.now()}.svg`;
      downloadFile(svg, filename, "image/svg+xml");
    } finally {
      setIsExporting(false);
    }
  };

  // Client-side PNG download
  const handleDownloadPng = async () => {
    if (!encodedPayload || !validation.isValid || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateQRPngDataUrl(encodedPayload, 1024, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      const filename = `qr-${selectedType}-${Date.now()}.png`;
      downloadDataUrl(dataUrl, filename);
    } finally {
      setIsExporting(false);
    }
  };

  // Clipboard copy
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
      // Fallback: Copy raw payload string
      try {
        await navigator.clipboard.writeText(encodedPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  };

  // Content type form renderer
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
    <div className="flex min-h-screen flex-col bg-canvas text-foreground">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={0}
      />

      <Shell>
        {activeTab === "create" ? (
          <div className="flex flex-col gap-6">
            {/* Functional Workspace Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div>
                <h1 className="text-sm font-semibold tracking-tight text-foreground">
                  QR Studio Workspace
                </h1>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Real-time client-side QR generation and vector export
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isLowContrast ? (
                  <Badge variant="warning" dot>
                    Low Contrast ({contrastRatio.toFixed(1)}:1)
                  </Badge>
                ) : (
                  <Badge variant="subtle" dot>
                    Optimal Contrast ({contrastRatio.toFixed(1)}:1)
                  </Badge>
                )}
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Controls & Input Forms (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* 1. Content Type Selector & Active Form */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Content Type
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-1">
                    <SegmentedControl
                      options={CONTENT_TYPE_OPTIONS}
                      value={selectedType}
                      onChange={setSelectedType}
                      size="sm"
                    />
                  </div>

                  {/* Active Form */}
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    {renderActiveForm()}
                  </div>
                </div>

                {/* 2. Appearance & Geometry Controls */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-panel flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        Appearance & Geometry
                      </span>
                    </div>
                  </div>

                  {/* Pattern & Error Correction */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label hint="Module shape">Pattern Style</Label>
                      <SegmentedControl
                        options={PATTERN_STYLES}
                        value={pattern}
                        onChange={setPattern}
                        size="sm"
                        fullWidth
                      />
                    </div>

                    <div>
                      <Label hint="Reed-Solomon redundancy">Error Correction</Label>
                      <SegmentedControl
                        options={ECC_LEVELS}
                        value={ecc}
                        onChange={setEcc}
                        size="sm"
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* Margin / Quiet Zone Slider */}
                  <div className="pt-2">
                    <Slider
                      label="Quiet Zone (Margin)"
                      value={margin}
                      min={1}
                      max={6}
                      step={1}
                      unit=" modules"
                      onChange={setMargin}
                    />
                  </div>

                  {/* Color Controls */}
                  <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label hint="Hex code or picker">Foreground Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={fgColor}
                          onChange={(e) => setFgColor(e.target.value)}
                          className="h-9 w-10 p-0.5 rounded border border-border-default bg-surface cursor-pointer"
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
                      <Label hint="Hex code or picker">Background Color</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => setBgColor(e.target.value)}
                          className="h-9 w-10 p-0.5 rounded border border-border-default bg-surface cursor-pointer"
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

                  {isLowContrast && (
                    <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Low contrast between foreground and background may cause cameras to fail scanning.
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Live QR Preview & Actions (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20">
                <div className="rounded-xl border border-border-subtle bg-surface p-5 shadow-panel flex flex-col items-center">
                  {/* Canvas Header */}
                  <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        Live Preview
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Badge variant={validation.isValid && svgMarkup ? "default" : "warning"} dot>
                        {validation.isValid && svgMarkup ? "Generated" : "Incomplete Input"}
                      </Badge>
                      <span className="font-mono text-[11px] text-foreground-muted">
                        Vector SVG
                      </span>
                    </div>
                  </div>

                  {/* QR Canvas Frame */}
                  <div className="relative flex items-center justify-center w-full aspect-square max-w-[340px] rounded-lg border border-border-subtle bg-canvas-subtle p-6 overflow-hidden">
                    {validation.isValid && svgMarkup ? (
                      <div
                        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full rounded-md shadow-subtle overflow-hidden transition-all duration-150"
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                      />
                    ) : (
                      <div className="text-center p-6 flex flex-col items-center justify-center gap-2">
                        <div className="h-10 w-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-foreground-muted">
                          <Info className="h-5 w-5" />
                        </div>
                        <p className="text-xs text-foreground-secondary font-medium mt-1">
                          Complete required fields to generate QR
                        </p>
                        {validation.error ? (
                          <p className="text-[11px] text-status-danger max-w-[220px]">
                            {validation.error}
                          </p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Density Warning Banner if applicable */}
                  {isDense && validation.isValid && (
                    <div className="w-full mt-3 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span className="text-[11px] leading-tight">
                        This QR contains a lot of data and may be harder to scan at smaller sizes.
                      </span>
                    </div>
                  )}

                  {/* Payload readout */}
                  <div className="w-full mt-4 p-2.5 rounded-lg bg-canvas-subtle border border-border-subtle text-xs">
                    <div className="flex items-center justify-between text-foreground-muted mb-1 text-[11px]">
                      <span>Encoded Content</span>
                      <span className="font-mono">
                        {encodedPayload ? `${encodedPayload.length} chars` : "0 chars"}
                      </span>
                    </div>
                    <div className="font-mono text-foreground text-xs truncate">
                      {summary || "—"}
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={!validation.isValid || !encodedPayload || isExporting}
                      onClick={handleDownloadPng}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download PNG
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={!validation.isValid || !encodedPayload || isExporting}
                      onClick={handleDownloadSvg}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Export SVG
                    </Button>
                  </div>

                  <div className="w-full mt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled={!validation.isValid || !encodedPayload}
                      onClick={handleCopy}
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                          Copied to Clipboard
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5 mr-1.5" />
                          Copy Image
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Privacy Architecture Notice */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 text-xs">
                  <div className="flex items-center gap-2 mb-1 text-foreground font-medium">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Pure Browser Execution</span>
                  </div>
                  <p className="text-foreground-secondary text-[11px] leading-relaxed">
                    QR matrix generation and visual styling occur strictly client-side. No URL or user data is ever sent to a server.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "scan" ? (
          <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center max-w-lg mx-auto my-12 shadow-panel">
            <div className="mx-auto h-12 w-12 rounded-full bg-canvas-subtle border border-border-subtle flex items-center justify-center mb-4">
              <Layers className="h-5 w-5 text-foreground-secondary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              QR Scanner
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 max-w-xs mx-auto">
              Scan QR codes using your device camera or upload image files.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => setActiveTab("create")}
            >
              Return to Generator
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center max-w-lg mx-auto my-12 shadow-panel">
            <div className="mx-auto h-12 w-12 rounded-full bg-canvas-subtle border border-border-subtle flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-foreground-secondary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Local History
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 max-w-xs mx-auto">
              Recently generated QR codes will be stored locally on this device.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => setActiveTab("create")}
            >
              Return to Generator
            </Button>
          </div>
        )}
      </Shell>
    </div>
  );
}
