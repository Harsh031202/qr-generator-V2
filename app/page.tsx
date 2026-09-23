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
  RotateCcw,
  ChevronDown,
  ChevronUp,
  QrCode as QrIcon,
  HelpCircle,
} from "lucide-react";

import type {
  QRContentType,
  QRPatternStyle,
  QRCornerStyle,
  QRErrorCorrection,
  QROutputSize,
  QRLogoConfig,
  QRVerificationResult,
} from "@/types/qr";
import type { QRContentPayloadMap } from "@/lib/qr/encoder";
import { QR_TYPE_HANDLERS } from "@/lib/qr/content-registry";
import { validateHexColor, isHighDensityPayload } from "@/lib/validation/qr-validators";
import {
  generateQRSvg,
  generateQRPngDataUrl,
  verifyQRCode,
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
import { LogoUpload } from "@/components/editor/logo-upload";

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

const CORNER_STYLES: SegmentOption<QRCornerStyle>[] = [
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
];

const ECC_LEVELS: SegmentOption<QRErrorCorrection>[] = [
  { value: "L", label: "L (7%)" },
  { value: "M", label: "M (15%)" },
  { value: "Q", label: "Q (25%)" },
  { value: "H", label: "H (30%)" },
];

const OUTPUT_SIZES: SegmentOption<string>[] = [
  { value: "256", label: "256px" },
  { value: "512", label: "512px" },
  { value: "1024", label: "1024px" },
  { value: "2048", label: "2048px" },
];

const DEFAULT_APPEARANCE = {
  pattern: "square" as QRPatternStyle,
  cornerStyle: "square" as QRCornerStyle,
  ecc: "M" as QRErrorCorrection,
  margin: 3,
  fgColor: "#0f172a",
  bgColor: "#ffffff",
  outputSize: 512 as QROutputSize,
  logo: undefined as QRLogoConfig | undefined,
};

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = React.useState<WorkspaceTab>("create");
  const [selectedType, setSelectedType] = React.useState<keyof QRContentPayloadMap>("url");

  // Normalized content data per type (starts empty with placeholders)
  const [contents, setContents] = React.useState<QRContentPayloadMap>({
    url: { url: "" },
    text: { text: "" },
    wifi: { ssid: "", password: "", security: "WPA", hidden: false },
    vcard: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      organization: "",
      title: "",
      url: "",
    },
    email: {
      to: "",
      subject: "",
      body: "",
    },
    upi: {
      pa: "",
      pn: "",
      am: "",
      tn: "",
      cu: "INR",
    },
  });

  // Global appearance settings
  const [pattern, setPattern] = React.useState<QRPatternStyle>(DEFAULT_APPEARANCE.pattern);
  const [cornerStyle, setCornerStyle] = React.useState<QRCornerStyle>(DEFAULT_APPEARANCE.cornerStyle);
  const [ecc, setEcc] = React.useState<QRErrorCorrection>(DEFAULT_APPEARANCE.ecc);
  const [margin, setMargin] = React.useState(DEFAULT_APPEARANCE.margin);
  const [fgColor, setFgColor] = React.useState(DEFAULT_APPEARANCE.fgColor);
  const [bgColor, setBgColor] = React.useState(DEFAULT_APPEARANCE.bgColor);
  const [outputSize, setOutputSize] = React.useState<QROutputSize>(DEFAULT_APPEARANCE.outputSize);
  const [logo, setLogo] = React.useState<QRLogoConfig | undefined>(undefined);

  // Progressive disclosure toggle for advanced customization
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  // Output and feedback states
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");
  const [copied, setCopied] = React.useState(false);
  const [downloadedFormat, setDownloadedFormat] = React.useState<string | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

  // Verification state
  const [verificationResult, setVerificationResult] = React.useState<QRVerificationResult>({
    status: "idle",
    contrastRatio: 21,
    isGoodContrast: true,
  });
  const [isVerifying, setIsVerifying] = React.useState(false);

  // Active handler and validation
  const currentHandler = QR_TYPE_HANDLERS[selectedType];
  const currentData = contents[selectedType];

  const validation = React.useMemo(() => {
    return currentHandler.validate(currentData as never);
  }, [currentHandler, currentData]);

  // Compute canonical encoded payload
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

  const isGoodContrast = contrastRatio >= 3.0;

  // Real-time client-side vector SVG generation
  React.useEffect(() => {
    let isCancelled = false;

    async function updateQR() {
      if (!encodedPayload || !validation.isValid) {
        setSvgMarkup("");
        setVerificationResult({
          status: "idle",
          contrastRatio,
          isGoodContrast,
        });
        return;
      }

      try {
        const svg = await generateQRSvg(encodedPayload, {
          errorCorrection: ecc,
          margin,
          foregroundColor: fgColor,
          backgroundColor: bgColor,
          pattern,
          cornerStyle,
          logo,
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
  }, [
    encodedPayload,
    validation.isValid,
    ecc,
    margin,
    fgColor,
    bgColor,
    pattern,
    cornerStyle,
    logo,
    contrastRatio,
    isGoodContrast,
  ]);

  // Asynchronous verification pipeline
  React.useEffect(() => {
    let isCancelled = false;

    async function runVerification() {
      if (!encodedPayload || !validation.isValid) return;

      setIsVerifying(true);

      const result = await verifyQRCode(encodedPayload, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        pattern,
        cornerStyle,
        logo,
      });

      if (!isCancelled) {
        setVerificationResult(result);
        setIsVerifying(false);
      }
    }

    // Debounce verification slightly so fast typing doesn't run redundant decodes
    const timer = setTimeout(() => {
      runVerification();
    }, 180);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [
    encodedPayload,
    validation.isValid,
    ecc,
    margin,
    fgColor,
    bgColor,
    pattern,
    cornerStyle,
    logo,
  ]);

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
        pattern,
        cornerStyle,
        logo,
      });
      const filename = `qr-${selectedType}-${Date.now()}.svg`;
      downloadFile(svg, filename, "image/svg+xml");
      setDownloadedFormat("svg");
      setTimeout(() => setDownloadedFormat(null), 2000);
    } finally {
      setIsExporting(false);
    }
  };

  // Client-side PNG download
  const handleDownloadPng = async () => {
    if (!encodedPayload || !validation.isValid || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateQRPngDataUrl(encodedPayload, outputSize, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        pattern,
        cornerStyle,
        logo,
      });
      const filename = `qr-${selectedType}-${outputSize}px-${Date.now()}.png`;
      downloadDataUrl(dataUrl, filename);
      setDownloadedFormat("png");
      setTimeout(() => setDownloadedFormat(null), 2000);
    } finally {
      setIsExporting(false);
    }
  };

  // Clipboard copy action with image blob and text fallback
  const handleCopy = async () => {
    if (!encodedPayload || !validation.isValid) return;
    try {
      const dataUrl = await generateQRPngDataUrl(encodedPayload, outputSize, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
        pattern,
        cornerStyle,
        logo,
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
      // Fallback: Copy raw payload text
      try {
        await navigator.clipboard.writeText(encodedPayload);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
    }
  };

  // Reset appearance settings to defaults
  const handleResetAppearance = () => {
    setPattern(DEFAULT_APPEARANCE.pattern);
    setCornerStyle(DEFAULT_APPEARANCE.cornerStyle);
    setEcc(DEFAULT_APPEARANCE.ecc);
    setMargin(DEFAULT_APPEARANCE.margin);
    setFgColor(DEFAULT_APPEARANCE.fgColor);
    setBgColor(DEFAULT_APPEARANCE.bgColor);
    setOutputSize(DEFAULT_APPEARANCE.outputSize);
    setLogo(undefined);
  };

  // Primary preview status badge logic
  const renderPrimaryStatus = () => {
    if (!encodedPayload || !validation.isValid) {
      return (
        <Badge variant="subtle" className="text-foreground-muted">
          No content
        </Badge>
      );
    }

    if (isVerifying) {
      return (
        <Badge variant="default" dot>
          Verifying...
        </Badge>
      );
    }

    if (!isGoodContrast) {
      return (
        <Badge variant="warning" dot title={`Contrast: ${contrastRatio.toFixed(1)}:1`}>
          ⚠ Low contrast
        </Badge>
      );
    }

    if (verificationResult.status === "verified") {
      return (
        <Badge variant="success" dot title="Decoded and verified successfully">
          ✓ Verified
        </Badge>
      );
    }

    if (verificationResult.status === "failed") {
      return (
        <Badge variant="danger" dot title="Could not decode generated QR reliably">
          ⚠ Verification failed
        </Badge>
      );
    }

    return (
      <Badge variant="default" dot>
        Ready
      </Badge>
    );
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
                  Client-side QR creation, customization, and verification
                </p>
              </div>

              <div className="flex items-center gap-2">
                {isGoodContrast ? (
                  <span
                    className="inline-flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 select-none"
                    title={`WCAG contrast: ${contrastRatio.toFixed(1)}:1`}
                  >
                    ✓ Good contrast
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center text-xs font-medium text-amber-600 dark:text-amber-400 select-none"
                    title={`WCAG contrast: ${contrastRatio.toFixed(1)}:1`}
                  >
                    ⚠ Low contrast
                  </span>
                )}
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Controls & Input Forms (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5 order-1">
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
                        Appearance
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleResetAppearance}
                      className="text-xs text-foreground-muted hover:text-foreground inline-flex items-center gap-1 transition-colors"
                      title="Reset colors, pattern, margin, and logo to defaults"
                    >
                      <RotateCcw className="h-3 w-3" />
                      <span>Reset appearance</span>
                    </button>
                  </div>

                  {/* Pattern Selection */}
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

                  {/* Colors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label hint="Hex value or picker">Foreground</Label>
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
                      <Label hint="Hex value or picker">Background</Label>
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

                  {/* Non-blocking low contrast warning */}
                  {!isGoodContrast && (
                    <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <span>
                        Low contrast — scanning may be less reliable in low-light environments.
                      </span>
                    </div>
                  )}

                  {/* Progressive Disclosure: Advanced Settings Accordion */}
                  <div className="pt-2 border-t border-border-subtle">
                    <button
                      type="button"
                      onClick={() => setShowAdvanced(!showAdvanced)}
                      className="w-full flex items-center justify-between text-xs font-medium text-foreground py-1 hover:text-foreground-secondary transition-colors"
                      aria-expanded={showAdvanced}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>Advanced Customization</span>
                        {logo ? (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                        ) : null}
                      </span>
                      {showAdvanced ? (
                        <ChevronUp className="h-4 w-4 text-foreground-muted" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-foreground-muted" />
                      )}
                    </button>

                    {showAdvanced && (
                      <div className="flex flex-col gap-4 pt-3.5">
                        {/* Corner / Finder Style */}
                        <div>
                          <Label hint="3 position detection patterns">Corner Style</Label>
                          <SegmentedControl
                            options={CORNER_STYLES}
                            value={cornerStyle}
                            onChange={setCornerStyle}
                            size="sm"
                            fullWidth
                          />
                        </div>

                        {/* Error Correction & Output Size */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <Label className="mb-0">Error Correction</Label>
                              <span
                                className="text-[11px] text-foreground-muted inline-flex items-center gap-0.5 cursor-help"
                                title="Higher error correction allows the QR to remain readable after partial damage or logo insertion, but creates a denser QR."
                              >
                                <HelpCircle className="h-3 w-3" />
                              </span>
                            </div>
                            <SegmentedControl
                              options={ECC_LEVELS}
                              value={ecc}
                              onChange={setEcc}
                              size="sm"
                              fullWidth
                            />
                          </div>

                          <div>
                            <Label hint="For PNG downloads">Export Size</Label>
                            <SegmentedControl
                              options={OUTPUT_SIZES}
                              value={String(outputSize)}
                              onChange={(val) => setOutputSize(Number(val) as QROutputSize)}
                              size="sm"
                              fullWidth
                            />
                          </div>
                        </div>

                        {/* Quiet Zone Slider */}
                        <div>
                          <Slider
                            label="Quiet Zone"
                            value={margin}
                            min={1}
                            max={6}
                            step={1}
                            unit=" modules"
                            onChange={setMargin}
                          />
                          <span className="text-[11px] text-foreground-muted mt-0.5 block">
                            Whitespace border around the QR code required by scanners.
                          </span>
                        </div>

                        {/* Center Logo Upload */}
                        <div className="pt-2 border-t border-border-subtle">
                          <LogoUpload
                            logo={logo}
                            onChange={setLogo}
                            errorCorrection={ecc}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Live QR Preview & Actions (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4 sticky top-20 order-2">
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
                      {renderPrimaryStatus()}
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
                      <div className="text-center p-6 flex flex-col items-center justify-center gap-2 select-none">
                        <div className="h-10 w-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-foreground-muted">
                          <QrIcon className="h-5 w-5" />
                        </div>
                        <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                          QR Preview
                        </span>
                        <p className="text-xs text-foreground-secondary font-medium">
                          Your QR code will appear here.
                        </p>
                        <p className="text-[11px] text-foreground-muted">
                          Enter some content to get started.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Density Warning Banner if applicable */}
                  {isDense && validation.isValid && (
                    <div className="w-full mt-3 p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      <div className="flex flex-col">
                        <span className="font-medium text-[11px]">⚠ Dense QR</span>
                        <span className="text-[11px] leading-tight text-amber-600/90 dark:text-amber-400/90">
                          This code contains a lot of data and may be harder to scan at smaller sizes.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Technical Metadata readout beneath preview */}
                  <div className="w-full mt-3 p-2.5 rounded-lg bg-canvas-subtle border border-border-subtle text-xs flex flex-col gap-1.5">
                    <div className="flex items-center justify-between text-[11px] text-foreground-muted font-mono">
                      <span>{outputSize} × {outputSize}</span>
                      <span>ECC: {ecc}</span>
                      <span>Margin: {margin}</span>
                    </div>

                    {validation.isValid && encodedPayload ? (
                      <div className="pt-1.5 border-t border-border-subtle/80 flex items-center justify-between text-[11px]">
                        <span className="text-foreground-muted truncate max-w-[200px]" title={summary}>
                          {summary}
                        </span>
                        <span
                          className={`font-medium ${
                            verificationResult.status === "verified"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : verificationResult.status === "failed"
                              ? "text-status-danger"
                              : "text-foreground-muted"
                          }`}
                        >
                          {verificationResult.status === "verified"
                            ? "Decodes correctly"
                            : verificationResult.status === "failed"
                            ? "Decoding failed"
                            : isVerifying
                            ? "Verifying..."
                            : "Ready"}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  {/* Export Actions */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={!validation.isValid || !encodedPayload || isExporting}
                      onClick={handleDownloadPng}
                    >
                      {downloadedFormat === "png" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                          Downloaded
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Download PNG
                        </>
                      )}
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={!validation.isValid || !encodedPayload || isExporting}
                      onClick={handleDownloadSvg}
                    >
                      {downloadedFormat === "svg" ? (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-500" />
                          Exported SVG
                        </>
                      ) : (
                        <>
                          <Download className="h-3.5 w-3.5 mr-1.5" />
                          Export SVG
                        </>
                      )}
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
                    Custom module rendering, logo placement, and scan verification occur strictly client-side in your browser.
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
