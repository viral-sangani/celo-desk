"use client";

import Panel from "@/components/ui/Panel";
import { api } from "@/convex/_generated/api";
import { useQueryCached } from "@/lib/useQueryCached";

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getUTCHours()).padStart(2, "0");
  const m = String(d.getUTCMinutes()).padStart(2, "0");
  const s = String(d.getUTCSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export default function NewsFeed() {
  const news = useQueryCached<any[]>(api.news.getRecent, { limit: 20 }, "news_feed");
  const isLoading = news === undefined;

  const items =
    news && news.length > 0
      ? news.map((n: any) => ({
          timestamp: formatTimestamp(n.timestamp),
          source: n.source as string,
          headline: n.headline as string,
        }))
      : [];

  return (
    <Panel title="MARKET FEED" collapsible>
      <div className="flex-grow overflow-auto custom-scrollbar p-2">
        <div className="space-y-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <article key={i} className="border-b border-terminal-border pb-3">
                  <div className="flex gap-2 mb-2">
                    <div className="h-3 w-16 bg-terminal-border/50 animate-pulse" />
                    <div className="h-3 w-28 bg-terminal-border/50 animate-pulse" />
                  </div>
                  <div className="h-4 w-full bg-terminal-border/30 animate-pulse mb-1" />
                  <div className="h-4 w-3/4 bg-terminal-border/30 animate-pulse" />
                </article>
              ))
            : items.map((item, i) => (
                <article key={i} className="border-b border-terminal-border pb-3">
                  <div className="flex items-center space-x-2 text-[10px] mb-1">
                    <span className="text-terminal-amber">{item.timestamp}</span>
                    <span className="text-gray-500">[{item.source}]</span>
                  </div>
                  <h3 className="text-xs text-white leading-relaxed">
                    {item.headline}
                  </h3>
                </article>
              ))}
        </div>
      </div>
    </Panel>
  );
}
