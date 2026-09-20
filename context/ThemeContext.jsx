'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');
  const [ready, setReady] = useState(false);

  // Load saved theme on mount (client-only — avoids SSR/client text mismatch)
  useEffect(() => {
    const saved = storage.getSettings().theme;
    setTheme(saved || 'dark');
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.setAttribute('data-theme', theme);
    const settings = storage.getSettings();
    storage.setSettings({ ...settings, theme });
  }, [theme, ready]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
