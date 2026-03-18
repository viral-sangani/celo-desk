"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatUsd, formatMarketCap, formatPercent, formatNumber } from "@/lib/format";

interface TokenAccordionProps {
  token: string;
  isOpen: boolean;
}

export default function TokenAccordion({ token, isOpen }: TokenAccordionProps) {
  const metadata = useQuery(
    api.tokenMetadata.getByToken,
    isOpen ? { token } : "skip"
  );

  if (!isOpen) return null;

  if (!metadata) {
    return (
      <tr>
        <td colSpan={4} className="p-0">
          <div className="bg-[#111] border-t border-terminal-border p-3 text-[10px] text-gray-500 text-center">
            Loading metadata...
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td colSpan={4} className="p-0">
        <div className="bg-[#111] border-t border-terminal-border p-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-[10px]">
            {/* Row 1 */}
            <StatCell label="MKT CAP" value={metadata.marketCap ? formatMarketCap(metadata.marketCap) : "—"} />
            <StatCell label="VOLUME 24H" value={metadata.totalVolume24h ? formatMarketCap(metadata.totalVolume24h) : "—"} />
            <StatCell label="SUPPLY" value={metadata.circulatingSupply ? `${formatNumber(metadata.circulatingSupply, 0)} ${token}` : "—"} />
            <StatCell label="RANK" value={metadata.rank ? `#${metadata.rank}` : "—"} />
            {/* Row 2 */}
            <StatCell label="HOLDERS" value={metadata.holders ? formatNumber(metadata.holders, 0) : "—"} />
            <StatCell label="TVL" value={metadata.tvl ? formatMarketCap(metadata.tvl) : "—"} />
            <StatCell
              label="7D CHG"
              value={metadata.change7d != null ? formatPercent(metadata.change7d) : "—"}
              color={metadata.change7d != null ? (metadata.change7d >= 0 ? "text-terminal-green" : "text-terminal-red") : undefined}
            />
            <StatCell
              label="30D CHG"
              value={metadata.change30d != null ? formatPercent(metadata.change30d) : "—"}
              color={metadata.change30d != null ? (metadata.change30d >= 0 ? "text-terminal-green" : "text-terminal-red") : undefined}
            />
          </div>
          {/* Bottom row */}
          {(metadata.ath || metadata.fullyDilutedValuation) && (
            <div className="mt-2 pt-2 border-t border-terminal-border/50 flex gap-6 text-[10px]">
              {metadata.ath && (
                <span className="text-gray-500">
                  ATH: <span className="text-gray-300">{formatUsd(metadata.ath)}</span>
                  {metadata.athDate && <span className="ml-1">({metadata.athDate.split("T")[0]})</span>}
                </span>
              )}
              {metadata.fullyDilutedValuation && (
                <span className="text-gray-500">
                  FDV: <span className="text-gray-300">{formatMarketCap(metadata.fullyDilutedValuation)}</span>
                </span>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

function StatCell({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
      <div className={`font-mono text-[11px] ${color ?? "text-gray-300"}`}>{value}</div>
    </div>
  );
}
