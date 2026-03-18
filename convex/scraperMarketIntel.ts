"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

export const fetchMarketIntel = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error("GROK_API_KEY not set, skipping market intel fetch");
      return;
    }

    try {
      // Fetch current prices for accurate context
      const prices = await ctx.runQuery(internal.agentTradingInternal.getAllPrices, {});
      const priceContext = prices
        .map((p: any) => `${p.token}: $${p.priceUsd.toFixed(2)} (24h: ${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(2)}%)`)
        .join(", ");

      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-3-latest",
          messages: [
            {
              role: "user",
              content: `Today is ${new Date().toISOString().split("T")[0]}. Current crypto prices: ${priceContext}.

Provide a brief market intelligence report on crypto markets right now. Include:
1. Overall market direction
2. Key events moving markets
3. Notable token-specific news for CELO, BTC, ETH
4. Any emerging risks or opportunities
IMPORTANT: Make the title unique and specific. Reference specific events, price levels, or trends. Avoid generic titles like "Market Update" or "Mixed Signals".
Respond ONLY with JSON: {"type": "analysis", "title": "short headline", "content": "2-4 paragraph analysis", "sentiment": "bullish"|"bearish"|"neutral", "tokens": ["BTC","ETH","CELO"]}`,
            },
          ],
        }),
      });

      if (!res.ok) {
        console.error(`Grok market intel fetch failed: ${res.status}`);
        return;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return;

      const parsed = JSON.parse(jsonMatch[0]);
      await ctx.runMutation(internal.scraperMutations.saveMarketIntel, {
        items: [
          {
            type: parsed.type ?? "analysis",
            title: parsed.title ?? "Market Update",
            content: parsed.content ?? "",
            source: "grok",
            tokens: JSON.stringify(parsed.tokens ?? []),
            sentiment: parsed.sentiment ?? "neutral",
            timestamp: Date.now(),
          },
        ],
      });
    } catch (err) {
      console.error("fetchMarketIntel error:", err);
    }
  },
});
