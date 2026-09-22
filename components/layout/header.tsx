"use client";

import * as React from "react";
import { QrCode, ScanLine, History, ShieldCheck } from "lucide-react";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "create" | "scan" | "history";

interface HeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  historyCount?: number;
}

export function Header({
  activeTab,
  onTabChange,
  historyCount = 0,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-13 w-full items-center justify-between border-b border-border-subtle bg-surface px-4 sm:px-6">
      {/* Brand & Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-canvas font-mono font-bold text-xs shadow-subtle select-none">
            QR
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground select-none">
            QR Studio
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav
        role="tablist"
        aria-label="Workspace views"
        className="flex items-center gap-1 rounded-lg bg-canvas-subtle p-1 border border-border-subtle"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "create"}
          onClick={() => onTabChange("create")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all select-none",
            activeTab === "create"
              ? "bg-surface text-foreground shadow-subtle font-semibold"
              : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
          )}
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>Create</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "scan"}
          onClick={() => onTabChange("scan")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all select-none",
            activeTab === "scan"
              ? "bg-surface text-foreground shadow-subtle font-semibold"
              : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
          )}
        >
          <ScanLine className="h-3.5 w-3.5" />
          <span>Scan</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => onTabChange("history")}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all select-none",
            activeTab === "history"
              ? "bg-surface text-foreground shadow-subtle font-semibold"
              : "text-foreground-secondary hover:text-foreground hover:bg-surface/50"
          )}
        >
          <History className="h-3.5 w-3.5" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="ml-0.5 rounded-full bg-border-subtle px-1.5 py-0.2 text-[10px] font-mono">
              {historyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Utilities & Privacy Guarantee */}
      <div className="flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] text-foreground-muted bg-canvas-subtle border border-border-subtle font-mono select-none">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Browser-Only</span>
        </div>

        <div className="h-4 w-px bg-border-subtle hidden sm:block" />

        <ThemeToggle />
      </div>
    </header>
  );
}
