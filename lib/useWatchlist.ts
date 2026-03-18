"use client";

import { useState, useEffect, useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "celodesk_watchlist";
const DEFAULT_WATCHLIST = ["CELO", "BTC", "ETH", "XAUt"];

// Simple external store so all components using this hook share the same state
let currentWatchlist: string[] = DEFAULT_WATCHLIST;
const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((l) => l());
}

function getSnapshot() {
  return currentWatchlist;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function load() {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        currentWatchlist = parsed;
        emitChange();
      }
    }
  } catch {}
}

function save(tokens: string[]) {
  currentWatchlist = tokens;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
  } catch {}
  emitChange();
}

let initialized = false;

export function useWatchlist() {
  const watchlist = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_WATCHLIST);

  useEffect(() => {
    if (!initialized) {
      initialized = true;
      load();
    }
  }, []);

  const addToken = useCallback((token: string) => {
    if (currentWatchlist.includes(token)) return;
    save([...currentWatchlist, token]);
  }, []);

  const removeToken = useCallback((token: string) => {
    save(currentWatchlist.filter((t) => t !== token));
  }, []);

  const toggleToken = useCallback((token: string) => {
    if (currentWatchlist.includes(token)) {
      save(currentWatchlist.filter((t) => t !== token));
    } else {
      save([...currentWatchlist, token]);
    }
  }, []);

  const isInWatchlist = useCallback((token: string) => {
    return currentWatchlist.includes(token);
  }, [watchlist]);

  return { watchlist, addToken, removeToken, toggleToken, isInWatchlist };
}
