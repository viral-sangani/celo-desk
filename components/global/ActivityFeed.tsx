"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatTime } from "@/lib/format";

type EventType = "trade" | "agent" | "fee" | "alert";

interface ActivityEvent {
  time: string;
  type: EventType;
  message: string;
  highlight?: string;
}

const TAG_STYLES: Record<EventType, string> = {
  trade:
    "bg-terminal-green/20 text-terminal-green border border-terminal-green/30",
  agent:
    "bg-terminal-amber/20 text-terminal-amber border border-terminal-amber/30",
  fee: "bg-slate-800 text-slate-400 border border-slate-700",
  alert: "bg-terminal-red/20 text-terminal-red border border-terminal-red/30",
};

const TAG_LABELS: Record<EventType, string> = {
  trade: "[TRADE]",
  agent: "[AGENT]",
  fee: "[FEE]",
  alert: "[ALERT]",
};

const FALLBACK_EVENTS: ActivityEvent[] = [
  {
    time: "14:32:05",
    type: "trade",
    message: "Alpha_Arbitrage executed BUY 1200 CELO @ $0.6842",
  },
  {
    time: "14:31:58",
    type: "agent",
    message: "New Agent Sentinel_Node_02 initialized on Mainnet",
  },
  {
    time: "14:31:45",
    type: "fee",
    message: "Collected 0.45 USDC fee from pool 0x42...fE2",
  },
  {
    time: "14:31:22",
    type: "alert",
    message: "High volatility detected in CELO/WETH pair (+4.2% in 5m)",
  },
  {
    time: "14:31:10",
    type: "trade",
    message: "Ghost_LP rebalanced position +$15k USDm liquidity",
  },
  {
    time: "14:30:55",
    type: "trade",
    message: "Neon_Trader_v4 closed short 500 ETH for +$120.40",
  },
  {
    time: "14:30:42",
    type: "fee",
    message: "Collected 1.12 USDC fee from swap",
  },
];

export default function ActivityFeed() {
  const events = useQuery(api.activityLog.getRecent, { limit: 20 });

  const EVENTS: ActivityEvent[] =
    events && events.length > 0
      ? events.map((event) => ({
          time: formatTime(new Date(event.timestamp)),
          type: event.type as EventType,
          message: event.message,
        }))
      : FALLBACK_EVENTS;

  return (
    <div className="border-panel">
      <div className="p-3 border-b border-terminal-border flex justify-between items-center">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider">
          Live Activity Feed
        </h3>
        <label className="flex items-center gap-1 cursor-pointer">
          <input
            type="checkbox"
            defaultChecked
            className="w-3 h-3 bg-black border-terminal-border text-terminal-green focus:ring-0 rounded-none accent-terminal-green"
          />
          <span className="text-[9px] font-sans uppercase tracking-wider text-slate-500">
            AUTO-SCROLL
          </span>
        </label>
      </div>
      <div className="h-64 overflow-y-auto p-2 space-y-1 font-mono text-[11px] custom-scrollbar">
        {EVENTS.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-1 border-b border-terminal-border/30"
          >
            <span className="text-slate-500 shrink-0">{e.time}</span>
            <span
              className={`px-1 text-[9px] shrink-0 ${TAG_STYLES[e.type]}`}
            >
              {TAG_LABELS[e.type]}
            </span>
            <span
              className={
                e.type === "alert" ? "text-terminal-red" : "text-white"
              }
            >
              {e.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
