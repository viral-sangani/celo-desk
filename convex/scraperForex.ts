"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const RSS_FEEDS = [
  { url: "https://www.forexlive.com/feed/", source: "FOREXLIVE" },
  { url: "https://www.fxstreet.com/rss", source: "FXSTREET" },
];

export const fetchForexNews = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const items: Array<{
      type: string;
      title: string;
      content: string;
      source: string;
      url?: string;
      tokens: undefined;
      sentiment: undefined;
      timestamp: number;
    }> = [];

    for (const feed of RSS_FEEDS) {
      try {
        const res = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
        );
        if (!res.ok) {
          console.error(`RSS fetch failed for ${feed.source}: ${res.status}`);
          continue;
        }

        const data = await res.json();
        if (!data.items || !Array.isArray(data.items)) continue;

        for (const item of data.items.slice(0, 5)) {
          items.push({
            type: "news",
            title: item.title ?? "",
            content: item.description?.replace(/<[^>]*>/g, "").slice(0, 500) ?? "",
            source: feed.source,
            url: item.link ?? undefined,
            tokens: undefined,
            sentiment: undefined,
            timestamp: item.pubDate
              ? new Date(item.pubDate).getTime()
              : now,
          });
        }
      } catch (err) {
        console.error(`RSS error for ${feed.source}:`, err);
      }
    }

    if (items.length > 0) {
      await ctx.runMutation(internal.scraperMutations.saveMarketIntel, { items });
    }
  },
});
