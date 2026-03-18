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
// These show real on-chain trading data from Uniswap/Mento pools
const GECKO_POOLS: Record<string, string> = {
  // Mento stablecoins with DEX liquidity
  USDm: "0x5dc631ad6c26bea1a59fbf2c2680cf3df43d249f",
  EURm: "0x628cb3a5a206956423d158009612813b64b19dab",
  BRLm: "0x1625fe58cdb3726e5841fb2bb367dde9aaa009b3",
  KESm: "0x61ef8708fc240dc7f9f2c0d81c3124df2fd8829f",
  COPm: "0x2ac5baa668a8a58fd0e302b9896717484fd217b0",
  PHPm: "0x87dec9a2589d9e6511df84c193561b3a16cf6238",
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
