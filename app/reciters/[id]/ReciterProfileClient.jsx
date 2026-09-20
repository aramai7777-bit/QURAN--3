'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useChapters } from '@/context/ChaptersContext';
import { usePlayer } from '@/context/PlayerContext';
import { moshafHasChapter, buildAudioUrl } from '@/lib/mp3quranApi';
import { storage } from '@/lib/storage';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

function initials(name) {
  return (name || '?').trim().split(' ').slice(0, 2).map((w) => w[0]).join('');
}

export default function ReciterProfileClient({ reciterId }) {
  const { chapters: allChapters } = useChapters();
  const { play, setQueue: setPlayerQueue } = usePlayer();
  const [reciter, setReciter] = useState(null);
  const [status, setStatus] = useState('loading');
  const [moshafId, setMoshafId] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    load();
    storage.pushRecentReciter(reciterId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reciterId]);

  async function load() {
    setStatus('loading');
    try {
      const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      const found = (data.reciters || []).find((r) => r.id === reciterId);
      if (!found) throw new Error('not found');
      setReciter(found);
      setMoshafId(found.moshaf[0].id);
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }

  const moshaf = useMemo(() => reciter?.moshaf.find((m) => m.id === moshafId), [reciter, moshafId]);

  const availableChapters = useMemo(() => {
    if (!moshaf || !allChapters.length) return [];
    const set = new Set(moshaf.surah_list.split(',').map(Number));
    const q = filter.trim().toLowerCase();
    return allChapters.filter(
      (c) => set.has(c.id) && (!q || c.name_simple.toLowerCase().includes(q) || c.name_arabic.includes(q) || String(c.id).includes(q))
    );
  }, [moshaf, allChapters, filter]);

  function handlePlay(chapter) {
    setPlayerQueue(availableChapters.map((c) => c.id));
    play(chapter, reciter, moshaf);
  }

  function handleDownload(chapter) {
    if (!moshaf) return;
    const url = buildAudioUrl(moshaf, chapter.id);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${chapter.id}-${chapter.name_simple}-${reciter.name.replace(/\s+/g, '_')}.mp3`;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  if (status === 'loading') {
    return <section className="section container"><LoadingSkeleton count={6} /></section>;
  }
  if (status === 'error' || !reciter) {
    return <section className="section container"><ErrorState message="تعذّر تحميل بيانات هذا القارئ." onRetry={load} /></section>;
  }

  return (
    <section className="section container">
      <Link href="/reciters" className="btn btn-ghost btn-sm" style={{ marginBottom: 22 }}>← رجوع لقائمة القرّاء</Link>

      <div className="reciter-profile-head" style={{ display: 'flex', alignItems: 'center', gap: 20, paddingBottom: 26, borderBottom: '1px solid var(--line)', marginBottom: 26 }}>
        <div className="reciter-avatar" style={{ width: 90, height: 90, fontSize: '1.8rem' }}>{initials(reciter.name)}</div>
        <div>
          <div className="name-ar arabic" style={{ fontSize: '1.5rem' }}>{reciter.name}</div>
          <div className="name-en">{reciter.moshaf.length} {reciter.moshaf.length > 1 ? 'روايات متاحة' : 'رواية متاحة'}</div>
        </div>
      </div>

      {reciter.moshaf.length > 1 && (
        <div className="chip-row" style={{ marginBottom: 22 }}>
          {reciter.moshaf.map((m) => (
            <button key={m.id} className={`chip ${m.id === moshafId ? 'active' : ''}`} onClick={() => setMoshafId(m.id)}>
              {m.name}
            </button>
          ))}
        </div>
      )}

      <div className="field" style={{ marginBottom: 20 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
        <input type="text" placeholder="ابحث عن سورة ضمن تلاوات هذا القارئ..." value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>

      <div className="rp-list" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {availableChapters.length === 0 && <div className="empty-state"><p>لا توجد سور مطابقة ضمن هذه الرواية</p></div>}
        {availableChapters.map((ch) => (
          <div key={ch.id} className="rp-item" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', border: '1px solid var(--line)', borderRadius: 14 }}>
            <div className="rp-num" style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--line-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', flexShrink: 0 }}>{ch.id}</div>
            <div style={{ flex: 1 }}>
              <div className="quran-text" style={{ fontSize: '1.05rem' }}>{ch.name_arabic}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--ivory-faint)' }}>{ch.name_simple} · {ch.verses_count} آية</div>
            </div>
            <button className="icon-btn sm" aria-label="تشغيل" onClick={() => handlePlay(ch)}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            </button>
            <button className="icon-btn sm" aria-label="تحميل" onClick={() => handleDownload(ch)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v9M8 9l4 4 4-4" /><path d="M4 19h16" /></svg>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
