import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const savePrices = internalMutation({
  args: {
    prices: v.array(
      v.object({
        token: v.string(),
        priceUsd: v.float64(),
        change24h: v.float64(),
        marketCap: v.float64(),
        volume24h: v.float64(),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const p of args.prices) {
      await ctx.db.insert("prices", p);
    }
  },
});

export const saveNews = internalMutation({
  args: {
    items: v.array(
      v.object({
        source: v.string(),
        headline: v.string(),
        url: v.string(),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      const existing = await ctx.db
        .query("news")
        .withIndex("by_timestamp")
        .filter((q) => q.eq(q.field("headline"), item.headline))
        .first();
      if (!existing) {
        await ctx.db.insert("news", item);
      }
    }
  },
});

export const saveTokenMetadata = internalMutation({
  args: {
    metadata: v.array(
      v.object({
        token: v.string(),
        marketCap: v.optional(v.float64()),
        fullyDilutedValuation: v.optional(v.float64()),
        circulatingSupply: v.optional(v.float64()),
        totalSupply: v.optional(v.float64()),
        maxSupply: v.optional(v.float64()),
        totalVolume24h: v.optional(v.float64()),
        tvl: v.optional(v.float64()),
        holders: v.optional(v.float64()),
        priceUsd: v.optional(v.float64()),
        change24h: v.optional(v.float64()),
        change7d: v.optional(v.float64()),
        change30d: v.optional(v.float64()),
        ath: v.optional(v.float64()),
        athDate: v.optional(v.string()),
        rank: v.optional(v.float64()),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const meta of args.metadata) {
      // Delete old record for this token
      const existing = await ctx.db
        .query("tokenMetadata")
        .withIndex("by_token", (q) => q.eq("token", meta.token))
        .collect();
      for (const old of existing) {
        await ctx.db.delete(old._id);
      }
      // Insert new
      await ctx.db.insert("tokenMetadata", meta);
    }
  },
});

export const saveSocialSentiment = internalMutation({
  args: {
    items: v.array(
      v.object({
        token: v.string(),
        sentiment: v.string(),
        score: v.float64(),
        summary: v.string(),
        topTweets: v.optional(v.string()),
        source: v.string(),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      await ctx.db.insert("socialSentiment", item);
    }
  },
});

export const saveFearGreedIndex = internalMutation({
  args: {
    value: v.float64(),
    classification: v.string(),
    timestamp: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fearGreedIndex", args);
  },
});

export const saveFXGlobalVolume = internalMutation({
  args: {
    totalVolume24h: v.float64(),
    volumeChange24h: v.float64(),
    topPairs: v.string(),
    source: v.string(),
    timestamp: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("fxGlobalVolume", args);
  },
});

export const saveKolTweets = internalMutation({
  args: {
    items: v.array(
      v.object({
        handle: v.string(),
        name: v.string(),
        text: v.string(),
        url: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        tokens: v.optional(v.string()),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      // Deduplicate by handle + text prefix
      const existing = await ctx.db
        .query("kolTweets")
        .withIndex("by_handle", (q) => q.eq("handle", item.handle))
        .filter((q) => q.eq(q.field("text"), item.text))
        .first();
      if (!existing) {
        await ctx.db.insert("kolTweets", item);
      }
    }
  },
});

export const saveMarketIntel = internalMutation({
  args: {
    items: v.array(
      v.object({
        type: v.string(),
        title: v.string(),
        content: v.string(),
        source: v.string(),
        url: v.optional(v.string()),
        tokens: v.optional(v.string()),
        sentiment: v.optional(v.string()),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const item of args.items) {
      // Deduplicate by title
      const existing = await ctx.db
        .query("marketIntel")
        .withIndex("by_timestamp")
        .filter((q) => q.eq(q.field("title"), item.title))
        .first();
      if (!existing) {
        await ctx.db.insert("marketIntel", item);
      }
    }
  },
});

export const saveFXRates = internalMutation({
  args: {
    rates: v.array(
      v.object({
        pair: v.string(),
        price: v.float64(),
        change24h: v.float64(),
        spread: v.float64(),
        timestamp: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const rate of args.rates) {
      await ctx.db.insert("fxRates", rate);
    }
  },
});
