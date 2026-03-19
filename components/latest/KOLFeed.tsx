"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function getSentimentColor(sentiment?: string): string {
  if (sentiment === "bullish") return "text-terminal-green";
  if (sentiment === "bearish") return "text-red-400";
  return "text-gray-400";
}

const PAGE_SIZE = 10;

export default function KOLFeed() {
  const [page, setPage] = useState(0);
  const tweets = useQuery(api.latestIntel.getKolTweets, { limit: 50 });

  const totalItems = tweets?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedTweets = tweets?.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE) ?? [];

  return (
    <div className="border border-terminal-border bg-[#0a0a0a]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-terminal-border">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
          KOL Tracker (Crypto Influencers)
        </span>
        <span className="text-[9px] text-terminal-amber">AI-Generated Summaries</span>
      </div>
      <div className="max-h-[400px] overflow-y-auto">
        {!tweets || tweets.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-600">
            Waiting for KOL data... Grok will generate summaries from key influencers.
          </div>
        ) : (
          pagedTweets.map((tweet, i) => {
            const time = new Date(tweet.timestamp);
            const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}`;
            const handle = (tweet.handle ?? "").replace(/^@/, "");
            const profileUrl = handle ? `https://x.com/${handle}` : null;
            return (
              <div
                key={`${tweet._id}-${i}`}
                className="px-3 py-2.5 border-b border-terminal-border/50 hover:bg-white/[0.02]"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-gray-600">{timeStr}</span>
                  {profileUrl ? (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-bold text-purple-400 hover:text-purple-300"
                    >
                      @{handle}
                    </a>
                  ) : (
                    <span className="text-xs font-bold text-purple-400">
                      {tweet.handle}
                    </span>
                  )}
                  <span className="text-[10px] text-gray-600">{tweet.name}</span>
                  {tweet.sentiment && (
                    <span
                      className={`text-[9px] font-bold uppercase ${getSentimentColor(tweet.sentiment)}`}
                    >
                      {tweet.sentiment}
                    </span>
                  )}
                  {tweet.tokens && (
                    <span className="text-[9px] text-gray-600">
                      {tweet.tokens}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-300 leading-relaxed">
                  {tweet.text}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {profileUrl && (
                    <a
                      href={profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-terminal-green hover:underline"
                    >
                      @{handle} on X &rarr;
                    </a>
                  )}
                  {handle && (
                    <a
                      href={`https://x.com/search?q=from%3A${handle}&src=typed_query&f=live`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-gray-500 hover:text-terminal-green hover:underline"
                    >
                      Latest posts &rarr;
                    </a>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-terminal-border bg-[#111]">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="text-[10px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.97]"
          >
            &larr; PREV
          </button>
          <span className="text-[10px] text-gray-600">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="text-[10px] text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:scale-[0.97]"
          >
            NEXT &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
