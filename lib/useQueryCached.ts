"use client";

import { useQuery } from "convex/react";
import { useState, useEffect, useRef } from "react";

/**
 * Wrapper around Convex useQuery that caches results in localStorage.
 * Shows cached data instantly while Convex fetches fresh data in background.
 * Once fresh data arrives, it updates the cache and returns fresh data.
 */
export function useQueryCached<T>(
  queryFn: any,
  args: any,
  cacheKey: string,
): T | undefined {
  const result = useQuery(queryFn, args);
  const [cached, setCached] = useState<T | undefined>(undefined);
  const hasHydrated = useRef(false);

  // Load from localStorage on mount (client-side only)
  useEffect(() => {
    if (hasHydrated.current) return;
    hasHydrated.current = true;
    try {
      const stored = localStorage.getItem(`celo_desk_${cacheKey}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Only use cache if less than 5 minutes old
        if (parsed._ts && Date.now() - parsed._ts < 300000) {
          setCached(parsed.data);
        }
      }
    } catch {}
  }, [cacheKey]);

  // Save to localStorage when fresh data arrives
  useEffect(() => {
    if (result !== undefined) {
      try {
        localStorage.setItem(
          `celo_desk_${cacheKey}`,
          JSON.stringify({ data: result, _ts: Date.now() })
        );
      } catch {}
      setCached(undefined); // Clear cached, use fresh
    }
  }, [result, cacheKey]);

  // Return fresh data if available, otherwise cached
  return result !== undefined ? result : cached;
}
