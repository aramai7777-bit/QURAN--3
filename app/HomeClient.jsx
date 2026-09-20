'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useChapters } from '@/context/ChaptersContext';
import { usePlayer } from '@/context/PlayerContext';
import { getVerseByKey } from '@/lib/quranApi';
import { storage } from '@/lib/storage';
import ReciterCard from '@/components/ReciterCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

/** Deterministic "verse of the day" — same for everyone on a given date,
 *  picked from real Quran.com data (never generated). */
function dayIndex(totalAyahs) {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % totalAyahs;
}

function resolveVerseKey(chapters, globalIndex) {
  let remaining = globalIndex;
  for (const ch of chapters) {
    if (remaining < ch.verses_count) return `${ch.id}:${remaining + 1}`;
    remaining -= ch.verses_count;
  }
  return '1:1';
}

export default function HomeClient() {
  const { chapters, status: chaptersStatus } = useChapters();
  const { play } = usePlayer();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [reciters, setReciters] = useState([]);
  const [recitersStatus, setRecitersStatus] = useState('loading');
  const [dailyVerse, setDailyVerse] = useState(null);
  const [continueReading, setContinueReading] = useState(null);
  const [recentAudio, setRecentAudio] = useState([]);

  useEffect(() => {
    setContinueReading(storage.getContinueReading());
    setRecentAudio(storage.getRecentAudio());
  }, []);

  useEffect(() => {
    loadReciters();
  }, []);

  async function loadReciters() {
    setRecitersStatus('loading');
    try {
      const res = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar');
      if (!res.ok) throw new Error('failed');
      const data = await res.json();
      setReciters((data.reciters || []).filter((r) => r.moshaf?.length).slice(0, 8));
      setRecitersStatus('ready');
    } catch (err) {
      console.error(err);
      setRecitersStatus('error');
    }
  }

  useEffect(() => {
    if (!chapters.length) return;
    const totalAyahs = chapters.reduce((sum, c) => sum + c.verses_count, 0);
    const key = resolveVerseKey(chapters, dayIndex(totalAyahs));
    getVerseByKey(key).then(setDailyVerse).catch(() => setDailyVerse(null));
  }, [chapters]);

  function handleSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const bySurah = chapters.find(
      (c) => c.name_simple.toLowerCase().includes(q.toLowerCase()) || c.name_arabic.includes(q) || String(c.id) === q
    );
    if (bySurah) router.push(`/surah/${bySurah.id}`);
    else router.push('/surah');
  }

  const favoriteIds = typeof window !== 'undefined' ? storage.getFavoriteReciters() : [];

  return (
    <>
      <section className="hero">
        <div className="hero-frame" aria-hidden="true" />
        <p className="hero-eyebrow"><span className="line" /> منصّة قرآنية موثوقة <span className="line" /></p>
        <h1 className="hero-title arabic">القرآن الكريم</h1>
        <p className="hero-subtitle eng-display">Listen, Read &amp; Reflect</p>
        <p className="hero-desc">
          استمع إلى القرآن الكريم بأصوات نخبة من القرّاء، واقرأ آياته بخط واضح مريح للعين، في تجربة هادئة مصمّمة للتدبر.
        </p>

        <form className="hero-search" onSubmit={handleSearch} role="search">
          <label htmlFor="heroSearchInput" className="sr-only">ابحث عن سورة أو آية أو قارئ</label>
          <input
            id="heroSearchInput"
            type="text"
            placeholder="ابحث عن سورة، آية، أو اسم قارئ..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" aria-label="بحث">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          </button>
        </form>

        <div className="hero-ctas">
          <Link href="/surah" className="btn btn-gold">ابدأ القراءة</Link>
          <Link href="/reciters" className="btn btn-ghost">استمع الآن</Link>
        </div>

        <div className="hero-stats">
          <div className="hero-stat"><div className="num eng-display">114</div><div className="label">سورة</div></div>
          <div className="hero-stat"><div className="num eng-display">6,236</div><div className="label">آية</div></div>
          <div className="hero-stat"><div className="num eng-display">{reciters.length ? '150+' : '—'}</div><div className="label">قارئ</div></div>
        </div>
      </section>

      {continueReading && (
        <section className="section container">
          <div className="section-head">
            <div><h2 className="section-title">أكمل القراءة</h2><p className="section-sub">Continue Reading</p></div>
          </div>
          <Link href={`/surah/${continueReading.chapterId}#ayah-${continueReading.verseNumber}`} className="continue-strip">
            <div className="continue-card glass">
              <div className="continue-art">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 19.5A2.5 2.5 0 016.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" /></svg>
              </div>
              <div className="continue-meta">
                <div className="surah">{continueReading.chapterName}</div>
                <div className="reciter">آية {continueReading.verseNumber}</div>
              </div>
            </div>
          </Link>
        </section>
      )}

      {dailyVerse && (
        <section className="section container">
          <div className="section-head">
            <div><h2 className="section-title">الآية اليومية</h2><p className="section-sub">Daily Verse — from verified Quran text</p></div>
          </div>
          <div className="glass ai-result-card" style={{ maxWidth: 720 }}>
            <p className="verse-ar quran-text" style={{ fontSize: '1.5rem' }}>{dailyVerse.text_uthmani}</p>
            <div className="verse-ref" style={{ marginTop: 10, fontSize: '0.8rem', color: 'var(--ivory-faint)' }}>{dailyVerse.verse_key}</div>
          </div>
        </section>
      )}

      {recentAudio.length > 0 && (
        <section className="section container">
          <div className="section-head">
            <div><h2 className="section-title">استمعت مؤخرًا</h2><p className="section-sub">Recently played</p></div>
          </div>
          <div className="continue-strip">
            {recentAudio.map((item) => {
              const ch = chapters.find((c) => c.id === item.chapterId);
              if (!ch) return null;
              return (
                <button
                  key={`${item.chapterId}-${item.reciterId}`}
                  className="continue-card glass"
                  onClick={() => router.push(`/reciters/${item.reciterId}`)}
                >
                  <div className="continue-art">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>
                  </div>
                  <div className="continue-meta">
                    <div className="surah">{ch.name_arabic}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section className="section container">
        <div className="section-head">
          <div><h2 className="section-title">قرّاء مميزون</h2><p className="section-sub">Popular Reciters</p></div>
          <Link href="/reciters" className="btn btn-ghost btn-sm">عرض الكل</Link>
        </div>
        {recitersStatus === 'loading' && <LoadingSkeleton count={4} height={180} />}
        {recitersStatus === 'error' && <ErrorState onRetry={loadReciters} />}
        {recitersStatus === 'ready' && (
          <div className="reciter-grid">
            {reciters.map((r) => (
              <ReciterCard
                key={r.id}
                reciter={r}
                isFavorite={favoriteIds.includes(r.id)}
                onToggleFavorite={(id) => storage.toggleFavoriteReciter(id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section container">
        <div className="section-head">
          <div><h2 className="section-title">تجربة قرآنية متكاملة</h2><p className="section-sub">Everything you need to read, listen, and reflect</p></div>
        </div>
        <div className="feature-grid">
          <FeatureCard title="مصحف كامل واضح" desc="جميع السور الـ114 بخط عثماني مريح، مع أرقام الآيات ومعلومات كل سورة." />
          <FeatureCard title="تلاوات موثوقة" desc="استمع لعشرات القرّاء المعتمدين عبر مشغل صوتي احترافي." />
          <FeatureCard title="وضع الحفظ" desc="كرّر الآيات، أخفِ النص، وتابع تقدّمك في الحفظ بسهولة." />
          <FeatureCard title="حفظ ومتابعة" desc="ضع علامة على آياتك المفضلة وواصل القراءة من حيث توقفت." />
        </div>
      </section>
    </>
  );
}

function FeatureCard({ title, desc }) {
  return (
    <div className="feature-card glass">
      <h3>{title}</h3>
      <p>{desc}</p>
    </div>
  );
}
