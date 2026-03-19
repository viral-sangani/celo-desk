"use client";

import { Personality } from "@/lib/personalities";

interface PersonalityCardProps {
  personality: Personality;
  selected: boolean;
  onClick: () => void;
}

export default function PersonalityCard({ personality, selected, onClick }: PersonalityCardProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left p-4 border transition-colors active:scale-[0.97] ${
        selected
          ? "border-terminal-green bg-terminal-green/5"
          : "border-terminal-border hover:border-gray-500 bg-[#0a0a0a]"
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-lg w-7 h-7 flex items-center justify-center border"
          style={{
            color: personality.color,
            borderColor: selected ? personality.color : "#2a2a2a",
          }}
        >
          {personality.icon}
        </span>
        <div>
          <div className="text-xs font-bold text-white uppercase tracking-wider">
            {personality.name}
          </div>
          <div className="text-[10px] text-gray-500">{personality.subtitle}</div>
        </div>
      </div>
      <div className="text-[11px] text-gray-400 leading-relaxed">
        {personality.description}
      </div>
      {selected && (
        <div
          className="mt-2 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: personality.color }}
        >
          Selected
        </div>
      )}
    </button>
  );
}
