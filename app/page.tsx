import Link from "next/link";
import Image from "next/image";
import { APP_VERSION } from "@/lib/constants";
import { PERSONALITIES } from "@/lib/personalities";
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

const steps = [
  { num: "01", title: "Connect Wallet", description: "Link your Celo wallet via Thirdweb. Your agent wallet is generated deterministically." },
  { num: "02", title: "Choose Personality", description: "Pick a trading strategy — Dip Buyer, Momentum Rider, Stablecoin Farmer, or write your own." },
  { num: "03", title: "Fund & Deploy", description: "Deposit USDT to your agent. It starts trading automatically every 5 minutes using Gemini AI." },
];

export default function LandingPage() {
  return (
    <div className="bg-black text-white font-mono selection:bg-[#00FF41] selection:text-black">
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
          <span className="flex items-center gap-1.5">
            <Image src="/celodesk-logo.png" alt="Celo Desk" width={28} height={28} className="w-6 h-6 sm:w-7 sm:h-7" />
            <span className="font-bold tracking-tight text-base sm:text-lg">
              <span className="text-[#FFEB3B]">CELO</span>
              <span className="text-white ml-1">DESK</span>
            </span>
          </span>
          <div className="hidden md:flex gap-6 text-[11px] uppercase tracking-[0.2em]">
            <a href="#features" className="text-gray-400 hover:text-[#00FF41] transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-400 hover:text-[#00FF41] transition-colors">How It Works</a>
            <a href="https://github.com/viral-sangani/celo-desk" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#00FF41] transition-colors">GitHub</a>
          </div>
        </div>
        <Link
          href="/terminal"
          className="border border-[#00FF41] text-[#00FF41] px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs uppercase tracking-[0.15em] hover:bg-[#00FF41] hover:text-black transition-colors active:scale-[0.97] font-bold"
        >
          Launch App
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center px-4 sm:px-6 py-16 sm:py-20 text-center overflow-hidden">
        <div className="scanline" />
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
              className="bg-[#00FF41] text-black px-6 sm:px-8 py-3 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#00FF41]/90 transition-colors active:scale-[0.97]"
            >
              Enter Terminal
            </Link>
            <Link
              href="/latest"
              className="border border-[#FFB800] text-[#FFB800] px-6 sm:px-8 py-3 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#FFB800]/10 transition-colors active:scale-[0.97]"
            >
              View Market Data
            </Link>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <ThirdwebProvider>
            <ConvexClientProvider>
              <LandingTicker />
            </ConvexClientProvider>
          </ThirdwebProvider>
        </div>
      </section>

      {/* Product Preview — 2x2 Grid */}
      <section className="px-4 sm:px-6 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="border border-[#333] bg-[#0a0a0a]">
            {/* Window chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#333] bg-[#111]">
              <span className="w-2.5 h-2.5 bg-[#FF3333]" />
              <span className="w-2.5 h-2.5 bg-[#FFB800]" />
              <span className="w-2.5 h-2.5 bg-[#00FF41]" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider ml-4">
                CELO DESK DASHBOARD — MAINNET NODE_01
              </span>
              <span className="ml-auto text-[10px] text-gray-600">16:24:30 UTC</span>
            </div>
            {/* 2x2 Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] grid-rows-1 lg:grid-rows-2">
              {/* Top Left: Price Chart */}
              <div className="border-b border-r-0 lg:border-r border-[#222] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">PAIR: CELO / USD</div>
                    <div className="flex items-baseline gap-3 mt-1">
                      <span className="text-3xl font-bold text-white">0.0768</span>
                      <span className="text-sm text-[#FF3333] font-bold">-6.42%</span>
                    </div>
                    <div className="text-[10px] text-gray-600 mt-1">H: 0.0842 | L: 0.0721 | O: 0.0819</div>
                  </div>
                  <div className="hidden sm:flex gap-2 text-[10px]">
                    {["1H", "4H", "1D", "1W"].map((tf, i) => (
                      <span key={tf} className={`px-2 py-0.5 border ${i === 1 ? "border-[#00FF41] text-[#00FF41]" : "border-[#333] text-gray-600"}`}>{tf}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-end gap-[3px] h-28 sm:h-36">
                  {[35, 42, 38, 48, 55, 52, 60, 58, 65, 72, 68, 75, 70, 62, 55, 48, 42, 38, 45, 40, 35, 30, 28, 32].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 min-w-[4px]"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i >= 16 ? "#FF3333" : "#00FF41",
                        opacity: 0.5 + (h / 150),
                      }}
                    />
                  ))}
                </div>
                <div className="flex items-end gap-[3px] h-6 mt-1 opacity-40">
                  {[20, 35, 25, 45, 60, 40, 55, 30, 70, 50, 65, 45, 35, 55, 40, 30, 50, 35, 25, 40, 55, 45, 30, 20].map((h, i) => (
                    <div key={i} className="flex-1 min-w-[4px] bg-gray-600" style={{ height: `${h}%` }} />
                  ))}
                </div>
              </div>

              {/* Top Right: FX Rates + Watchlist */}
              <div className="border-b border-[#222] p-4 sm:p-5">
                <div className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold mb-3">FX STABLECOIN RATES</div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-gray-600 text-[10px]">
                      <th className="text-left pb-2 font-normal">PAIR</th>
                      <th className="text-right pb-2 font-normal">PRICE</th>
                      <th className="text-right pb-2 font-normal">24H</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    {[
                      { pair: "USDm/USD", price: "0.9996", chg: "-0.04", down: true },
                      { pair: "EURm/USD", price: "1.1500", chg: "+0.00", down: false },
                      { pair: "BRLm/USD", price: "0.1918", chg: "-0.11", down: true },
                      { pair: "KESm/USD", price: "0.0077", chg: "+0.16", down: false },
                    ].map((r) => (
                      <tr key={r.pair} className="border-t border-[#1a1a1a]">
                        <td className="py-1.5">{r.pair}</td>
                        <td className="py-1.5 text-right text-white">{r.price}</td>
                        <td className={`py-1.5 text-right ${r.down ? "text-[#FF3333]" : "text-[#00FF41]"}`}>{r.chg}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 pt-3 border-t border-[#222]">
                  <div className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold mb-2">WATCHLIST</div>
                  <div className="space-y-1.5 text-[11px]">
                    {[
                      { token: "BTC", price: "$71,260", chg: "-4.07%", down: true },
                      { token: "ETH", price: "$2,176", chg: "-6.70%", down: true },
                      { token: "XAUt", price: "$4,856", chg: "-2.17%", down: true },
                    ].map((t) => (
                      <div key={t.token} className="flex items-center justify-between">
                        <span className="text-white">{t.token}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-gray-300">{t.price}</span>
                          <span className={`w-14 text-right ${t.down ? "text-[#FF3333]" : "text-[#00FF41]"}`}>{t.chg}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Left: Agent Portfolio */}
              <div className="border-r-0 lg:border-r border-[#222] p-4 sm:p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold">AGENT PORTFOLIO</div>
                  <div className="text-[10px] text-[#00FF41]">STATUS: ACTIVE</div>
                </div>
                <div className="flex gap-6">
                  <div>
                    <div className="text-[10px] text-gray-500">TOTAL VALUE</div>
                    <div className="text-xl font-bold text-white">$142,504</div>
                    <div className="text-xs text-[#00FF41] font-bold mt-0.5">+$12,401 (+9.2%)</div>
                  </div>
                  {/* Mini donut */}
                  <div className="hidden sm:block">
                    <svg width="64" height="64" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#222" strokeWidth="8" />
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#35d07f" strokeWidth="8" strokeDasharray="75 150" strokeDashoffset="0" />
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#2775CA" strokeWidth="8" strokeDasharray="34 150" strokeDashoffset="-75" />
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#627EEA" strokeWidth="8" strokeDasharray="31 150" strokeDashoffset="-109" />
                      <circle cx="32" cy="32" r="24" fill="none" stroke="#6b7280" strokeWidth="8" strokeDasharray="10 150" strokeDashoffset="-140" />
                    </svg>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-[#222] space-y-1.5 text-[11px]">
                  {[
                    { token: "CELO", pct: "50.2%", value: "$71,537", color: "#35d07f" },
                    { token: "USDT", pct: "22.7%", value: "$32,348", color: "#26A17B" },
                    { token: "WETH", pct: "20.6%", value: "$29,356", color: "#627EEA" },
                    { token: "BRLm", pct: "6.5%", value: "$9,263", color: "#6b7280" },
                  ].map((h) => (
                    <div key={h.token} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2" style={{ backgroundColor: h.color }} />
                        <span className="text-white">{h.token}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">{h.value}</span>
                        <span className="text-gray-500 w-12 text-right">{h.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Right: Market Feed */}
              <div className="p-4 sm:p-5">
                <div className="text-[10px] text-[#FFB800] uppercase tracking-wider font-bold mb-3">MARKET FEED</div>
                <div className="space-y-3 text-[11px]">
                  {[
                    { time: "15:31", src: "DECRYPT", text: "YouTube Comedy Takes You Back to When Bitcoin Was Just $250" },
                    { time: "15:21", src: "THE BLOCK", text: "Polymarket acquires crypto startup Brahma to boost liquidity" },
                    { time: "15:17", src: "DEFIANT", text: "Kraken shelves IPO plans amid market headwinds" },
                    { time: "15:14", src: "COINDESK", text: "Crypto exchange Kraken freezes multibillion-dollar IPO plan" },
                    { time: "15:13", src: "THE BLOCK", text: "HIVE launches first AI GPU cluster in Paraguay" },
                  ].map((n, i) => (
                    <div key={i} className="border-b border-[#1a1a1a] pb-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[#FFB800] text-[10px]">{n.time}</span>
                        <span className="text-gray-500 text-[10px]">[{n.src}]</span>
                      </div>
                      <div className="text-gray-300 leading-relaxed">{n.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between px-4 py-2 border-t border-[#222] bg-[#111]">
              <div className="text-[10px] text-gray-600">CPU: 12% | MEM: 1.4GB | NET: 420kb/s</div>
              <span className="text-[10px] text-[#00FF41] uppercase tracking-wider">SYNC_STATUS: 100%</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="px-4 sm:px-6 py-12 sm:py-20 border-t border-[#222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-[10px] text-[#00FF41] uppercase tracking-[0.3em] font-bold mb-3">PROTOCOL</div>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">
              How It <span className="text-[#00FF41]">Works</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.num} className="border border-[#333] bg-black p-6 relative">
                <div className="text-4xl font-bold text-[#00FF41]/20 absolute top-4 right-4">{step.num}</div>
                <div className="text-[#00FF41] text-3xl font-bold mb-3">{step.num}</div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-2 text-white">{step.title}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personality Showcase */}
      <section className="px-4 sm:px-6 py-12 sm:py-20 bg-[#0a0a0a] border-t border-[#222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-[10px] text-[#FFB800] uppercase tracking-[0.3em] font-bold mb-3">STRATEGY ENGINE</div>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">
              Choose Your <span className="text-[#FFB800]">Personality</span>
            </h2>
            <p className="text-sm text-gray-500 mt-3 max-w-xl mx-auto">
              Each personality defines how your AI agent reads the market and makes trading decisions.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.values(PERSONALITIES).map((p) => (
              <div key={p.id} className="border border-[#333] bg-black p-5 hover:border-gray-500 transition-colors active:scale-[0.97] group">
                <div
                  className="w-10 h-10 border flex items-center justify-center text-xl mb-4 transition-colors"
                  style={{ borderColor: p.color, color: p.color }}
                >
                  {p.icon}
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-1">{p.name}</h3>
                <div className="text-[10px] uppercase tracking-wider mb-3" style={{ color: p.color }}>{p.subtitle}</div>
                <p className="text-[11px] text-gray-400 leading-relaxed">{p.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 border border-dashed border-[#333] p-4 text-center">
            <span className="text-[11px] text-gray-500">
              + Or create a <span className="text-white">custom personality</span> with your own trading rules in{" "}
              <Link href="/settings" className="text-[#00FF41] hover:underline">Settings</Link>
            </span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-4 sm:px-6 py-12 sm:py-20 border-t border-[#222]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-14">
            <div className="text-[10px] text-[#00FF41] uppercase tracking-[0.3em] font-bold mb-3">CAPABILITIES</div>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight">
              Built for <span className="text-[#00FF41]">Traders</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f) => (
              <div key={f.title} className="border border-[#333] bg-black p-6 flex flex-col">
                <div className="w-10 h-10 border border-[#333] flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-3">{f.title}</h3>
                <p className="text-[12px] text-gray-400 leading-relaxed flex-1 mb-4">{f.description}</p>
                <div className="text-[10px] text-[#00FF41] uppercase tracking-[0.2em] font-bold">{f.status}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 py-16 sm:py-24 text-center border-t border-[#222]">
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
            className="inline-block bg-[#00FF41] text-black px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-[0.15em] font-bold hover:bg-[#00FF41]/90 transition-colors active:scale-[0.97]"
          >
            Launch Terminal
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-8 border-t border-[#222] flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-gray-500">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Image src="/celodesk-logo.png" alt="Celo Desk" width={18} height={18} />
            <span className="font-bold tracking-tight text-sm">
              <span className="text-[#FFEB3B]">CELO</span>
              <span className="text-gray-300 ml-0.5">DESK</span>
            </span>
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
