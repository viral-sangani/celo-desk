"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMarketCap, formatPercent } from "@/lib/format";

const COINGECKO_SLUGS: Record<string, string> = {
  CELO: "celo",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  XAUt: "tether-gold",
  USDm: "celo-dollar",
  WETH: "ethereum",
  WBTC: "wrapped-bitcoin",
};

export default function TopCeloTokens() {
  const tokens = useQuery(api.latestIntel.getTopCeloTokens);

  return (
    <div className="border border-terminal-border bg-[#0a0a0a] p-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
        Top Celo Tokens
      </div>
      {!tokens || tokens.length === 0 ? (
        <div className="text-xs text-gray-600">Loading token data...</div>
      ) : (
        <div className="space-y-2">
          {tokens.slice(0, 7).map((t, i) => (
            <div key={t.token} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 w-4">{i + 1}.</span>
                <a
                  href={`https://www.coingecko.com/en/coins/${COINGECKO_SLUGS[t.token] ?? t.token.toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-white font-medium hover:text-terminal-green"
                >
                  {t.token}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-300">
                  ${formatMarketCap(t.marketCap ?? 0)}
                </span>
                <span
                  className={`text-[10px] font-bold w-16 text-right ${
                    (t.change24h ?? 0) >= 0 ? "text-terminal-green" : "text-red-400"
                  }`}
                >
                  {formatPercent(t.change24h ?? 0)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="text-[9px] text-gray-700 mt-2 pt-1 border-t border-terminal-border/50">
        <a
          href="https://www.coingecko.com/en/chains/celo"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-gray-400"
        >
          Source: CoinGecko
        </a>
      </div>
    </div>
  );
}
