'use client';

import { useMemo, useState } from 'react';
import { useChapters } from '@/context/ChaptersContext';
import SurahCard from '@/components/SurahCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

export default function SurahIndexClient() {
  const { chapters, status, reload } = useChapters();
  const [query, setQuery] = useState('');
  const [revelation, setRevelation] = useState('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return chapters.filter((c) => {
      const matchesQuery =
        !q || c.name_simple.toLowerCase().includes(q) || c.name_arabic.includes(q) || String(c.id).includes(q);
      const matchesRevelation =
        revelation === 'all' || (revelation === 'meccan' ? c.revelation_place === 'makkah' : c.revelation_place !== 'makkah');
      return matchesQuery && matchesRevelation;
    });
  }, [chapters, query, revelation]);

  return (
    <>
      <div className="toolbar" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 26 }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input type="text" placeholder="ابحث باسم السورة أو رقمها..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="chip-row">
          <button className={`chip ${revelation === 'all' ? 'active' : ''}`} onClick={() => setRevelation('all')}>الكل</button>
          <button className={`chip ${revelation === 'meccan' ? 'active' : ''}`} onClick={() => setRevelation('meccan')}>مكية</button>
          <button className={`chip ${revelation === 'medinan' ? 'active' : ''}`} onClick={() => setRevelation('medinan')}>مدنية</button>
        </div>
      </div>

      {status === 'loading' && <LoadingSkeleton count={9} />}
      {status === 'error' && <ErrorState onRetry={reload} />}
      {status === 'ready' && filtered.length === 0 && (
        <div className="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <p>لا توجد نتائج مطابقة</p>
        </div>
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div className="surah-grid">
          {filtered.map((c) => <SurahCard key={c.id} chapter={c} />)}
        </div>
      )}
    </>
  );
}
