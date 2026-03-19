import { query, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getLatestSentiment = query({
  args: {},
  handler: async (ctx) => {
    const tokens = ["CELO", "BTC", "ETH"];
    const results = [];
    for (const token of tokens) {
      const latest = await ctx.db
        .query("socialSentiment")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (latest) results.push(latest);
    }
    return results;
  },
});

export const getFearGreedIndex = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fearGreedIndex")
      .withIndex("by_timestamp")
      .order("desc")
      .first();
  },
});

export const getTopCeloTokens = query({
  args: {},
  handler: async (ctx) => {
    const celoTokens = ["CELO", "USDC", "USDT", "USDm", "WETH", "WBTC", "XAUt"];
    const results = [];
    for (const token of celoTokens) {
      const meta = await ctx.db
        .query("tokenMetadata")
        .withIndex("by_token", (q) => q.eq("token", token))
        .first();
      if (meta && meta.marketCap) {
        results.push(meta);
      }
    }
    return results.sort((a, b) => (b.marketCap ?? 0) - (a.marketCap ?? 0));
  },
});

export const getLatestIntel = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("marketIntel")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});

export const getLatestNews = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("marketIntel")
      .withIndex("by_type", (q) => q.eq("type", "news"))
      .order("desc")
      .take(limit);
  },
});

// Internal versions for use from internalActions (agentTrading)
export const getLatestSentimentInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tokens = ["CELO", "BTC", "ETH"];
    const results = [];
    for (const token of tokens) {
      const latest = await ctx.db
        .query("socialSentiment")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (latest) results.push(latest);
    }
    return results;
  },
});

export const getFearGreedIndexInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("fearGreedIndex")
      .withIndex("by_timestamp")
      .order("desc")
      .first();
  },
});

export const getTokenMetadataAllInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tokens = ["CELO", "BTC", "ETH", "XAUt", "USDC", "USDT"];
    const results = [];
    for (const token of tokens) {
      const meta = await ctx.db
        .query("tokenMetadata")
        .withIndex("by_token", (q) => q.eq("token", token))
        .first();
      if (meta) results.push(meta);
    }
    return results;
  },
});

export const getKolTweets = query({
  args: { limit: v.optional(v.float64()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("kolTweets")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});
