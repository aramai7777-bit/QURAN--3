'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useChapters } from '@/context/ChaptersContext';

export default function SearchBar({ onClose }) {
  const [query, setQuery] = useState('');
  const [reciters, setReciters] = useState([]);
  const { chapters } = useChapters();
  const router = useRouter();

  useEffect(() => {
    // Lazy-load reciters only when the search overlay opens
    import('@/lib/mp3quranApi').then(() => {});
    fetch('https://www.mp3quran.net/api/v3/reciters?language=ar')
      .then((r) => r.json())
      .then((d) => setReciters((d.reciters || []).filter((r) => r.moshaf?.length)))
      .catch(() => setReciters([]));
  }, []);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const q = query.trim().toLowerCase();
  const surahHits = useMemo(
    () =>
      q
        ? chapters
            .filter(
              (c) =>
                c.name_simple.toLowerCase().includes(q) ||
                c.name_arabic.includes(q) ||
                String(c.id) === q
            )
            .slice(0, 5)
        : [],
    [q, chapters]
  );
  const reciterHits = useMemo(
    () => (q ? reciters.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 5) : []),
    [q, reciters]
  );

  function goTo(path) {
    onClose();
    router.push(path);
  }

  return (
    <div className="search-overlay open" role="dialog" aria-modal="true" aria-label="بحث شامل" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="search-box glass">
        <div className="search-close">
          <button className="icon-btn" aria-label="إغلاق البحث" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="field">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            autoFocus
            type="text"
            placeholder="ابحث عن سورة، رقم آية، أو اسم قارئ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="search-results">
          {q && !surahHits.length && !reciterHits.length && (
            <div className="empty-state" style={{ padding: '30px 0' }}><p>لا توجد نتائج</p></div>
          )}
          {surahHits.map((c) => (
            <button key={`s-${c.id}`} className="search-result-item" onClick={() => goTo(`/surah/${c.id}`)}>
              <span className="cat">سورة</span> {c.name_arabic} — {c.name_simple}
            </button>
          ))}
          {reciterHits.map((r) => (
            <button key={`r-${r.id}`} className="search-result-item" onClick={() => goTo(`/reciters/${r.id}`)}>
              <span className="cat">قارئ</span> {r.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
