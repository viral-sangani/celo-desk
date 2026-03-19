"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassTooltip from "@/components/ui/GlassTooltip";

function getSentimentColor(sentiment: string): string {
  if (sentiment === "bullish") return "#00ff41";
  if (sentiment === "bearish") return "#ff4444";
  return "#888888";
}

const PLACEHOLDER_TOKENS = ["BTC", "ETH", "CELO"];

export default function SocialSentiment() {
  const data = useQuery(api.latestIntel.getLatestSentiment);

  const tokens = data && data.length > 0 ? data : null;

  return (
    <div className="border border-terminal-border bg-[#0a0a0a] p-4 flex flex-col justify-between">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
        Social Sentiment (X/Twitter)
      </div>
      <div className="space-y-3 flex-1">
        {tokens ? (
          tokens.map((item) => {
            const color = getSentimentColor(item.sentiment);
            const normalizedScore = (item.score + 100) / 2; // -100..100 → 0..100
            return (
              <div key={item.token} className="space-y-1">
                <div className="flex items-center justify-between">
                  <a
                    href={`https://x.com/search?q=%24${item.token}&src=typed_query&f=live`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white hover:text-terminal-green"
                  >
                    {item.token}
                  </a>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase"
                      style={{ color }}
                    >
                      {item.sentiment}
                    </span>
                    <span className="text-xs font-mono tabular-nums" style={{ color }}>
                      {item.score > 0 ? "+" : ""}
                      {item.score}
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden relative">
                  <div
                    className="absolute top-0 h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(4, normalizedScore)}%`,
                      backgroundColor: color,
                      left: 0,
                    }}
                  />
                </div>
                {item.summary && (
                  <GlassTooltip text={item.summary}>
                    <div className="text-[10px] text-gray-600 line-clamp-1 cursor-default">
                      {item.summary}
                    </div>
                  </GlassTooltip>
                )}
              </div>
            );
          })
        ) : (
          PLACEHOLDER_TOKENS.map((token) => (
            <div key={token} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{token}</span>
                <span className="text-[10px] text-gray-600">Waiting for Grok...</span>
              </div>
              <div className="h-1.5 bg-[#1a1a1a] rounded-full" />
            </div>
          ))
        )}
      </div>
      <div className="text-[9px] text-gray-700 mt-2 pt-1 border-t border-terminal-border/50">
        <span className="text-terminal-amber">AI-Generated Sentiment</span> &middot; Click token to view on X
      </div>
    </div>
  );
}
