'use client';

import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';

export default function BookmarkButton({ verseKey, chapterId, chapterName, text }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(storage.isBookmarked(verseKey));
  }, [verseKey]);

  function toggle() {
    if (saved) {
      storage.removeBookmark(verseKey);
      setSaved(false);
    } else {
      storage.addBookmark({ verseKey, chapterId, chapterName, text, note: '' });
      setSaved(true);
    }
  }

  return (
    <button
      className={`icon-btn sm ${saved ? 'active' : ''}`}
      aria-label={saved ? 'إزالة الحفظ' : 'حفظ الآية'}
      onClick={toggle}
    >
      <svg viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
        <path d="M6 3h12v18l-6-4-6 4V3z" />
      </svg>
    </button>
  );
}
