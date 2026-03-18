// CoinGecko API helper with round-robin key rotation
// Demo API keys use: https://api.coingecko.com/api/v3/ + x_cg_demo_api_key param

const KEYS = [
  process.env.COINGECKO_API_KEY_1,
  process.env.COINGECKO_API_KEY_2,
].filter(Boolean) as string[];

let requestCounter = 0;

export async function cgFetch(path: string): Promise<Response> {
  if (KEYS.length === 0) {
    return fetch(`https://api.coingecko.com/api/v3${path}`);
  }

  const key = KEYS[requestCounter % KEYS.length];
  requestCounter++;

  const separator = path.includes("?") ? "&" : "?";
  const url = `https://api.coingecko.com/api/v3${path}${separator}x_cg_demo_api_key=${key}`;

  const res = await fetch(url);

  // If rate limited, try the other key
  if (res.status === 429 && KEYS.length > 1) {
    const otherKey = KEYS[requestCounter % KEYS.length];
    requestCounter++;
    const retryUrl = `https://api.coingecko.com/api/v3${path}${separator}x_cg_demo_api_key=${otherKey}`;
    return fetch(retryUrl);
  }

  return res;
}
