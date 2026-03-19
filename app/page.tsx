import Link from "next/link";
import { APP_VERSION } from "@/lib/constants";
import LandingTicker from "./landing/LandingTicker";
import ConvexClientProvider from "./ConvexClientProvider";
import { ThirdwebProvider } from "thirdweb/react";

const features = [
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    title: "AI Agent Ecosystem",
    description:
      "Deploy autonomous traders with custom LLM personalities. Choose from Dip Buyer, Momentum Rider, Celo Maximalist, or create your own strategy.",
    status: "STATUS: OPERATIONAL",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="1.5">
        <path d="M3 3v18h18M7 16l4-4 4 4 5-5" />
      </svg>
    ),
    title: "Bloomberg-Grade Data",
    description:
      "Real-time Mento FX pairs, CoinGecko prices, Fear & Greed index, and AI-powered social sentiment analysis from X/Twitter.",
    status: "FEED: LIVE",
  },
  {
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00FF41" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Trade History & Intelligence",
    description:
      "Every decision logged with full Gemini AI reasoning. Market intelligence from Grok, crypto news, KOL sentiment tracking.",
    status: "INDEX: MAINNET_01",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-black text-white font-mono selection:bg-[#00FF41] selection:text-black">
      {/* Scanline animation */}
      <style>{`
        .scanline {
          width: 100%;
          height: 100px;
          z-index: 10;
          background: linear-gradient(0deg, rgba(0,0,0,0) 0%, rgba(0,255,65,0.05) 50%, rgba(0,0,0,0) 100%);
          opacity: 0.1;
          position: absolute;
          bottom: 100%;
          animation: scanline 10s linear infinite;
          pointer-events: none;
        }
        @keyframes scanline {
          0% { bottom: 100%; }
          100% { bottom: -100px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="border-b border-[#333] bg-black sticky top-0 z-50 px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-10">
          <span className="text-xl font-bold tracking-tighter flex items-center gap-1">
            <span className="bg-[#00FF41] text-black px-1">CELO</span>
            <span className="text-white">DESK</span>
          </span>
          <div className="hidden md:flex gap-6 text-[11px] uppercase tracking-[0.2em]">
            <a href="#features" className="text-gray-400 hover:text-[#00FF41] transition-colors">Features</a>
            <a href="https://github.com/viral-sangani/celo-desk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00FF41] transition-colors">GitHub</a>
            <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00FF41] transition-colors">Docs</a>
          </div>
        </div>
        <Link
          href="/terminal"
          className="border border-[#00FF41] text-[#00FF41] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:bg-[#00FF41] hover:text-black transition-all font-bold"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 text-center overflow-hidden">
        <div className="scanline" />
        {/* Dot grid background */}
        <div
          className="absolute inset-0 z-0 opacity-20 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#333 1px, transparent 1px)", backgroundSize: "40px 40px" }}
        />
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-block border border-[#00FF41]/30 px-3 py-1 mb-6">
            <span className="text-[10px] text-[#00FF41] uppercase tracking-[0.3em] font-bold">
              v{APP_VERSION} // SYSTEM ACTIVE
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tight leading-tight mb-6 sm:mb-8">
            The Terminal for{" "}
            <span className="text-[#00FF41]">AI-Driven</span>
            <br />
            On-Chain Trading.
          </h1>
          <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
            Monitor, deploy, and analyze autonomous AI agents trading bluechip tokens
            and FX pairs on the Celo blockchain. Professional-grade tooling for the
            decentralized frontier.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/terminal"
              className="bg-[#00FF41] text-black px-6 sm:px-8 py-3 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#00FF41]/90 transition-colors"
            >
              Enter Terminal
            </Link>
            <Link
              href="/latest"
              className="border border-[#FFB800] text-[#FFB800] px-6 sm:px-8 py-3 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#FFB800]/10 transition-colors"
            >
              View Market Data
            </Link>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="absolute bottom-0 left-0 right-0">
          <ThirdwebProvider>
            <ConvexClientProvider>
              <LandingTicker />
            </ConvexClientProvider>
          </ThirdwebProvider>
        </div>
      </section>

      {/* Product Preview */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="border border-[#333] bg-[#0a0a0a]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2 border-b border-[#333] bg-[#111]">
              <span className="w-2.5 h-2.5 bg-[#FF3333]" />
              <span className="w-2.5 h-2.5 bg-[#FFB800]" />
              <span className="w-2.5 h-2.5 bg-[#00FF41]" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider ml-4">
                CELO DESK DASHBOARD — MAINNET
              </span>
            </div>
            {/* Simplified dashboard preview */}
            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chart area */}
              <div className="border border-[#222] p-4 min-h-[200px]">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">PAIR: CELO / USD</div>
                <div className="text-2xl font-bold text-white mb-1">0.0768</div>
                <div className="text-xs text-[#FF3333]">-6.42%</div>
                <div className="mt-4 flex items-end gap-1 h-20">
                  {[40, 55, 45, 60, 50, 70, 65, 80, 55, 45, 35, 50, 60, 45, 30].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i > 10 ? "#FF3333" : "#00FF41",
                        opacity: 0.6,
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Live feed area */}
              <div className="border border-[#222] p-4">
                <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">LIVE FEED</div>
                <div className="space-y-2 text-[11px]">
                  {[
                    { time: "14:32", type: "BUY", color: "#00FF41", text: "Agent_Alpha: 500 CELO" },
                    { time: "14:31", type: "FEES", color: "#FFB800", text: "Collected 1.12 USDC" },
                    { time: "14:30", type: "INIT", color: "#3B82F6", text: "New Agent Sentinel_v2" },
                    { time: "14:28", type: "WARN", color: "#FF3333", text: "High volatility detected" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-gray-600">{item.time}</span>
                      <span className="text-[10px] font-bold px-1 border" style={{ color: item.color, borderColor: item.color + "50" }}>
                        {item.type}
                      </span>
                      <span className="text-gray-300">{item.text}</span>
                    </div>
                  ))}
                </div>
                {/* Agent performance bars */}
                <div className="mt-4 border-t border-[#222] pt-3">
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">AGENT PERFORMANCE</div>
                  <div className="space-y-1.5">
                    {[
                      { label: "Win Rate", pct: 68, color: "#00FF41" },
                      { label: "Uptime", pct: 99, color: "#3B82F6" },
                      { label: "ROI", pct: 42, color: "#FFB800" },
                    ].map((bar) => (
                      <div key={bar.label} className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 w-14">{bar.label}</span>
                        <div className="flex-1 h-2 bg-[#111]">
                          <div style={{ width: `${bar.pct}%`, backgroundColor: bar.color }} className="h-full" />
                        </div>
                        <span className="text-[10px] w-8 text-right" style={{ color: bar.color }}>{bar.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end px-4 py-2 border-t border-[#222]">
              <span className="text-[10px] text-[#00FF41] uppercase tracking-wider">SYNC_STATUS: 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f) => (
            <div key={f.title} className="border border-[#333] bg-black p-6 flex flex-col">
              <div className="w-10 h-10 border border-[#333] flex items-center justify-center mb-4">
                {f.icon}
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{f.title}</h3>
              <p className="text-[12px] text-gray-400 leading-relaxed flex-1 mb-4">
                {f.description}
              </p>
              <div className="text-[10px] text-[#00FF41] uppercase tracking-[0.2em] font-bold">
                {f.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 text-center bg-[#0a0a0a] border-t border-b border-[#222]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4 sm:mb-6">
            Ready to Trade with{" "}
            <span className="text-[#FFB800]">AI</span>?
          </h2>
          <p className="text-sm text-gray-400 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
            Join the next generation of algorithmic traders on the most efficient
            blockchain for stablecoins and real-world assets.
          </p>
          <Link
            href="/terminal"
            className="inline-block bg-[#00FF41] text-black px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#00FF41]/90 transition-colors"
          >
            Launch Terminal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm tracking-tighter">
            <span className="bg-[#00FF41] text-black px-0.5">CELO</span>{" "}
            <span className="text-gray-300">DESK</span>
          </span>
          <div className="flex gap-3 uppercase tracking-wider">
            <a href="https://github.com/viral-sangani/celo-desk" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF41]">GitHub</a>
            <a href="https://celo.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF41]">Celo</a>
            <a href="https://docs.celo.org" target="_blank" rel="noopener noreferrer" className="hover:text-[#00FF41]">Docs</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 border border-[#333] px-2 py-1">
            <span className="w-1.5 h-1.5 bg-[#00FF41] animate-pulse" />
            <span className="uppercase tracking-wider">System Status: Operational</span>
          </div>
          <span>&copy; {new Date().getFullYear()} Celo Desk Analytics</span>
        </div>
      </footer>
    </div>
  );
}
