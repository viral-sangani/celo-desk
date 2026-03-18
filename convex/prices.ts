import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLatest = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const price = await ctx.db
      .query("prices")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .order("desc")
      .first();
    return price;
  },
});

export const getLatestAll = query({
  args: {},
  handler: async (ctx) => {
    const tokens = ["CELO", "USDC", "USDT", "BTC", "ETH", "XAUt"];
    const results = [];
    for (const token of tokens) {
      const price = await ctx.db
        .query("prices")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (price) {
        results.push(price);
      }
    }
    return results;
  },
});

const TIMEFRAME_MS: Record<string, number> = {
  "1H": 60 * 60 * 1000,
  "4H": 4 * 60 * 60 * 1000,
  "1D": 24 * 60 * 60 * 1000,
  "1W": 7 * 24 * 60 * 60 * 1000,
};

export const getHistory = query({
  args: { token: v.string(), timeframe: v.string() },
  handler: async (ctx, args) => {
    const ms = TIMEFRAME_MS[args.timeframe] ?? TIMEFRAME_MS["1D"];
    const since = Date.now() - ms;

    const prices = await ctx.db
      .query("prices")
      .withIndex("by_token", (q) =>
        q.eq("token", args.token).gte("timestamp", since)
      )
      .order("asc")
      .collect();

    // Only return entries that have OHLCV data
    return prices.filter((p) => p.open !== undefined);
  },
});
