"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getColor(value: number): string {
  if (value <= 20) return "#ff4444";
  if (value <= 40) return "#ff8844";
  if (value <= 60) return "#ffcc00";
  if (value <= 80) return "#88cc44";
  return "#00ff41";
}

function getSignal(value: number): string {
  if (value <= 20) return "Strong Buy (Contrarian)";
  if (value <= 35) return "Buy (Contrarian)";
  if (value <= 50) return "Cautious";
  if (value <= 65) return "Neutral";
  if (value <= 80) return "Sell (Contrarian)";
  return "Strong Sell (Contrarian)";
}

export default function FearGreedGauge() {
  const data = useQuery(api.latestIntel.getFearGreedIndex);

  const value = data?.value ?? 0;
  const classification = data?.classification ?? "—";
  const color = getColor(value);
  const signal = getSignal(value);

  const radius = 40;
  const circumference = Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  const updatedAt = data
    ? (() => {
        const d = new Date(data.timestamp);
        return `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")} UTC`;
      })()
    : "";

  return (
    <div className="border border-terminal-border bg-[#0a0a0a] p-4 flex flex-col items-center justify-between">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
        Fear &amp; Greed Index
      </div>
      <svg width="100" height="60" viewBox="0 0 100 60">
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M 10 55 A 40 40 0 0 1 90 55"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={`${offset}`}
        />
      </svg>
      <div className="text-2xl font-bold" style={{ color }}>
        {data ? Math.round(value) : "—"}
      </div>
      <div className="text-xs text-gray-400 uppercase font-bold">{classification}</div>
      <div className="text-[10px] text-gray-600 mt-1">{signal}</div>
      {/* Mini scale */}
      <div className="flex w-full mt-2 gap-px">
        {[
          { label: "Fear", color: "#ff4444", active: value <= 40 },
          { label: "Neutral", color: "#ffcc00", active: value > 40 && value <= 60 },
          { label: "Greed", color: "#00ff41", active: value > 60 },
        ].map((s) => (
          <div key={s.label} className="flex-1 text-center">
            <div
              className="h-1 rounded-full mb-0.5"
              style={{
                backgroundColor: s.active ? s.color : "#1a1a1a",
              }}
            />
            <span className="text-[8px] text-gray-600">{s.label}</span>
          </div>
        ))}
      </div>
      {updatedAt && (
        <div className="text-[9px] text-gray-700 mt-1">Updated {updatedAt}</div>
      )}
    </div>
  );
}
