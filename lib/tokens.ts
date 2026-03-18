export interface TokenMeta {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  color: string;
}

export const TOKENS: TokenMeta[] = [
  {
    symbol: "CELO",
    name: "Celo",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
    color: "#00ff41",
  },
  {
    symbol: "USDm",
    name: "Mento Dollar",
    address: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
    decimals: 18,
    color: "#ffb400",
  },
  {
    symbol: "EURm",
    name: "Mento Euro",
    address: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
    decimals: 18,
    color: "#3B82F6",
  },
  {
    symbol: "BRLm",
    name: "Mento Brazilian Real",
    address: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
    decimals: 18,
    color: "#6b7280",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
    decimals: 6,
    color: "#2775CA",
  },
  {
    symbol: "USDT",
    name: "Tether",
    address: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
    decimals: 6,
    color: "#26A17B",
  },
  {
    symbol: "XAUt",
    name: "Tether Gold",
    address: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
    decimals: 6,
    color: "#CFB53B",
  },
  {
    symbol: "WETH",
    name: "Wrapped Ether",
    address: "0xD221812de1BD094f35587EE8E174B07B6167D9Af",
    decimals: 18,
    color: "#627EEA",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    address: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D",
    decimals: 8,
    color: "#F7931A",
  },
];

export const CHART_TOKENS = [
  { symbol: "CELO", name: "Celo", tvSymbol: "BINANCE:CELOUSDT", color: "#00ff41" },
  { symbol: "BTC", name: "Bitcoin", tvSymbol: "BINANCE:BTCUSDT", color: "#F7931A" },
  { symbol: "ETH", name: "Ethereum", tvSymbol: "BINANCE:ETHUSDT", color: "#627EEA" },
  { symbol: "XAUt", name: "Tether Gold", tvSymbol: "OKX:XAUTUSDT", color: "#CFB53B" },
];

export const TOKEN_COINGECKO_IDS: Record<string, string> = {
  CELO: "celo",
  BTC: "bitcoin",
  ETH: "ethereum",
  XAUt: "tether-gold",
  USDC: "usd-coin",
  USDT: "tether",
  USDm: "celo-dollar",
  EURm: "celo-euro",
  BRLm: "celo-brazilian-real",
};

export const FX_PAIRS = [
  "USDm/USDT",
  "EURm/USDT",
  "BRLm/USDT",
  "KESm/USDT",
  "COPm/USDT",
  "PHPm/USDT",
  "XOFm/USDT",
  "NGNm/USDT",
  "JPYm/USDT",
  "CHFm/USDT",
];
