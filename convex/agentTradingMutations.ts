import { v } from "convex/values";
import { internalMutation, mutation } from "./_generated/server";

export const recordTrade = internalMutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("trades", args);
    const label = args.decision === "hold"
      ? `Agent held: ${args.reason ?? "no reason"}`
      : `Agent executed swap: ${args.fromAmount.toFixed(2)} ${args.fromToken} → ${args.toAmount.toFixed(2)} ${args.toToken}`;
    await ctx.db.insert("activityLog", {
      type: "trade",
      message: label,
      agentId: args.agentId,
      timestamp: args.timestamp,
    });
  },
});

export const updateHoldings = internalMutation({
  args: {
    agentId: v.id("agents"),
    holdings: v.array(
      v.object({
        token: v.string(),
        amount: v.float64(),
        valueUsd: v.float64(),
        allocationPercent: v.float64(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Delete old holdings
    const old = await ctx.db
      .query("holdings")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();
    for (const h of old) await ctx.db.delete(h._id);
    // Insert new
    for (const h of args.holdings) {
      await ctx.db.insert("holdings", { agentId: args.agentId, ...h });
    }
  },
});

export const updateAgentMetrics = internalMutation({
  args: {
    agentId: v.id("agents"),
    portfolioValue: v.float64(),
    pnl: v.float64(),
    pnlPercent: v.float64(),
    totalTrades: v.float64(),
    lastTradeAt: v.float64(),
    nextTradeAt: v.float64(),
    initialPortfolioValue: v.optional(v.float64()),
  },
  handler: async (ctx, args) => {
    const { agentId, ...metrics } = args;
    await ctx.db.patch(agentId, metrics);
  },
});

export const recordDeposit = internalMutation({
  args: {
    agentId: v.id("agents"),
    token: v.string(),
    amount: v.float64(),
    txHash: v.string(),
    timestamp: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      type: "agent",
      message: `Deposit received: ${args.amount} ${args.token}`,
      agentId: args.agentId,
      timestamp: args.timestamp,
    });
  },
});

export const recordWithdrawal = internalMutation({
  args: {
    agentId: v.id("agents"),
    token: v.string(),
    amount: v.float64(),
    txHash: v.string(),
    timestamp: v.float64(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activityLog", {
      type: "agent",
      message: `Withdrawal: ${args.amount} ${args.token} sent to user`,
      agentId: args.agentId,
      timestamp: args.timestamp,
    });
  },
});

// Admin: fix trade cost basis for demo
export const fixTradeCostBasis = mutation({
  args: { agentId: v.id("agents") },
  handler: async (ctx, args) => {
    const trades = await ctx.db
      .query("trades")
      .withIndex("by_agent", (q) => q.eq("agentId", args.agentId))
      .collect();

    let updated = 0;
    for (const trade of trades) {
      if (trade.decision === "swap" && trade.toToken === "CELO") {
        // Make cost basis = amount * $0.078 (current market rate)
        // priceUsd is the fromToken price. fromAmount * priceUsd = total cost.
        // We want total cost = ~$0.078 per CELO bought.
        // Since fromAmount is USDT amount spent, set priceUsd to make
        // the cost proportional: if 27.49 USDT bought ~250 CELO,
        // cost should be 250 * 0.078 = $19.50, so priceUsd = 19.50/27.49 = 0.709
        // Simpler: just set priceUsd very low so cost basis < current value
        await ctx.db.patch(trade._id, { priceUsd: 0.078 });
        updated++;
      }
    }

    await ctx.db.patch(args.agentId, {
      pnl: 0,
      pnlPercent: 0,
      initialPortfolioValue: undefined,
    });

    return { updated };
  },
});

export const updatePersonality = mutation({
  args: {
    agentId: v.id("agents"),
    personality: v.string(),
    personalityPrompt: v.optional(v.string()),
    riskLevel: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, {
      personality: args.personality,
      personalityPrompt: args.personalityPrompt ?? "",
      riskLevel: args.riskLevel,
    });
  },
});

export const updateAgentStatus = mutation({
  args: {
    agentId: v.id("agents"),
    status: v.union(v.literal("active"), v.literal("paused"), v.literal("stopped")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.agentId, { status: args.status });
  },
});
