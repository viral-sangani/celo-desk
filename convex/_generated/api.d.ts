/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as activityLog from "../activityLog.js";
import type * as agentTrading from "../agentTrading.js";
import type * as agentTradingInternal from "../agentTradingInternal.js";
import type * as agentTradingMutations from "../agentTradingMutations.js";
import type * as agentWallet from "../agentWallet.js";
import type * as agentWalletAction from "../agentWalletAction.js";
import type * as agentWalletInternal from "../agentWalletInternal.js";
import type * as agents from "../agents.js";
import type * as analytics from "../analytics.js";
import type * as crons from "../crons.js";
import type * as fxRates from "../fxRates.js";
import type * as latestIntel from "../latestIntel.js";
import type * as lib_coingecko from "../lib/coingecko.js";
import type * as lib_tokenMap from "../lib/tokenMap.js";
import type * as news from "../news.js";
import type * as prices from "../prices.js";
import type * as scraper from "../scraper.js";
import type * as scraperFearGreed from "../scraperFearGreed.js";
import type * as scraperForex from "../scraperForex.js";
import type * as scraperKol from "../scraperKol.js";
import type * as scraperMarketIntel from "../scraperMarketIntel.js";
import type * as scraperMutations from "../scraperMutations.js";
import type * as scraperSentiment from "../scraperSentiment.js";
import type * as scraperTokenMetadata from "../scraperTokenMetadata.js";
import type * as seed from "../seed.js";
import type * as tokenMetadata from "../tokenMetadata.js";
import type * as tradeHistory from "../tradeHistory.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  activityLog: typeof activityLog;
  agentTrading: typeof agentTrading;
  agentTradingInternal: typeof agentTradingInternal;
  agentTradingMutations: typeof agentTradingMutations;
  agentWallet: typeof agentWallet;
  agentWalletAction: typeof agentWalletAction;
  agentWalletInternal: typeof agentWalletInternal;
  agents: typeof agents;
  analytics: typeof analytics;
  crons: typeof crons;
  fxRates: typeof fxRates;
  latestIntel: typeof latestIntel;
  "lib/coingecko": typeof lib_coingecko;
  "lib/tokenMap": typeof lib_tokenMap;
  news: typeof news;
  prices: typeof prices;
  scraper: typeof scraper;
  scraperFearGreed: typeof scraperFearGreed;
  scraperForex: typeof scraperForex;
  scraperKol: typeof scraperKol;
  scraperMarketIntel: typeof scraperMarketIntel;
  scraperMutations: typeof scraperMutations;
  scraperSentiment: typeof scraperSentiment;
  scraperTokenMetadata: typeof scraperTokenMetadata;
  seed: typeof seed;
  tokenMetadata: typeof tokenMetadata;
  tradeHistory: typeof tradeHistory;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
