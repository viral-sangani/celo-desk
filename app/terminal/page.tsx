"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import DashboardGrid from "@/components/layout/DashboardGrid";
import PriceChart from "@/components/terminal/PriceChart";
import FXRatesGrid from "@/components/terminal/FXRatesGrid";
import Watchlist from "@/components/terminal/Watchlist";
import Portfolio from "@/components/terminal/Portfolio";
import NewsFeed from "@/components/terminal/NewsFeed";
import TabbedPanel from "@/components/ui/TabbedPanel";

export default function TerminalPage() {
  const [selectedToken, setSelectedToken] = useState("CELO");
  const account = useActiveAccount();

  useEffect(() => {
    document.body.classList.add("terminal-page");
    return () => document.body.classList.remove("terminal-page");
  }, []);

  return (
    <>
      <TopBar activeTab="terminal" />
      <DashboardGrid
        topLeft={
          <PriceChart
            selectedToken={selectedToken}
            onTokenSelect={setSelectedToken}
          />
        }
        topRight={
          <TabbedPanel
            tabs={[
              { id: "fx", label: "FX Rates", content: <FXRatesGrid onTokenSelect={setSelectedToken} /> },
              { id: "watchlist", label: "Watchlist", content: <Watchlist onTokenSelect={setSelectedToken} /> },
            ]}
            defaultTab="fx"
          />
        }
        bottomLeft={<Portfolio connected={!!account} walletAddress={account?.address} />}
        bottomRight={<NewsFeed />}
      />
      <Footer />
    </>
  );
}
