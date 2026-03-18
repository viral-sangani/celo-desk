"use client";

import React, { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQueryCached } from "@/lib/useQueryCached";
import { formatMarketCap, formatPrice } from "@/lib/format";
import { SkeletonRows } from "@/components/ui/Skeleton";
import TokenAccordion from "@/components/ui/TokenAccordion";

interface WatchlistItem {
  token: string;
  priceUsd: number;
  change24h: number;
  marketCap?: number | null;
}

const CHARTABLE_TOKENS = new Set(["CELO", "BTC", "ETH", "XAUt"]);

interface WatchlistProps {
  onTokenSelect?: (token: string) => void;
}

export default function Watchlist({ onTokenSelect }: WatchlistProps) {
  const prices = useQueryCached<WatchlistItem[]>(api.prices.getLatestAll, {}, "watchlist_prices");
  const isLoading = prices === undefined;
  const data: WatchlistItem[] = prices && prices.length > 0 ? prices : [];
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const handleRowClick = (token: string) => {
    setExpandedToken(expandedToken === token ? null : token);
    if (CHARTABLE_TOKENS.has(token)) {
      onTokenSelect?.(token);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="w-full text-[11px] text-left">
          <thead className="bg-[#1a1a1a] sticky top-0">
            <tr className="text-gray-500 border-b border-terminal-border">
              <th className="p-2 font-normal">TOKEN</th>
              <th className="p-2 font-normal text-right">PRICE</th>
              <th className="p-2 font-normal text-right">24H %</th>
              <th className="p-2 font-normal text-right">MKT CAP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border text-white">
            {isLoading ? (
              <SkeletonRows rows={6} cols={4} />
            ) : data.map((row) => (
              <React.Fragment key={row.token}>
                <tr
                  onClick={() => handleRowClick(row.token)}
                  className="cursor-pointer hover:bg-[#1a1a1a]"
                >
                  <td className="p-2">{row.token}</td>
                  <td className="p-2 text-right">
                    {formatPrice(row.priceUsd)}
                  </td>
                  <td
                    className={`p-2 text-right ${
                      row.change24h > 0
                        ? "text-terminal-green"
                        : row.change24h < 0
                          ? "text-terminal-red"
                          : "text-gray-500"
                    }`}
                  >
                    {row.change24h >= 0 ? "+" : ""}
                    {row.change24h.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    {formatMarketCap(row.marketCap ?? 0)}
                  </td>
                </tr>
                <TokenAccordion token={row.token} isOpen={expandedToken === row.token} />
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
