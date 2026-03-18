import { mutation } from "./_generated/server";

export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("agents").first();
    if (existing) return "Already seeded";

    const now = Date.now();

    // --- Agent ---
    const agentId = await ctx.db.insert("agents", {
      name: "alpha-seeker-7",
      walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD18",
      status: "active",
      portfolioValue: 142504.12,
      pnl: 12401.5,
      pnlPercent: 9.2,
      totalTrades: 284,
      winRate: 0.682,
      tradeIntervalMs: 300000,
      lastTradeAt: now - 78000,
      nextTradeAt: now + 222000,
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
    });

    // --- Holdings ---
    const holdings = [
      { token: "CELO", amount: 85000, valueUsd: 71578, allocationPercent: 50.2 },
      { token: "USDm", amount: 32400, valueUsd: 32400, allocationPercent: 22.7 },
      { token: "WETH", amount: 8.54, valueUsd: 29481, allocationPercent: 20.6 },
      { token: "BRLm", amount: 45100, valueUsd: 9045, allocationPercent: 6.5 },
    ];
    for (const h of holdings) {
      await ctx.db.insert("holdings", { agentId, ...h });
    }

    // --- CELO OHLCV Price History (200 candles, 1hr intervals) ---
    let price = 0.78;
    for (let i = 200; i > 0; i--) {
      const ts = now - i * 3600 * 1000;
      const open = price;
      const change = (Math.random() - 0.47) * 0.015;
      const close = Math.max(0.5, open + change);
      const high = Math.max(open, close) + Math.random() * 0.008;
      const low = Math.min(open, close) - Math.random() * 0.008;
      const volume = Math.random() * 4000000 + 1000000;

      await ctx.db.insert("prices", {
        token: "CELO",
        priceUsd: close,
        change24h: 4.12,
        marketCap: 442100000,
        volume24h: 42100000,
        timestamp: ts,
        open,
        high,
        low,
        close,
        volume,
      });
      price = close;
    }

    // --- Latest Prices for Watchlist tokens ---
    const watchlistTokens = [
      { token: "CELO", priceUsd: 0.8421, change24h: 4.12, marketCap: 442100000 },
      { token: "USDC", priceUsd: 1.0, change24h: 0.0, marketCap: 28400000000 },
      { token: "USDT", priceUsd: 0.9999, change24h: -0.01, marketCap: 96200000000 },
      { token: "BTC", priceUsd: 62450, change24h: 1.42, marketCap: 1220000000000 },
      { token: "ETH", priceUsd: 3452.1, change24h: -0.12, marketCap: 415200000000 },
      { token: "XAUt", priceUsd: 2650.0, change24h: 0.35, marketCap: 680000000 },
    ];
    for (const t of watchlistTokens) {
      await ctx.db.insert("prices", {
        ...t,
        timestamp: now,
      });
    }

    // --- FX Rates ---
    const fxRates = [
      { pair: "USDm/USDT", price: 0.9998, change24h: -0.01, spread: 0.0001 },
      { pair: "EURm/USDT", price: 1.0842, change24h: 0.12, spread: 0.0004 },
      { pair: "BRLm/USDT", price: 4.9512, change24h: 0.05, spread: 0.0012 },
      { pair: "KESm/USDT", price: 132.4, change24h: -0.42, spread: 0.024 },
      { pair: "COPm/USDT", price: 3912.4, change24h: 0.18, spread: 0.45 },
      { pair: "PHPm/USDT", price: 56.12, change24h: 0.08, spread: 0.015 },
      { pair: "XOFm/USDT", price: 605.5, change24h: -0.05, spread: 0.12 },
      { pair: "NGNm/USDT", price: 1580.0, change24h: 0.22, spread: 0.35 },
      { pair: "JPYm/USDT", price: 149.8, change24h: -0.15, spread: 0.02 },
      { pair: "CHFm/USDT", price: 0.878, change24h: 0.03, spread: 0.0003 },
    ];
    for (const fx of fxRates) {
      await ctx.db.insert("fxRates", { ...fx, timestamp: now });
    }

    // --- News ---
    const newsItems = [
      {
        source: "YAHOO FINANCE",
        headline: "Celo Foundation announces partnership for stablecoin adoption in East Africa region.",
        timestamp: now - 120000,
      },
      {
        source: "TRADINGVIEW",
        headline: "CELO/USD breaks through crucial resistance at 0.82; analysts target 0.95 next.",
        timestamp: now - 900000,
      },
      {
        source: "REUTERS",
        headline: "Global FX markets brace for Fed commentary as yields stabilize near 4.25%.",
        timestamp: now - 1920000,
      },
      {
        source: "COINDESK",
        headline: "Layer 2 transition on Celo network seeing high validator participation rates.",
        timestamp: now - 2880000,
      },
      {
        source: "TRADINGVIEW",
        headline: "Bollinger Bands tightening for major stablecoin pairs across the ecosystem.",
        timestamp: now - 4200000,
      },
      {
        source: "YAHOO FINANCE",
        headline: "DeFi protocols on Celo surpass $500M in combined TVL as institutional interest grows.",
        timestamp: now - 5400000,
      },
      {
        source: "COINDESK",
        headline: "Mento Protocol introduces new stablecoin pairs targeting Southeast Asian markets.",
        timestamp: now - 7200000,
      },
      {
        source: "REUTERS",
        headline: "Central banks eye stablecoin frameworks as digital currency adoption accelerates globally.",
        timestamp: now - 9000000,
      },
      {
        source: "SEEKING ALPHA",
        headline: "AI-driven trading strategies outperform manual traders by 23% in Q4 analysis.",
        timestamp: now - 10800000,
      },
      {
        source: "YAHOO FINANCE",
        headline: "Celo network gas fees drop 40% following latest protocol upgrade.",
        timestamp: now - 14400000,
      },
    ];
    for (const n of newsItems) {
      await ctx.db.insert("news", n);
    }

    return "Seeded successfully";
  },
});

export const seedGlobal = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingMetrics = await ctx.db.query("platformMetrics").first();
    if (existingMetrics) return "Global already seeded";

    const now = Date.now();

    // --- Additional Agents for Leaderboard ---
    await ctx.db.insert("agents", {
      name: "Neon_Trader_v4",
      walletAddress: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      status: "active",
      portfolioValue: 32150,
      pnl: 3850.12,
      pnlPercent: 12.0,
      totalTrades: 412,
      winRate: 0.721,
      tradeIntervalMs: 300000,
      createdAt: now - 5 * 86400000,
    });

    await ctx.db.insert("agents", {
      name: "Ghost_LP",
      walletAddress: "0xCA35b7d915458EF540aDe6068dFe2F44E8fa733c",
      status: "active",
      portfolioValue: 128400,
      pnl: -1200.5,
      pnlPercent: -0.94,
      totalTrades: 890,
      winRate: 0.458,
      tradeIntervalMs: 300000,
      createdAt: now - 14 * 86400000,
    });

    await ctx.db.insert("agents", {
      name: "Liquid_Celo_Bot",
      walletAddress: "0x14723A09ACff6D2A60DcdF7aA4AFf308FDDC160C",
      status: "active",
      portfolioValue: 15200,
      pnl: 840.44,
      pnlPercent: 5.5,
      totalTrades: 156,
      winRate: 0.59,
      tradeIntervalMs: 300000,
      createdAt: now - 3 * 86400000,
    });

    // --- Platform Metrics History (7 days) ---
    const metricsHistory = [
      { tvl: 4210000, totalVolume24h: 1800000, totalTrades24h: 12100, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4350000, totalVolume24h: 2100000, totalTrades24h: 12800, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4280000, totalVolume24h: 1950000, totalTrades24h: 12400, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4520000, totalVolume24h: 2300000, totalTrades24h: 13000, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4610000, totalVolume24h: 2050000, totalTrades24h: 12600, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4750000, totalVolume24h: 1900000, totalTrades24h: 12200, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
      { tvl: 4821090, totalVolume24h: 2105942, totalTrades24h: 12482, totalFeesEarned: 18442, activeAgents: 84, avgTradeFrequencyMs: 312000 },
    ];
    for (let i = 0; i < metricsHistory.length; i++) {
      const dayOffset = (metricsHistory.length - 1 - i) * 86400000;
      await ctx.db.insert("platformMetrics", {
        ...metricsHistory[i],
        tvlChange24h: i === 0 ? 0 : ((metricsHistory[i].tvl - metricsHistory[i - 1].tvl) / metricsHistory[i - 1].tvl) * 100,
        timestamp: now - dayOffset,
      });
    }

    // --- Current Platform Metrics ---
    await ctx.db.insert("platformMetrics", {
      tvl: 4821090,
      tvlChange24h: 5.2,
      totalTrades24h: 12482,
      totalVolume24h: 2105942,
      totalFeesEarned: 18442,
      activeAgents: 84,
      avgTradeFrequencyMs: 312000,
      timestamp: now,
    });

    // --- Activity Log ---
    const activities: Array<{
      type: "trade" | "agent" | "fee" | "alert";
      message: string;
      offset: number;
    }> = [
      { type: "trade", message: "Alpha_Arbitrage executed BUY 1200 CELO @ $0.6842", offset: 0 },
      { type: "agent", message: "New Agent Sentinel_Node_02 initialized on Mainnet", offset: 7000 },
      { type: "fee", message: "Collected 0.45 USDC fee from pool 0x42...fE2", offset: 20000 },
      { type: "alert", message: "High volatility detected in CELO/WETH pair (+4.2% in 5m)", offset: 43000 },
      { type: "trade", message: "Ghost_LP rebalanced position +$15k USDm liquidity", offset: 55000 },
      { type: "trade", message: "Neon_Trader_v4 closed short 500 ETH for +$120.40", offset: 70000 },
      { type: "fee", message: "Collected 1.12 USDC fee from swap", offset: 83000 },
    ];
    for (const a of activities) {
      await ctx.db.insert("activityLog", {
        type: a.type,
        message: a.message,
        timestamp: now - a.offset,
      });
    }

    // --- Trades for Revenue Breakdown ---
    // Get first agent for agentId
    const firstAgent = await ctx.db.query("agents").first();
    if (!firstAgent) return "No agents found — run seedAll first";
    const agentId = firstAgent._id;

    // CELO/USDC trades — target sum ~$4201
    const celoUsdcFees = [840.2, 672.16, 504.12, 420.1, 336.08, 252.06, 504.12, 336.08, 168.04, 168.04];
    for (let i = 0; i < celoUsdcFees.length; i++) {
      await ctx.db.insert("trades", {
        agentId,
        fromToken: "CELO",
        toToken: "USDC",
        fromAmount: 5000 + i * 200,
        toAmount: 4200 + i * 168,
        priceUsd: 0.84,
        feeUsd: celoUsdcFees[i],
        txHash: `0xaa${i.toString().padStart(62, "0")}`,
        timestamp: now - i * 3600000,
      });
    }

    // CELO/ETH trades — target sum ~$3112
    const celoEthFees = [622.4, 497.92, 373.44, 311.2, 248.96, 186.72, 373.44, 248.96, 124.48, 124.48];
    for (let i = 0; i < celoEthFees.length; i++) {
      await ctx.db.insert("trades", {
        agentId,
        fromToken: "CELO",
        toToken: "ETH",
        fromAmount: 3000 + i * 100,
        toAmount: 0.72 + i * 0.024,
        priceUsd: 0.84,
        feeUsd: celoEthFees[i],
        txHash: `0xbb${i.toString().padStart(62, "0")}`,
        timestamp: now - i * 3600000 - 1800000,
      });
    }

    // USDm/USDC trades — target sum ~$2890
    const usdmUsdcTrades = [
      { fromAmount: 25000, toAmount: 24975, fee: 578 },
      { fromAmount: 18000, toAmount: 17982, fee: 462.4 },
      { fromAmount: 12000, toAmount: 11988, fee: 346.8 },
      { fromAmount: 15000, toAmount: 14985, fee: 289 },
      { fromAmount: 20000, toAmount: 19980, fee: 231.2 },
      { fromAmount: 10000, toAmount: 9990, fee: 173.4 },
      { fromAmount: 22000, toAmount: 21978, fee: 346.8 },
      { fromAmount: 8000, toAmount: 7992, fee: 231.2 },
      { fromAmount: 5000, toAmount: 4995, fee: 115.6 },
      { fromAmount: 6000, toAmount: 5994, fee: 115.6 },
    ];
    for (let i = 0; i < usdmUsdcTrades.length; i++) {
      await ctx.db.insert("trades", {
        agentId,
        fromToken: "USDm",
        toToken: "USDC",
        fromAmount: usdmUsdcTrades[i].fromAmount,
        toAmount: usdmUsdcTrades[i].toAmount,
        priceUsd: 1.0,
        feeUsd: usdmUsdcTrades[i].fee,
        txHash: `0xcc${i.toString().padStart(62, "0")}`,
        timestamp: now - i * 3600000 - 900000,
      });
    }

    // CELO/WBTC trades — target sum ~$1450
    const celoWbtcTrades = [
      { fromAmount: 8000, toAmount: 0.0001, fee: 290 },
      { fromAmount: 6000, toAmount: 0.00008, fee: 232 },
      { fromAmount: 4500, toAmount: 0.00006, fee: 174 },
      { fromAmount: 5500, toAmount: 0.00007, fee: 145 },
      { fromAmount: 7000, toAmount: 0.00009, fee: 116 },
      { fromAmount: 3000, toAmount: 0.00004, fee: 87 },
      { fromAmount: 5000, toAmount: 0.00006, fee: 174 },
      { fromAmount: 4000, toAmount: 0.00005, fee: 116 },
      { fromAmount: 2000, toAmount: 0.00003, fee: 58 },
      { fromAmount: 2500, toAmount: 0.00003, fee: 58 },
    ];
    for (let i = 0; i < celoWbtcTrades.length; i++) {
      await ctx.db.insert("trades", {
        agentId,
        fromToken: "CELO",
        toToken: "WBTC",
        fromAmount: celoWbtcTrades[i].fromAmount,
        toAmount: celoWbtcTrades[i].toAmount,
        priceUsd: 0.84,
        feeUsd: celoWbtcTrades[i].fee,
        txHash: `0xdd${i.toString().padStart(62, "0")}`,
        timestamp: now - i * 3600000 - 2700000,
      });
    }

    return "Global data seeded successfully";
  },
});

export const reseed = mutation({
  args: {},
  handler: async (ctx) => {
    // Delete all data from all tables
    const tables = ["agents", "holdings", "trades", "prices", "fxRates", "news", "platformMetrics", "activityLog", "tokenMetadata"];
    for (const table of tables) {
      const rows = await ctx.db.query(table as any).collect();
      for (const row of rows) {
        await ctx.db.delete(row._id);
      }
    }
    return "All data cleared. Run seedAll and seedGlobal to repopulate.";
  },
});

export const clearMockTrades = mutation({
  args: {},
  handler: async (ctx) => {
    const trades = await ctx.db.query("trades").collect();
    let deleted = 0;
    for (const trade of trades) {
      const isMock =
        trade.txHash.startsWith("0xaa0") ||
        trade.txHash.startsWith("0xbb0") ||
        trade.txHash.startsWith("0xcc0") ||
        trade.txHash.startsWith("0xdd0");
      if (isMock) {
        await ctx.db.delete(trade._id);
        deleted++;
      }
    }
    return `Deleted ${deleted} mock trades`;
  },
});

export const clearKolTweets = mutation({
  args: {},
  handler: async (ctx) => {
    const tweets = await ctx.db.query("kolTweets").collect();
    for (const t of tweets) {
      await ctx.db.delete(t._id);
    }
    return `Deleted ${tweets.length} KOL tweets`;
  },
});
