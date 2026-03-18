"use client";

import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import PriceTicker from "@/components/latest/PriceTicker";
import FearGreedGauge from "@/components/latest/FearGreedGauge";
import SocialSentiment from "@/components/latest/SocialSentiment";
import TopCeloTokens from "@/components/latest/TopCeloTokens";
import IntelFeed from "@/components/latest/IntelFeed";
import CryptoNewsFeed from "@/components/latest/CryptoNewsFeed";
import KOLFeed from "@/components/latest/KOLFeed";

export default function LatestPage() {
  return (
    <div className="min-h-screen flex flex-col bg-black">
      <TopBar activeTab="latest" />
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4">
        <PriceTicker />

        {/* Top metrics row: stack on mobile, 3 cols on lg */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <FearGreedGauge />
          <SocialSentiment />
          <TopCeloTokens />
        </div>

        {/* Middle: intel feed + crypto news */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          <div className="lg:col-span-2">
            <IntelFeed />
          </div>
          <CryptoNewsFeed />
        </div>

        <KOLFeed />
      </main>
      <Footer variant="latest" />
    </div>
  );
}
