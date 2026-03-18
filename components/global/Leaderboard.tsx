"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatUsd } from "@/lib/format";

const FALLBACK_AGENTS = [
  {
    rank: "01",
    name: "Alpha_Arbitrage",
    pnl: "+$4,210.00",
    pnlPositive: true,
    winRate: "68.2%",
    portfolio: "$45,210",
  },
  {
    rank: "02",
    name: "Neon_Trader_v4",
    pnl: "+$3,850.12",
    pnlPositive: true,
    winRate: "72.1%",
    portfolio: "$32,150",
  },
  {
    rank: "03",
    name: "Ghost_LP",
    pnl: "-$1,200.50",
    pnlPositive: false,
    winRate: "45.8%",
    portfolio: "$128,400",
  },
  {
    rank: "04",
    name: "Liquid_Celo_Bot",
    pnl: "+$840.44",
    pnlPositive: true,
    winRate: "59.0%",
    portfolio: "$15,200",
  },
];

export default function Leaderboard() {
  const agents = useQuery(api.agents.getLeaderboard, { limit: 10 });

  const AGENTS =
    agents && agents.length > 0
      ? agents.map((agent, i) => ({
          rank: String(i + 1).padStart(2, "0"),
          name: agent.name,
          pnl: `${agent.pnl >= 0 ? "+" : ""}${formatUsd(agent.pnl)}`,
          pnlPositive: agent.pnl >= 0,
          winRate: `${(agent.winRate * 100).toFixed(1)}%`,
          portfolio: formatUsd(agent.portfolioValue),
        }))
      : FALLBACK_AGENTS;

  return (
    <div className="border-panel">
      <div className="p-3 border-b border-terminal-border">
        <h3 className="font-sans text-xs font-bold uppercase tracking-wider">
          Agent Leaderboard
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#333]/20">
            <tr className="text-[9px] font-sans uppercase tracking-wider text-slate-400">
              <th className="p-3 font-normal">RANK</th>
              <th className="p-3 font-normal">AGENT</th>
              <th className="p-3 font-normal text-right">PNL (24H)</th>
              <th className="p-3 font-normal text-right">WIN %</th>
              <th className="p-3 font-normal text-right">PORTFOLIO</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[11px] divide-y divide-terminal-border">
            {AGENTS.map((a) => (
              <tr
                key={a.rank}
                className="hover:bg-terminal-green/5 transition-colors"
              >
                <td className="p-3 text-slate-500">{a.rank}</td>
                <td className="p-3 font-bold">{a.name}</td>
                <td
                  className={`p-3 text-right ${
                    a.pnlPositive ? "text-terminal-green" : "text-terminal-red"
                  }`}
                >
                  {a.pnl}
                </td>
                <td className="p-3 text-right">{a.winRate}</td>
                <td className="p-3 text-right">{a.portfolio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
