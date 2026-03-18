"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import GlassTooltip from "@/components/ui/GlassTooltip";

type FilterType = "all" | "analysis" | "news";

function getSourceColor(source: string): string {
  switch (source.toUpperCase()) {
    case "GROK": return "text-purple-400";
    case "FOREXLIVE": return "text-blue-400";
    case "FXSTREET": return "text-cyan-400";
    case "COINTELEGRAPH": return "text-yellow-400";
    default: return "text-gray-400";
  }
}

function getSentimentBadge(sentiment?: string) {
  if (!sentiment) return null;
  const colors: Record<string, string> = {
    bullish: "text-terminal-green bg-terminal-green/10 border-terminal-green/30",
    bearish: "text-red-400 bg-red-400/10 border-red-400/30",
    neutral: "text-gray-400 bg-gray-400/10 border-gray-600/30",
  };
  return (
    <span
      className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${colors[sentiment] ?? colors.neutral}`}
    >
      {sentiment}
    </span>
  );
}

export default function IntelFeed() {
  const [filter, setFilter] = useState<FilterType>("all");
  const intel = useQuery(api.latestIntel.getLatestIntel, { limit: 50 });

  const filtered = intel?.filter(
    (item) => filter === "all" || item.type === filter
  );

  const filters: { id: FilterType; label: string }[] = [
    { id: "all", label: "ALL" },
    { id: "analysis", label: "ANALYSIS" },
    { id: "news", label: "NEWS" },
  ];

  return (
    <div className="border border-terminal-border bg-[#0a0a0a]">
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-1 px-3 py-2 border-b border-terminal-border">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider mr-2 shrink-0">
          Market Intelligence
        </span>
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
              filter === f.id
                ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="max-h-[400px] lg:max-h-[500px] overflow-y-auto">
        {!filtered || filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-600">
            No intelligence data yet. Crons will populate this feed.
          </div>
        ) : (
          filtered.map((item) => {
            const time = new Date(item.timestamp);
            const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
            return (
              <div
                key={item._id}
                className="px-3 py-2.5 border-b border-terminal-border/50 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-600">{timeStr}</span>
                  <span className={`text-[10px] font-bold ${getSourceColor(item.source)}`}>
                    [{item.source.toUpperCase()}]
                  </span>
                  <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase text-gray-500 border border-gray-700">
                    {item.type}
                  </span>
                  {getSentimentBadge(item.sentiment)}
                </div>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-white font-medium hover:text-terminal-green"
                  >
                    {item.title}
                  </a>
                ) : (
                  <div className="text-xs text-white font-medium">{item.title}</div>
                )}
                {item.content && (
                  <GlassTooltip text={item.content} maxWidth={400}>
                    <div className="text-[11px] text-gray-400 mt-1 line-clamp-2 cursor-default">
                      {item.content.slice(0, 200)}
                      {item.content.length > 200 && "..."}
                    </div>
                  </GlassTooltip>
                )}
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-terminal-green hover:underline mt-1 inline-block"
                  >
                    Read more &rarr;
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
