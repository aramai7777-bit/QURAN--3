'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getChapters } from '@/lib/quranApi';

const ChaptersContext = createContext(null);

/**
 * Chapter (surah) metadata rarely changes and is used almost everywhere
 * (home, surah index, reciter profiles, the sticky player). Fetching it
 * once here avoids every page/component re-requesting the same 114 rows.
 */
export function ChaptersProvider({ children }) {
  const [chapters, setChapters] = useState([]);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  async function load() {
    setStatus('loading');
    try {
      const data = await getChapters();
      setChapters(data);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  useEffect(() => {
    load();
  }, []);

  function getChapterById(id) {
    return chapters.find((c) => c.id === Number(id));
  }

  return (
    <ChaptersContext.Provider value={{ chapters, status, reload: load, getChapterById }}>
      {children}
    </ChaptersContext.Provider>
  );
}

export function useChapters() {
  const ctx = useContext(ChaptersContext);
  if (!ctx) throw new Error('useChapters must be used within ChaptersProvider');
  return ctx;
}
