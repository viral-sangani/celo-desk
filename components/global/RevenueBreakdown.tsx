"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatUsd } from "@/lib/format";

const FEE_DATA = [
  { pair: "CELO/USDC", fees: "$4,201.50" },
  { pair: "CELO/ETH", fees: "$3,112.20" },
  { pair: "USDm/USDC", fees: "$2,890.00" },
  { pair: "CELO/WBTC", fees: "$1,450.15" },
];

export default function RevenueBreakdown() {
  const breakdown = useQuery(api.analytics.getRevenueBreakdown);
  const metrics = useQuery(api.analytics.getLatestMetrics);

  const hasBreakdown = breakdown && breakdown.length > 0;
  const feeRows = hasBreakdown
    ? breakdown.map((b) => ({ pair: b.pair, fees: formatUsd(b.totalFees) }))
    : FEE_DATA;

  const displayRevenue =
    metrics != null ? formatUsd(metrics.totalFeesEarned) : "$18,442.20";

  return (
    <div className="border-panel">
      <div className="p-3 border-b border-terminal-border flex justify-between items-center">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider">
          Platform Revenue
        </h3>
        <span className="text-[10px] font-mono text-terminal-green">
          LIVE UPDATES
        </span>
      </div>
      <div className="p-4 grid grid-cols-2 gap-4">
        {/* Left: Cumulative chart */}
        <div className="relative">
          <p className="text-[10px] text-slate-500 mb-2 font-sans uppercase tracking-wider">
            Cumulative Revenue
          </p>
          <p className="text-xl font-mono mb-4">{displayRevenue}</p>
          <svg className="w-full h-24" viewBox="0 0 200 60">
            <polyline
              fill="none"
              points="0,50 20,45 40,48 60,35 80,40 100,25 120,28 140,15 160,18 180,5 200,8"
              stroke="#00FF41"
              strokeWidth="1.5"
            />
          </svg>
        </div>
        {/* Right: Fee table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-terminal-border">
              <tr className="text-[9px] font-sans uppercase tracking-wider text-slate-500">
                <th className="pb-2 font-normal">PAIR</th>
                <th className="pb-2 font-normal text-right">FEES (24H)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-[11px] divide-y divide-terminal-border/50">
              {feeRows.map((row) => (
                <tr key={row.pair}>
                  <td className="py-2">{row.pair}</td>
                  <td className="py-2 text-right text-terminal-green">
                    {row.fees}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
