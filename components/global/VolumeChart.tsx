"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatMarketCap, formatPercent } from "@/lib/format";

const BAR_HEIGHTS = [60, 40, 85, 70, 50, 95, 65, 75, 40, 30, 55, 80];

export default function VolumeChart() {
  const history = useQuery(api.analytics.getMetricsHistory, { days: 1 });

  const hasData = history && history.length > 0;

  // Compute bar heights from live data or use fallback
  const barHeights = hasData
    ? (() => {
        const volumes = history.map((d) => d.totalVolume24h);
        const maxVol = Math.max(...volumes) || 1;
        return volumes.map((v) => Math.max(5, (v / maxVol) * 95));
      })()
    : BAR_HEIGHTS;

  // Display values
  const latestVolume = hasData
    ? history[history.length - 1].totalVolume24h
    : null;
  const displayVolume =
    latestVolume !== null ? `$${formatMarketCap(latestVolume)}` : "$2.1M";

  // Compute volume change if we have at least 2 data points
  let displayChange = "-1.8%";
  let changeColor = "text-terminal-red";
  if (hasData && history.length >= 2) {
    const prev = history[0].totalVolume24h;
    const latest = history[history.length - 1].totalVolume24h;
    const pctChange = prev > 0 ? ((latest - prev) / prev) * 100 : 0;
    displayChange = formatPercent(pctChange);
    changeColor = pctChange >= 0 ? "text-terminal-green" : "text-terminal-red";
  }

  return (
    <div className="border-panel p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="font-sans text-xs text-slate-400 uppercase tracking-wider">
            Trading Volume
          </p>
          <p className="text-2xl font-mono text-terminal-amber">
            {displayVolume}{" "}
            <span className={`text-xs ${changeColor} font-normal`}>
              {displayChange}
            </span>
          </p>
        </div>
        <span className="text-slate-500 cursor-pointer text-lg">&hellip;</span>
      </div>
      <div className="h-48 flex items-end justify-between gap-1">
        {barHeights.map((h, i) => (
          <div
            key={i}
            className="w-full bg-terminal-amber/20 border-t border-terminal-amber"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 text-[9px] font-mono text-slate-500 px-1">
        <span>00:00</span>
        <span>04:00</span>
        <span>08:00</span>
        <span>12:00</span>
        <span>16:00</span>
        <span>20:00</span>
      </div>
    </div>
  );
}
