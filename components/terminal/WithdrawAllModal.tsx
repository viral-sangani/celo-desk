"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

interface WithdrawAllModalProps {
  isOpen: boolean;
  onClose: () => void;
  userAddress: string;
  onSuccess?: () => void;
}

export default function WithdrawAllModal({ isOpen, onClose, userAddress, onSuccess }: WithdrawAllModalProps) {
  const [toAddress, setToAddress] = useState(userAddress);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [transferred, setTransferred] = useState<string[]>([]);

  const withdrawAllAction = useAction(api.agentTrading.withdrawAll);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !loading) onClose();
  };

  const handleWithdrawAll = async () => {
    if (!toAddress || !toAddress.startsWith("0x")) return;
    setLoading(true);
    setError("");

    try {
      const result = await withdrawAllAction({
        userAddress,
        toAddress,
      });

      if (result.success) {
        setSuccess(true);
        setTransferred(result.transferred);
        onSuccess?.();
        setTimeout(() => {
          setSuccess(false);
          setTransferred([]);
          onClose();
        }, 3000);
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
    setTransferred([]);
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
          <span className="text-terminal-red font-bold">WITHDRAW ALL FUNDS</span>
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
          <div className="text-[10px] text-gray-400 border border-terminal-amber/30 bg-terminal-amber/5 px-3 py-2">
            This will transfer ALL tokens from your agent wallet to the address below.
          </div>

          {/* Destination address */}
          <div>
            <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">
              Destination Wallet Address
            </div>
            <input
              type="text"
              value={toAddress}
              onChange={(e) => setToAddress(e.target.value)}
              className="w-full bg-black border border-terminal-border p-2 text-white font-mono text-xs focus:outline-none focus:border-terminal-red transition-colors"
              placeholder="0x..."
              disabled={loading}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="text-[10px] text-red-400 border border-red-400/30 bg-red-400/5 px-3 py-2 break-all">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-[10px] text-terminal-green border border-terminal-green/30 bg-terminal-green/5 px-3 py-2">
              <div className="font-bold mb-1">Withdrawal successful:</div>
              {transferred.map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleWithdrawAll}
            disabled={loading || !toAddress || !toAddress.startsWith("0x")}
            className="w-full py-2 border border-terminal-red text-terminal-red text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-red/10 transition-colors active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "WITHDRAWING..." : success ? "DONE" : "WITHDRAW ALL FUNDS"}
          </button>
        </div>
      </div>
    </div>
  );
}
