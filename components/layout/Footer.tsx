"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { APP_VERSION } from "@/lib/constants";

interface FooterProps {
  variant?: "terminal" | "global" | "history" | "latest";
}

export default function Footer({ variant = "terminal" }: FooterProps) {
  const latestNews = useQuery(api.news.getRecent, { limit: 1 });

  if (variant === "global") {
    return (
      <footer className="h-6 bg-[#1a1a1a] border-t border-terminal-border flex items-center justify-between px-3 lg:px-4 text-[10px] text-gray-500 shrink-0">
        <div className="flex space-x-2">
          <span>SYSTEM: OK</span>
          <span className="hidden md:inline">|</span>
          <span className="hidden md:inline">DB: CONNECTED</span>
        </div>
        <div className="flex space-x-2">
          <span className="text-green-400">v{APP_VERSION}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">&copy; {new Date().getFullYear()} CELO DESK ANALYTICS</span>
        </div>
      </footer>
    );
  }

  const tickerText = latestNews?.[0]?.headline ?? "SYSTEM ONLINE — MONITORING ALL PAIRS";

  return (
    <footer className="h-6 bg-[#1a1a1a] border-t border-terminal-border flex items-center px-3 lg:px-4 text-[10px] space-x-4 lg:space-x-6 text-gray-500 shrink-0">
      <div className="flex-grow text-center text-terminal-amber overflow-hidden whitespace-nowrap">
        <span className="inline-block animate-marquee">
          {tickerText}
        </span>
      </div>
      <div className="shrink-0">v{APP_VERSION}</div>
    </footer>
  );
}
