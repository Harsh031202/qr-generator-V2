"use client";

import * as React from "react";
import {
  QrCode,
  ScanLine,
  History,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkspaceTab = "generator" | "scanner" | "history";

interface BrutalHeaderProps {
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  historyCount?: number;
}

export function BrutalHeader({
  activeTab,
  onTabChange,
  historyCount = 0,
}: BrutalHeaderProps) {
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("qr-studio-theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("qr-studio-theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <header className="w-full mb-8 pt-3 flex flex-wrap items-center justify-between gap-4 border-b-2 border-black dark:border-zinc-800 pb-5 select-none">
      {/* Brand Identity */}
      <div
        onClick={() => onTabChange("generator")}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="flex items-center gap-1.5">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
            qrstudio
          </span>
          <span className="text-xl font-black text-[#ec4899] dark:text-[#f472b6] transform transition-transform group-hover:rotate-45">
            ✦
          </span>
        </div>

        {/* Yellow Sketch Badge */}
        <span className="badge-sketch px-3 py-0.5 text-xs text-black hidden sm:inline-block">
          Vector Suite
        </span>
      </div>

      {/* Chunky Neo-brutalist Navigation Tabs */}
      <nav
        role="tablist"
        aria-label="Workspace views"
        className="flex items-center gap-2 p-1.5 rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 shadow-[3px_3px_0px_#000]"
      >
        {/* Generator Tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "generator"}
          onClick={() => onTabChange("generator")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-150",
            activeTab === "generator"
              ? "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black border-2 border-black dark:border-purple-400 shadow-[2px_2px_0px_#000]"
              : "text-slate-700 dark:text-slate-300 hover:text-black hover:bg-slate-100 dark:hover:bg-slate-800"
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
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-150",
            activeTab === "scanner"
              ? "bg-[#05df72] text-black border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000]"
              : "text-slate-700 dark:text-slate-300 hover:text-black hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <ScanLine className="h-4 w-4" />
          <span>Scanner</span>
        </button>

        {/* History Tab */}
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "history"}
          onClick={() => onTabChange("history")}
          className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all duration-150",
            activeTab === "history"
              ? "bg-[#7c3aed] text-white border-2 border-black dark:border-zinc-700 shadow-[2px_2px_0px_#000]"
              : "text-slate-700 dark:text-slate-300 hover:text-black hover:bg-slate-100 dark:hover:bg-slate-800"
          )}
        >
          <History className="h-4 w-4" />
          <span>Saved</span>
          {historyCount > 0 && (
            <span
              className={cn(
                "ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-mono font-black",
                activeTab === "history"
                  ? "bg-black text-[#ffde59]"
                  : "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black border border-black dark:border-purple-400"
              )}
            >
              {historyCount}
            </span>
          )}
        </button>
      </nav>

      {/* Right Utilities: Theme Toggle */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 text-black dark:text-white shadow-[2px_2px_0px_#000] hover:translate-y-[-1px] active:translate-y-[1px] transition-all"
          title="Toggle Dark / Light Theme"
        >
          {isDark ? <Sun className="h-4 w-4 text-[#ffde59]" /> : <Moon className="h-4 w-4" />}
        </button>
      </div>
    </header>
  );
}
