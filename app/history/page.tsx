"use client";

import { useActiveAccount } from "thirdweb/react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import TradeStatsStrip from "@/components/history/TradeStatsStrip";
import TradeHistoryTable from "@/components/history/TradeHistoryTable";

export default function HistoryPage() {
  const account = useActiveAccount();
  const walletAddress = account?.address;

  const trades = useQuery(
    api.tradeHistory.getTradesForUser,
    walletAddress ? { userAddress: walletAddress, limit: 500 } : "skip"
  );

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <TopBar activeTab="history" />
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        {!walletAddress ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              No Wallet Detected
            </div>
            <div className="text-gray-500 text-xs text-center max-w-xs">
              Connect your wallet from the top bar to view your agent&apos;s trade history
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Agent Trade History
              </h2>
              <div className="text-[10px] text-gray-600">
                All decisions (swaps + holds) are logged with Gemini reasoning
              </div>
            </div>
            <TradeStatsStrip trades={trades} />
            <TradeHistoryTable trades={trades} />
          </>
        )}
      </main>
      <Footer variant="history" />
    </div>
  );
}
