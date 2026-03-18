import { query } from "./_generated/server";
import { v } from "convex/values";

export const getLatestMetrics = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("platformMetrics")
      .withIndex("by_timestamp")
      .order("desc")
      .first();
  },
});

export const getMetricsHistory = query({
  args: { days: v.float64() },
  handler: async (ctx, args) => {
    const since = Date.now() - args.days * 86400000;
    return await ctx.db
      .query("platformMetrics")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", since))
      .order("asc")
      .collect();
  },
});

export const getRevenueBreakdown = query({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    const feesByPair: Record<string, number> = {};
    for (const t of trades) {
      const pair = `${t.fromToken}/${t.toToken}`;
      feesByPair[pair] = (feesByPair[pair] ?? 0) + t.feeUsd;
    }
    return Object.entries(feesByPair)
      .map(([pair, totalFees]) => ({ pair, totalFees }))
      .sort((a, b) => b.totalFees - a.totalFees)
      .slice(0, 10);
  },
});
