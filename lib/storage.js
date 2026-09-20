/**
 * All client-side persistence for Quran 3.
 * There is no backend/auth system, so bookmarks, reading position, and
 * preferences all live in the browser's localStorage and survive refreshes
 * but are per-device/per-browser (not synced across devices).
 */

const KEYS = {
  bookmarks: 'q3_bookmarks',        // [{ verseKey, chapterId, chapterName, text, note, savedAt }]
  continueReading: 'q3_continue',   // { chapterId, chapterName, verseNumber, updatedAt }
  recentReciters: 'q3_recent_reciters', // [reciterId]
  favoriteReciters: 'q3_fav_reciters',  // [reciterId]
  recentAudio: 'q3_recent_audio',   // [{ chapterId, reciterId, moshafId, playedAt }]
  settings: 'q3_settings'           // { fontSize, arabicFont, lineSpacing, theme, reciterId, moshafId, speed, autoplay, repeat }
};

function read(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* localStorage may be unavailable (private mode, quota) — fail silently */
  }
}

export const DEFAULT_SETTINGS = {
  fontSize: 'medium',      // small | medium | large
  arabicFont: 'amiri',     // amiri | naskh
  lineSpacing: 'comfortable', // compact | comfortable | relaxed
  theme: 'dark',           // dark | light
  reciterId: null,
  moshafId: null,
  speed: 1,
  autoplayNextSurah: true,
  repeatCount: 1
};

export const storage = {
  getBookmarks: () => read(KEYS.bookmarks, []),
  setBookmarks: (list) => write(KEYS.bookmarks, list),

  addBookmark(bookmark) {
    const list = this.getBookmarks().filter((b) => b.verseKey !== bookmark.verseKey);
    const next = [{ ...bookmark, savedAt: Date.now() }, ...list];
    this.setBookmarks(next);
    return next;
  },
  removeBookmark(verseKey) {
    const next = this.getBookmarks().filter((b) => b.verseKey !== verseKey);
    this.setBookmarks(next);
    return next;
  },
  isBookmarked(verseKey) {
    return this.getBookmarks().some((b) => b.verseKey === verseKey);
  },
  updateBookmarkNote(verseKey, note) {
    const next = this.getBookmarks().map((b) => (b.verseKey === verseKey ? { ...b, note } : b));
    this.setBookmarks(next);
    return next;
  },

  getContinueReading: () => read(KEYS.continueReading, null),
  setContinueReading: (position) => write(KEYS.continueReading, { ...position, updatedAt: Date.now() }),

  getRecentAudio: () => read(KEYS.recentAudio, []),
  pushRecentAudio(item) {
    const list = this.getRecentAudio().filter(
      (r) => !(r.chapterId === item.chapterId && r.reciterId === item.reciterId)
    );
    const next = [{ ...item, playedAt: Date.now() }, ...list].slice(0, 8);
    write(KEYS.recentAudio, next);
    return next;
  },

  getFavoriteReciters: () => read(KEYS.favoriteReciters, []),
  toggleFavoriteReciter(reciterId) {
    const list = this.getFavoriteReciters();
    const next = list.includes(reciterId)
      ? list.filter((id) => id !== reciterId)
      : [...list, reciterId];
    write(KEYS.favoriteReciters, next);
    return next;
  },

  getRecentReciters: () => read(KEYS.recentReciters, []),
  pushRecentReciter(reciterId) {
    const list = this.getRecentReciters().filter((id) => id !== reciterId);
    const next = [reciterId, ...list].slice(0, 6);
    write(KEYS.recentReciters, next);
    return next;
  },

  getSettings: () => ({ ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) }),
  setSettings: (settings) => write(KEYS.settings, settings)
};
