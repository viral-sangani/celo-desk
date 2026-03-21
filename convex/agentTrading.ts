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
  EURm: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  BRLm: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
  KESm: "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0",
  COPm: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA",
  PHPm: "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B",
  XOFm: "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08",
  NGNm: "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71",
  JPYm: "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20",
  CHFm: "0xb55a79F398E759E43C95b979163f30eC87Ee131D",
};

const DECIMALS: Record<string, number> = {
  CELO: 18,
  USDT: 6,
  USDm: 18,
  USDC: 6,
  WETH: 18,
  WBTC: 8,
  XAUt: 6,
  EURm: 18,
  BRLm: 18,
  KESm: 18,
  COPm: 18,
  PHPm: 18,
  XOFm: 18,
  NGNm: 18,
  JPYm: 18,
  CHFm: 18,
};

const UNISWAP_ROUTER = "0x5615CDAb10dc425a742d643d949a7F474C01abc4";
const UNISWAP_QUOTER = "0x82825d0554fA07f7FC52Ab63c961F330fdEFa8E8"; // Uniswap V3 QuoterV2 on Celo

// Celo fee abstraction: USDT fee currency adapter
// Allows paying gas fees with USDT instead of native CELO
// See: https://docs.celo.org/tooling/overview/fee-abstraction
const USDT_FEE_ADAPTER = "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72";

// Safety limits
const MAX_TRADE_USD = 10; // Max $10 per trade to avoid draining thin pools
const TRADE_COOLDOWN_MS = 5 * 60 * 1000; // 5 minute cooldown between trades
const MAX_SLIPPAGE_BPS = 200; // 2% max slippage (200 basis points)

// Fee tier mapping — Mento stablecoin pools use 0.01% fee (100), crypto uses 0.3% (3000)
const STABLECOIN_TOKENS = new Set(["USDT", "USDC", "USDm", "EURm", "BRLm", "KESm", "COPm", "PHPm", "XOFm", "NGNm", "JPYm", "CHFm"]);

function getPoolFee(fromSymbol: string, toSymbol: string): number {
  // Stablecoin-to-stablecoin: 0.01% fee tier
  if (STABLECOIN_TOKENS.has(fromSymbol) && STABLECOIN_TOKENS.has(toSymbol)) return 100;
  // Everything else: 0.3% fee tier
  return 3000;
}

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
    { symbol: "EURm", address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73", decimals: 18 },
    { symbol: "BRLm", address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787", decimals: 18 },
    { symbol: "KESm", address: "0x456a3D042C0DbD3db53D5489e98dFb038553B0d0", decimals: 18 },
    { symbol: "COPm", address: "0x8A567e2aE79CA692Bd748aB832081C45de4041eA", decimals: 18 },
    { symbol: "PHPm", address: "0x105d4A9306D2E55a71d2Eb95B81553AE1dC20d7B", decimals: 18 },
    { symbol: "XOFm", address: "0x73F93dcc49cB8A239e2032663e9475dd5ef29A08", decimals: 18 },
    { symbol: "NGNm", address: "0xE2702Bd97ee33c88c8f6f92DA3B733608aa76F71", decimals: 18 },
    { symbol: "JPYm", address: "0xc45eCF20f3CD864B32D9794d6f76814aE8892e20", decimals: 18 },
    { symbol: "CHFm", address: "0xb55a79F398E759E43C95b979163f30eC87Ee131D", decimals: 18 },
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

async function getViemAccount(userAddress: string) {
  const secretKey = process.env.THIRDWEB_SECRET_KEY!;
  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(`agent_wallet_${userAddress}`)
    .digest("hex");
  const { privateKeyToAccount: viemPKToAccount } = await import("viem/accounts");
  return viemPKToAccount(`0x${hash}` as `0x${string}`);
}

async function getQuote(
  publicClient: any,
  fromTokenAddr: string,
  toTokenAddr: string,
  amountIn: bigint,
  fromSymbol: string,
  toSymbol: string
): Promise<bigint> {
  const { encodeFunctionData, decodeFunctionResult } = await import("viem");

  const quoteData = encodeFunctionData({
    abi: [{
      name: "quoteExactInputSingle",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [{
        name: "params",
        type: "tuple",
        components: [
          { name: "tokenIn", type: "address" },
          { name: "tokenOut", type: "address" },
          { name: "amountIn", type: "uint256" },
          { name: "fee", type: "uint24" },
          { name: "sqrtPriceLimitX96", type: "uint160" },
        ],
      }],
      outputs: [
        { name: "amountOut", type: "uint256" },
        { name: "sqrtPriceX96After", type: "uint160" },
        { name: "initializedTicksCrossed", type: "uint32" },
        { name: "gasEstimate", type: "uint256" },
      ],
    }],
    functionName: "quoteExactInputSingle",
    args: [{
      tokenIn: fromTokenAddr as `0x${string}`,
      tokenOut: toTokenAddr as `0x${string}`,
      amountIn,
      fee: getPoolFee(fromSymbol, toSymbol),
      sqrtPriceLimitX96: BigInt(0),
    }],
  });

  const result = await publicClient.call({
    to: UNISWAP_QUOTER as `0x${string}`,
    data: quoteData,
  });

  // First 32 bytes of the return data is the amountOut
  if (!result.data) throw new Error("Quoter returned no data");
  const amountOut = BigInt(`0x${result.data.slice(2, 66)}`);
  return amountOut;
}

async function executeSwap(
  client: any,
  account: any,
  fromTokenAddr: string,
  toTokenAddr: string,
  amountIn: bigint,
  userAddress: string,
  fromSymbol: string,
  toSymbol: string
) {
  const { createPublicClient, createWalletClient, http, encodeFunctionData } = await import("viem");
  const { celo: celoChain } = await import("viem/chains");

  const viemAccount = await getViemAccount(userAddress);

  const publicClient = createPublicClient({
    chain: celoChain,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account: viemAccount,
    chain: celoChain,
    transport: http(),
  });

  // Step 1: Get quote from Uniswap Quoter for slippage protection
  let amountOutMinimum = BigInt(0);
  try {
    const quotedOutput = await getQuote(publicClient, fromTokenAddr, toTokenAddr, amountIn, fromSymbol, toSymbol);
    // Apply slippage tolerance: accept up to MAX_SLIPPAGE_BPS less than quoted
    amountOutMinimum = (quotedOutput * BigInt(10000 - MAX_SLIPPAGE_BPS)) / BigInt(10000);
    console.log(`Quote: ${quotedOutput.toString()}, min acceptable: ${amountOutMinimum.toString()}`);
  } catch (err) {
    console.error("Quoter failed, skipping trade for safety:", err);
    throw new Error("Could not get price quote — skipping trade to prevent slippage loss");
  }

  // Step 2: Approve router for the input token
  const approveData = encodeFunctionData({
    abi: [{
      name: "approve",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [
        { name: "spender", type: "address" },
        { name: "amount", type: "uint256" },
      ],
      outputs: [{ name: "", type: "bool" }],
    }],
    functionName: "approve",
    args: [UNISWAP_ROUTER as `0x${string}`, amountIn],
  });

  let approveHash: `0x${string}`;
  try {
    approveHash = await walletClient.sendTransaction({
      to: fromTokenAddr as `0x${string}`,
      data: approveData,
      feeCurrency: USDT_FEE_ADAPTER as `0x${string}`,
    });
  } catch {
    // Fallback: pay gas with native CELO
    approveHash = await walletClient.sendTransaction({
      to: fromTokenAddr as `0x${string}`,
      data: approveData,
    });
  }
  await publicClient.waitForTransactionReceipt({ hash: approveHash });

  // Step 3: Execute swap with slippage protection
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
      fee: getPoolFee(fromSymbol, toSymbol),
      recipient: viemAccount.address,
      amountIn,
      amountOutMinimum,
      sqrtPriceLimitX96: BigInt(0),
    }],
  });

  let swapHash: `0x${string}`;
  try {
    swapHash = await walletClient.sendTransaction({
      to: UNISWAP_ROUTER as `0x${string}`,
      data: swapData,
      feeCurrency: USDT_FEE_ADAPTER as `0x${string}`,
    });
  } catch {
    // Fallback: pay gas with native CELO
    swapHash = await walletClient.sendTransaction({
      to: UNISWAP_ROUTER as `0x${string}`,
      data: swapData,
    });
  }
  await publicClient.waitForTransactionReceipt({ hash: swapHash });

  return { transactionHash: swapHash };
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
  fxRates: any[];
  forexNews: any[];
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

  // Build FX rates summary
  const fxRatesSummary = ctx.fxRates
    .map((r: any) => `${r.pair}: ${r.price.toFixed(4)} (24h: ${r.change24h >= 0 ? "+" : ""}${r.change24h.toFixed(2)}%, spread: ${r.spread.toFixed(4)})`)
    .join("\n");

  // Build forex news summary
  const forexNewsSummary = ctx.forexNews
    .map((n: any) => `- [${n.source.toUpperCase()}] ${n.title}`)
    .join("\n");

  const prompt = `${ctx.personalityPrompt}

You are managing a mixed crypto and FX portfolio on Celo blockchain. All trades are swaps against USDT on Uniswap V3.

Available tokens to trade:
- FX Stablecoins: USDm, EURm, BRLm, KESm, COPm, PHPm, XOFm, NGNm, JPYm, CHFm (Mento stablecoins pegged to fiat currencies)
- Crypto: CELO, WETH, WBTC, XAUt (volatile assets)
- Stablecoins: USDC (USD-pegged)

Use FX rate data and forex news to identify opportunities in Mento stablecoin pairs.
Use crypto prices and sentiment for crypto trades.
FX trades are lower risk and more frequent. Crypto trades are higher risk.

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

FX Rates (Mento Stablecoins vs USDT):
${fxRatesSummary || "No FX rate data available"}

Forex News:
${forexNewsSummary || "No forex news available"}

Recent News:
${ctx.news}

Based on your personality and the data above, make a trading decision.
You SHOULD trade when your strategy signals an opportunity — do not default to holding.

Respond with ONLY a valid JSON object, no markdown:
{"action":"swap","fromToken":"USDT","toToken":"EURm","amountPercent":${riskMaxPercent},"reason":"brief explanation"}

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

export const withdrawAll = action({
  args: { userAddress: v.string(), toAddress: v.string() },
  handler: async (ctx, args): Promise<{ success: boolean; transferred: string[]; error?: string }> => {
    try {
      const addr = args.userAddress.toLowerCase();
      const agent = await ctx.runQuery(
        internal.agentWalletInternal.getAgentForUser,
        { userAddress: addr }
      );
      if (!agent) return { success: false, transferred: [], error: "No agent found" };

      const { client, account } = await getAgentAccount(addr);
      const balances = await getOnChainBalances(client, agent.walletAddress);

      if (balances.length === 0) return { success: false, transferred: [], error: "No balances to withdraw" };

      const { createWalletClient, http, encodeFunctionData } = await import("viem");
      const { celo: celoChain } = await import("viem/chains");
      const viemAccount = await getViemAccount(addr);

      const walletClient = createWalletClient({
        account: viemAccount,
        chain: celoChain,
        transport: http(),
      });

      const { createPublicClient } = await import("viem");
      const publicClient = createPublicClient({
        chain: celoChain,
        transport: http(),
      });

      // Sort balances: transfer non-USDT tokens first, USDT last
      // (because USDT is used to pay gas via fee abstraction)
      const sorted = [...balances].sort((a, b) => {
        if (a.token === "USDT") return 1;
        if (b.token === "USDT") return -1;
        return 0;
      });

      const GAS_RESERVE_USDT = 0.05; // Reserve 0.05 USDT for gas on remaining transfers

      // Check if we have USDT for fee abstraction
      const usdtBalance = balances.find((b) => b.token === "USDT");
      const hasUsdtForGas = usdtBalance && usdtBalance.amount > GAS_RESERVE_USDT;

      // Check if we have native CELO for gas fallback
      const nativeCeloBalance = await publicClient.getBalance({ address: viemAccount.address });
      const hasNativeCelo = nativeCeloBalance > BigInt(0);

      if (!hasUsdtForGas && !hasNativeCelo) {
        return {
          success: false,
          transferred: [],
          error: "Insufficient gas: no USDT for fee abstraction and no native CELO for gas. Fund the agent wallet with CELO or USDT first.",
        };
      }

      const transferred: string[] = [];
      for (let i = 0; i < sorted.length; i++) {
        const b = sorted[i];
        if (b.amount <= 0) continue;

        let transferAmount = b.amount;
        // Reserve small amounts for gas
        if (b.token === "USDT") {
          transferAmount = Math.max(0, b.amount - GAS_RESERVE_USDT);
        } else if (b.token === "CELO") {
          transferAmount = Math.max(0, b.amount - 0.1); // Reserve 0.1 CELO for gas
        }

        if (transferAmount <= 0) continue;
        const amountWei = BigInt(Math.floor(transferAmount * 10 ** b.decimals));
        if (amountWei <= BigInt(0)) continue;

        try {
          const transferData = encodeFunctionData({
            abi: [{
              name: "transfer",
              type: "function",
              stateMutability: "nonpayable",
              inputs: [
                { name: "to", type: "address" },
                { name: "amount", type: "uint256" },
              ],
              outputs: [{ name: "", type: "bool" }],
            }],
            functionName: "transfer",
            args: [args.toAddress as `0x${string}`, amountWei],
          });

          let hash: `0x${string}`;
          try {
            // Try fee abstraction (pay gas with USDT) first
            hash = await walletClient.sendTransaction({
              to: b.address as `0x${string}`,
              data: transferData,
              feeCurrency: USDT_FEE_ADAPTER as `0x${string}`,
            });
          } catch (feeErr: any) {
            // Fallback: pay gas with native CELO
            console.warn(`Fee abstraction failed for ${b.token}, falling back to native CELO gas:`, feeErr.message);
            hash = await walletClient.sendTransaction({
              to: b.address as `0x${string}`,
              data: transferData,
            });
          }
          await publicClient.waitForTransactionReceipt({ hash });
          transferred.push(`${transferAmount.toFixed(4)} ${b.token}`);
        } catch (err: any) {
          console.error(`Failed to withdraw ${b.token}:`, err.message);
        }
      }

      if (transferred.length > 0) {
        await ctx.runMutation(internal.agentTradingMutations.recordWithdrawal, {
          agentId: agent._id,
          token: "ALL",
          amount: 0,
          txHash: "",
          timestamp: Date.now(),
        });
      }

      return { success: true, transferred };
    } catch (err: any) {
      return { success: false, transferred: [], error: err.message ?? String(err) };
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
    // Calculate P/L: current value of traded tokens vs what was spent to buy them
    const costBasis = await ctx.runQuery(internal.agentTradingInternal.getCostBasisPerToken, { agentId: agent._id });
    let totalCostBasis = 0;
    let tradedTokensValue = 0;
    for (const h of holdings) {
      const spent = costBasis[h.token] ?? 0;
      if (spent > 0) {
        // Only count tokens that were actually bought (have cost basis from trades)
        totalCostBasis += spent;
        tradedTokensValue += h.valueUsd;
      }
    }

    const pnl = tradedTokensValue - totalCostBasis;
    const pnlPercent = totalCostBasis > 0 ? (pnl / totalCostBasis) * 100 : 0;

    await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
      agentId: agent._id,
      portfolioValue: totalValue,
      pnl,
      pnlPercent,
      totalTrades: agent.totalTrades,
      lastTradeAt: agent.lastTradeAt ?? Date.now(),
      nextTradeAt: Date.now() + 300000,
      initialPortfolioValue: totalCostBasis > 0 ? totalCostBasis : totalValue,
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
      const fxRates = await ctx.runQuery(internal.fxRates.getLatestInternal, {});
      const forexNews = await ctx.runQuery(internal.latestIntel.getLatestForexNewsInternal, {});

      const DEFAULT_PROMPT = `You are an AI trading agent. Buy dips, follow momentum, and take profits. You SHOULD trade when opportunities arise.`;
      let personalityPrompt = DEFAULT_PROMPT;
      if (agent.personality === "custom" && agent.personalityPrompt) {
        personalityPrompt = agent.personalityPrompt;
      } else if (agent.personality) {
        const presets: Record<string, string> = {
          dip_buyer: `You are a mean-reversion trader. For FX: BUY Mento stablecoins (EURm, BRLm, KESm) when depegged >0.5%. For crypto: BUY on >3% dips. SELL on recovery (+2%). You SHOULD trade on dips in FX or crypto.`,
          momentum: `You are a momentum trader. For FX: follow forex trends — buy strengthening currencies (EURm, BRLm, KESm). For crypto: BUY tokens up >2% with bullish sentiment. Use forex news for FX signals. You SHOULD trade on momentum.`,
          stablecoin_farmer: `You are an FX-focused trader. Diversify across Mento stablecoins (USDm, EURm, BRLm, CHFm, JPYm). Exploit spread differences. Only enter crypto on >10% dips. You SHOULD trade to diversify across FX.`,
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
        fxRates: fxRates ?? [],
        forexNews: forexNews ?? [],
      });

      if (decision.action === "swap" && decision.fromToken && decision.toToken) {
        const fromBalance = balances.find((b) => b.token === decision.fromToken);
        if (!fromBalance) return { success: true, decision: `hold (no ${decision.fromToken} balance)` };

        const fromPrice = prices.find((p: any) => p.token === decision.fromToken)?.priceUsd ?? 0;
        let swapAmount = fromBalance.amount * (decision.amountPercent / 100);

        // Cap trade size to MAX_TRADE_USD to avoid draining thin liquidity pools
        if (fromPrice > 0) {
          const swapValueUsd = swapAmount * fromPrice;
          if (swapValueUsd > MAX_TRADE_USD) {
            swapAmount = MAX_TRADE_USD / fromPrice;
            console.log(`Capped trade from $${swapValueUsd.toFixed(2)} to $${MAX_TRADE_USD}`);
          }
        }

        const amountInWei = BigInt(Math.floor(swapAmount * 10 ** fromBalance.decimals));
        if (amountInWei <= BigInt(0)) return { success: true, decision: "hold (amount too small)" };

        const fromAddr = TOKEN_ADDRESSES[decision.fromToken];
        const toAddr = TOKEN_ADDRESSES[decision.toToken];
        if (!fromAddr || !toAddr) return { success: true, decision: "hold (unknown token address)" };

        const result = await executeSwap(client, account, fromAddr, toAddr, amountInWei, addr, decision.fromToken, decision.toToken);

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

      const costBasis = await ctx.runQuery(internal.agentTradingInternal.getCostBasisPerToken, { agentId: agent._id });
      let totalCostBasis = 0;
      for (const h of holdings) {
        totalCostBasis += costBasis[h.token] ?? 0;
      }
      const usdtH = holdings.find((h) => h.token === "USDT");
      if (usdtH) totalCostBasis += usdtH.valueUsd;
      const pnl = totalValue - totalCostBasis;
      const pnlPercent = totalCostBasis > 0 ? (pnl / totalCostBasis) * 100 : 0;

      await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
        agentId: agent._id, portfolioValue: totalValue, pnl, pnlPercent,
        totalTrades: agent.totalTrades + (decision.action === "swap" ? 1 : 0),
        lastTradeAt: Date.now(), nextTradeAt: Date.now() + 300000,
        initialPortfolioValue: totalCostBasis > 0 ? totalCostBasis : totalValue,
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

      // Cooldown: skip if last trade was less than 5 minutes ago
      if (agent.lastTradeAt && (Date.now() - agent.lastTradeAt) < TRADE_COOLDOWN_MS) {
        console.log(`Agent ${agent.name}: cooldown active, skipping`);
        continue;
      }

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
        const fxRates = await ctx.runQuery(internal.fxRates.getLatestInternal, {});
        const forexNews = await ctx.runQuery(internal.latestIntel.getLatestForexNewsInternal, {});

        // 5. Build personality prompt
        const DEFAULT_PROMPT = `You are an AI trading agent. Buy dips, follow momentum, and take profits. You SHOULD trade when opportunities arise.`;
        let personalityPrompt = DEFAULT_PROMPT;
        if (agent.personality === "custom" && agent.personalityPrompt) {
          personalityPrompt = agent.personalityPrompt;
        } else if (agent.personality) {
          // Import personality prompts inline to avoid circular deps
          const presets: Record<string, string> = {
            dip_buyer: `You are a mean-reversion trader. For FX: BUY Mento stablecoins (EURm, BRLm, KESm) when depegged >0.5%. For crypto: BUY on >3% dips. SELL on recovery (+2%). You SHOULD trade on dips in FX or crypto.`,
            momentum: `You are a momentum trader. For FX: follow forex trends — buy strengthening currencies (EURm, BRLm, KESm). For crypto: BUY tokens up >2% with bullish sentiment. Use forex news for FX signals. You SHOULD trade on momentum.`,
            stablecoin_farmer: `You are an FX-focused trader. Diversify across Mento stablecoins (USDm, EURm, BRLm, CHFm, JPYm). Exploit spread differences. Only enter crypto on >10% dips. You SHOULD trade to diversify across FX.`,
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
          fxRates: fxRates ?? [],
          forexNews: forexNews ?? [],
        });
        console.log(`Agent ${agent.name} decision:`, JSON.stringify(decision));

        // 5. Execute swap if needed, or record hold
        if (decision.action === "swap" && decision.fromToken && decision.toToken) {
          const fromBalance = balances.find((b) => b.token === decision.fromToken);
          if (!fromBalance) {
            console.log(`No ${decision.fromToken} balance to swap`);
            continue;
          }

          const fromPrice =
            prices.find((p: any) => p.token === decision.fromToken)?.priceUsd ?? 0;
          let swapAmount = fromBalance.amount * (decision.amountPercent / 100);

          // Cap trade size to MAX_TRADE_USD
          if (fromPrice > 0) {
            const swapValueUsd = swapAmount * fromPrice;
            if (swapValueUsd > MAX_TRADE_USD) {
              swapAmount = MAX_TRADE_USD / fromPrice;
              console.log(`Capped trade from $${swapValueUsd.toFixed(2)} to $${MAX_TRADE_USD}`);
            }
          }

          const amountInWei = BigInt(Math.floor(swapAmount * 10 ** fromBalance.decimals));

          if (amountInWei <= BigInt(0)) continue;

          const fromAddr = TOKEN_ADDRESSES[decision.fromToken];
          const toAddr = TOKEN_ADDRESSES[decision.toToken];
          if (!fromAddr || !toAddr) continue;

          const result = await executeSwap(client, account, fromAddr, toAddr, amountInWei, agent.userAddress!, decision.fromToken, decision.toToken);

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

        const costBasisCron = await ctx.runQuery(internal.agentTradingInternal.getCostBasisPerToken, { agentId: agent._id });
        let totalCostBasisCron = 0;
        for (const h of holdings) {
          totalCostBasisCron += costBasisCron[h.token] ?? 0;
        }
        const usdtHCron = holdings.find((h) => h.token === "USDT");
        if (usdtHCron) totalCostBasisCron += usdtHCron.valueUsd;
        const pnl = totalValue - totalCostBasisCron;
        const pnlPercent = totalCostBasisCron > 0 ? (pnl / totalCostBasisCron) * 100 : 0;

        await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
          agentId: agent._id,
          portfolioValue: totalValue,
          pnl,
          pnlPercent,
          totalTrades: agent.totalTrades + (decision.action === "swap" ? 1 : 0),
          lastTradeAt: Date.now(),
          nextTradeAt: Date.now() + 300000,
          initialPortfolioValue: totalCostBasisCron > 0 ? totalCostBasisCron : totalValue,
        });
      } catch (err) {
        console.error(`Agent ${agent.name} trade error:`, err);
        // Always update nextTradeAt so countdown never gets stuck
        try {
          await ctx.runMutation(internal.agentTradingMutations.updateAgentMetrics, {
            agentId: agent._id,
            portfolioValue: agent.portfolioValue,
            pnl: agent.pnl ?? 0,
            pnlPercent: agent.pnlPercent ?? 0,
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
