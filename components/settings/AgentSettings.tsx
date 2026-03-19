"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PERSONALITIES, RISK_LEVELS, DEFAULT_PERSONALITY, DEFAULT_RISK_LEVEL } from "@/lib/personalities";
import type { PersonalityId, RiskLevelId } from "@/lib/personalities";
import PersonalityCard from "./PersonalityCard";

interface AgentSettingsProps {
  walletAddress: string;
}

export default function AgentSettings({ walletAddress }: AgentSettingsProps) {
  const userAgent = useQuery(api.agentWallet.getAgentForUser, { userAddress: walletAddress });
  const updatePersonality = useMutation(api.agentTradingMutations.updatePersonality);
  const updateStatus = useMutation(api.agentTradingMutations.updateAgentStatus);

  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityId>(DEFAULT_PERSONALITY);
  const [customPrompt, setCustomPrompt] = useState("");
  const [riskLevel, setRiskLevel] = useState<RiskLevelId>(DEFAULT_RISK_LEVEL);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync state from agent data
  useEffect(() => {
    if (userAgent) {
      setSelectedPersonality((userAgent.personality as PersonalityId) ?? DEFAULT_PERSONALITY);
      setCustomPrompt(userAgent.personalityPrompt ?? "");
      setRiskLevel((userAgent.riskLevel as RiskLevelId) ?? DEFAULT_RISK_LEVEL);
    }
  }, [userAgent]);

  if (userAgent === undefined) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider animate-pulse">
          Loading agent...
        </div>
      </div>
    );
  }

  if (!userAgent) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider">
          No Agent Found
        </div>
        <div className="text-gray-500 text-xs text-center max-w-xs">
          Create an AI trading agent on the Terminal page first, then configure its personality here.
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updatePersonality({
        agentId: userAgent._id,
        personality: selectedPersonality,
        personalityPrompt: selectedPersonality === "custom" ? customPrompt : undefined,
        riskLevel,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status: "active" | "paused" | "stopped") => {
    try {
      await updateStatus({ agentId: userAgent._id, status });
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Agent Status */}
      <section className="border border-terminal-border bg-[#0a0a0a] p-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
          Agent Status
        </div>
        <div className="flex gap-2">
          {(["active", "paused", "stopped"] as const).map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                userAgent.status === status
                  ? status === "active"
                    ? "border-terminal-green text-terminal-green bg-terminal-green/10"
                    : status === "paused"
                      ? "border-terminal-amber text-terminal-amber bg-terminal-amber/10"
                      : "border-terminal-red text-terminal-red bg-terminal-red/10"
                  : "border-terminal-border text-gray-500 hover:text-white hover:border-gray-500"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </section>

      {/* Trading Personality */}
      <section className="border border-terminal-border bg-[#0a0a0a] p-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-4">
          Trading Personality
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.values(PERSONALITIES).map((p) => (
            <PersonalityCard
              key={p.id}
              personality={p}
              selected={selectedPersonality === p.id}
              onClick={() => setSelectedPersonality(p.id as PersonalityId)}
            />
          ))}
        </div>

        {/* Custom option */}
        <button
          onClick={() => setSelectedPersonality("custom")}
          className={`mt-3 w-full text-left p-4 border transition-all ${
            selectedPersonality === "custom"
              ? "border-terminal-green bg-terminal-green/5"
              : "border-terminal-border hover:border-gray-500 bg-[#0a0a0a]"
          }`}
        >
          <div className="flex items-center gap-2">
            <span className="text-lg w-7 h-7 flex items-center justify-center border border-terminal-border text-gray-400">
              +
            </span>
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Custom Personality
              </div>
              <div className="text-[10px] text-gray-500">Write your own trading rules</div>
            </div>
          </div>
        </button>

        {selectedPersonality === "custom" && (
          <div className="mt-3">
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Describe your trading strategy. Example: Buy CELO when it drops more than 5%. Sell when it's up 3%. Always keep 50% in stablecoins..."
              className="w-full h-32 bg-black border border-terminal-border p-3 text-xs text-white font-mono resize-none focus:outline-none focus:border-terminal-green"
            />
            <div className="text-[10px] text-gray-600 mt-1">
              This prompt will be sent to the AI trading agent to guide its decisions.
            </div>
          </div>
        )}
      </section>

      {/* Risk Level */}
      <section className="border border-terminal-border bg-[#0a0a0a] p-4">
        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-3">
          Risk Level
        </div>
        <div className="flex gap-2">
          {(Object.entries(RISK_LEVELS) as [RiskLevelId, typeof RISK_LEVELS[RiskLevelId]][]).map(
            ([id, level]) => (
              <button
                key={id}
                onClick={() => setRiskLevel(id)}
                className={`flex-1 px-3 py-2 border transition-colors text-center ${
                  riskLevel === id
                    ? "border-terminal-green text-terminal-green bg-terminal-green/5"
                    : "border-terminal-border text-gray-500 hover:text-white hover:border-gray-500"
                }`}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider">
                  {level.label}
                </div>
                <div className="text-[10px] text-gray-600 mt-0.5">{level.description}</div>
              </button>
            )
          )}
        </div>
      </section>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className={`w-full py-2.5 border text-[10px] font-bold uppercase tracking-wider transition-colors ${
          saved
            ? "border-terminal-green text-terminal-green bg-terminal-green/10"
            : "border-terminal-green text-terminal-green hover:bg-terminal-green/10 disabled:opacity-50"
        }`}
      >
        {saving ? "SAVING..." : saved ? "SETTINGS SAVED" : "SAVE SETTINGS"}
      </button>
    </div>
  );
}
