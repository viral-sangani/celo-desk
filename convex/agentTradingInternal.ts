import { internalQuery } from "./_generated/server";

export const getActiveAgents = internalQuery({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
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
