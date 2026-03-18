import { v } from "convex/values";
import { query } from "./_generated/server";

// Public query: check if user already has an agent
export const getAgentForUser = query({
  args: { userAddress: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("agents")
      .withIndex("by_userAddress", (q) =>
        q.eq("userAddress", args.userAddress.toLowerCase())
      )
      .first();
  },
});
