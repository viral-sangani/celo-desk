// Uniswap V3 on Celo
export const UNISWAP_V3_ROUTER = "0x5615CDAb10dc425a742d643d949a7F474C01abc4" as const;

// Token addresses on Celo mainnet
export const TOKEN_ADDRESSES: Record<string, `0x${string}`> = {
  CELO: "0x471EcE3750Da237f93B8E339c536989b8978a438",
  USDm: "0x765DE816845861e75A25fCA122bb6898B8B1282a",
  EURm: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73",
  BRLm: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787",
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C",
  USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e",
  WETH: "0xD221812de1BD094f35587EE8E174B07B6167D9Af",
  WBTC: "0x8aC2901Dd8A1F17a1A4768A6bA4C3751e3995B2D",
  XAUt: "0xaf37E8B6C9ED7f6318979f56Fc287d76c30847ff",
};

// Token decimals
export const TOKEN_DECIMALS: Record<string, number> = {
  CELO: 18,
  USDm: 18,
  EURm: 18,
  BRLm: 18,
  USDC: 6,
  USDT: 6,
  WETH: 18,
  WBTC: 8,
  XAUt: 6,
};

// Celo fee currency adapters (for paying gas in stablecoins)
export const CELO_USDT_FEE_ADAPTER = "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as const;

// Tradable tokens (all against USDT)
export const TRADABLE_TOKENS = ["CELO", "WETH", "WBTC", "USDm", "EURm", "BRLm", "XAUt", "USDC"] as const;
