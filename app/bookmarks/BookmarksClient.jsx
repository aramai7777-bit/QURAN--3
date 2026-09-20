'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { storage } from '@/lib/storage';

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    setBookmarks(storage.getBookmarks());
  }, []);

  function remove(verseKey) {
    setBookmarks(storage.removeBookmark(verseKey));
  }

  function updateNote(verseKey, note) {
    setBookmarks(storage.updateBookmarkNote(verseKey, note));
  }

  if (!bookmarks.length) {
    return (
      <div className="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 3h12v18l-6-4-6 4V3z" /></svg>
        <p>لا توجد آيات محفوظة بعد. افتح أي سورة واضغط أيقونة الحفظ بجانب الآية.</p>
        <Link href="/surah" className="btn btn-gold btn-sm">تصفّح السور</Link>
      </div>
    );
  }

  return (
    <div>
      {bookmarks.map((b) => {
        const [chapterId, verseNumber] = b.verseKey.split(':');
        return (
          <div key={b.verseKey} className="bookmark-item glass">
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--ivory-faint)' }}>{b.chapterName} — آية {verseNumber}</span>
              <button className="icon-btn sm" aria-label="إزالة" onClick={() => remove(b.verseKey)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <p className="verse-ar quran-text" style={{ fontSize: '1.3rem' }}>{b.text}</p>
            <textarea
              placeholder="أضف ملاحظة شخصية..."
              defaultValue={b.note}
              onBlur={(e) => updateNote(b.verseKey, e.target.value)}
            />
            <div className="bookmark-actions">
              <Link href={`/surah/${chapterId}#ayah-${verseNumber}`} className="btn btn-ghost btn-sm">الانتقال إلى الآية</Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
