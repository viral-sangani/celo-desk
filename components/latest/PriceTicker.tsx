"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatPrice, formatPercent } from "@/lib/format";

export default function PriceTicker() {
  const prices = useQuery(api.prices.getLatestAll);

  if (!prices || prices.length === 0) {
    return (
      <div className="border border-terminal-border bg-[#0a0a0a] px-4 py-2 flex items-center gap-6 overflow-x-auto">
        <span className="text-[10px] text-gray-600">Loading prices...</span>
      </div>
    );
  }

  return (
    <div className="border border-terminal-border bg-[#0a0a0a] px-3 sm:px-4 py-2 flex items-center gap-3 sm:gap-6 overflow-x-auto custom-scrollbar">
      <span className="text-[10px] text-gray-500 uppercase tracking-wider shrink-0">
        Live Prices
      </span>
      {prices.map((p) => (
        <div key={p.token} className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-bold text-white">{p.token}</span>
          <span className="text-xs text-gray-300">${formatPrice(p.priceUsd)}</span>
          <span
            className={`text-[10px] font-bold ${
              p.change24h >= 0 ? "text-terminal-green" : "text-red-400"
            }`}
          >
            {formatPercent(p.change24h)}
          </span>
        </div>
      ))}
    </div>
  );
}
