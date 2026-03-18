import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Fetch token prices every 1 minute
crons.interval("fetch-prices", { minutes: 1 }, internal.scraper.fetchPrices);

// Fetch crypto news every 5 minutes
crons.interval("fetch-news", { minutes: 5 }, internal.scraper.fetchNews);

// Fetch FX stablecoin rates every 5 minutes
crons.interval(
  "fetch-fx-rates",
  { minutes: 5 },
  internal.scraper.fetchFXRates
);

// Fetch token metadata every 5 minutes
crons.interval("fetch-token-metadata", { minutes: 5 }, internal.scraperTokenMetadata.fetchTokenMetadata);

// Execute agent trades every 5 minutes
crons.interval("execute-trades", { minutes: 5 }, internal.agentTrading.executeTrades);

// Fetch Grok social sentiment every 10 minutes
crons.interval("fetch-sentiment", { minutes: 10 }, internal.scraperSentiment.fetchSentiment);

// Fetch Fear & Greed Index every 15 minutes
crons.interval("fetch-fear-greed", { minutes: 15 }, internal.scraperFearGreed.fetchFearGreed);

// Fetch Grok market intel every 15 minutes
crons.interval("fetch-market-intel", { minutes: 15 }, internal.scraperMarketIntel.fetchMarketIntel);

// Fetch ForexLive/FXStreet news every 10 minutes
crons.interval("fetch-forex-news", { minutes: 10 }, internal.scraperForex.fetchForexNews);

// Fetch KOL tweets every 15 minutes
crons.interval("fetch-kol-tweets", { minutes: 15 }, internal.scraperKol.fetchKolTweets);

export default crons;
