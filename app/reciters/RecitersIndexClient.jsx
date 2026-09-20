'use client';

import { useEffect, useMemo, useState } from 'react';
import ReciterCard from '@/components/ReciterCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { storage } from '@/lib/storage';

export default function RecitersIndexClient() {
  const [reciters, setReciters] = useState([]);
  const [status, setStatus] = useState('loading');
  const [query, setQuery] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    setFavoriteIds(storage.getFavoriteReciters());
    load();
  }, []);

  async function load() {
    setStatus('loading');
    try {
      const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setReciters((data.reciters || []).filter((r) => r.moshaf?.length));
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  function toggleFavorite(id) {
    setFavoriteIds(storage.toggleFavoriteReciter(id));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return reciters.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q);
      const matchesFav = !onlyFavorites || favoriteIds.includes(r.id);
      return matchesQuery && matchesFav;
    });
  }, [reciters, query, onlyFavorites, favoriteIds]);

  const recentIds = typeof window !== 'undefined' ? storage.getRecentReciters() : [];
  const recentReciters = recentIds.map((id) => reciters.find((r) => r.id === id)).filter(Boolean);

  return (
    <>
      {recentReciters.length > 0 && (
        <div style={{ marginBottom: 30 }}>
          <p className="section-sub" style={{ marginBottom: 12 }}>استمعت لهم مؤخرًا</p>
          <div className="continue-strip">
            {recentReciters.map((r) => (
              <a key={r.id} href={`/reciters/${r.id}`} className="continue-card glass">
                <div className="continue-meta"><div className="surah">{r.name}</div></div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="toolbar" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center', marginBottom: 26 }}>
        <div className="field" style={{ flex: 1, minWidth: 220 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input type="text" placeholder="ابحث عن اسم الشيخ..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <button className={`chip ${onlyFavorites ? 'active' : ''}`} onClick={() => setOnlyFavorites((v) => !v)}>
          المفضّلة فقط
        </button>
      </div>

      {status === 'loading' && <LoadingSkeleton count={8} height={180} />}
      {status === 'error' && <ErrorState message="تعذّر تحميل قائمة القرّاء. تحقق من اتصالك وحاول مجددًا." onRetry={load} />}
      {status === 'ready' && filtered.length === 0 && (
        <div className="empty-state"><p>لا يوجد قارئ مطابق لبحثك</p></div>
      )}
      {status === 'ready' && filtered.length > 0 && (
        <div className="reciter-grid">
          {filtered.map((r) => (
            <ReciterCard key={r.id} reciter={r} isFavorite={favoriteIds.includes(r.id)} onToggleFavorite={toggleFavorite} />
          ))}
        </div>
      )}
    </>
  );
}
