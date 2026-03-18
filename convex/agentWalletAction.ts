"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import crypto from "crypto";

// Public action: create agent wallet and save to DB
export const createAgent = action({
  args: { userAddress: v.string() },
  handler: async (
    ctx,
    args
  ): Promise<{ walletAddress: string; agentId: string }> => {
    const addr = args.userAddress.toLowerCase();

    // Check if agent already exists
    const existing = await ctx.runQuery(
      internal.agentWalletInternal.getAgentForUser,
      { userAddress: addr }
    );
    if (existing) {
      return { walletAddress: existing.walletAddress, agentId: existing._id };
    }

    // Generate real wallet using thirdweb
    let walletAddress: string;
    const secretKey = process.env.THIRDWEB_SECRET_KEY;

    if (secretKey) {
      try {
        const { createThirdwebClient } = await import("thirdweb");
        const { privateKeyToAccount } = await import("thirdweb/wallets");

        const client = createThirdwebClient({ secretKey });

        // Deterministic private key from HMAC(secretKey, userAddress)
        const hash = crypto
          .createHmac("sha256", secretKey)
          .update(`agent_wallet_${addr}`)
          .digest("hex");

        const account = privateKeyToAccount({
          client,
          privateKey: `0x${hash}` as `0x${string}`,
        });

        walletAddress = account.address;
        console.log(`Created real agent wallet: ${walletAddress} for user: ${addr}`);
      } catch (err) {
        console.error("thirdweb wallet creation failed:", err);
        // Fallback to deterministic address
        const hash = crypto
          .createHmac("sha256", "celo_desk_fallback")
          .update(`agent_wallet_${addr}`)
          .digest("hex");
        walletAddress = `0x${hash.slice(0, 40)}`;
      }
    } else {
      console.warn("THIRDWEB_SECRET_KEY not set");
      const hash = crypto
        .createHash("sha256")
        .update(`agent_wallet_${addr}`)
        .digest("hex");
      walletAddress = `0x${hash.slice(0, 40)}`;
    }

    const agentId = await ctx.runMutation(
      internal.agentWalletInternal.saveAgent,
      {
        name: `agent-${addr.slice(2, 8)}`,
        walletAddress,
        userAddress: addr,
      }
    );

    return { walletAddress, agentId };
  },
});
