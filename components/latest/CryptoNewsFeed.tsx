"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getSourceColor(source: string): string {
  switch (source.toUpperCase()) {
    case "COINTELEGRAPH": return "text-yellow-400";
    case "COINDESK": return "text-blue-400";
    case "DECRYPT": return "text-purple-400";
    case "THE DEFIANT": return "text-orange-400";
    case "THE BLOCK": return "text-cyan-400";
    default: return "text-gray-400";
  }
}

export default function CryptoNewsFeed() {
  const news = useQuery(api.news.getRecent, { limit: 15 });

  return (
    <div className="border border-terminal-border bg-[#0a0a0a] p-4">
      <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
        Crypto News
      </div>
      {!news || news.length === 0 ? (
        <div className="text-xs text-gray-600">No news yet</div>
      ) : (
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto">
          {news.map((item) => {
            const time = new Date(item.timestamp);
            const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
            return (
              <div key={item._id} className="group">
                <div className="flex items-start gap-2">
                  <span className="text-[10px] text-gray-600 shrink-0 mt-0.5">
                    {timeStr}
                  </span>
                  <div className="min-w-0">
                    <span className={`text-[10px] font-bold mr-1.5 ${getSourceColor(item.source)}`}>
                      {item.source}
                    </span>
                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-300 hover:text-terminal-green"
                      >
                        {item.headline}
                      </a>
                    ) : (
                      <span className="text-xs text-gray-300">{item.headline}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
