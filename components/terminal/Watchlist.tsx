"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMarketCap, formatPrice } from "@/lib/format";
import { SkeletonRows } from "@/components/ui/Skeleton";
import TokenAccordion from "@/components/ui/TokenAccordion";
import { useWatchlist } from "@/lib/useWatchlist";

const CHARTABLE_TOKENS = new Set(["CELO", "BTC", "ETH", "XAUt"]);

interface WatchlistProps {
  onTokenSelect?: (token: string) => void;
}

export default function Watchlist({ onTokenSelect }: WatchlistProps) {
  const { watchlist, removeToken } = useWatchlist();
  const [expandedToken, setExpandedToken] = useState<string | null>(null);

  const prices = useQuery(api.prices.getLatestForTokens, {
    tokens: watchlist.length > 0 ? watchlist : ["CELO"],
  });
  const isLoading = prices === undefined;

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
              <SkeletonRows rows={4} cols={4} />
            ) : watchlist.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500 text-xs">
                  <div className="text-[10px] uppercase tracking-wider mb-1">No tokens bookmarked</div>
                  <div>Click ☆ in FX Rates to add tokens here</div>
                </td>
              </tr>
            ) : (
              (prices ?? []).map((row) => (
                <React.Fragment key={row.token}>
                  <tr
                    onClick={() => handleRowClick(row.token)}
                    className="cursor-pointer hover:bg-[#1a1a1a] group"
                  >
                    <td className="p-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeToken(row.token);
                          }}
                          className="text-terminal-amber text-sm leading-none hover:text-terminal-red transition-colors active:scale-[0.97]"
                          title={`Remove ${row.token} from watchlist`}
                        >
                          ★
                        </button>
                        {row.token}
                      </div>
                    </td>
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
                      {row.change24h.toFixed(2)}%
                    </td>
                    <td className="p-2 text-right">
                      {formatMarketCap(row.marketCap ?? 0)}
                    </td>
                  </tr>
                  <TokenAccordion token={row.token} isOpen={expandedToken === row.token} />
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
