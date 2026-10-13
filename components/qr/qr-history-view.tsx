"use client";

import * as React from "react";
import {
  History,
  Trash2,
  Download,
  ExternalLink,
  QrCode,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { downloadFile } from "@/lib/qr/generator";

export interface HistoryItem {
  id: string;
  type: string;
  payload: string;
  svg: string;
  timestamp: number;
}

interface QRHistoryViewProps {
  historyItems: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onOpenGenerator: () => void;
}

export function QRHistoryView({
  historyItems,
  onClearHistory,
  onDeleteItem,
  onOpenGenerator,
}: QRHistoryViewProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-xl bg-surface border border-border-subtle p-6 sm:p-8 shadow-sm transition-all duration-300 hover:shadow-md">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20">
              <History className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#566a7f] dark:text-white">
                Saved QR Code History
              </h2>
              <p className="text-xs text-[#8592a3]">
                Codes generated during this session stored locally on your device
              </p>
            </div>
          </div>

          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#ff3e1d]/30 text-[#ff3e1d] hover:bg-[#ffe0db] text-xs font-semibold transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Content list or Empty State */}
        {historyItems.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-2xl bg-canvas border border-border-subtle flex items-center justify-center text-[#8592a3] mb-4">
              <QrCode className="h-8 w-8 text-[#696cff]" />
            </div>
            <h3 className="text-base font-bold text-[#566a7f] dark:text-white">
              No QR Codes in History Yet
            </h3>
            <p className="text-xs text-[#8592a3] mt-1 max-w-sm">
              Any QR codes you generate will appear here so you can download or review them anytime.
            </p>
            <button
              type="button"
              onClick={onOpenGenerator}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#696cff] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#696cff]/25 hover:bg-[#5f61e6] transition-all"
            >
              <span>Create Your First QR</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 rounded-xl border border-border-subtle bg-canvas/40 p-4 transition-all duration-200 hover:bg-canvas hover:border-[#696cff]/40 group"
              >
                {/* Thumbnail */}
                <div
                  className="h-16 w-16 shrink-0 rounded-lg bg-surface border border-border-subtle p-1.5 overflow-hidden flex items-center justify-center shadow-sm [&>svg]:w-full [&>svg]:h-full"
                  dangerouslySetInnerHTML={{ __html: item.svg }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#e7e7ff] text-[#696cff] dark:bg-[#696cff]/20">
                      {item.type}
                    </span>
                    <span className="text-[11px] text-[#8592a3]">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <p className="mt-1 font-mono text-xs text-[#566a7f] dark:text-white truncate">
                    {item.payload}
                  </p>

                  <div className="mt-2.5 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const filename = `qr-${item.type}-${item.timestamp}.svg`;
                        downloadFile(item.svg, filename, "image/svg+xml");
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#696cff] hover:underline"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download SVG</span>
                    </button>
                    <span className="text-border-subtle">•</span>
                    <button
                      type="button"
                      onClick={() => onDeleteItem(item.id)}
                      className="text-[11px] font-medium text-[#ff3e1d] hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
