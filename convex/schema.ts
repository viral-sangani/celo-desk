import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  agents: defineTable({
    name: v.string(),
    walletAddress: v.string(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("stopped")
    ),
    portfolioValue: v.float64(),
    pnl: v.float64(),
    pnlPercent: v.float64(),
    totalTrades: v.float64(),
    winRate: v.float64(),
    tradeIntervalMs: v.float64(),
    lastTradeAt: v.optional(v.float64()),
    nextTradeAt: v.optional(v.float64()),
    userAddress: v.optional(v.string()),
    personality: v.optional(v.string()),        // "dip_buyer" | "momentum" | "stablecoin_farmer" | "celo_maxi" | "custom"
    personalityPrompt: v.optional(v.string()),  // custom prompt text
    riskLevel: v.optional(v.string()),          // "conservative" | "moderate" | "aggressive"
    createdAt: v.float64(),
  })
    .index("by_status", ["status"])
    .index("by_pnl", ["pnlPercent"])
    .index("by_userAddress", ["userAddress"]),

  holdings: defineTable({
    agentId: v.id("agents"),
    token: v.string(),
    amount: v.float64(),
    valueUsd: v.float64(),
    allocationPercent: v.float64(),
  }).index("by_agent", ["agentId"]),

  trades: defineTable({
    agentId: v.id("agents"),
    fromToken: v.string(),
    toToken: v.string(),
    fromAmount: v.float64(),
    toAmount: v.float64(),
    priceUsd: v.float64(),
    feeUsd: v.float64(),
    txHash: v.string(),
    timestamp: v.float64(),
    reason: v.optional(v.string()),
    reasonFull: v.optional(v.string()),
    decision: v.optional(v.string()),
  })
    .index("by_agent", ["agentId", "timestamp"])
    .index("by_timestamp", ["timestamp"]),

  prices: defineTable({
    token: v.string(),
    priceUsd: v.float64(),
    change24h: v.float64(),
    marketCap: v.optional(v.float64()),
    volume24h: v.optional(v.float64()),
    timestamp: v.float64(),
    // OHLCV fields for candlestick chart
    open: v.optional(v.float64()),
    high: v.optional(v.float64()),
    low: v.optional(v.float64()),
    close: v.optional(v.float64()),
    volume: v.optional(v.float64()),
  }).index("by_token", ["token", "timestamp"]),

  fxRates: defineTable({
    pair: v.string(),
    price: v.float64(),
    change24h: v.float64(),
    spread: v.float64(),
    timestamp: v.float64(),
  }).index("by_pair", ["pair", "timestamp"]),

  news: defineTable({
    source: v.string(),
    headline: v.string(),
    url: v.optional(v.string()),
    timestamp: v.float64(),
  }).index("by_timestamp", ["timestamp"]),

  platformMetrics: defineTable({
    tvl: v.float64(),
    tvlChange24h: v.float64(),
    totalTrades24h: v.float64(),
    totalVolume24h: v.float64(),
    totalFeesEarned: v.float64(),
    activeAgents: v.float64(),
    avgTradeFrequencyMs: v.float64(),
    timestamp: v.float64(),
  }).index("by_timestamp", ["timestamp"]),

  activityLog: defineTable({
    type: v.union(
      v.literal("trade"),
      v.literal("agent"),
      v.literal("fee"),
      v.literal("alert")
    ),
    message: v.string(),
    agentId: v.optional(v.id("agents")),
    timestamp: v.float64(),
  }).index("by_timestamp", ["timestamp"]),

  socialSentiment: defineTable({
    token: v.string(),
    sentiment: v.string(),
    score: v.float64(),
    summary: v.string(),
    topTweets: v.optional(v.string()),
    source: v.string(),
    timestamp: v.float64(),
  }).index("by_token", ["token", "timestamp"]),

  fearGreedIndex: defineTable({
    value: v.float64(),
    classification: v.string(),
    timestamp: v.float64(),
  }).index("by_timestamp", ["timestamp"]),

  fxGlobalVolume: defineTable({
    totalVolume24h: v.float64(),
    volumeChange24h: v.float64(),
    topPairs: v.string(),
    source: v.string(),
    timestamp: v.float64(),
  }).index("by_timestamp", ["timestamp"]),

  marketIntel: defineTable({
    type: v.string(),
    title: v.string(),
    content: v.string(),
    source: v.string(),
    url: v.optional(v.string()),
    tokens: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    timestamp: v.float64(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_type", ["type", "timestamp"]),

  kolTweets: defineTable({
    handle: v.string(),
    name: v.string(),
    text: v.string(),
    url: v.optional(v.string()),
    sentiment: v.optional(v.string()),
    tokens: v.optional(v.string()),
    timestamp: v.float64(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_handle", ["handle", "timestamp"]),

  tokenMetadata: defineTable({
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
  }).index("by_token", ["token"]),
});
