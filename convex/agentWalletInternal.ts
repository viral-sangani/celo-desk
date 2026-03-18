import { v } from "convex/values";
import { internalMutation, internalQuery } from "./_generated/server";

// Internal query (for use within actions)
export const getAgentForUser = internalQuery({
  args: { userAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_userAddress", (q) =>
        q.eq("userAddress", args.userAddress)
      )
      .first();
  },
});

// Internal mutation to save agent
export const saveAgent = internalMutation({
  args: {
    name: v.string(),
    walletAddress: v.string(),
    userAddress: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("agents", {
      name: args.name,
      walletAddress: args.walletAddress,
      userAddress: args.userAddress,
      status: "active" as const,
      portfolioValue: 0,
      pnl: 0,
      pnlPercent: 0,
      totalTrades: 0,
      winRate: 0,
      tradeIntervalMs: 300000,
      createdAt: now,
      nextTradeAt: now + 300000,
    });
  },
});
