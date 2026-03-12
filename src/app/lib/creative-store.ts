"use client";

import { useEffect, useState } from "react";

export const PURPOSES = ["ads creative", "email", "social media"] as const;

export type Purpose = (typeof PURPOSES)[number];

export type Settings = {
  mainPrompt: string;
  purposePrompts: Record<Purpose, string>;
};

export type HistoryItem = {
  id: string;
  type: "image" | "video";
  url: string;
  prompt: string;
  createdAt: string;
  purpose: Purpose;
};

export const DEFAULT_SETTINGS: Settings = {
  mainPrompt:
    "You are a creative director. Use the brand identity and product image as reference. Produce clean, premium visuals with legible typography and clear product focus.",
  purposePrompts: {
    "ads creative":
      "Create a high-performing ad concept with bold headline placement and clear call-to-action spacing.",
    email: "Compose a calm, editorial-style visual that feels trustworthy and readable for email.",
    "social media":
      "Design a vibrant, scroll-stopping visual with strong contrast and playful layout.",
  },
};

const STORAGE_KEYS = {
  settings: "gemini-ui-settings",
  history: "gemini-ui-history",
};

function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useCreativeStore() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setSettings(readLocal(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
    setHistory(readLocal(STORAGE_KEYS.history, [] as HistoryItem[]));
  }, []);

  useEffect(() => {
    writeLocal(STORAGE_KEYS.settings, settings);
  }, [settings]);

  useEffect(() => {
    writeLocal(STORAGE_KEYS.history, history);
  }, [history]);

  const addHistory = (item: HistoryItem) => {
    setHistory((prev) => [item, ...prev].slice(0, 25));
  };

  const resetLocalData = () => {
    setSettings(DEFAULT_SETTINGS);
    setHistory([]);
  };

  return {
    settings,
    setSettings,
    history,
    addHistory,
    resetLocalData,
  };
}
