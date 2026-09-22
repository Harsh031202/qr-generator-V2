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
} from "lucide-react";
import type { QRContentType, QRPatternStyle, QRErrorCorrection } from "@/types/qr";
import { validateUrl, validateHexColor } from "@/lib/validation/qr-validators";
import {
  generateQRSvg,
  generateQRPngDataUrl,
  downloadFile,
  downloadDataUrl,
  getContrastRatio,
} from "@/lib/qr/generator";

const CONTENT_TYPES: SegmentOption<QRContentType>[] = [
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
  const [selectedType, setSelectedType] = React.useState<QRContentType>("url");
  const [urlInput, setUrlInput] = React.useState("https://github.com");
  const [pattern, setPattern] = React.useState<QRPatternStyle>("square");
  const [ecc, setEcc] = React.useState<QRErrorCorrection>("M");
  const [margin, setMargin] = React.useState(3);
  const [fgColor, setFgColor] = React.useState("#0f172a");
  const [bgColor, setBgColor] = React.useState("#ffffff");
  const [copied, setCopied] = React.useState(false);
  const [svgMarkup, setSvgMarkup] = React.useState<string>("");
  const [isExporting, setIsExporting] = React.useState(false);

  // Validate URL with decoupled functional validator
  const urlValidation = React.useMemo(() => {
    return validateUrl(urlInput);
  }, [urlInput]);

  // Compute contrast ratio to ensure scannability
  const contrastRatio = React.useMemo(() => {
    if (validateHexColor(fgColor) && validateHexColor(bgColor)) {
      return getContrastRatio(fgColor, bgColor);
    }
    return 21;
  }, [fgColor, bgColor]);

  const isLowContrast = contrastRatio < 3.0;

  // Real-time client-side SVG generation
  React.useEffect(() => {
    let isCancelled = false;

    async function updateQR() {
      if (!urlInput.trim()) {
        setSvgMarkup("");
        return;
      }

      try {
        const svg = await generateQRSvg(urlInput.trim(), {
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
  }, [urlInput, ecc, margin, fgColor, bgColor, pattern]);

  // Client-side SVG download
  const handleDownloadSvg = async () => {
    if (!urlInput.trim() || isExporting) return;
    setIsExporting(true);
    try {
      const svg = await generateQRSvg(urlInput.trim(), {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      downloadFile(svg, "qr-studio-code.svg", "image/svg+xml");
    } finally {
      setIsExporting(false);
    }
  };

  // Client-side PNG download
  const handleDownloadPng = async () => {
    if (!urlInput.trim() || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await generateQRPngDataUrl(urlInput.trim(), 1024, {
        errorCorrection: ecc,
        margin,
        foregroundColor: fgColor,
        backgroundColor: bgColor,
      });
      downloadDataUrl(dataUrl, "qr-studio-code.png");
    } finally {
      setIsExporting(false);
    }
  };

  // Clipboard copy
  const handleCopy = async () => {
    if (!urlInput.trim()) return;
    try {
      const dataUrl = await generateQRPngDataUrl(urlInput.trim(), 512, {
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
      // Fallback to copying URL string
      try {
        await navigator.clipboard.writeText(urlInput.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // clipboard unavailable
      }
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
            {/* Clean Functional Workspace Toolbar */}
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
                  <Badge variant="success" dot>
                    Contrast Optimal ({contrastRatio.toFixed(1)}:1)
                  </Badge>
                )}
              </div>
            </div>

            {/* Split Workspace Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Configuration Panels (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* Content Configuration */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Content Type
                    </span>
                  </div>

                  <div className="overflow-x-auto pb-1">
                    <SegmentedControl
                      options={CONTENT_TYPES}
                      value={selectedType}
                      onChange={setSelectedType}
                      size="sm"
                    />
                  </div>

                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <Label required hint="http:// or https:// required">
                      Target Destination URL
                    </Label>
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      mono
                      error={!urlValidation.isValid ? urlValidation.error : undefined}
                      startAdornment={<Globe className="h-4 w-4" />}
                    />
                    {!urlValidation.isValid && urlValidation.error ? (
                      <p className="mt-1.5 text-xs text-status-danger">
                        {urlValidation.error}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Appearance & Geometry Panel */}
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

                  {/* Foreground & Background Colors */}
                  <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label hint="Hex value or picker">Foreground Color</Label>
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
                      <Label hint="Hex value or picker">Background Color</Label>
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
                      <Badge variant={urlValidation.isValid ? "success" : "warning"} dot>
                        {urlValidation.isValid ? "Scannable" : "Invalid Input"}
                      </Badge>
                      <span className="font-mono text-[11px] text-foreground-muted">
                        Vector SVG
                      </span>
                    </div>
                  </div>

                  {/* QR Canvas Frame */}
                  <div className="relative flex items-center justify-center w-full aspect-square max-w-[340px] rounded-lg border border-border-subtle bg-canvas-subtle p-6 overflow-hidden">
                    {svgMarkup ? (
                      <div
                        className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full rounded-md shadow-subtle overflow-hidden"
                        dangerouslySetInnerHTML={{ __html: svgMarkup }}
                      />
                    ) : (
                      <div className="text-center p-6">
                        <p className="text-xs text-foreground-secondary">
                          Enter content to generate QR code
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Payload readout */}
                  <div className="w-full mt-4 p-2.5 rounded-lg bg-canvas-subtle border border-border-subtle text-xs">
                    <div className="flex items-center justify-between text-foreground-muted mb-1 text-[11px]">
                      <span>Encoded Payload</span>
                      <span className="font-mono">{urlInput.length} chars</span>
                    </div>
                    <div className="font-mono text-foreground text-xs truncate">
                      {urlInput || "—"}
                    </div>
                  </div>

                  {/* Export Actions */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      disabled={!urlValidation.isValid || isExporting}
                      onClick={handleDownloadPng}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download PNG
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      disabled={!urlValidation.isValid || isExporting}
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
                      disabled={!urlValidation.isValid}
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
