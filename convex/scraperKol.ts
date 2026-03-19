"use node";

import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";

// Crypto KOLs and Celo ecosystem accounts
// These handles are passed to Grok to generate tweet-style summaries
const KOLS = [
  "VitalikButerin",
  "aantonop",
  "punk6529",
  "CryptoHayes",
  "DefiIgnas",
  "0xMaki",
  "jessepollak",
  "celoorg",
  "MentoLabs",
  "RegenRene",
  "rleshner",
  "sassal0x",
  "WuBlockchain",
  "CryptoCobain",
  "BarrySilbert",
];

export const fetchKolTweets = internalAction({
  args: {},
  handler: async (ctx) => {
    const apiKey = process.env.GROK_API_KEY;
    if (!apiKey) {
      console.error("GROK_API_KEY not set, skipping KOL fetch");
      return;
    }

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
              content: `Search X/Twitter for recent crypto-related posts from these accounts: ${KOLS.join(", ")}.
For each account that has posted in the last 24 hours about crypto, DeFi, Celo, Ethereum, Bitcoin, or markets, return their most recent post.
IMPORTANT: Only return REAL tweets you can verify. Do NOT fabricate tweets. Do NOT invent tweet URLs.
For the "url" field, use the format "https://x.com/{handle}" (just link to their profile, NOT a fake status URL).
Respond ONLY with a valid JSON array, no markdown:
[{"handle": "@VitalikButerin", "name": "Vitalik Buterin", "text": "actual tweet text...", "url": "https://x.com/VitalikButerin", "sentiment": "bullish"|"bearish"|"neutral", "tokens": "BTC,ETH"}]
If you cannot find real recent tweets from a KOL, omit them entirely. Return up to 15 results.`,
            },
          ],
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        console.error(`Grok KOL fetch failed: ${res.status} ${body}`);
        return;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content || "";
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return;

      const parsed = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(parsed) || parsed.length === 0) return;

      const now = Date.now();
      const items = parsed.slice(0, 15).map((t: any) => {
        // Only use profile URL, never trust status URLs from LLM
        const handle = (t.handle ?? "").replace(/^@/, "");
        const profileUrl = handle ? `https://x.com/${handle}` : undefined;
        return {
          handle: t.handle ?? "",
          name: t.name ?? t.handle ?? "",
          text: t.text ?? "",
          url: profileUrl,
          sentiment: t.sentiment ?? undefined,
          tokens: t.tokens ?? undefined,
          timestamp: now,
        };
      });

      await ctx.runMutation(internal.scraperMutations.saveKolTweets, { items });
    } catch (err) {
      console.error("fetchKolTweets error:", err);
    }
  },
});
