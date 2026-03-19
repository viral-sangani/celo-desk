import { query, internalQuery } from "./_generated/server";

export const getLatest = query({
  args: {},
  handler: async (ctx) => {
    const pairs = ["USDm/USDT", "EURm/USDT", "BRLm/USDT", "KESm/USDT", "COPm/USDT", "PHPm/USDT", "XOFm/USDT", "NGNm/USDT", "JPYm/USDT", "CHFm/USDT"];
    const results = [];
    for (const pair of pairs) {
      const rate = await ctx.db
        .query("fxRates")
        .withIndex("by_pair", (q) => q.eq("pair", pair))
        .order("desc")
        .first();
      if (rate) {
        results.push(rate);
      }
    }
    return results;
  },
});

export const getLatestInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    const pairs = ["USDm/USDT", "EURm/USDT", "BRLm/USDT", "KESm/USDT", "COPm/USDT", "PHPm/USDT", "XOFm/USDT", "NGNm/USDT", "JPYm/USDT", "CHFm/USDT"];
    const results = [];
    for (const pair of pairs) {
      const rate = await ctx.db
        .query("fxRates")
        .withIndex("by_pair", (q) => q.eq("pair", pair))
        .order("desc")
        .first();
      if (rate) results.push(rate);
    }
    return results;
  },
});
