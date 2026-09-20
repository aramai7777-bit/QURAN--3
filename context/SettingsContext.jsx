'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { storage, DEFAULT_SETTINGS } from '@/lib/storage';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettingsState] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettingsState(storage.getSettings());
  }, []);

  function updateSettings(patch) {
    setSettingsState((prev) => {
      const next = { ...prev, ...patch };
      storage.setSettings(next);
      return next;
    });
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
