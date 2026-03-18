"use client";

import { useEffect, useState } from "react";
import { PieChart, Pie, Cell } from "recharts";
import Panel from "@/components/ui/Panel";
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { formatUsd } from "@/lib/format";
import { TOKEN_COLORS } from "@/lib/constants";
import DepositModal from "./DepositModal";
import WithdrawModal from "./WithdrawModal";

interface Holding {
  token: string;
  amount: number;
  valueUsd: number;
  allocationPercent: number;
}

const EMPTY_HOLDINGS: Holding[] = [];

function truncateAddress(addr?: string) {
  if (!addr) return "---";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function CopyableAddress({ label, address }: { label: string; address?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <span>
      {label}:{" "}
      <button
        onClick={handleCopy}
        className="text-gray-300 hover:text-terminal-green transition-colors cursor-pointer"
        title={address ?? ""}
      >
        {truncateAddress(address)}
        {copied && <span className="text-terminal-green ml-1 text-[8px]">COPIED</span>}
      </button>
    </span>
  );
}

function Countdown({ targetMs }: { targetMs: number }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = targetMs - Date.now();
      if (diff <= 0) {
        setRemaining("AWAITING...");
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setRemaining(
        `${mins}:${String(secs).padStart(2, "0")}`
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetMs]);

  return <>{remaining}</>;
}

interface PortfolioProps {
  connected?: boolean;
  walletAddress?: string;
}

export default function Portfolio({ connected, walletAddress }: PortfolioProps) {
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [creating, setCreating] = useState(false);

  const userAgent = useQuery(
    api.agentWallet.getAgentForUser,
    walletAddress ? { userAddress: walletAddress } : "skip"
  );

  const createAgentAction = useAction(api.agentWalletAction.createAgent);
  const refreshPortfolio = useAction(api.agentTrading.refreshPortfolio);

  const holdings = useQuery(
    api.agents.getHoldings,
    userAgent?._id ? { agentId: userAgent._id } : "skip"
  );

  const agentData = userAgent ?? { portfolioValue: 0, pnl: 0, pnlPercent: 0, nextTradeAt: Date.now() + 300000 };
  const holdingsData: Holding[] =
    holdings && holdings.length > 0 ? holdings : EMPTY_HOLDINGS;
  const nextTrade = agentData.nextTradeAt ?? Date.now() + 300000;

  const [refreshing, setRefreshing] = useState(false);

  const handleRefreshPortfolio = async () => {
    if (walletAddress) {
      setRefreshing(true);
      try {
        await refreshPortfolio({ userAddress: walletAddress });
      } catch (err) {
        console.error("Portfolio refresh failed:", err);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const handleCreateAgent = async () => {
    if (!walletAddress) return;
    setCreating(true);
    try {
      await createAgentAction({ userAddress: walletAddress });
    } catch (err) {
      console.error("Failed to create agent:", err);
    } finally {
      setCreating(false);
    }
  };

  // State 0: Loading agent data
  if (connected && userAgent === undefined) {
    return (
      <Panel
        title="AGENT PORTFOLIO"
        collapsible
        headerRight={<span className="text-[10px] text-gray-500 animate-pulse">LOADING...</span>}
      >
        <div className="flex-grow flex flex-col items-center justify-center gap-3 p-8">
          <div className="h-4 w-32 bg-terminal-border/50 animate-pulse" />
          <div className="h-3 w-48 bg-terminal-border/30 animate-pulse" />
          <div className="h-8 w-28 bg-terminal-border/30 animate-pulse mt-2" />
        </div>
      </Panel>
    );
  }

  // State 1: Not connected
  if (!connected) {
    return (
      <Panel
        title="AGENT PORTFOLIO"
        collapsible
        headerRight={<span className="text-[10px] text-gray-500">DISCONNECTED</span>}
      >
        <div className="flex-grow flex flex-col items-center justify-center gap-3 p-8">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">No Wallet Detected</div>
          <div className="text-gray-500 text-xs text-center max-w-xs">
            Connect your wallet from the top bar to create an AI trading agent
          </div>
        </div>
      </Panel>
    );
  }

  // State 2: Connected, no agent yet
  if (!userAgent) {
    return (
      <Panel
        title="AGENT PORTFOLIO"
        collapsible
        headerRight={<span className="text-[10px] text-terminal-green">WALLET CONNECTED</span>}
      >
        <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
            <CopyableAddress label="Your Wallet" address={walletAddress} />
          </div>
          <div className="text-gray-400 text-xs text-center max-w-xs">
            Create an AI trading agent that automatically rebalances your portfolio on Celo
          </div>
          <button
            onClick={handleCreateAgent}
            disabled={creating}
            className="px-4 py-2 border border-terminal-green text-terminal-green text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-green/10 transition-colors disabled:opacity-50"
          >
            {creating ? "CREATING..." : "Create Agent"}
          </button>
        </div>
      </Panel>
    );
  }

  // State 3: Agent active
  return (
    <Panel
      title="AGENT PORTFOLIO"
      collapsible
      headerRight={
        <span className="text-[10px] text-terminal-green">
          STATUS: ACTIVE - NEXT TRADE IN{" "}
          <Countdown targetMs={nextTrade} />
        </span>
      }
    >
      <div className="flex-grow flex flex-col overflow-hidden min-h-0">
        {/* Wallet info row */}
        <div className="px-3 sm:px-4 pt-3 pb-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 text-[10px] text-gray-500 uppercase tracking-wider border-b border-terminal-border">
          <CopyableAddress label="Your Wallet" address={walletAddress} />
          <CopyableAddress label="Agent Wallet" address={userAgent.walletAddress} />
        </div>

        {/* Action buttons */}
        <div className="px-3 sm:px-4 pt-3">
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={handleRefreshPortfolio}
              disabled={refreshing}
              className="px-3 py-1 border border-terminal-border text-gray-400 text-[10px] font-bold uppercase tracking-wider hover:bg-[#1a1a1a] hover:text-white transition-colors disabled:opacity-50"
              title="Refresh on-chain balances"
            >
              <span className={refreshing ? "animate-spin inline-block" : ""}>↻</span>
              {refreshing ? " SYNCING..." : " REFRESH"}
            </button>
            <button
              onClick={() => setShowDeposit(true)}
              className="px-3 py-1 border border-terminal-green text-terminal-green text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-green/10"
            >
              Deposit
            </button>
            <button
              onClick={() => setShowWithdraw(true)}
              className="px-3 py-1 border border-terminal-amber text-terminal-amber text-[10px] font-bold uppercase tracking-wider hover:bg-terminal-amber/10"
            >
              Withdraw
            </button>
          </div>
        </div>

        {/* Existing portfolio content */}
        <div className="flex-grow px-3 sm:px-4 pb-4 flex flex-col sm:flex-row gap-4 sm:gap-6 overflow-auto sm:overflow-hidden min-h-0">
          {/* Stats and Chart Side */}
          <div className="sm:w-1/3 flex flex-col">
            <div className="mb-4">
              <div className="text-gray-500 text-[10px]">TOTAL VALUE (USD)</div>
              <div className="text-2xl font-bold text-white">
                {formatUsd(agentData.portfolioValue)}
              </div>
            </div>
            <div className="mb-6">
              <div className="text-gray-500 text-[10px]">TOTAL P/L</div>
              <div className="text-lg font-bold text-terminal-green">
                +{formatUsd(agentData.pnl)} ({agentData.pnlPercent}%)
              </div>
            </div>
            {/* Donut Chart */}
            <div className="relative mx-auto">
              <PieChart width={128} height={128}>
                <Pie
                  data={holdingsData}
                  dataKey="allocationPercent"
                  nameKey="token"
                  cx={64}
                  cy={64}
                  innerRadius={40}
                  outerRadius={58}
                  stroke="none"
                >
                  {holdingsData.map((h, i) => (
                    <Cell
                      key={i}
                      fill={TOKEN_COLORS[h.token] ?? "#6b7280"}
                    />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[10px] text-center leading-tight text-gray-400">
                  ASSET
                  <br />
                  SPLIT
                </span>
              </div>
            </div>
          </div>
          {/* Table Side */}
          <div className="sm:w-2/3 overflow-auto custom-scrollbar sm:border-l border-t sm:border-t-0 border-terminal-border pt-4 sm:pt-0 sm:pl-4">
            {holdingsData.length > 0 ? (
              <table className="w-full text-[11px] text-left">
                <thead>
                  <tr className="text-gray-500 border-b border-terminal-border uppercase">
                    <th className="pb-2 font-normal">Token</th>
                    <th className="pb-2 font-normal text-right">Amount</th>
                    <th className="pb-2 font-normal text-right">Value</th>
                    <th className="pb-2 font-normal text-right">%</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border text-white">
                  {holdingsData.map((h) => (
                    <tr key={h.token} className="h-8">
                      <td>{h.token}</td>
                      <td className="text-right">
                        {h.amount.toLocaleString()}
                      </td>
                      <td className="text-right">{formatUsd(h.valueUsd)}</td>
                      <td className="text-right">{h.allocationPercent}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500 text-xs">
                <div className="text-[10px] uppercase tracking-wider mb-2">No Holdings</div>
                <div>Deposit tokens to start trading</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <DepositModal
        isOpen={showDeposit}
        onClose={() => setShowDeposit(false)}
        agentWalletAddress={userAgent.walletAddress}
        onSuccess={handleRefreshPortfolio}
      />
      <WithdrawModal
        isOpen={showWithdraw}
        onClose={() => setShowWithdraw(false)}
        userAddress={walletAddress ?? ""}
        onSuccess={handleRefreshPortfolio}
      />
    </Panel>
  );
}
