// Tokens fetched via CoinGecko simple/price (for watchlist)
export const COINGECKO_IDS: Record<string, string> = {
  CELO: "celo",
  BTC: "bitcoin",
  ETH: "ethereum",
  USDC: "usd-coin",
  USDT: "tether",
  XAUt: "tether-gold",
};

// Mento stablecoins — fetched in USD for FX rates table
export const COINGECKO_STABLE_IDS: Record<
  string,
  { id: string; pair: string }
> = {
  USDm: { id: "celo-dollar", pair: "USDm/USDT" },
  EURm: { id: "celo-euro", pair: "EURm/USDT" },
  BRLm: { id: "celo-real-creal", pair: "BRLm/USDT" },
  KESm: { id: "celo-kenyan-shilling", pair: "KESm/USDT" },
  // Tokens below may not exist on CoinGecko — will fall back gracefully
  COPm: { id: "celo-colombian-peso", pair: "COPm/USDT" },
  PHPm: { id: "celo-philippine-peso", pair: "PHPm/USDT" },
  XOFm: { id: "celo-west-african-franc", pair: "XOFm/USDT" },
  NGNm: { id: "celo-nigerian-naira", pair: "NGNm/USDT" },
  JPYm: { id: "celo-japanese-yen", pair: "JPYm/USDT" },
  CHFm: { id: "celo-swiss-franc", pair: "CHFm/USDT" },
};

// Reverse lookup: CoinGecko ID → our token symbol
export const COINGECKO_TO_SYMBOL: Record<string, string> = Object.fromEntries(
  Object.entries(COINGECKO_IDS).map(([symbol, id]) => [id, symbol])
);
