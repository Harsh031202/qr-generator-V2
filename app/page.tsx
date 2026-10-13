"use client";

import * as React from "react";
import { BrutalHeader, type WorkspaceTab } from "@/components/layout/brutal-header";
import { BrutalQRGenerator } from "@/components/qr/brutal-qr-generator";
import { BrutalQRScanner } from "@/components/qr/brutal-qr-scanner";
import { BrutalQRHistory, type HistoryItem } from "@/components/qr/brutal-qr-history";

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = React.useState<WorkspaceTab>("generator");
  const [historyItems, setHistoryItems] = React.useState<HistoryItem[]>([]);

  const [editingItem, setEditingItem] = React.useState<HistoryItem | null>(null);

  // Add generated QR codes to session history (deduplicated by payload)
  const handleSaveToHistory = React.useCallback(
    (item: Omit<HistoryItem, "id">) => {
      setHistoryItems((prev) => {
        const existingIndex = prev.findIndex((p) => p.payload === item.payload);
        if (existingIndex !== -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            ...item,
            timestamp: item.timestamp,
          };
          return updated;
        }
        return [
          {
            id: `qr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            ...item,
          },
          ...prev.slice(0, 19),
        ];
      });
    },
    []
  );

  const handleClearHistory = React.useCallback(() => {
    setHistoryItems([]);
  }, []);

  const handleDeleteHistoryItem = React.useCallback((id: string) => {
    setHistoryItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handleEditHistoryItem = React.useCallback((item: HistoryItem) => {
    setEditingItem(item);
    setActiveTab("generator");
  }, []);

  return (
    <div className="min-h-screen bg-canvas text-foreground font-sans antialiased selection:bg-[#ffde59] selection:text-black">
      {/* Background Subtle Organic Wire Loop (inspired by the line art in the image) */}
      <svg
        className="fixed inset-0 w-full h-full pointer-events-none z-0 opacity-40 dark:opacity-20"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M -30 180 C 120 180, 80 340, 220 340 C 360 340, 280 140, 520 140 C 760 140, 800 520, 1100 520 C 1320 520, 1260 220, 1480 220"
          stroke="#18181b"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Neo-brutalist Header */}
        <BrutalHeader
          activeTab={activeTab}
          onTabChange={setActiveTab}
          historyCount={historyItems.length}
        />

        {/* Tab 1: Neo-brutalist QR Generator */}
        {activeTab === "generator" && (
          <div className="pb-16 animate-fade-in">
            <BrutalQRGenerator
              onSaveToHistory={handleSaveToHistory}
              loadItem={editingItem}
              onClearLoadedItem={() => setEditingItem(null)}
            />
          </div>
        )}

        {/* Tab 2: Neo-brutalist QR Scanner */}
        {activeTab === "scanner" && (
          <div className="pb-16 animate-fade-in">
            <BrutalQRScanner />
          </div>
        )}

        {/* Tab 3: Neo-brutalist Saved Codes History */}
        {activeTab === "history" && (
          <div className="pb-16 animate-fade-in">
            <BrutalQRHistory
              historyItems={historyItems}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
              onOpenGenerator={() => setActiveTab("generator")}
              onEditItem={handleEditHistoryItem}
            />
          </div>
        )}
      </main>
    </div>
  );
}
