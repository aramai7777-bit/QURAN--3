/**
 * Quran.com API v4 wrapper.
 * -------------------------------------------------------------------------
 * Used ONLY for authentic Quran text: chapter (surah) metadata and verse
 * text (Uthmani script). This is a read-only, publicly documented API and
 * does not require a private key for the endpoints used here.
 *
 * IMPORTANT: Never modify or "correct" the text returned by this API. If
 * you introduce a key-gated endpoint later (e.g. the newer OAuth-based
 * apis.quran.foundation), proxy that call through a Next.js Route Handler
 * (app/api/.../route.js) so the client id/secret stays server-side only.
 * -------------------------------------------------------------------------
 */

const BASE_URL = 'https://api.quran.com/api/v4';

async function getJSON(path, { revalidate = 3600 } = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    // Next.js data cache: re-fetch at most once per `revalidate` seconds.
    // Chapter/verse text never changes, so this avoids hammering the API.
    next: { revalidate }
  });
  if (!res.ok) {
    throw new Error(`Quran API request failed (${res.status}): ${path}`);
  }
  return res.json();
}

/** All 114 chapters (surahs), Arabic names included. */
export async function getChapters() {
  const data = await getJSON('/chapters?language=ar');
  return data.chapters;
}

/** A single chapter's metadata by number (1-114). */
export async function getChapter(chapterId) {
  const data = await getJSON(`/chapters/${chapterId}?language=ar`);
  return data.chapter;
}

/** All verses of a chapter, Uthmani script. */
export async function getVersesByChapter(chapterId) {
  const data = await getJSON(
    `/verses/by_chapter/${chapterId}?language=ar&words=false&fields=text_uthmani&per_page=300`,
    { revalidate: 86400 }
  );
  return data.verses;
}

/** A single verse by its "surah:ayah" key, e.g. "2:255" for Ayat al-Kursi. */
export async function getVerseByKey(verseKey) {
  const data = await getJSON(
    `/verses/by_key/${verseKey}?language=ar&words=false&fields=text_uthmani`,
    { revalidate: 86400 }
  );
  return data.verse;
}

/** Keyword/topical search across the Quran text (used by search + AI assistant). */
export async function searchQuran(query, size = 6) {
  const data = await getJSON(
    `/search?q=${encodeURIComponent(query)}&language=ar&size=${size}`,
    { revalidate: 0 }
  );
  return (data.search && data.search.results) || [];
}
