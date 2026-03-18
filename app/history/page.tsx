"use client";

import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import TradeStatsStrip from "@/components/history/TradeStatsStrip";
import TradeHistoryTable from "@/components/history/TradeHistoryTable";

export default function HistoryPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <TopBar activeTab="history" />
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Agent Trade History
          </h2>
          <div className="text-[10px] text-gray-600">
            All decisions (swaps + holds) are logged with Gemini reasoning
          </div>
        </div>
        <TradeStatsStrip />
        <TradeHistoryTable />
      </main>
      <Footer variant="history" />
    </div>
  );
}
