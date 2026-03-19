"use client";

import React, { useState } from "react";
import { api } from "@/convex/_generated/api";
import { useQueryCached } from "@/lib/useQueryCached";
import { formatPrice } from "@/lib/format";
import { SkeletonRows } from "@/components/ui/Skeleton";
import TokenAccordion from "@/components/ui/TokenAccordion";
import { useWatchlist } from "@/lib/useWatchlist";

interface FXRate {
  pair: string;
  price: number;
  change24h: number;
  spread: number;
}

interface FXRatesGridProps {
  onTokenSelect?: (token: string) => void;
}

const tokenFromPair = (pair: string) => pair.split("/")[0];

export default function FXRatesGrid({ onTokenSelect }: FXRatesGridProps) {
  const rates = useQueryCached<FXRate[]>(api.fxRates.getLatest, {}, "fx_rates");
  const isLoading = rates === undefined;
  const data: FXRate[] = rates && rates.length > 0 ? rates : [];
  const [expandedPair, setExpandedPair] = useState<string | null>(null);
  const { isInWatchlist, toggleToken } = useWatchlist();

  const handleRowClick = (pair: string) => {
    setExpandedPair(expandedPair === pair ? null : pair);
    const token = tokenFromPair(pair);
    onTokenSelect?.(token);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="overflow-auto custom-scrollbar flex-grow">
        <table className="w-full text-[11px] text-left">
          <thead className="bg-[#1a1a1a] sticky top-0">
            <tr className="text-gray-500 border-b border-terminal-border">
              <th className="p-2 font-normal w-6"></th>
              <th className="p-2 font-normal">PAIR</th>
              <th className="p-2 font-normal">PRICE</th>
              <th className="p-2 font-normal">24H CHG</th>
              <th className="p-2 font-normal">SPREAD</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border">
            {isLoading ? (
              <SkeletonRows rows={8} cols={5} />
            ) : (
              data.map((row) => {
                const token = tokenFromPair(row.pair);
                const bookmarked = isInWatchlist(token);
                return (
                  <React.Fragment key={row.pair}>
                    <tr
                      onClick={() => handleRowClick(row.pair)}
                      className="cursor-pointer hover:bg-[#1a1a1a]"
                    >
                      <td className="p-2 w-6">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleToken(token);
                          }}
                          className={`text-sm leading-none transition-colors active:scale-[0.97] ${
                            bookmarked
                              ? "text-terminal-amber"
                              : "text-gray-700 hover:text-terminal-amber"
                          }`}
                          title={bookmarked ? `Remove ${token} from watchlist` : `Add ${token} to watchlist`}
                        >
                          {bookmarked ? "★" : "☆"}
                        </button>
                      </td>
                      <td className="p-2">{row.pair}</td>
                      <td className="p-2 text-white">{formatPrice(row.price)}</td>
                      <td
                        className={`p-2 ${
                          row.change24h >= 0
                            ? "text-terminal-green"
                            : "text-terminal-red"
                        }`}
                      >
                        {row.change24h >= 0 ? "+" : ""}
                        {row.change24h.toFixed(2)}%
                      </td>
                      <td className="p-2">{row.spread.toFixed(4)}</td>
                    </tr>
                    <TokenAccordion
                      token={token}
                      isOpen={expandedPair === row.pair}
                    />
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
