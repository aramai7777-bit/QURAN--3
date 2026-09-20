# Quran 3 — القرآن الكريم

A Next.js (App Router) rebuild of the "Quran Recitations" single-page site,
restructured into a real multi-page project so it can support per-surah SEO,
a proper PWA shell, dark/light mode, settings, bookmarks, and a Hifz
(memorization) mode — while keeping the same visual identity, the same data
sources, and the same "Eng: Anas" credit.

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On vercel.com, click **New Project** → import that repository.
3. Framework preset: Vercel auto-detects **Next.js** — no extra config needed.
4. Deploy. No environment variables are required (both data sources used
   here are public, keyless APIs).

---

## Data sources (unchanged from the previous version, verified working)

- **Quran text** — [Quran.com API v4](https://api.quran.com/api/v4): chapter
  metadata and Uthmani verse text. Read-only, public, no key required.
- **Reciters & audio** — [mp3quran.net API](https://www.mp3quran.net/api/v3):
  chosen specifically because each reciter's own audio server is returned
  directly (no separate ID to cross-reference), it has a very large roster
  (al-Husary, al-Tablawi, al-Minshawi, al-Afasy, al-Dosari, al-Luhaidan,
  al-Sudais, and many more), and it lists every "moshaf" (riwayah/style) a
  reciter actually recorded so the UI never offers a style that doesn't
  exist. No key required.

Neither source was silently swapped without reason — see `lib/quranApi.js`
and `lib/mp3quranApi.js` for the reasoning in code comments.

---

## Features added (new in this Next.js version)

- Real per-surah **routes** (`/surah/2`) with **dynamic SEO metadata**
  (`generateMetadata`) — each surah gets its own page title/description.
- **Dark and light mode**, toggleable from the navbar, persisted locally.
- Full **Settings page**: font size, line spacing, default reciter,
  playback speed, autoplay-next-surah, default repeat count.
- **Hifz (memorization) mode** inside the surah reader: pick an ayah range,
  repeat count, hide/show text, and a simple progress bar.
- **Bookmarks page** with personal notes per ayah and a "jump to verse" link.
- **Continue Reading** and **Recently Played** cards on the home page.
- **Daily Verse** — deterministic (same verse for everyone on a given date),
  pulled live from Quran.com, never AI-generated.
- Copy / share buttons per ayah (uses the Web Share API where available).
- Reciter **favorites** and **recently played reciters**.
- Global **search** (surahs + reciters) as a modal, reachable from anywhere.
- Basic **PWA**: manifest + a service worker that caches only the UI shell
  (never audio, out of respect for reciters' recording rights).
- Friendly loading skeletons and retry-capable error states everywhere data
  is fetched, instead of blank/broken screens.

## Features carried over unchanged

- The visual identity (navy/green + gold, Amiri Quran + Aref Ruqaa fonts).
- The sticky bottom audio player, now global via React Context so it keeps
  playing while you navigate between pages.
- The AI Quran Assistant's behavior: it never invents verses — it only
  parses intent locally and fetches real text from Quran.com.
- "Eng: Anas" / "anas mohamed" credit in the navbar and footer.

## Known limitations / what's left to verify

- **This code was written without internet access in the authoring
  environment, so `npm install` / `npm run build` could not be run here to
  confirm a clean build.** Please run `npm install && npm run dev` after
  downloading and report back anything that errors — happy to fix it.
- PWA icons are a simple original SVG placeholder (`public/icons/icon.svg`);
  swap in real PNG icons (192×192, 512×512) if you want a more polished
  home-screen icon on iOS/Android.
- The AI assistant is intentionally rule-based (keyword/topic matching), not
  an LLM — see the `AI_INTEGRATION_NOTE` comment in
  `app/assistant/AssistantClient.jsx` for exactly how to wire up a real LLM
  behind a server-side Route Handler later without breaking the
  "never invent Quran verses" rule.
- No automated tests were added.

## Project structure

```
app/
  layout.js, globals.css, shell.css        — root shell, providers, design tokens
  page.js, HomeClient.jsx                  — home page
  surah/page.js, SurahIndexClient.jsx      — browse all surahs
  surah/[id]/page.js, SurahReaderClient.jsx— read a surah + Hifz mode
  reciters/page.js, RecitersIndexClient.jsx— browse reciters
  reciters/[id]/page.js, ReciterProfileClient.jsx — reciter profile
  bookmarks/page.js, BookmarksClient.jsx   — saved ayahs + notes
  settings/page.js, SettingsClient.jsx     — preferences
  assistant/page.js, AssistantClient.jsx   — AI Quran assistant
components/                                — shared, reusable UI
context/                                   — Theme, Settings, Chapters, Player
lib/                                       — API wrappers + localStorage helpers
public/                                    — manifest.json, sw.js, icon
```
