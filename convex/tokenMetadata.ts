import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByToken = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tokenMetadata")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .order("desc")
      .first();
  },
});

export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const tokens = ["CELO", "BTC", "ETH", "XAUt", "USDC", "USDT", "USDm", "EURm", "BRLm"];
    const results = [];
    for (const token of tokens) {
      const meta = await ctx.db
        .query("tokenMetadata")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (meta) results.push(meta);
    }
    return results;
  },
});
