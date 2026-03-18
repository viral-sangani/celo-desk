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
      "CELO",
      "USDC",
      "USDT",
      "BTC",
      "ETH",
      "XAUt",
      "USDm",
      "EURm",
      "BRLm",
      "WETH",
      "WBTC",
    ];
    const results = [];
    for (const token of tokens) {
      const price = await ctx.db
        .query("prices")
        .withIndex("by_token", (q) => q.eq("token", token))
        .order("desc")
        .first();
      if (price) results.push(price);
    }
    return results;
  },
});
