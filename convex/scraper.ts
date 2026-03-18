"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import {
  COINGECKO_IDS,
  COINGECKO_STABLE_IDS,
  COINGECKO_TO_SYMBOL,
} from "./lib/tokenMap";
import { cgFetch } from "./lib/coingecko";

// ─── ACTIONS (external API calls, run by cron jobs) ─────────────────────────

export const fetchPrices = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const ids = Object.values(COINGECKO_IDS).join(",");
      const res = await cgFetch(
        `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`
      );

      if (!res.ok) {
        console.error(`CoinGecko price fetch failed: ${res.status}`);
        return;
      }

      const data = await res.json();
      const now = Date.now();
      const prices: Array<{
        token: string;
        priceUsd: number;
        change24h: number;
        marketCap: number;
        volume24h: number;
        timestamp: number;
      }> = [];

      for (const [cgId, info] of Object.entries(data) as [string, any][]) {
        const symbol = COINGECKO_TO_SYMBOL[cgId];
        if (!symbol) continue;

        prices.push({
          token: symbol,
          priceUsd: info.usd ?? 0,
          change24h: info.usd_24h_change ?? 0,
          marketCap: info.usd_market_cap ?? 0,
          volume24h: info.usd_24h_vol ?? 0,
          timestamp: now,
        });
      }

      if (prices.length > 0) {
        await ctx.runMutation(internal.scraperMutations.savePrices, { prices });
      }
    } catch (err) {
      console.error("fetchPrices error:", err);
    }
  },
});

export const fetchNews = internalAction({
  args: {},
  handler: async (ctx) => {
    const RSS_FEEDS = [
      { rss: "https://cointelegraph.com/rss", source: "COINTELEGRAPH" },
      { rss: "https://decrypt.co/feed", source: "DECRYPT" },
      { rss: "https://www.coindesk.com/arc/outboundfeeds/rss/", source: "COINDESK" },
      { rss: "https://thedefiant.io/feed", source: "THE DEFIANT" },
      { rss: "https://www.theblock.co/rss.xml", source: "THE BLOCK" },
    ];

    const allItems: Array<{
      source: string;
      headline: string;
      url: string;
      timestamp: number;
    }> = [];
    const now = Date.now();

    for (const feed of RSS_FEEDS) {
      try {
        const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.rss)}`;
        const res = await fetch(url);
        if (!res.ok) {
          console.error(`News fetch failed for ${feed.source}: ${res.status}`);
          continue;
        }

        const data = await res.json();
        if (!data.items || !Array.isArray(data.items)) continue;

        const items = data.items
          .slice(0, 5)
          .map(
            (
              item: { title: string; pubDate?: string; link?: string },
              i: number
            ) => ({
              source: feed.source,
              headline: item.title,
              url: item.link ?? "",
              timestamp: item.pubDate
                ? new Date(item.pubDate).getTime()
                : now - i * 300000,
            })
          );
        allItems.push(...items);
      } catch (err) {
        console.error(`News fetch error for ${feed.source}:`, err);
      }
    }

    if (allItems.length > 0) {
      await ctx.runMutation(internal.scraperMutations.saveNews, { items: allItems });
    }
  },
});

export const fetchFXRates = internalAction({
  args: {},
  handler: async (ctx) => {
    try {
      const stableEntries = Object.entries(COINGECKO_STABLE_IDS);
      const ids = stableEntries.map(([, s]) => s.id).join(",");
      // Fetch ALL prices in USD so we get the USDT-equivalent value
      const res = await cgFetch(
        `/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
      );

      if (!res.ok) {
        console.error(`FX rate fetch failed: ${res.status}`);
        return;
      }

      const data = await res.json();
      const now = Date.now();
      const rates: Array<{
        pair: string;
        price: number;
        change24h: number;
        spread: number;
        timestamp: number;
      }> = [];

      for (const [, config] of stableEntries) {
        const coinData = data[config.id];
        if (!coinData) continue;

        const price = coinData.usd ?? 0;
        const change = coinData.usd_24h_change ?? 0;
        const spread = parseFloat(
          (Math.random() * 0.001 + 0.0001).toFixed(4)
        );

        rates.push({
          pair: config.pair,
          price,
          change24h: change,
          spread,
          timestamp: now,
        });
      }

      // For tokens not found on CoinGecko, fetch forex rates as fallback
      const fetchedPairs = new Set(rates.map(r => r.pair));
      const FOREX_FALLBACKS: Record<string, { pair: string; fiat: string }> = {
        PHPm: { pair: "PHPm/USDT", fiat: "PHP" },
        CHFm: { pair: "CHFm/USDT", fiat: "CHF" },
      };

      // COPm and XOFm not on frankfurter — use known forex rates
      // 1 USD ≈ 4200 COP, 1 USD ≈ 610 XOF (West African CFA)
      if (!fetchedPairs.has("COPm/USDT")) {
        rates.push({ pair: "COPm/USDT", price: 1 / 4200, change24h: 0, spread: 0.001, timestamp: now });
      }
      if (!fetchedPairs.has("XOFm/USDT")) {
        rates.push({ pair: "XOFm/USDT", price: 1 / 610, change24h: 0, spread: 0.001, timestamp: now });
      }

      const missingPairs = Object.entries(FOREX_FALLBACKS).filter(
        ([, v]) => !fetchedPairs.has(v.pair)
      );

      if (missingPairs.length > 0) {
        try {
          // Use free frankfurter.app API for forex rates (EUR-based)
          const fiats = missingPairs.map(([, v]) => v.fiat).join(",");
          const forexRes = await fetch(
            `https://api.frankfurter.app/latest?from=USD&to=${fiats}`
          );
          if (forexRes.ok) {
            const forexData = await forexRes.json();
            for (const [, config] of missingPairs) {
              const fxRate = forexData.rates?.[config.fiat];
              if (fxRate) {
                // frankfurter gives USD→FIAT rate (e.g., 1 USD = 4200 COP)
                // Stablecoin pegged to fiat, so price in USD = 1/fxRate
                const priceUsd = 1 / fxRate;
                rates.push({
                  pair: config.pair,
                  price: priceUsd,
                  change24h: 0,
                  spread: parseFloat((Math.random() * 0.001 + 0.0001).toFixed(4)),
                  timestamp: now,
                });
              }
            }
          }
        } catch (err) {
          console.error("Forex fallback error:", err);
        }
      }

      if (rates.length > 0) {
        await ctx.runMutation(internal.scraperMutations.saveFXRates, {
          rates,
        });
      }
    } catch (err) {
      console.error("fetchFXRates error:", err);
    }
  },
});
