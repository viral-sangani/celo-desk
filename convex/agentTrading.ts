"use node";

import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import crypto from "crypto";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOKEN_ADDRESSES: Record<string, string> = {
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  WETH: "0xD221812de1BD094f35587EE8E174B07B6167D9Af",
  WBTC: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D",
  XAUt: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
};

const DECIMALS: Record<string, number> = {
  CELO: 18,
  USDT: 6,
  USDm: 18,
  USDC: 6,
  WETH: 18,
  WBTC: 8,
  XAUt: 6,
};

const UNISWAP_ROUTER = "0x5615CDAb10dc425a742d643d949a7F474C01abc4";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function getAgentAccount(userAddress: string) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY!;
  const { createThirdwebClient } = await import("thirdweb");
  const { privateKeyToAccount } = await import("thirdweb/wallets");

  const client = createThirdwebClient({ secretKey });
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(`agent_wallet_${userAddress}`)
    .digest("hex");
  const account = privateKeyToAccount({
    client,
    privateKey: `0x${hash}` as `0x${string}`,
  });

  return { client, account };
}

async function getOnChainBalances(client: any, agentAddress: string) {
  const { getContract, readContract } = await import("thirdweb");
  const { celo } = await import("thirdweb/chains");

  const tokens = [
    { symbol: "CELO", address: "0x471EcE3750Da237f93B8E339c536989b8978a438", decimals: 18 },
    { symbol: "USDT", address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e", decimals: 6 },
    { symbol: "USDm", address: "0x765DE816845861e75A25fCA122bb6898B8B1282a", decimals: 18 },
    { symbol: "USDC", address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", decimals: 6 },
    { symbol: "WETH", address: "0xD221812de1BD094f35587EE8E174B07B6167D9Af", decimals: 18 },
    { symbol: "WBTC", address: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D", decimals: 8 },
    { symbol: "XAUt", address: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff", decimals: 6 },
  ];

  const balances: { token: string; amount: number; address: string; decimals: number }[] = [];
  for (const t of tokens) {
    try {
      const contract = getContract({
        client,
        chain: celo,
        address: t.address as `0x${string}`,
      });
      const balance = await readContract({
        contract,
        method: "function balanceOf(address) view returns (uint256)",
        params: [agentAddress],
      });
      const amount = Number(balance) / 10 ** t.decimals;
      if (amount > 0) {
        balances.push({ token: t.symbol, amount, address: t.address, decimals: t.decimals });
      }
    } catch (err) {
      console.error(`Balance read error for ${t.symbol}:`, err);
    }
  }
  return balances;
}

async function executeSwap(
  client: any,
  account: any,
  fromTokenAddr: string,
  toTokenAddr: string,
  amountIn: bigint
) {
  const { getContract, prepareContractCall, sendTransaction } = await import("thirdweb");
  const { celo } = await import("thirdweb/chains");

  // Approve router
  const tokenContract = getContract({
    client,
    chain: celo,
    address: fromTokenAddr as `0x${string}`,
  });
  const approveTx = prepareContractCall({
    contract: tokenContract,
    method: "function approve(address spender, uint256 amount) returns (bool)",
    params: [UNISWAP_ROUTER, amountIn],
  });
  await sendTransaction({ transaction: approveTx, account });

  // Execute swap
  const router = getContract({
    client,
    chain: celo,
    address: UNISWAP_ROUTER as `0x${string}`,
  });
  const { prepareTransaction } = await import("thirdweb");
  const { encodeFunctionData } = await import("viem");

  const swapData = encodeFunctionData({
    abi: [{
      name: "exactInputSingle",
      type: "function",
      stateMutability: "payable",
      inputs: [{
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "fee", type: "uint24" },
          { name: "recipient", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "amountOutMinimum", type: "uint256" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      }],
      outputs: [{ name: "amountOut", type: "uint256" }],
    }],
    functionName: "exactInputSingle",
    args: [{
      tokenIn: fromTokenAddr as `0x${string}`,
      tokenOut: toTokenAddr as `0x${string}`,
      fee: 3000,
      recipient: account.address,
      amountIn,
      amountOutMinimum: BigInt(0),
      sqrtPriceLimitX96: BigInt(0),
    }],
  });

  const swapTx = prepareTransaction({
    client,
    chain: celo,
    to: UNISWAP_ROUTER as `0x${string}`,
    data: swapData,
  });

  return await sendTransaction({ transaction: swapTx, account });
}

async function fetchNewsFromParallel(): Promise<string> {
  const apiKey = process.env.PARALLEL_AI_API_KEY;
  if (!apiKey) return "No news available";

  try {
    const res = await fetch("https://api.parallel.ai/v1beta/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": apiKey },
      body: JSON.stringify({
        objective:
          "Latest crypto market news and analysis for CELO, Bitcoin, Ethereum, stablecoins, DeFi in the last 2 hours",
        mode: "fast",
        max_results: 5,
      }),
    });
    if (!res.ok) return "News fetch failed";
    const data = await res.json();
    return (data.results || [])
      .map((r: any) => `${r.title}: ${r.excerpt?.slice(0, 200)}`)
      .join("\n\n");
  } catch {
    return "News fetch error";
  }
}

interface TradingContext {
  holdings: any[];
  prices: any[];
  news: string;
  personalityPrompt: string;
  riskLevel: string;
  sentiment: any[];
  fearGreed: any;
  tokenMeta: any[];
}

async function getGeminiDecision(ctx: TradingContext): Promise<any> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { action: "hold", reason: "No Gemini API key" };

  const riskMaxPercent = ctx.riskLevel === "aggressive" ? 50 : ctx.riskLevel === "moderate" ? 25 : 10;

  // Build multi-timeframe analysis
  const multiTimeframe = ctx.tokenMeta
    .map((m: any) => `${m.token}: 24h: ${m.change24h?.toFixed(2) ?? "?"}%, 7d: ${m.change7d?.toFixed(2) ?? "?"}%, 30d: ${m.change30d?.toFixed(2) ?? "?"}%`)
    .join("\n");

  // Build sentiment summary
  const sentimentSummary = ctx.sentiment
    .map((s: any) => `${s.token}: ${s.sentiment} (score: ${s.score})`)
    .join("\n");

  const fearGreedText = ctx.fearGreed
    ? `Fear & Greed Index: ${ctx.fearGreed.value} (${ctx.fearGreed.classification})`
    : "Fear & Greed: unavailable";

  const prompt = `${ctx.personalityPrompt}

You are managing a crypto portfolio on Celo blockchain. All trades are swaps against USDT.

Risk Level: ${ctx.riskLevel} (max ${riskMaxPercent}% of any holding per trade, minimum trade $1)

Current Holdings:
${JSON.stringify(ctx.holdings, null, 2)}

Current Token Prices (USD):
${JSON.stringify(ctx.prices.map((p: any) => ({ token: p.token, price: p.priceUsd, change24h: p.change24h })), null, 2)}

Multi-Timeframe Analysis:
${multiTimeframe}

Market Sentiment:
${fearGreedText}
${sentimentSummary}

Recent News:
${ctx.news}

Based on your personality and the data above, make a trading decision.
You SHOULD trade when your strategy signals an opportunity — do not default to holding.

Respond with ONLY a valid JSON object, no markdown:
{"action":"swap","fromToken":"USDT","toToken":"CELO","amountPercent":${riskMaxPercent},"reason":"brief explanation"}

If genuinely no opportunity matches your strategy: {"action":"hold","reason":"brief explanation"}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
      }
    );
    if (!res.ok) return { action: "hold", reason: `Gemini error: ${res.status}` };
    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    return { action: "hold", reason: "Could not parse Gemini response" };
  } catch (err) {
    return { action: "hold", reason: `Gemini error: ${err}` };
  }
}

// ---------------------------------------------------------------------------
// Public actions
// ---------------------------------------------------------------------------

export const withdraw = action({
  args: {
    userAddress: v.string(),
    token: v.string(),
    amount: v.float64(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ success: boolean; txHash?: string; error?: string }> => {
    try {
      const addr = args.userAddress.toLowerCase();
      const agent = await ctx.runQuery(
        internal.agentWalletInternal.getAgentForUser,
        { userAddress: addr }
      );
      if (!agent) return { success: false, error: "No agent found" };

      const { client, account } = await getAgentAccount(addr);
      const { getContract, prepareContractCall, sendTransaction } = await import("thirdweb");
      const { celo } = await import("thirdweb/chains");

      const tokenAddr = TOKEN_ADDRESSES[args.token];
      const decimals = DECIMALS[args.token] ?? 18;
      if (!tokenAddr) return { success: false, error: "Unknown token" };

      const amountWei = BigInt(Math.floor(args.amount * 10 ** decimals));

      const tokenContract = getContract({
        client,
        chain: celo,
        address: tokenAddr as `0x${string}`,
      });
      const tx = prepareContractCall({
        contract: tokenContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [args.userAddress as `0x${string}`, amountWei],
      });
      const result = await sendTransaction({ transaction: tx, account });

      // Record withdrawal
      await ctx.runMutation(internal.agentTradingMutations.recordWithdrawal, {
        agentId: agent._id,
        token: args.token,
        amount: args.amount,
        txHash: result.transactionHash,
        timestamp: Date.now(),
      });

      return { success: true, txHash: result.transactionHash };
    } catch (err: any) {
      return { success: false, error: err.message ?? String(err) };
    }
  },
});

export const refreshPortfolio = action({
  args: { userAddress: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const addr = args.userAddress.toLowerCase();
    const agent = await ctx.runQuery(
      internal.agentWalletInternal.getAgentForUser,
      { userAddress: addr }
    );
    if (!agent) return;

    const { client } = await getAgentAccount(addr);
    const balances = await getOnChainBalances(client, agent.walletAddress);

    // Get prices
    const prices = await ctx.runQuery(internal.agentTradingInternal.getAllPrices, {});

    let totalValue = 0;
    const holdings = balances.map((b) => {
      const price = prices.find((p: any) => p.token === b.token);
      const valueUsd = b.amount * (price?.priceUsd ?? 0);
      totalValue += valueUsd;
      return { token: b.token, amount: b.amount, valueUsd, allocationPercent: 0 };
    });

    // Calculate allocation percentages
    for (const h of holdings) {
      h.allocationPercent = totalValue > 0 ? (h.valueUsd / totalValue) * 100 : 0;
    }

    await ctx.runMutation(internal.agentTradingMutations.updateHoldings, {
      agentId: agent._id,
      holdings,
    });
    await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
      agentId: agent._id,
      portfolioValue: totalValue,
      pnl: agent.pnl, // Keep existing PnL for now
      pnlPercent: agent.pnlPercent,
      totalTrades: agent.totalTrades,
      lastTradeAt: agent.lastTradeAt ?? Date.now(),
      nextTradeAt: Date.now() + 300000,
    });
  },
});

// ---------------------------------------------------------------------------
// Public action – manually trigger a trade for a user's agent
// ---------------------------------------------------------------------------

export const executeTradeNow = action({
  args: { userAddress: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; decision?: string; error?: string }> => {
    const addr = args.userAddress.toLowerCase();
    const agent = await ctx.runQuery(
      internal.agentWalletInternal.getAgentForUser,
      { userAddress: addr }
    );
    if (!agent) return { success: false, error: "No agent found" };
    if (agent.status !== "active") return { success: false, error: "Agent is not active" };

    try {
      const { client, account } = await getAgentAccount(addr);
      const balances = await getOnChainBalances(client, agent.walletAddress);
      if (balances.length === 0) return { success: false, error: "No balances found" };

      const prices = await ctx.runQuery(internal.agentTradingInternal.getAllPrices, {});
      const news = await fetchNewsFromParallel();
      const sentiment = await ctx.runQuery(internal.latestIntel.getLatestSentimentInternal, {});
      const fearGreed = await ctx.runQuery(internal.latestIntel.getFearGreedIndexInternal, {});
      const tokenMeta = await ctx.runQuery(internal.latestIntel.getTokenMetadataAllInternal, {});

      const DEFAULT_PROMPT = `You are an AI trading agent. Buy dips, follow momentum, and take profits. You SHOULD trade when opportunities arise.`;
      let personalityPrompt = DEFAULT_PROMPT;
      if (agent.personality === "custom" && agent.personalityPrompt) {
        personalityPrompt = agent.personalityPrompt;
      } else if (agent.personality) {
        const presets: Record<string, string> = {
          dip_buyer: `You are a mean-reversion trader. BUY when a token drops >3% in 24h. SELL on recovery (+2%). When Fear & Greed < 35, be MORE aggressive. You SHOULD trade on dips.`,
          momentum: `You are a momentum trader. BUY tokens up >2% with bullish sentiment. SELL when sentiment fades. Use 7d/30d trends to confirm. You SHOULD trade on momentum.`,
          stablecoin_farmer: `You are a capital-preservation trader. Stay in stablecoins. Only BUY volatile assets on >10% dips. Exit at +3-5% profit. You SHOULD trade on major dips.`,
          celo_maxi: `You are a Celo maximalist. Accumulate CELO on dips. DCA aggressively. Only SELL at >15% pumps to lock profits. You SHOULD trade to accumulate CELO.`,
        };
        personalityPrompt = presets[agent.personality] ?? DEFAULT_PROMPT;
      }

      const holdingsWithValues = balances.map((b) => {
        const price = prices.find((p: any) => p.token === b.token);
        return { ...b, priceUsd: price?.priceUsd ?? 0, valueUsd: b.amount * (price?.priceUsd ?? 0) };
      });

      const decision = await getGeminiDecision({
        holdings: holdingsWithValues,
        prices,
        news,
        personalityPrompt,
        riskLevel: agent.riskLevel ?? "moderate",
        sentiment: sentiment ?? [],
        fearGreed,
        tokenMeta: tokenMeta ?? [],
      });

      if (decision.action === "swap" && decision.fromToken && decision.toToken) {
        const fromBalance = balances.find((b) => b.token === decision.fromToken);
        if (!fromBalance) return { success: true, decision: `hold (no ${decision.fromToken} balance)` };

        const swapAmount = fromBalance.amount * (decision.amountPercent / 100);
        const amountInWei = BigInt(Math.floor(swapAmount * 10 ** fromBalance.decimals));
        if (amountInWei <= BigInt(0)) return { success: true, decision: "hold (amount too small)" };

        const fromAddr = TOKEN_ADDRESSES[decision.fromToken];
        const toAddr = TOKEN_ADDRESSES[decision.toToken];
        if (!fromAddr || !toAddr) return { success: true, decision: "hold (unknown token address)" };

        const result = await executeSwap(client, account, fromAddr, toAddr, amountInWei);
        const fromPrice = prices.find((p: any) => p.token === decision.fromToken)?.priceUsd ?? 0;

        await ctx.runMutation(internal.agentTradingMutations.recordTrade, {
          agentId: agent._id, fromToken: decision.fromToken, toToken: decision.toToken,
          fromAmount: swapAmount, toAmount: 0, priceUsd: fromPrice,
          feeUsd: swapAmount * fromPrice * 0.001, txHash: result.transactionHash,
          timestamp: Date.now(), reason: decision.reason ?? "", reasonFull: JSON.stringify(decision), decision: "swap",
        });
      } else {
        await ctx.runMutation(internal.agentTradingMutations.recordTrade, {
          agentId: agent._id, fromToken: "", toToken: "", fromAmount: 0, toAmount: 0,
          priceUsd: 0, feeUsd: 0, txHash: "", timestamp: Date.now(),
          reason: decision.reason ?? "", reasonFull: JSON.stringify(decision), decision: "hold",
        });
      }

      // Update portfolio
      const newBalances = await getOnChainBalances(client, agent.walletAddress);
      let totalValue = 0;
      const holdings = newBalances.map((b) => {
        const price = prices.find((p: any) => p.token === b.token);
        const valueUsd = b.amount * (price?.priceUsd ?? 0);
        totalValue += valueUsd;
        return { token: b.token, amount: b.amount, valueUsd, allocationPercent: 0 };
      });
      for (const h of holdings) h.allocationPercent = totalValue > 0 ? (h.valueUsd / totalValue) * 100 : 0;

      await ctx.runMutation(internal.agentTradingMutations.updateHoldings, { agentId: agent._id, holdings });
      await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
        agentId: agent._id, portfolioValue: totalValue, pnl: agent.pnl, pnlPercent: agent.pnlPercent,
        totalTrades: agent.totalTrades + (decision.action === "swap" ? 1 : 0),
        lastTradeAt: Date.now(), nextTradeAt: Date.now() + 300000,
      });

      return { success: true, decision: `${decision.action}: ${decision.reason}` };
    } catch (err: any) {
      console.error(`executeTradeNow error for ${addr}:`, err);
      return { success: false, error: err.message ?? "Trade execution failed" };
    }
  },
});

// ---------------------------------------------------------------------------
// Internal action – called by cron every 5 minutes
// ---------------------------------------------------------------------------

export const executeTrades = internalAction({
  args: {},
  handler: async (ctx) => {
    // Get all active agents
    const agents = await ctx.runQuery(internal.agentTradingInternal.getActiveAgents, {});

    for (const agent of agents) {
      if (!agent.userAddress) continue;

      try {
        const { client, account } = await getAgentAccount(agent.userAddress);

        // 1. Get on-chain balances
        const balances = await getOnChainBalances(client, agent.walletAddress);
        if (balances.length === 0) {
          console.log(`Agent ${agent.name}: no balances, skipping`);
          continue;
        }

        // 2. Get prices from Convex
        const prices = await ctx.runQuery(internal.agentTradingInternal.getAllPrices, {});

        // 3. Get news from Parallel AI
        const news = await fetchNewsFromParallel();

        // 4. Get enriched market data
        const sentiment = await ctx.runQuery(internal.latestIntel.getLatestSentimentInternal, {});
        const fearGreed = await ctx.runQuery(internal.latestIntel.getFearGreedIndexInternal, {});
        const tokenMeta = await ctx.runQuery(internal.latestIntel.getTokenMetadataAllInternal, {});

        // 5. Build personality prompt
        const DEFAULT_PROMPT = `You are an AI trading agent. Buy dips, follow momentum, and take profits. You SHOULD trade when opportunities arise.`;
        let personalityPrompt = DEFAULT_PROMPT;
        if (agent.personality === "custom" && agent.personalityPrompt) {
          personalityPrompt = agent.personalityPrompt;
        } else if (agent.personality) {
          // Import personality prompts inline to avoid circular deps
          const presets: Record<string, string> = {
            dip_buyer: `You are a mean-reversion trader. BUY when a token drops >3% in 24h. SELL on recovery (+2%). When Fear & Greed < 35, be MORE aggressive. You SHOULD trade on dips.`,
            momentum: `You are a momentum trader. BUY tokens up >2% with bullish sentiment. SELL when sentiment fades. Use 7d/30d trends to confirm. You SHOULD trade on momentum.`,
            stablecoin_farmer: `You are a capital-preservation trader. Stay in stablecoins. Only BUY volatile assets on >10% dips. Exit at +3-5% profit. You SHOULD trade on major dips.`,
            celo_maxi: `You are a Celo maximalist. Accumulate CELO on dips. DCA aggressively. Only SELL at >15% pumps to lock profits. You SHOULD trade to accumulate CELO.`,
          };
          personalityPrompt = presets[agent.personality] ?? DEFAULT_PROMPT;
        }

        // 6. Ask Gemini for trading decision
        const holdingsWithValues = balances.map((b) => {
          const price = prices.find((p: any) => p.token === b.token);
          return {
            ...b,
            priceUsd: price?.priceUsd ?? 0,
            valueUsd: b.amount * (price?.priceUsd ?? 0),
          };
        });

        const decision = await getGeminiDecision({
          holdings: holdingsWithValues,
          prices,
          news,
          personalityPrompt,
          riskLevel: agent.riskLevel ?? "moderate",
          sentiment: sentiment ?? [],
          fearGreed,
          tokenMeta: tokenMeta ?? [],
        });
        console.log(`Agent ${agent.name} decision:`, JSON.stringify(decision));

        // 5. Execute swap if needed, or record hold
        if (decision.action === "swap" && decision.fromToken && decision.toToken) {
          const fromBalance = balances.find((b) => b.token === decision.fromToken);
          if (!fromBalance) {
            console.log(`No ${decision.fromToken} balance to swap`);
            continue;
          }

          const swapAmount = fromBalance.amount * (decision.amountPercent / 100);
          const amountInWei = BigInt(Math.floor(swapAmount * 10 ** fromBalance.decimals));

          if (amountInWei <= BigInt(0)) continue;

          const fromAddr = TOKEN_ADDRESSES[decision.fromToken];
          const toAddr = TOKEN_ADDRESSES[decision.toToken];
          if (!fromAddr || !toAddr) continue;

          const result = await executeSwap(client, account, fromAddr, toAddr, amountInWei);

          const fromPrice =
            prices.find((p: any) => p.token === decision.fromToken)?.priceUsd ?? 0;
          const platformFee = swapAmount * fromPrice * 0.001; // 0.1% platform fee

          await ctx.runMutation(internal.agentTradingMutations.recordTrade, {
            agentId: agent._id,
            fromToken: decision.fromToken,
            toToken: decision.toToken,
            fromAmount: swapAmount,
            toAmount: 0,
            priceUsd: fromPrice,
            feeUsd: platformFee,
            txHash: result.transactionHash,
            timestamp: Date.now(),
            reason: decision.reason ?? "",
            reasonFull: JSON.stringify(decision),
            decision: "swap",
          });
        } else {
          // Record hold decision
          await ctx.runMutation(internal.agentTradingMutations.recordTrade, {
            agentId: agent._id,
            fromToken: "",
            toToken: "",
            fromAmount: 0,
            toAmount: 0,
            priceUsd: 0,
            feeUsd: 0,
            txHash: "",
            timestamp: Date.now(),
            reason: decision.reason ?? "",
            reasonFull: JSON.stringify(decision),
            decision: "hold",
          });
        }

        // 6. Update portfolio (read new balances)
        const newBalances = await getOnChainBalances(client, agent.walletAddress);
        let totalValue = 0;
        const holdings = newBalances.map((b) => {
          const price = prices.find((p: any) => p.token === b.token);
          const valueUsd = b.amount * (price?.priceUsd ?? 0);
          totalValue += valueUsd;
          return { token: b.token, amount: b.amount, valueUsd, allocationPercent: 0 };
        });
        for (const h of holdings) {
          h.allocationPercent = totalValue > 0 ? (h.valueUsd / totalValue) * 100 : 0;
        }

        await ctx.runMutation(internal.agentTradingMutations.updateHoldings, {
          agentId: agent._id,
          holdings,
        });
        await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
          agentId: agent._id,
          portfolioValue: totalValue,
          pnl: agent.pnl,
          pnlPercent: agent.pnlPercent,
          totalTrades: agent.totalTrades + (decision.action === "swap" ? 1 : 0),
          lastTradeAt: Date.now(),
          nextTradeAt: Date.now() + 300000,
        });
      } catch (err) {
        console.error(`Agent ${agent.name} trade error:`, err);
        // Always update nextTradeAt so countdown never gets stuck
        try {
          await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
            agentId: agent._id,
            portfolioValue: agent.portfolioValue,
            pnl: agent.pnl,
            pnlPercent: agent.pnlPercent,
            totalTrades: agent.totalTrades,
            lastTradeAt: agent.lastTradeAt ?? Date.now(),
            nextTradeAt: Date.now() + 300000,
          });
        } catch (updateErr) {
          console.error(`Failed to update nextTradeAt for ${agent.name}:`, updateErr);
        }
      }
    }
  },
});
