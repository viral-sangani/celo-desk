"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { celo } from "thirdweb/chains";
import { thirdwebClient } from "@/lib/thirdweb";

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentWalletAddress: string;
  onSuccess?: () => void;
}

const USDT_ADDRESS = "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as const;
const USDT_DECIMALS = 6;

export default function DepositModal({ isOpen, onClose, agentWalletAddress, onSuccess }: DepositModalProps) {
  const selectedToken = "USDT";
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const account = useActiveAccount();

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  const handleDeposit = async () => {
    if (!account || !amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");

    try {
      const amountWei = BigInt(Math.floor(parseFloat(amount) * (10 ** USDT_DECIMALS)));

      const tokenContract = getContract({
        client: thirdwebClient,
        chain: celo,
        address: USDT_ADDRESS,
      });

      const tx = prepareContractCall({
        contract: tokenContract,
        method: "function transfer(address to, uint256 amount) returns (bool)",
        params: [agentWalletAddress as `0x${string}`, amountWei],
      });

      await sendTransaction({ transaction: tx, account });

      setSuccess(true);
      // Wait briefly for chain to settle, then refresh portfolio
      setTimeout(() => onSuccess?.(), 2000);
      setTimeout(() => {
        setSuccess(false);
        setAmount("");
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message ?? "Transaction failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setError("");
    setSuccess(false);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-backdrop-in"
      onClick={handleBackdropClick}
    >
      <div className="max-w-sm w-full mx-3 sm:mx-0 border-panel bg-[#0a0a0a] p-0 animate-modal-in">
        {/* Header */}
        <div className="panel-header flex items-center justify-between">
          <span className="text-gray-400">DEPOSIT USDT</span>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white text-sm leading-none transition-colors active:scale-[0.97]"
            disabled={loading}
          >
            {"\u2715"}
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          {/* Token */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-terminal-green text-terminal-green bg-terminal-green/5">
              USDT
            </span>
            <span className="text-[10px] text-gray-500">Tether USD on Celo</span>
          </div>

          {/* Amount input */}
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black border border-terminal-border p-2 text-white font-mono text-sm focus:outline-none focus:border-terminal-green transition-colors"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div className="mt-2 text-[10px] text-gray-500">
              Enter USDT amount to deposit to agent
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-[10px] text-red-400 border border-red-400/30 bg-red-400/5 px-3 py-2 break-all">
              {error}
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="text-[10px] text-terminal-green border border-terminal-green/30 bg-terminal-green/5 px-3 py-2">
              Deposit successful
            </div>
          )}

          {/* Deposit button */}
          <button
            onClick={handleDeposit}
            disabled={loading || !account || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 border border-terminal-green text-terminal-green text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-green/10 transition-colors active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "SENDING..." : success ? "DEPOSITED" : "DEPOSIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
