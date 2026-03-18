import { query } from "./_generated/server";
import { v } from "convex/values";

export const getTradesForAgent = query({
  args: {
    agentId: v.id("agents"),
    limit: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("trades")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .order("desc")
      .take(limit);
  },
});

export const getTradeById = query({
  args: { tradeId: v.id("trades") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.tradeId);
  },
});

export const getAllTrades = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    return await ctx.db
      .query("trades")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getTradesForUser = query({
  args: { userAddress: v.string(), limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const agent = await ctx.db
      .query("agents")
      .withIndex("by_userAddress", (q) =>
        q.eq("userAddress", args.userAddress.toLowerCase())
      )
      .first();
    if (!agent) return [];
    const limit = args.limit ?? 100;
    return await ctx.db
      .query("trades")
      .withIndex("by_agent", (q) => q.eq("agentId", agent._id))
      .order("desc")
      .take(limit);
  },
});
