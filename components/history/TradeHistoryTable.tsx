"use client";

import { useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import ReasonModal from "./ReasonModal";
import GlassTooltip from "@/components/ui/GlassTooltip";

interface TradeHistoryTableProps {
  trades: Doc<"trades">[] | undefined;
}

export default function TradeHistoryTable({ trades }: TradeHistoryTableProps) {
  const [selectedTrade, setSelectedTrade] = useState<Doc<"trades"> | null>(null);

  if (!trades) {
    return (
      <div className="border border-terminal-border bg-[#0a0a0a] p-8 text-center text-gray-500 text-sm">
        Loading trade history...
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="border border-terminal-border bg-[#0a0a0a] p-8 text-center text-gray-500 text-sm">
        No trades recorded yet. The agent will start trading once funded.
      </div>
    );
  }

  return (
    <>
      <div className="border border-terminal-border bg-[#0a0a0a] overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-terminal-border text-[10px] text-gray-500 uppercase tracking-wider">
              <th className="text-left px-3 py-2">Time</th>
              <th className="text-left px-3 py-2">Decision</th>
              <th className="text-left px-3 py-2">Pair</th>
              <th className="text-right px-3 py-2">Amount</th>
              <th className="text-right px-3 py-2">Value</th>
              <th className="text-left px-3 py-2">Reason</th>
              <th className="text-left px-3 py-2">Tx</th>
              <th className="text-center px-3 py-2">Detail</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const isSwap = trade.decision === "swap" || (!trade.decision && trade.txHash !== "");
              const time = new Date(trade.timestamp);
              const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
              const dateStr = `${time.getMonth() + 1}/${time.getDate()}`;
              const value = isSwap && trade.priceUsd > 0
                ? `$${(trade.fromAmount * trade.priceUsd).toFixed(2)}`
                : "—";
              const shortHash =
                trade.txHash && trade.txHash.length > 10
                  ? `${trade.txHash.slice(0, 6)}...${trade.txHash.slice(-4)}`
                  : "";

              return (
                <tr
                  key={trade._id}
                  className="border-b border-terminal-border/50 hover:bg-white/[0.02]"
                >
                  <td className="px-3 py-2 text-gray-400 whitespace-nowrap">
                    <div>{timeStr}</div>
                    <div className="text-[10px] text-gray-600">{dateStr}</div>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isSwap
                          ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/30"
                          : "bg-gray-700/40 text-gray-400 border border-gray-600/30"
                      }`}
                    >
                      {isSwap ? "SWAP" : "HOLD"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-white whitespace-nowrap">
                    {isSwap ? (
                      <>
                        {trade.fromToken} <span className="text-gray-500">&rarr;</span>{" "}
                        {trade.toToken}
                      </>
                    ) : (
                      <span className="text-gray-500">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right text-white tabular-nums">
                    {isSwap ? trade.fromAmount.toFixed(2) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right text-white tabular-nums">{value}</td>
                  <td className="px-3 py-2 text-gray-400 max-w-[250px]">
                    <GlassTooltip text={trade.reason || ""}>
                      <span className="line-clamp-2 cursor-default">
                        {trade.reason || "—"}
                      </span>
                    </GlassTooltip>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {shortHash ? (
                      <GlassTooltip text={trade.txHash}>
                        <a
                          href={`https://celoscan.io/tx/${trade.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-terminal-green hover:underline font-mono"
                        >
                          {shortHash}
                        </a>
                      </GlassTooltip>
                    ) : (
                      <span className="text-gray-600 text-[10px]">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => setSelectedTrade(trade)}
                      className="text-gray-500 hover:text-terminal-green text-[10px] border border-terminal-border px-2 py-0.5 hover:border-terminal-green/30 transition-colors active:scale-[0.97]"
                    >
                      DETAIL
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedTrade && (
        <ReasonModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}
