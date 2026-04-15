import { useState } from "react";
import { storage } from "../storage";
import { Settings } from "../types";
// hooks/useSettings.ts


// localStorage key: 'appSettings'
const STORAGE_KEY = "appSettings";

// default recipientEmail: ''
// default senderName: 'Kiran Shrestha'
// default ccEmail: ''

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const raw = storage.get(STORAGE_KEY);
      return raw
        ? (JSON.parse(raw) as Settings)
        : { recipientEmail: "", senderName: "Referee", ccEmail: "" };
    } catch {
      return { recipientEmail: "", senderName: "Referee", ccEmail: "" };
    }
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      storage.set(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  return { settings, updateSettings };
}
