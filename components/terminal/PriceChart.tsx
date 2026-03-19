"use client";

import Panel from "@/components/ui/Panel";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";

const TOKEN_OPTIONS = ["CELO", "BTC", "ETH", "XAUt"] as const;

// TradingView symbols for centralized exchange tokens
const TV_SYMBOLS: Record<string, string> = {
  CELO: "BINANCE:CELOUSDT",
  BTC: "BINANCE:BTCUSDT",
  ETH: "BINANCE:ETHUSDT",
  WETH: "BINANCE:ETHUSDT",
  WBTC: "BINANCE:WBTCUSDT",
  XAUt: "OKX:XAUTUSDT",
  USDC: "BINANCE:USDCUSDT",
  USDT: "BINANCE:USDTUSD",
};

// GeckoTerminal pool addresses on Celo for DEX-traded tokens
// Verified against https://docs.celo.org/tooling/contracts/token-contracts
// and https://api.geckoterminal.com/api/v2/networks/celo/tokens/{address}/pools
const GECKO_POOLS: Record<string, string> = {
  // Mento stablecoins — highest liquidity pools
  USDm: "0x34757893070b0fc5de37aaf2844255ff90f7f1e0",   // USDC / cUSD
  EURm: "0x1c8dafd358d308b880f71edb5170b010b106ca60",   // cEUR / cUSD
  BRLm: "0x67449e82a0d354d34e6b7487a968eb3e15cd47b9",   // cREAL / cUSD
  KESm: "0x61ef8708fc240dc7f9f2c0d81c3124df2fd8829f",   // cKES / USD₮
  COPm: "0x2ac5baa668a8a58fd0e302b9896717484fd217b0",   // USD₮ / cCOP
  PHPm: "0xb466d5429d6ad9999bf112c225d9d7b15e96c658",   // PUSO / USDC
  XOFm: "0xaa97f0689660ea15b7d6f84f2e5250b63f2b381a",   // eXOF / cUSD
  NGNm: "0x1e2f87e1f8056fcd39695aaeb63cb475e1dd2318",   // cNGN / USD₮
  JPYm: "0x04feae0d4a3d0051397ee09314dad768a37fb539",   // cJPY / USD₮
  CHFm: "0x1aa2f83357150f811b1010c00020abe1462feb01",   // cCHF / USD₮
};

interface PriceChartProps {
  selectedToken: string;
  onTokenSelect: (token: string) => void;
}

export default function PriceChart({
  selectedToken,
  onTokenSelect,
}: PriceChartProps) {
  const tvSymbol = TV_SYMBOLS[selectedToken];
  const geckoPool = GECKO_POOLS[selectedToken];

  return (
    <Panel className="row-span-1 col-span-1">
      <div className="panel-header flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <span className="font-bold">{selectedToken} / {TV_SYMBOLS[selectedToken] ? "USDT" : "USD"}</span>
          <div className="flex space-x-2 text-[10px] text-gray-400">
            {TOKEN_OPTIONS.map((token) => (
              <button
                key={token}
                onClick={() => onTokenSelect(token)}
                className={`hover:text-white ${selectedToken === token ? "tab-active" : ""}`}
              >
                {token}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex-grow min-h-0">
        {tvSymbol ? (
          <AdvancedRealTimeChart
            key={selectedToken}
            symbol={tvSymbol}
            theme="dark"
            autosize={true}
            interval="5"
            timezone="Etc/UTC"
            style="1"
            locale="en"
            toolbar_bg="#0a0a0a"
            enable_publishing={false}
            hide_top_toolbar={true}
            hide_legend={true}
            save_image={false}
            container_id={`tv_chart_${selectedToken}`}
            backgroundColor="#0a0a0a"
          />
        ) : geckoPool ? (
          <iframe
            key={selectedToken}
            src={`https://www.geckoterminal.com/celo/pools/${geckoPool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0`}
            className="w-full h-full border-0"
            allow="clipboard-write"
            allowFullScreen
          />
        ) : (
          <div className="flex-grow h-full flex items-center justify-center text-gray-500 text-xs">
            <div className="text-center">
              <div className="text-[10px] uppercase tracking-wider mb-1">
                No Chart Available
              </div>
              <div>{selectedToken} — DEX chart data not indexed</div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
}
