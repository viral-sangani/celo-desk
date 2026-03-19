import { query } from "./_generated/server";
import { v } from "convex/values";

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .first();
    return agent;
  },
});

export const getLeaderboard = query({
  args: { limit: v.float64() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_pnl")
      .order("desc")
      .take(args.limit);
  },
});

export const getHoldings = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("holdings")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
  },
});

// Holdings with per-token P/L based on cost basis from trades
export const getHoldingsWithPnL = query({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const holdings = await ctx.db
      .query("holdings")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    // Get cost basis from trades
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    const costBasis: Record<string, number> = {};
    for (const trade of trades) {
      if (trade.decision === "swap" && trade.fromAmount > 0 && trade.priceUsd > 0 && trade.toToken) {
        costBasis[trade.toToken] = (costBasis[trade.toToken] ?? 0) + (trade.fromAmount * trade.priceUsd);
      }
    }

    return holdings.map((h) => {
      const spent = costBasis[h.token] ?? 0;
      // For stablecoins like USDT that were deposited (not bought), cost = current value
      const cost = spent > 0 ? spent : h.valueUsd;
      const pnl = h.valueUsd - cost;
      const pnlPercent = cost > 0 ? (pnl / cost) * 100 : 0;
      return { ...h, costBasisUsd: cost, pnl, pnlPercent };
    });
  },
});
