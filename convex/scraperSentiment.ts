"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

const TOKENS = ["CELO", "BTC", "ETH"];

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

    const now = Date.now();
    const items: Array<{
      token: string;
      sentiment: string;
      score: number;
      summary: string;
      topTweets: string;
      source: string;
      timestamp: number;
    }> = [];

    for (let i = 0; i < TOKENS.length; i++) {
      const token = TOKENS[i];
      if (i > 0) await sleep(3000); // 3s delay between calls to avoid 429

      try {
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
                content: `${(() => {
                  const tp = prices.find((p: any) => p.token === token);
                  return tp ? `Current ${token} price: $${tp.priceUsd.toFixed(2)}, 24h change: ${tp.change24h >= 0 ? "+" : ""}${tp.change24h.toFixed(2)}%. ` : "";
                })()}Analyze current Twitter/X sentiment for ${token} crypto token. Your sentiment assessment MUST be consistent with the actual price movement data provided. If the token is down significantly, sentiment should lean bearish. Rate sentiment from -100 (extremely bearish) to +100 (extremely bullish). Include top 3 recent relevant tweets with their URLs. Respond ONLY with valid JSON, no markdown: {"sentiment": "bullish"|"bearish"|"neutral", "score": number, "summary": "2-3 sentence analysis", "topTweets": [{"text": "tweet text", "author": "@handle", "url": "https://x.com/..."}]}`,
              },
            ],
          }),
        });

        if (!res.ok) {
          const body = await res.text();
          console.error(`Grok sentiment failed for ${token}: ${res.status} ${body}`);
          continue;
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        const parsed = JSON.parse(jsonMatch[0]);
        items.push({
          token,
          sentiment: parsed.sentiment ?? "neutral",
          score: typeof parsed.score === "number" ? parsed.score : 0,
          summary: parsed.summary ?? "",
          topTweets: JSON.stringify(parsed.topTweets ?? []),
          source: "grok",
          timestamp: now,
        });
      } catch (err) {
        console.error(`Sentiment error for ${token}:`, err);
      }
    }

    if (items.length > 0) {
      await ctx.runMutation(internal.scraperMutations.saveSocialSentiment, { items });
    }
  },
});
