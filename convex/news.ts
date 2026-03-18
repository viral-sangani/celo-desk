import { query } from "./_generated/server";
import { v } from "convex/values";

export const getRecent = query({
  args: { limit: v.float64() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("news")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit);
  },
});
