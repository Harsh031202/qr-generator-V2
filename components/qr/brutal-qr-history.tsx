"use client";

import * as React from "react";
import {
  Globe,
  Wifi,
  Contact2,
  FileText,
  Mail,
  IndianRupee,
  Pencil,
  Download,
  Trash2,
  QrCode,
  ArrowRight,
} from "lucide-react";
import { downloadFile } from "@/lib/qr/generator";
import { cn } from "@/lib/utils";

export interface HistoryItem {
  id: string;
  type: string;
  payload: string;
  svg: string;
  timestamp: number;
  data?: any;
  pattern?: "square" | "rounded" | "dots";
  fgColor?: string;
  bgColor?: string;
  ecc?: "L" | "M" | "Q" | "H";
  margin?: number;
}

interface BrutalQRHistoryProps {
  historyItems: HistoryItem[];
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  onOpenGenerator: () => void;
  onEditItem: (item: HistoryItem) => void;
}

const TYPE_CONFIG: Record<
  string,
  { label: string; icon: React.ElementType; color: string; badgeColor: string }
> = {
  url: {
    label: "URL / Website",
    icon: Globe,
    color: "bg-[#2563eb] text-white dark:bg-[#c084fc] dark:text-black",
    badgeColor: "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black",
  },
  wifi: {
    label: "Wi-Fi Network",
    icon: Wifi,
    color: "bg-[#05df72] text-black dark:bg-[#05df72] dark:text-black",
    badgeColor: "bg-[#05df72] text-black dark:bg-[#05df72] dark:text-black",
  },
  vcard: {
    label: "Contact Card",
    icon: Contact2,
    color: "bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black",
    badgeColor: "bg-[#c084fc] text-black dark:bg-[#c084fc] dark:text-black",
  },
  text: {
    label: "Plain Text",
    icon: FileText,
    color: "bg-slate-200 text-black dark:bg-slate-700 dark:text-white",
    badgeColor: "bg-slate-200 text-black dark:bg-slate-700 dark:text-white",
  },
  email: {
    label: "Email",
    icon: Mail,
    color: "bg-[#ec4899] text-white dark:bg-[#ec4899] dark:text-white",
    badgeColor: "bg-[#ec4899] text-white dark:bg-[#ec4899] dark:text-white",
  },
  upi: {
    label: "UPI Payment",
    icon: IndianRupee,
    color: "bg-[#06b6d4] text-black dark:bg-[#06b6d4] dark:text-black",
    badgeColor: "bg-[#06b6d4] text-black dark:bg-[#06b6d4] dark:text-black",
  },
};

function getItemSummary(item: HistoryItem): string {
  if (item.data) {
    if (item.type === "wifi" && item.data.ssid) {
      return `Wi-Fi: ${item.data.ssid} (${item.data.security || "WPA"})`;
    }
    if (item.type === "vcard") {
      const name = `${item.data.firstName || ""} ${item.data.lastName || ""}`.trim();
      return name ? `Contact: ${name}` : item.payload;
    }
    if (item.type === "email" && item.data.to) {
      return `Email: ${item.data.to}`;
    }
    if (item.type === "upi" && item.data.pa) {
      return `UPI: ${item.data.pa} ${item.data.am ? `(₹${item.data.am})` : ""}`;
    }
    if (item.type === "url" && item.data.url) {
      return item.data.url;
    }
    if (item.type === "text" && item.data.text) {
      return item.data.text;
    }
  }
  return item.payload || "—";
}

export function BrutalQRHistory({
  historyItems,
  onClearHistory,
  onDeleteItem,
  onOpenGenerator,
  onEditItem,
}: BrutalQRHistoryProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="rounded-2xl border-2 border-black dark:border-zinc-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-[6px_6px_0px_#000]">
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b-2 border-black/10 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <span className="badge-sketch px-3 py-1 text-xs text-white bg-[#7c3aed]">
              History
            </span>
            <div>
              <h2 className="text-lg font-black text-black dark:text-white">
                Saved QR Code History
              </h2>
              <p className="text-xs text-slate-500">
                Codes generated during this session stored locally on your device
              </p>
            </div>
          </div>

          {historyItems.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#ff3e1d] text-white text-xs font-bold shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All</span>
            </button>
          )}
        </div>

        {/* Content list or Empty State */}
        {historyItems.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center justify-center">
            <div className="h-16 w-16 rounded-2xl border-2 border-black dark:border-zinc-700 bg-[#ffde59] dark:bg-[#c084fc] flex items-center justify-center text-black dark:text-black mb-4 shadow-[3px_3px_0px_#000]">
              <QrCode className="h-8 w-8" />
            </div>
            <h3 className="text-base font-black text-black dark:text-white">
              No QR Codes in History Yet
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Any QR codes you generate will appear here with an edit shortcut to bring details back to the generator.
            </p>
            <button
              type="button"
              onClick={onOpenGenerator}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border-2 border-black dark:border-zinc-700 bg-[#2563eb] dark:bg-[#c084fc] text-white dark:text-black px-5 py-2.5 text-xs font-black shadow-[3px_3px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
            >
              <span>Create Your First QR</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyItems.map((item) => {
              const config = TYPE_CONFIG[item.type] || {
                label: item.type.toUpperCase(),
                icon: QrCode,
                color: "bg-slate-200 text-black dark:bg-slate-700 dark:text-white",
                badgeColor: "bg-slate-200 text-black dark:bg-slate-700 dark:text-white",
              };
              const IconComponent = config.icon;
              const summary = getItemSummary(item);

              return (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl border-2 border-black dark:border-zinc-700 bg-slate-50 dark:bg-slate-800 p-4 shadow-[4px_4px_0px_#000] transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] group"
                >
                  {/* Type Icon Box (Zero SVG rendering load) */}
                  <div
                    className={cn(
                      "h-14 w-14 shrink-0 rounded-xl border-2 border-black dark:border-zinc-700 flex items-center justify-center shadow-[2px_2px_0px_#000]",
                      config.color
                    )}
                  >
                    <IconComponent className="h-7 w-7" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-black dark:border-zinc-700 shadow-[1px_1px_0px_#000]",
                          config.badgeColor
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold shrink-0">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <p
                      className="mt-1.5 font-mono text-xs text-black dark:text-white truncate font-bold"
                      title={summary}
                    >
                      {summary}
                    </p>

                    <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-black/10 dark:border-zinc-700/60">
                      {/* Edit Button */}
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 border-black dark:border-zinc-700 bg-[#ffde59] text-black dark:bg-[#c084fc] dark:text-black text-xs font-black shadow-[2px_2px_0px_#000] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all"
                      >
                        <Pencil className="h-3.5 w-3.5 stroke-[2.5]" />
                        <span>Edit in Generator</span>
                      </button>

                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const filename = `qr-${item.type}-${item.timestamp}.svg`;
                            downloadFile(item.svg, filename, "image/svg+xml");
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
                          title="Download static SVG"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>SVG</span>
                        </button>

                        <span className="text-slate-300 dark:text-zinc-600">•</span>

                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#ff3e1d] hover:underline"
                          title="Delete from history"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
