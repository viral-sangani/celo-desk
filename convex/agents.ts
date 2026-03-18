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
