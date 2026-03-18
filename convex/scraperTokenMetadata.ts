"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { cgFetch } from "./lib/coingecko";

const COINGECKO_IDS: Record<string, string> = {
  CELO: "celo",
  BTC: "bitcoin",
  ETH: "ethereum",
  XAUt: "tether-gold",
  USDC: "usd-coin",
  USDT: "tether",
  USDm: "celo-dollar",
  EURm: "celo-euro",
  BRLm: "celo-real-creal",
};

const CELO_TOKEN_ADDRESSES: Record<string, string> = {
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  EURm: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  BRLm: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  ETH: "0xD221812de1BD094f35587EE8E174B07B6167D9Af",
  BTC: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D",
  XAUt: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
};

export const fetchTokenMetadata = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const metadata: any[] = [];

    // Step 1: Fetch CoinGecko data for each token (with delay to avoid rate limit)
    for (const [symbol, cgId] of Object.entries(COINGECKO_IDS)) {
      try {
        const res = await cgFetch(`/coins/${cgId}?localization=false&tickers=false&community_data=false&developer_data=false`);
        if (!res.ok) {
          console.error(`CoinGecko ${symbol} failed: ${res.status}`);
          continue;
        }
        const data = await res.json();
        const md = data.market_data;

        metadata.push({
          token: symbol,
          marketCap: md?.market_cap?.usd ?? undefined,
          fullyDilutedValuation: md?.fully_diluted_valuation?.usd ?? undefined,
          circulatingSupply: md?.circulating_supply ?? undefined,
          totalSupply: md?.total_supply ?? undefined,
          maxSupply: md?.max_supply ?? undefined,
          totalVolume24h: md?.total_volume?.usd ?? undefined,
          priceUsd: md?.current_price?.usd ?? undefined,
          change24h: md?.price_change_percentage_24h ?? undefined,
          change7d: md?.price_change_percentage_7d ?? undefined,
          change30d: md?.price_change_percentage_30d ?? undefined,
          ath: md?.ath?.usd ?? undefined,
          athDate: md?.ath_date?.usd ?? undefined,
          rank: data.market_cap_rank ?? undefined,
          timestamp: now,
        });

        // Wait 3 seconds between requests to stay within rate limits
        await new Promise((resolve) => setTimeout(resolve, 3000));
      } catch (err) {
        console.error(`Error fetching ${symbol}:`, err);
      }
    }

    // Step 2: Fetch Mento TVL from DeFi Llama
    try {
      const res = await fetch("https://api.llama.fi/protocol/mento");
      if (res.ok) {
        const data = await res.json();
        const celoTvl = data.currentChainTvls?.Celo ?? data.currentChainTvls?.celo ?? 0;
        // Apply Mento TVL to all Mento stablecoins
        for (const m of metadata) {
          if (["USDm", "EURm", "BRLm"].includes(m.token)) {
            m.tvl = celoTvl;
          }
        }
        // Also set for CELO if it exists
        const celoMeta = metadata.find((m) => m.token === "CELO");
        if (celoMeta) {
          // Try to get Celo chain TVL
          try {
            const celoRes = await fetch("https://api.llama.fi/v2/chains");
            if (celoRes.ok) {
              const chains = await celoRes.json();
              const celoChain = chains.find((c: any) => c.name === "Celo");
              if (celoChain) celoMeta.tvl = celoChain.tvl;
            }
          } catch {}
        }
      }
    } catch (err) {
      console.error("DeFi Llama error:", err);
    }

    // Step 3: Fetch holder counts from Blockscout
    for (const [symbol, address] of Object.entries(CELO_TOKEN_ADDRESSES)) {
      try {
        const url = `https://celo.blockscout.com/api/v2/tokens/${address}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const holders = data.holders_count ? parseInt(data.holders_count) : undefined;
          const existing = metadata.find((m) => m.token === symbol);
          if (existing && holders) {
            existing.holders = holders;
          }
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (err) {
        console.error(`Blockscout ${symbol} error:`, err);
      }
    }

    // Step 4: Save to Convex
    if (metadata.length > 0) {
      // Clean up undefined values (Convex doesn't accept undefined in objects)
      const cleaned = metadata.map((m) => {
        const clean: any = { token: m.token, timestamp: m.timestamp };
        for (const [key, val] of Object.entries(m)) {
          if (val !== undefined && val !== null) {
            clean[key] = val;
          }
        }
        return clean;
      });
      await ctx.runMutation(internal.scraperMutations.saveTokenMetadata, { metadata: cleaned });
      console.log(`Saved metadata for ${cleaned.length} tokens`);
    }
  },
});
