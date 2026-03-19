"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  onSuccess?: () => void;
}

export default function WithdrawModal({ isOpen, onClose, userAddress, onSuccess }: WithdrawModalProps) {
  const selectedToken = "USDT";
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const withdrawAction = useAction(api.agentTrading.withdraw);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    setError("");

    try {
      const result = await withdrawAction({
        userAddress,
        token: selectedToken,
        amount: parseFloat(amount),
      });

      if (result.success) {
        setSuccess(true);
        onSuccess?.();
        setTimeout(() => {
          setSuccess(false);
          setAmount("");
          onClose();
        }, 2000);
      } else {
        setError(result.error ?? "Withdrawal failed");
      }
    } catch (err: any) {
      setError(err.message ?? "Withdrawal failed");
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
          <span className="text-gray-400">WITHDRAW USDT</span>
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
            <span className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border border-terminal-amber text-terminal-amber bg-terminal-amber/5">
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
                className="w-full bg-black border border-terminal-border p-2 text-white font-mono text-sm focus:outline-none focus:border-terminal-amber transition-colors"
                placeholder="0.00"
                disabled={loading}
              />
            </div>
            <div className="mt-2 text-[10px] text-gray-500">
              Enter USDT amount to withdraw from agent
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
            <div className="text-[10px] text-terminal-amber border border-terminal-amber/30 bg-terminal-amber/5 px-3 py-2">
              Withdrawal successful
            </div>
          )}

          {/* Withdraw button */}
          <button
            onClick={handleWithdraw}
            disabled={loading || !amount || parseFloat(amount) <= 0}
            className="w-full py-2 border border-terminal-amber text-terminal-amber text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-amber/10 transition-colors active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "PROCESSING..." : success ? "WITHDRAWN" : "WITHDRAW"}
          </button>
        </div>
      </div>
    </div>
  );
}
