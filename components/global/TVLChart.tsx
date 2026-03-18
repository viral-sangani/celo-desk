"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMarketCap, formatPercent } from "@/lib/format";

const TIMEFRAMES = ["1D", "1W", "1M"] as const;
const TIMEFRAME_DAYS: Record<string, number> = { "1D": 1, "1W": 7, "1M": 30 };
const DAY_LABELS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

function generatePath(
  data: { timestamp: number; tvl: number }[],
  viewBoxW = 400,
  viewBoxH = 100,
) {
  const values = data.map((d) => d.tvl);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * viewBoxW;
      const y = viewBoxH - ((d.tvl - min) / range) * viewBoxH * 0.8 - 10;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function TVLChart() {
  const [active, setActive] = useState<string>("1W");
  const history = useQuery(api.analytics.getMetricsHistory, {
    days: TIMEFRAME_DAYS[active] ?? 7,
  });

  const hasData = history && history.length > 0;

  // Derive display values from live data or fall back to static
  const latestTvl = hasData ? history[history.length - 1].tvl : null;
  const tvlChange = hasData ? history[history.length - 1].tvlChange24h : null;
  const displayTvl = latestTvl !== null ? `$${formatMarketCap(latestTvl)}` : "$4.8M";
  const displayChange =
    tvlChange !== null ? formatPercent(tvlChange) : "+5.2%";
  const changeColor =
    tvlChange !== null && tvlChange < 0
      ? "text-terminal-red"
      : "text-terminal-green/70";

  // SVG paths
  const strokePath = hasData
    ? generatePath(history)
    : "M0,80 Q50,70 100,85 T200,40 T300,60 T400,20";
  const fillPath = hasData
    ? `${generatePath(history)} L400,100 L0,100 Z`
    : "M0,80 Q50,70 100,85 T200,40 T300,60 T400,20 L400,100 L0,100 Z";

  // X-axis labels
  const xLabels = hasData
    ? history.map((d) => DAY_LABELS[new Date(d.timestamp).getDay()])
    : ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  // Deduplicate consecutive identical labels for cleaner display
  const displayLabels =
    hasData && xLabels.length > 7
      ? xLabels.filter(
          (_, i) =>
            i === 0 ||
            i === xLabels.length - 1 ||
            Math.round((i / (xLabels.length - 1)) * 6) !==
              Math.round(((i - 1) / (xLabels.length - 1)) * 6),
        )
      : xLabels;

  return (
    <div className="border-panel p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-sans text-xs text-slate-400 uppercase tracking-wider">
            Total Value Locked
          </p>
          <p className="text-2xl font-mono text-terminal-green">
            {displayTvl}{" "}
            <span className={`text-xs ${changeColor} font-normal`}>
              {displayChange}
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setActive(tf)}
              className={`px-2 py-0.5 text-[10px] font-mono ${
                active === tf
                  ? "border border-terminal-green text-terminal-green"
                  : "border-panel text-slate-400"
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="h-48 w-full relative">
        <svg
          className="w-full h-full"
          viewBox="0 0 400 100"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="tvlGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                offset="0%"
                style={{ stopColor: "rgba(0, 255, 65, 0.2)", stopOpacity: 1 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: "rgba(0, 255, 65, 0)", stopOpacity: 1 }}
              />
            </linearGradient>
          </defs>
          <path d={fillPath} fill="url(#tvlGrad)" />
          <path
            d={strokePath}
            fill="none"
            stroke="#00FF41"
            strokeWidth="2"
          />
        </svg>
        <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500">
          {displayLabels.map((label, i) => (
            <span key={i}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
