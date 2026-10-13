"use client";

import * as React from "react";
import {
  QrCode,
  ScanLine,
  History,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { FlatQrStudioIcon } from "../ui/flaticon-icons";
import { ThemeToggle } from "../ui/theme-toggle";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "generator" | "scanner" | "history";

interface SneatHeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  historyCount?: number;
}

export function SneatHeader({
  activeTab,
  onTabChange,
  historyCount = 0,
}: SneatHeaderProps) {
  return (
    <header className="sticky top-3 z-40 mb-6 flex h-16 w-full items-center justify-between rounded-2xl bg-surface/90 backdrop-blur-md px-4 sm:px-6 shadow-sm border border-border-subtle transition-all duration-300">
      {/* Brand Identity */}
      <div className="flex items-center gap-3 select-none">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => onTabChange("generator")}
        >
          {/* Rich Flaticon Logo */}
          <div className="transition-transform duration-300 group-hover:scale-105 active:scale-95">
            <FlatQrStudioIcon size={38} />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#566a7f] dark:text-white">
                QR Studio
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20">
                PRO
              </span>
            </div>
            <span className="text-[10px] text-[#8592a3] hidden sm:block">
              Vector QR Suite
            </span>
          </div>
        </div>
      </div>

      {/* Pill-shaped Workspace Navigation Tabs (Sneat style) */}
      <nav
        role="tablist"
        aria-label="Workspace views"
        className="flex items-center gap-1 rounded-xl bg-canvas p-1 border border-border-subtle select-none"
      >
        {/* Generator Tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "generator"}
          onClick={() => onTabChange("generator")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95",
            activeTab === "generator"
              ? "bg-[#696cff] text-white shadow-sm shadow-[#696cff]/30 font-bold"
              : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff] hover:bg-surface"
          )}
        >
          <QrCode className="h-4 w-4" />
          <span>Generator</span>
        </button>

        {/* Scanner Tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "scanner"}
          onClick={() => onTabChange("scanner")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95",
            activeTab === "scanner"
              ? "bg-[#696cff] text-white shadow-sm shadow-[#696cff]/30 font-bold"
              : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff] hover:bg-surface"
          )}
        >
          <ScanLine className="h-4 w-4" />
          <span>Scanner</span>
          <span className="hidden sm:inline-block ml-0.5 rounded px-1 py-0.2 text-[9px] font-bold uppercase bg-[#e8fadf] text-[#71dd37] dark:bg-[#71dd37]/20">
            Live
          </span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => onTabChange("history")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 active:scale-95",
            activeTab === "history"
              ? "bg-[#696cff] text-white shadow-sm shadow-[#696cff]/30 font-bold"
              : "text-[#697a8d] dark:text-[#a3a8c8] hover:text-[#696cff] hover:bg-surface"
          )}
        >
          <History className="h-4 w-4" />
          <span>Saved</span>
          {historyCount > 0 && (
            <span
              className={cn(
                "ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-bold transition-all",
                activeTab === "history"
                  ? "bg-white text-[#696cff]"
                  : "bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20"
              )}
            >
              {historyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Utilities: Browser Only Badge + Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#71dd37] bg-[#e8fadf] dark:bg-[#71dd37]/15 select-none">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Browser Only</span>
        </div>

        <div className="h-4 w-px bg-border-subtle hidden sm:block" />

        <ThemeToggle />
      </div>
    </header>
  );
}
