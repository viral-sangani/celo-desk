"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function LandingTicker() {
  const prices = useQuery(api.prices.getLatestAll);

  if (!prices || prices.length === 0) {
    return (
      <div className="border-t border-b border-[#333] py-3 overflow-hidden">
        <div className="text-[11px] text-gray-600 text-center">Loading live prices...</div>
      </div>
    );
  }

  const items = prices.map((p) => ({
    token: p.token,
    price: p.priceUsd,
    change: p.change24h,
  }));

  // Duplicate for seamless scroll
  const doubled = [...items, ...items];

  return (
    <div className="border-t border-b border-[#333] py-3 overflow-hidden">
      <div className="flex gap-10 animate-marquee whitespace-nowrap">
        {doubled.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-[11px] font-mono shrink-0">
            <span className="text-gray-400 uppercase">{item.token}/USD:</span>
            <span className="text-white font-bold">
              {item.price >= 100 ? item.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : item.price.toFixed(4)}
            </span>
            <span className={item.change >= 0 ? "text-[#00FF41]" : "text-[#FF3333]"}>
              ({item.change >= 0 ? "+" : ""}{item.change.toFixed(2)}%)
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
