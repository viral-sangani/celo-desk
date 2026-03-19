"use client";

import { useActiveAccount } from "thirdweb/react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import AgentSettings from "@/components/settings/AgentSettings";

export default function SettingsPage() {
  const account = useActiveAccount();
  const walletAddress = account?.address;

  return (
    <div className="min-h-screen flex flex-col bg-black">
      <TopBar activeTab="settings" />
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            Agent Settings
          </h2>
          <div className="text-[10px] text-gray-600">
            Configure your AI trading agent&apos;s personality and risk level
          </div>
        </div>

        {!walletAddress ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20">
            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
              No Wallet Detected
            </div>
            <div className="text-gray-500 text-xs text-center max-w-xs">
              Connect your wallet from the top bar to configure your agent
            </div>
          </div>
        ) : (
          <AgentSettings walletAddress={walletAddress} />
        )}
      </main>
      <Footer variant="global" />
    </div>
  );
}
