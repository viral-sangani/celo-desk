"use client";

import { Doc } from "@/convex/_generated/dataModel";

interface ReasonModalProps {
  trade: Doc<"trades">;
  onClose: () => void;
}

export default function ReasonModal({ trade, onClose }: ReasonModalProps) {
  const isSwap = trade.decision === "swap";
  const time = new Date(trade.timestamp).toLocaleString();

  let fullReasoning = trade.reasonFull ?? "";
  try {
    const parsed = JSON.parse(fullReasoning);
    fullReasoning = JSON.stringify(parsed, null, 2);
  } catch {
    // keep as-is
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-backdrop-in">
      <div className="bg-[#0a0a0a] border border-terminal-border rounded w-full max-w-lg mx-3 sm:mx-4 max-h-[85vh] sm:max-h-[80vh] flex flex-col animate-modal-in">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-terminal-border">
          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                isSwap
                  ? "bg-terminal-green/20 text-terminal-green border border-terminal-green/30"
                  : "bg-gray-700/40 text-gray-400 border border-gray-600/30"
              }`}
            >
              {trade.decision ?? "swap"}
            </span>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white text-lg leading-none transition-colors active:scale-[0.97]"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-3 overflow-y-auto flex-1">
          {isSwap && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Trade</div>
              <div className="text-sm text-white">
                {trade.fromAmount.toFixed(4)} {trade.fromToken} &rarr; {trade.toToken}
              </div>
              {trade.priceUsd > 0 && (
                <div className="text-xs text-gray-400">
                  Value: ${(trade.fromAmount * trade.priceUsd).toFixed(2)} | Fee: ${trade.feeUsd.toFixed(4)}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">Reason</div>
            <div className="text-sm text-gray-300">{trade.reason || "No reason provided"}</div>
          </div>

          {fullReasoning && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Full Analysis</div>
              <pre className="text-xs text-gray-400 bg-black/50 p-3 rounded border border-terminal-border overflow-x-auto whitespace-pre-wrap font-mono">
                {fullReasoning}
              </pre>
            </div>
          )}

          {trade.txHash && trade.txHash !== "" && (
            <div className="space-y-1">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider">Transaction</div>
              <a
                href={`https://celoscan.io/tx/${trade.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-terminal-green hover:underline break-all"
              >
                {trade.txHash}
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-terminal-border">
          <button
            onClick={onClose}
            className="w-full text-xs py-1.5 text-gray-400 border border-terminal-border hover:border-gray-500 hover:text-white transition-colors active:scale-[0.97]"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
