"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TOKENS = ["CELO", "BTC", "ETH"];

export const fetchSentiment = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error("GROK_API_KEY not set, skipping sentiment fetch");
      return;
    }

    // Fetch current prices for accurate sentiment context
    const prices = await ctx.runQuery(internal.agentTradingInternal.getAllPrices, {});
    const priceContext = TOKENS.map((token) => {
      const tp = prices.find((p: any) => p.token === token);
      return tp
        ? `${token}: $${tp.priceUsd.toFixed(2)} (24h: ${tp.change24h >= 0 ? "+" : ""}${tp.change24h.toFixed(2)}%)`
        : `${token}: no price data`;
    }).join(", ");

    const now = Date.now();

    try {
      // Single Grok call for all tokens
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-mini-fast",
          messages: [
            {
              role: "user",
              content: `Current prices: ${priceContext}.

Analyze current Twitter/X sentiment for each of these crypto tokens: ${TOKENS.join(", ")}.
Your sentiment assessment MUST be consistent with the actual price movement data provided. If a token is down significantly, sentiment should lean bearish.
Rate each token's sentiment from -100 (extremely bearish) to +100 (extremely bullish).

Respond ONLY with a valid JSON array, no markdown:
[{"token": "CELO", "sentiment": "bullish"|"bearish"|"neutral", "score": number, "summary": "2-3 sentence analysis"}, ...]
Return one entry per token.`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`Grok sentiment failed: ${res.status} ${body}`);
        return;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error("Grok sentiment: could not parse JSON array");
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed)) return;

      const items = parsed
        .filter((p: any) => TOKENS.includes(p.token))
        .map((p: any) => ({
          token: p.token,
          sentiment: p.sentiment ?? "neutral",
          score: typeof p.score === "number" ? p.score : 0,
          summary: p.summary ?? "",
          topTweets: "[]",
          source: "grok",
          timestamp: now,
        }));

      if (items.length > 0) {
        await ctx.runMutation(internal.scraperMutations.saveSocialSentiment, { items });
      }
    } catch (err) {
      console.error("fetchSentiment error:", err);
    }
  },
});
