/**
 * mp3quran.net API wrapper.
 * -------------------------------------------------------------------------
 * Used for reciters and chapter audio. Chosen over Quran.com's own audio
 * endpoints because:
 *   1) It exposes each reciter's own audio server directly — no separate
 *      "reciter ID" to cross-reference against a different resource,
 *      which is what caused wrong-audio bugs in an earlier version.
 *   2) It has a much larger reciter roster (al-Husary, al-Tablawi,
 *      al-Minshawi, al-Afasy, al-Dosari, al-Luhaidan, al-Sudais, and more).
 *   3) It lists every "moshaf" (riwayah/style) a reciter actually
 *      recorded, so the UI never offers a style that doesn't exist.
 *   4) It is free and does not require an API key — unlike Quran.com's
 *      audio endpoints, which have moved behind an OAuth2 client-
 *      credentials flow (apis.quran.foundation).
 * -------------------------------------------------------------------------
 */

const BASE_URL = 'https://www.mp3quran.net/api/v3';

export async function getReciters() {
  const res = await fetch(`${BASE_URL}/reciters?language=ar`, {
    next: { revalidate: 3600 }
  });
  if (!res.ok) throw new Error(`mp3quran API request failed (${res.status})`);
  const data = await res.json();
  // Only keep reciters that actually have at least one playable moshaf
  return (data.reciters || []).filter((r) => r.moshaf && r.moshaf.length);
}

export function buildAudioUrl(moshaf, chapterId) {
  const server = moshaf.server.endsWith('/') ? moshaf.server : `${moshaf.server}/`;
  return `${server}${String(chapterId).padStart(3, '0')}.mp3`;
}

export function moshafHasChapter(moshaf, chapterId) {
  return moshaf.surah_list.split(',').map(Number).includes(Number(chapterId));
}
