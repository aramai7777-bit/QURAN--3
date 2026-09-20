'use client';

import { useEffect } from 'react';

/**
 * Registers the offline app-shell service worker (public/sw.js).
 * By design this caches ONLY the static UI shell (pages, CSS, fonts) —
 * never Quran audio files, since we don't have the right to redistribute
 * or cache reciters' copyrighted recordings offline without permission.
 */
export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);
  return null;
}
