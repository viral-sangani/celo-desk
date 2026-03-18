"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const FALLBACK_METRICS = [
  { label: "Total Value Locked", value: "$4,821,090" },
  { label: "Total Trades", value: "12,482" },
  { label: "24H Volume", value: "$2,105,942" },
  { label: "Accumulated Fees", value: "$18,442" },
  { label: "Active Agents", value: "84" },
  { label: "Trade Freq", value: "5.2", suffix: "m" },
];

export default function MetricsStrip() {
  const metrics = useQuery(api.analytics.getLatestMetrics);

  const METRICS = metrics
    ? [
        {
          label: "Total Value Locked",
          value: `$${metrics.tvl.toLocaleString()}`,
        },
        {
          label: "Total Trades",
          value: metrics.totalTrades24h.toLocaleString(),
        },
        {
          label: "24H Volume",
          value: `$${metrics.totalVolume24h.toLocaleString()}`,
        },
        {
          label: "Accumulated Fees",
          value: `$${metrics.totalFeesEarned.toLocaleString()}`,
        },
        {
          label: "Active Agents",
          value: String(metrics.activeAgents),
        },
        {
          label: "Trade Freq",
          value: (metrics.avgTradeFrequencyMs / 60000).toFixed(1),
          suffix: "m",
        },
      ]
    : FALLBACK_METRICS;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0 border-panel divide-x divide-terminal-border divide-y md:divide-y-0">
      {METRICS.map((m) => (
        <div key={m.label} className="p-3">
          <p className="text-[10px] text-slate-500 font-sans uppercase tracking-wider mb-1">
            {m.label}
          </p>
          <p className="text-xl font-mono font-bold text-white">
            {m.value}
            {m.suffix && <span className="text-sm">{m.suffix}</span>}
          </p>
        </div>
      ))}
    </div>
  );
}
