"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const fetchFearGreed = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const res = await fetch("https://api.alternative.me/fng/?limit=1");
      if (!res.ok) {
        console.error(`Fear & Greed fetch failed: ${res.status}`);
        return;
      }

      const data = await res.json();
      const entry = data.data?.[0];
      if (!entry) return;

      await ctx.runMutation(internal.scraperMutations.saveFearGreedIndex, {
        value: parseFloat(entry.value),
        classification: entry.value_classification ?? "Unknown",
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error("fetchFearGreed error:", err);
    }
  },
});
