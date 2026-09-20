'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlayer } from '@/context/PlayerContext';
import { useSettings } from '@/context/SettingsContext';
import BookmarkButton from '@/components/BookmarkButton';
import { storage } from '@/lib/storage';

export default function SurahReaderClient({ chapter, verses }) {
  const router = useRouter();
  const { track, play } = usePlayer();
  const { settings, updateSettings } = useSettings();
  const [reciters, setReciters] = useState([]);
  const [selectedReciterId, setSelectedReciterId] = useState(settings.reciterId);
  const [hifzOpen, setHifzOpen] = useState(false);

  // Mark this surah as "continue reading" as soon as it's opened.
  useEffect(() => {
    storage.setContinueReading({
      chapterId: chapter.id,
      chapterName: chapter.name_arabic,
      verseNumber: 1
    });
  }, [chapter.id]);

  useEffect(() => {
    fetch('https://www.mp3quran.net/api/v3/reciters?language=ar')
      .then((r) => r.json())
      .then((d) => setReciters((d.reciters || []).filter((r) => r.moshaf?.length)))
      .catch(() => setReciters([]));
  }, []);

  const currentReciter = useMemo(
    () => reciters.find((r) => r.id === Number(selectedReciterId)) || reciters[0],
    [reciters, selectedReciterId]
  );

  function handlePlaySurah() {
    if (!currentReciter) return;
    updateSettings({ reciterId: currentReciter.id, moshafId: currentReciter.moshaf[0].id });
    play(chapter, currentReciter, currentReciter.moshaf[0]);
  }

  function handleCopy(text, key) {
    navigator.clipboard?.writeText(`${text}\n\n(${key})`).catch(() => {});
  }

  async function handleShare(text, key) {
    const shareData = { title: 'Quran 3', text: `${text}\n\n(${key})`, url: `${window.location.origin}/surah/${chapter.id}#ayah-${key.split(':')[1]}` };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch { /* user cancelled */ }
    } else {
      handleCopy(text, key);
    }
  }

  const isCurrentSurahPlaying = track?.chapter?.id === chapter.id;

  return (
    <section className="section container">
      <div style={{ marginBottom: 18, display: 'flex', gap: 10 }}>
        <Link href="/surah" className="btn btn-ghost btn-sm">← رجوع لقائمة السور</Link>
        <button className="btn btn-ghost btn-sm" onClick={() => setHifzOpen((v) => !v)}>
          {hifzOpen ? 'إغلاق وضع الحفظ' : 'وضع الحفظ'}
        </button>
      </div>

      <div className="reader-header">
        {chapter.id > 1 && (
          <button className="reader-nav-btn prev" aria-label="السورة السابقة" onClick={() => router.push(`/surah/${chapter.id - 1}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}
        <div className="ar-name quran-text">{chapter.name_arabic}</div>
        <div className="en-name">{chapter.id}. {chapter.name_simple} {chapter.translated_name ? `— "${chapter.translated_name.name}"` : ''}</div>
        <div className="info-line">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} · {chapter.verses_count} آية</div>
        {chapter.bismillah_pre !== false && <div className="basmala">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>}
        {chapter.id < 114 && (
          <button className="reader-nav-btn next" aria-label="السورة التالية" onClick={() => router.push(`/surah/${chapter.id + 1}`)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        )}
      </div>

      <div className="reader-tools">
        <div className="field" style={{ maxWidth: 220 }}>
          <select value={selectedReciterId || ''} onChange={(e) => setSelectedReciterId(e.target.value)} aria-label="اختر القارئ">
            <option value="" disabled>اختر قارئًا</option>
            {reciters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={handlePlaySurah} disabled={!currentReciter}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
          {isCurrentSurahPlaying ? 'يتم التشغيل الآن' : 'استمع لهذه السورة'}
        </button>
        <div className="field" style={{ maxWidth: 200 }}>
          <select value={settings.fontSize} onChange={(e) => updateSettings({ fontSize: e.target.value })} aria-label="حجم الخط">
            <option value="small">خط صغير</option>
            <option value="medium">خط متوسط</option>
            <option value="large">خط كبير</option>
          </select>
        </div>
      </div>

      {hifzOpen && <HifzPanel chapter={chapter} verses={verses} />}

      <div className="verses" data-font-size={settings.fontSize} data-line-spacing={settings.lineSpacing}>
        {verses.map((v) => (
          <div key={v.verse_key} id={`ayah-${v.verse_number}`} className="verse">
            <div className="verse-num">{v.verse_number}</div>
            <div className="verse-body">
              <p className="verse-ar quran-text">{v.text_uthmani}</p>
              <div className="verse-actions">
                <BookmarkButton verseKey={v.verse_key} chapterId={chapter.id} chapterName={chapter.name_arabic} text={v.text_uthmani} />
                <button className="icon-btn sm" aria-label="نسخ الآية" onClick={() => handleCopy(v.text_uthmani, v.verse_key)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                </button>
                <button className="icon-btn sm" aria-label="مشاركة الآية" onClick={() => handleShare(v.text_uthmani, v.verse_key)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" /></svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** Simple Hifz (memorization) helper: pick a range, repeat, hide text. */
function HifzPanel({ chapter, verses }) {
  const { play, track } = usePlayer();
  const [from, setFrom] = useState(1);
  const [to, setTo] = useState(Math.min(5, verses.length));
  const [repeatCount, setRepeatCount] = useState(3);
  const [hideText, setHideText] = useState(false);
  const [current, setCurrent] = useState(from);
  const [reciters, setReciters] = useState([]);

  useEffect(() => {
    fetch('https://www.mp3quran.net/api/v3/reciters?language=ar')
      .then((r) => r.json())
      .then((d) => setReciters((d.reciters || []).filter((r) => r.moshaf?.length)))
      .catch(() => {});
  }, []);

  const range = verses.filter((v) => v.verse_number >= from && v.verse_number <= to);
  const progress = range.length ? Math.round(((current - from + 1) / (to - from + 1)) * 100) : 0;

  return (
    <div className="hifz-panel glass" style={{ marginBottom: 30 }}>
      <h3 className="section-title" style={{ fontSize: '1.1rem' }}>وضع الحفظ — {chapter.name_arabic}</h3>
      <div className="hifz-controls">
        <div className="field">
          <label className="sr-only">من آية</label>
          <select value={from} onChange={(e) => setFrom(Number(e.target.value))}>
            {verses.map((v) => <option key={v.verse_number} value={v.verse_number}>من آية {v.verse_number}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="sr-only">إلى آية</label>
          <select value={to} onChange={(e) => setTo(Number(e.target.value))}>
            {verses.map((v) => <option key={v.verse_number} value={v.verse_number}>إلى آية {v.verse_number}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="sr-only">عدد التكرار</label>
          <select value={repeatCount} onChange={(e) => setRepeatCount(Number(e.target.value))}>
            {[1, 3, 5, 7, 10].map((n) => <option key={n} value={n}>تكرار {n} مرات</option>)}
          </select>
        </div>
        <button className={`chip ${hideText ? 'active' : ''}`} onClick={() => setHideText((v) => !v)}>
          {hideText ? 'إظهار النص' : 'إخفاء النص'}
        </button>
      </div>

      <div>
        <div style={{ fontSize: '0.8rem', color: 'var(--ivory-faint)' }}>Memorization Progress — {progress}%</div>
        <div className="hifz-progress-track"><div className="hifz-progress-fill" style={{ width: `${progress}%` }} /></div>
      </div>

      <div className={hideText ? 'hifz-ayah-hidden' : ''} style={{ marginTop: 18 }}>
        {range.map((v) => (
          <p key={v.verse_key} className="verse-ar quran-text" style={{ opacity: v.verse_number === current ? 1 : 0.4 }}>
            {v.verse_number}. {v.text_uthmani}
          </p>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
        <select className="field" style={{ maxWidth: 200 }} onChange={(e) => {
          const reciter = reciters.find((r) => r.id === Number(e.target.value));
          if (reciter) play(chapter, reciter, reciter.moshaf[0], { repeatsLeft: repeatCount });
        }}>
          <option value="">اختر قارئًا للاستماع المتكرر</option>
          {reciters.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => setCurrent((c) => Math.min(to, c + 1))} disabled={current >= to}>
          الآية التالية
        </button>
      </div>
    </div>
  );
}
