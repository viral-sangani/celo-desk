// Celo fee currency configuration
// Celo allows paying gas fees in ERC-20 tokens via fee currency adapters

// USDT fee adapter address on Celo mainnet
// This is an ADAPTER address (not the USDT token address) because USDT has 6 decimals
// See: https://docs.celo.org/protocol/transaction/erc20-transaction-fees
export const CELO_USDT_FEE_ADAPTER =
  "0x0e2a3e05bc9a16f5292a6170456a710cb89c6f72" as `0x${string}`;

// USDC fee adapter address on Celo mainnet
export const CELO_USDC_FEE_ADAPTER =
  "0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B" as `0x${string}`;

// USDT token address on Celo mainnet
export const CELO_USDT_TOKEN =
  "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as `0x${string}`;

// Celo chain ID
export const CELO_CHAIN_ID = 42220;
