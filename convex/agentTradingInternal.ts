import { internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const getActiveAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Calculate cost basis per token from swap trades
// Returns { token: { costBasisUsd, totalSpent } } for each token bought
export const getCostBasisPerToken = internalQuery({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    // For each swap, the USD spent = fromAmount * priceUsd
    // The token bought = toToken
    const costBasis: Record<string, number> = {};
    for (const trade of trades) {
      if (trade.decision === "swap" && trade.fromAmount > 0 && trade.priceUsd > 0) {
        const usdSpent = trade.fromAmount * trade.priceUsd;
        const bought = trade.toToken;
        if (bought) {
          costBasis[bought] = (costBasis[bought] ?? 0) + usdSpent;
        }
      }
    }
    return costBasis;
  },
});

export const getAllPrices = internalQuery({
  args: {},
  handler: async (ctx) => {
    const tokens = [
      "CELO", "USDC", "USDT", "BTC", "ETH", "XAUt",
      "USDm", "EURm", "BRLm", "WETH", "WBTC",
      "KESm", "COPm", "PHPm", "XOFm", "NGNm", "JPYm", "CHFm",
    ];
    const results = [];
    for (const token of tokens) {
      // First try the prices table (crypto tokens)
      const price = await ctx.db
        .query("prices")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (price) {
        results.push(price);
        continue;
      }

      // Fallback: check fxRates table for Mento FX tokens
      const fxPair = `${token}/USDT`;
      const fxRate = await ctx.db
        .query("fxRates")
        .withIndex("by_pair", (q) => q.eq("pair", fxPair))
        .order("desc")
        .first();
      if (fxRate) {
        results.push({
          token,
          priceUsd: fxRate.price,
          change24h: fxRate.change24h,
          marketCap: 0,
          volume24h: 0,
          timestamp: fxRate.timestamp,
        });
      }
    }
    return results;
  },
});
