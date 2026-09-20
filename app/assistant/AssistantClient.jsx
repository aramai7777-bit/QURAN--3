'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useChapters } from '@/context/ChaptersContext';
import { getVerseByKey, getVersesByChapter, searchQuran } from '@/lib/quranApi';

/*
 * AI_INTEGRATION_NOTE: this assistant intentionally does NOT call a
 * generative model to produce Quran text — verses always come straight
 * from Quran.com's verified API, per the "never invent Quran verses"
 * requirement. The natural-language understanding below is a lightweight
 * rule-based intent parser. To upgrade this to a full LLM-powered
 * assistant: send the question to a Next.js Route Handler
 * (app/api/assistant/route.js), call an LLM there ONLY to decide intent
 * and to write a short plain-language explanation, and still fetch the
 * actual Quran text from Quran.com — never let model output stand in for
 * Quran text. Keep any model API key server-side only.
 */

const KNOWN_SURAHS = {
  'al-kahf': 18, kahf: 18, الكهف: 18,
  'al-baqarah': 2, baqarah: 2, البقرة: 2,
  yasin: 36, 'ya-sin': 36, يس: 36,
  'ar-rahman': 55, rahman: 55, الرحمن: 55,
  'al-mulk': 67, mulk: 67, الملك: 67,
  'al-fatiha': 1, fatiha: 1, الفاتحة: 1,
  'al-ikhlas': 112, ikhlas: 112, الإخلاص: 112
};

function parseIntent(raw) {
  const q = raw.toLowerCase().trim();
  if (q.includes('kursi') || q.includes('الكرسي')) {
    return { type: 'ayah', ref: '2:255', label: 'آية الكرسي (البقرة 255)' };
  }
  for (const key in KNOWN_SURAHS) {
    if (q.includes(key)) return { type: 'surah', chapterId: KNOWN_SURAHS[key], label: `سورة معروفة: ${key}` };
  }
  const numMatch = q.match(/surah\s*(\d{1,3})|سورة\s*(\d{1,3})/);
  if (numMatch) {
    const n = parseInt(numMatch[1] || numMatch[2], 10);
    if (n >= 1 && n <= 114) return { type: 'surah', chapterId: n, label: `سورة رقم ${n}` };
  }
  return { type: 'topic', query: raw };
}

const SUGGESTIONS = ['Find Surah Al-Kahf', 'Show verses about patience', 'Find Ayat Al-Kursi', 'verses about gratitude'];

export default function AssistantClient() {
  const { getChapterById } = useChapters();
  const [input, setInput] = useState('');
  const [state, setState] = useState({ status: 'idle', result: null });

  async function runQuery(raw) {
    setState({ status: 'loading', result: null });
    const intent = parseIntent(raw);
    try {
      if (intent.type === 'surah') {
        const chapter = getChapterById(intent.chapterId);
        const firstVerses = await getVersesByChapter(intent.chapterId);
        setState({
          status: 'done',
          result: { kind: 'surah', chapter, verses: firstVerses.slice(0, 3), label: intent.label }
        });
      } else if (intent.type === 'ayah') {
        const verse = await getVerseByKey(intent.ref);
        setState({ status: 'done', result: { kind: 'ayah', verse, label: intent.label, ref: intent.ref } });
      } else {
        const hits = await searchQuran(intent.query);
        setState({ status: 'done', result: { kind: 'topic', hits } });
      }
    } catch (err) {
      console.error(err);
      setState({ status: 'error', result: null });
    }
  }

  return (
    <>
      <div className="ai-chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" onClick={() => { setInput(s); runQuery(s); }}>{s}</button>
        ))}
      </div>

      <form
        className="ai-input-row"
        style={{ display: 'flex', gap: 10 }}
        onSubmit={(e) => { e.preventDefault(); if (input.trim()) runQuery(input.trim()); }}
      >
        <div className="field" style={{ flex: 1 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          <input
            type="text"
            dir="auto"
            placeholder="اكتب سؤالك... مثال: Find Surah Al-Kahf"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-gold btn-sm">اسأل</button>
      </form>

      <div className="ai-results">
        {state.status === 'loading' && (
          <div className="ai-thinking"><span className="dot-pulse" /><span className="dot-pulse" /><span className="dot-pulse" /> جاري البحث ضمن نص القرآن الموثّق...</div>
        )}
        {state.status === 'error' && (
          <div className="error-state"><p>تعذّر إتمام البحث الآن. حاول مرة أخرى بعد قليل.</p></div>
        )}
        {state.status === 'done' && state.result?.kind === 'surah' && (
          <div className="ai-result-card glass">
            <div className="ai-result-tag">SURAH MATCH — من بيانات Quran.com الموثّقة</div>
            <div className="verse-ar quran-text">{state.result.chapter?.name_arabic}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ivory-faint)', margin: '8px 0' }}>
              {state.result.chapter?.name_simple} · {state.result.chapter?.verses_count} آية — أول آيات السورة:
            </div>
            {state.result.verses.map((v) => (
              <p key={v.verse_key} className="verse-ar quran-text" style={{ fontSize: '1.3rem', marginTop: 10 }}>{v.text_uthmani}</p>
            ))}
            <Link href={`/surah/${state.result.chapter?.id}`} className="btn btn-gold btn-sm" style={{ marginTop: 12 }}>افتح السورة كاملة</Link>
          </div>
        )}
        {state.status === 'done' && state.result?.kind === 'ayah' && (
          <div className="ai-result-card glass">
            <div className="ai-result-tag">AYAH MATCH — من بيانات Quran.com الموثّقة</div>
            <p className="verse-ar quran-text">{state.result.verse.text_uthmani}</p>
            <div style={{ fontSize: '0.78rem', color: 'var(--ivory-faint)', marginTop: 10 }}>{state.result.label} — {state.result.ref}</div>
          </div>
        )}
        {state.status === 'done' && state.result?.kind === 'topic' && (
          <>
            {state.result.hits.length === 0 ? (
              <div className="empty-state"><p>لم يتم العثور على آيات مطابقة. جرّب صياغة مختلفة.</p></div>
            ) : (
              <>
                <div className="ai-result-tag">TOPIC SEARCH — نتائج من بيانات Quran.com الموثّقة</div>
                {state.result.hits.map((h) => (
                  <div key={h.verse_key} className="ai-result-card glass">
                    <p className="verse-ar quran-text">{h.text}</p>
                    <div style={{ fontSize: '0.78rem', color: 'var(--ivory-faint)', marginTop: 10 }}>{h.verse_key}</div>
                  </div>
                ))}
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}
