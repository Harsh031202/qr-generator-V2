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
  Palette,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import type { QRContentType, QRPatternStyle, QRErrorCorrection } from "@/types/qr";

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

  const handleCopyMock = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
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
            {/* Workspace Banner / Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-subtle">
              <div>
                <h1 className="text-base font-semibold tracking-tight text-foreground">
                  QR Studio Workspace
                </h1>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Phase 1 Foundation: Architecture, Layout & Design System
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" dot>
                  Design System Active
                </Badge>
                <Badge variant="subtle">
                  Client-Side Engine
                </Badge>
              </div>
            </div>

            {/* Split Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* LEFT COLUMN: Controls & Configuration (7 cols) */}
              <div className="lg:col-span-7 flex flex-col gap-5">
                {/* 1. Content Type Switcher */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-panel">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Content Type
                    </span>
                    <span className="text-[11px] text-foreground-muted">
                      Standard Compliant
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

                  {/* Active Type Form Field Preview */}
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <Label required hint="Must include http:// or https://">
                      Target Destination URL
                    </Label>
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="https://example.com"
                      mono
                      startAdornment={<Globe className="h-4 w-4" />}
                    />
                  </div>
                </div>

                {/* 2. Appearance & Customization */}
                <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-panel flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                    <div className="flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-foreground-secondary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                        Appearance & Geometry
                      </span>
                    </div>
                    <Badge variant="subtle">Vector Precision</Badge>
                  </div>

                  {/* Pattern Selection */}
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
                      <Label hint="Reed-Solomon recovery">Error Correction</Label>
                      <SegmentedControl
                        options={ECC_LEVELS}
                        value={ecc}
                        onChange={setEcc}
                        size="sm"
                        fullWidth
                      />
                    </div>
                  </div>

                  {/* Quiet Zone Slider */}
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

                  {/* Color Palette Controls */}
                  <div className="pt-3 border-t border-border-subtle grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label hint="Hex or picker">Foreground Color</Label>
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
                      <Label hint="Hex or picker">Background Color</Label>
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
                </div>

                {/* 3. Design System Tokens & Primitives Inspector */}
                <div className="rounded-xl border border-border-subtle bg-surface/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="h-4 w-4 text-foreground-secondary" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                      Design System Verification
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border border-border-subtle bg-surface flex flex-col gap-1">
                      <span className="text-[10px] text-foreground-muted font-mono">
                        Primary Button
                      </span>
                      <Button variant="primary" size="sm" className="w-full">
                        Action
                      </Button>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border-subtle bg-surface flex flex-col gap-1">
                      <span className="text-[10px] text-foreground-muted font-mono">
                        Secondary
                      </span>
                      <Button variant="secondary" size="sm" className="w-full">
                        Outline
                      </Button>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border-subtle bg-surface flex flex-col gap-1">
                      <span className="text-[10px] text-foreground-muted font-mono">
                        Ghost
                      </span>
                      <Button variant="ghost" size="sm" className="w-full">
                        Cancel
                      </Button>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border-subtle bg-surface flex flex-col gap-1">
                      <span className="text-[10px] text-foreground-muted font-mono">
                        Danger
                      </span>
                      <Button variant="danger" size="sm" className="w-full">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Live QR Preview & Action Area (5 cols) */}
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
                      <Badge variant="success" dot>
                        Scannable
                      </Badge>
                      <span className="font-mono text-[11px] text-foreground-muted">
                        512 × 512
                      </span>
                    </div>
                  </div>

                  {/* QR Canvas Frame */}
                  <div className="relative flex items-center justify-center w-full aspect-square max-w-[340px] rounded-lg border border-border-subtle bg-canvas-subtle p-6">
                    {/* Visual QR Simulation for Phase 1 Wireframe */}
                    <div
                      className="w-full h-full rounded-md shadow-subtle p-5 flex flex-col items-center justify-between transition-all"
                      style={{ backgroundColor: bgColor, color: fgColor }}
                    >
                      {/* Top Eyes */}
                      <div className="w-full flex justify-between">
                        <div
                          className="h-12 w-12 border-4 rounded-sm flex items-center justify-center p-1.5"
                          style={{ borderColor: fgColor }}
                        >
                          <div
                            className="h-5 w-5 rounded-xs"
                            style={{ backgroundColor: fgColor }}
                          />
                        </div>
                        <div
                          className="h-12 w-12 border-4 rounded-sm flex items-center justify-center p-1.5"
                          style={{ borderColor: fgColor }}
                        >
                          <div
                            className="h-5 w-5 rounded-xs"
                            style={{ backgroundColor: fgColor }}
                          />
                        </div>
                      </div>

                      {/* Middle Matrix Simulation */}
                      <div className="w-full py-2 flex flex-col gap-1 items-center justify-center opacity-85 font-mono text-[10px]">
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-4 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-6 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: fgColor }} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-5 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-3 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-4 rounded-xs" style={{ backgroundColor: fgColor }} />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="h-2 w-3 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-6 rounded-xs" style={{ backgroundColor: fgColor }} />
                          <span className="h-2 w-2 rounded-xs" style={{ backgroundColor: fgColor }} />
                        </div>
                      </div>

                      {/* Bottom Eye & Info */}
                      <div className="w-full flex justify-between items-end">
                        <div
                          className="h-12 w-12 border-4 rounded-sm flex items-center justify-center p-1.5"
                          style={{ borderColor: fgColor }}
                        >
                          <div
                            className="h-5 w-5 rounded-xs"
                            style={{ backgroundColor: fgColor }}
                          />
                        </div>
                        <div className="text-[10px] font-mono text-right opacity-60">
                          ECC {ecc} • {pattern}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Payload readout */}
                  <div className="w-full mt-4 p-2.5 rounded-lg bg-canvas-subtle border border-border-subtle text-xs">
                    <div className="flex items-center justify-between text-foreground-muted mb-1 text-[11px]">
                      <span>Encoded Content</span>
                      <span className="font-mono">{urlInput.length} chars</span>
                    </div>
                    <div className="font-mono text-foreground text-xs truncate">
                      {urlInput || "Empty payload"}
                    </div>
                  </div>

                  {/* Export & Clipboard Action Suite */}
                  <div className="w-full grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="primary"
                      className="w-full"
                      onClick={() => alert("Phase 1 verified: PNG export hook ready for Phase 6")}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Download PNG
                    </Button>

                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => alert("Phase 1 verified: Vector SVG export hook ready for Phase 6")}
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      Export SVG
                    </Button>
                  </div>

                  <div className="w-full mt-2">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleCopyMock}
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

                {/* Privacy & Engine Architecture Notice */}
                <div className="rounded-xl border border-border-subtle bg-surface/50 p-4 text-xs">
                  <div className="flex items-center gap-2 mb-1 text-foreground font-medium">
                    <Shield className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Pure Browser Execution</span>
                  </div>
                  <p className="text-foreground-secondary text-[11px] leading-relaxed">
                    All matrix generation and visual styling occur strictly client-side. No URL or user data is ever sent to a server.
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
              Scanner Module
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 max-w-xs mx-auto">
              Camera scanning and drag-and-drop image decoding will be connected in Phase 8.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => setActiveTab("create")}
            >
              Return to Workspace
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-border-subtle bg-surface p-12 text-center max-w-lg mx-auto my-12 shadow-panel">
            <div className="mx-auto h-12 w-12 rounded-full bg-canvas-subtle border border-border-subtle flex items-center justify-center mb-4">
              <Shield className="h-5 w-5 text-foreground-secondary" />
            </div>
            <h2 className="text-sm font-semibold text-foreground">
              Local History Module
            </h2>
            <p className="text-xs text-foreground-secondary mt-1 max-w-xs mx-auto">
              IndexedDB local storage will be wired in Phase 7.
            </p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-5"
              onClick={() => setActiveTab("create")}
            >
              Return to Workspace
            </Button>
          </div>
        )}
      </Shell>
    </div>
  );
}
