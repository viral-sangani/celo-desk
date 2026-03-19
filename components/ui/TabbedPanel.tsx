"use client";

import { useState, ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  content: ReactNode;
}

interface TabbedPanelProps {
  tabs: Tab[];
  defaultTab?: string;
}

export default function TabbedPanel({ tabs, defaultTab }: TabbedPanelProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div className="border-panel flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-terminal-border bg-[#141414]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors active:scale-[0.97] ${
              activeTab === tab.id
                ? "text-terminal-amber border-b border-terminal-amber bg-[#0a0a0a]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="flex-grow overflow-hidden min-h-0 relative">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`h-full transition-opacity duration-100 ${activeTab === tab.id ? "opacity-100" : "opacity-0 pointer-events-none absolute inset-0"}`}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
