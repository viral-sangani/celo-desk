"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatUsd } from "@/lib/format";

export default function TradeStatsStrip() {
  const trades = useQuery(api.tradeHistory.getAllTrades, { limit: 500 });

  if (!trades) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-terminal-border bg-[#0a0a0a] p-3 animate-pulse">
            <div className="h-3 w-16 bg-gray-800 rounded mb-2" />
            <div className="h-5 w-20 bg-gray-800 rounded" />
          </div>
        ))}
      </div>
    );
  }

  const totalTrades = trades.length;
  const swaps = trades.filter(
    (t) => t.decision === "swap" || (!t.decision && t.txHash !== "")
  );
  const holds = trades.filter(
    (t) => t.decision === "hold" || (!t.decision && t.txHash === "")
  );
  const totalVolume = swaps.reduce(
    (sum, t) => sum + t.fromAmount * t.priceUsd,
    0
  );
  const totalFees = swaps.reduce((sum, t) => sum + t.feeUsd, 0);
  const lastTrade = trades[0];
  const lastTradeTime = lastTrade
    ? getRelativeTime(lastTrade.timestamp)
    : "—";

  const stats = [
    { label: "Total Decisions", value: String(totalTrades) },
    { label: "Swaps", value: String(swaps.length), sub: `${holds.length} holds` },
    { label: "Total Volume", value: formatUsd(totalVolume) },
    { label: "Fees Paid", value: formatUsd(totalFees) },
    { label: "Last Decision", value: lastTradeTime },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="border border-terminal-border bg-[#0a0a0a] px-3 py-2.5"
        >
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
            {s.label}
          </div>
          <div className="text-sm font-bold text-white mt-0.5">{s.value}</div>
          {s.sub && (
            <div className="text-[10px] text-gray-600">{s.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}

function getRelativeTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
