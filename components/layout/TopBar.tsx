"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { darkTheme } from "thirdweb/react";
import { celo } from "thirdweb/chains";
import { thirdwebClient } from "@/lib/thirdweb";
import { formatTime } from "@/lib/format";

const terminalTheme = darkTheme({
  colors: {
    modalBg: "#0a0a0a",
    borderColor: "#2a2a2a",
    separatorLine: "#2a2a2a",
    primaryText: "#e0e0e0",
    secondaryText: "#888888",
    accentButtonBg: "#00ff41",
    accentButtonText: "#000000",
  },
});

function getTradingSession(): string {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  const t = h * 60 + m;
  if (t >= 810 && t < 1200) return "New York";
  if (t >= 480 && t < 990) return "London";
  if (t >= 0 && t < 540) return "Asia";
  return "Off Hours";
}

interface TopBarProps {
  activeTab?: "terminal" | "history" | "latest" | "settings";
}

export default function TopBar({ activeTab = "terminal" }: TopBarProps) {
  const [time, setTime] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const update = () => setTime(formatTime(new Date()));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-terminal-border bg-black z-10 shrink-0">
      {/* Main bar */}
      <div className="h-10 flex items-center justify-between px-3 lg:px-4">
        <div className="flex items-center gap-2 lg:gap-6">
          <h1 className="text-terminal-amber font-bold tracking-tighter text-base lg:text-lg">
            CELO DESK
          </h1>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {(["terminal", "history", "latest", "settings"] as const).map((tab) => (
              <Link
                key={tab}
                href={`/${tab}`}
                className={`px-3 lg:px-4 py-1 text-xs font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-1 focus:ring-terminal-green ${
                  activeTab === tab
                    ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab}
              </Link>
            ))}
          </nav>

          {/* Status - hidden on small screens */}
          <div className="hidden lg:flex items-center space-x-2 text-[10px] text-gray-500">
            <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <span className="font-bold text-terminal-green">MAINNET</span>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-4 text-[11px]">
          <ConnectButton
            client={thirdwebClient}
            chain={celo}
            theme={terminalTheme}
            connectButton={{
              label: "CONNECT",
              style: {
                fontSize: "10px",
                fontWeight: "bold",
                letterSpacing: "0.05em",
                padding: "4px 8px",
                height: "24px",
                border: "1px solid #00ff41",
                background: "transparent",
                color: "#00ff41",
                fontFamily: '"JetBrains Mono", monospace',
              },
            }}
          />
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-gray-400 text-[10px]">UTC</span>
            <span className="text-white text-[10px]">{time || "--:--:--"}</span>
          </div>
          <div className="hidden xl:flex flex-col items-end border-l border-terminal-border pl-4">
            <span className="text-gray-400 text-[10px]">SESSION</span>
            <span className="text-white text-[10px] uppercase">{getTradingSession()}</span>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white focus:outline-none focus:ring-1 focus:ring-terminal-green"
            aria-label="Toggle navigation menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {menuOpen && (
        <nav className="md:hidden border-t border-terminal-border bg-[#0a0a0a] px-3 py-2 flex flex-col gap-1">
          {(["terminal", "history", "latest", "settings"] as const).map((tab) => (
            <Link
              key={tab}
              href={`/${tab}`}
              onClick={() => setMenuOpen(false)}
              className={`px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                activeTab === tab
                  ? "bg-terminal-green/10 text-terminal-green border border-terminal-green/30"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {tab}
            </Link>
          ))}
          <div className="flex items-center gap-2 text-[10px] text-gray-500 px-3 py-2 border-t border-terminal-border mt-1">
            <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse" />
            <span className="font-bold text-terminal-green">MAINNET</span>
          </div>
        </nav>
      )}
    </header>
  );
}
