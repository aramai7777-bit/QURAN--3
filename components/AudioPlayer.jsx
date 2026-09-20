'use client';

import { usePlayer } from '@/context/PlayerContext';
import { useSettings } from '@/context/SettingsContext';

function fmt(sec) {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const { track, isPlaying, isLoading, currentTime, duration, error, togglePlay, seek, setVolume, setSpeed, playNext, playPrev } = usePlayer();
  const { settings, updateSettings } = useSettings();

  if (!track) return null;

  const pct = duration ? (currentTime / duration) * 100 : 0;

  function handleSeek(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  }

  function handleSpeed(e) {
    const rate = parseFloat(e.target.value);
    setSpeed(rate);
    updateSettings({ speed: rate });
  }

  return (
    <div className={`player open ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`} role="region" aria-label="مشغل الصوت">
      <div className="player-progress-track" onClick={handleSeek}>
        <div className="player-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="player-inner">
        <div className="player-meta">
          <div className="player-art">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <div className="player-text">
            <div className="surah-name">{track.chapter.name_arabic} — {track.chapter.name_simple}</div>
            <div className="reciter-name">{error || track.reciter.name}</div>
          </div>
        </div>

        <div className="player-controls">
          <button className="icon-btn" aria-label="السورة السابقة" onClick={playPrev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 20L9 12l10-8v16zM5 19V5" /></svg>
          </button>
          <button className="play-pause" aria-label="تشغيل/إيقاف" onClick={togglePlay}>
            {isLoading ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
                <path d="M12 2v4M12 18v4M4.9 4.9l2.9 2.9M16.2 16.2l2.9 2.9M2 12h4M18 12h4M4.9 19.1l2.9-2.9M16.2 7.8l2.9-2.9" />
              </svg>
            ) : isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
            )}
          </button>
          <button className="icon-btn" aria-label="السورة التالية" onClick={playNext}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4l10 8-10 8V4zM19 5v14" /></svg>
          </button>
        </div>

        <div className="time-row">
          <span>{fmt(currentTime)}</span>
          <div className="player-progress-track thin" onClick={handleSeek}>
            <div className="player-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <span>{fmt(duration)}</span>
        </div>

        <div className="player-extra">
          <select className="speed-select" value={settings.speed} onChange={handleSpeed} aria-label="سرعة التشغيل">
            {[0.75, 1, 1.25, 1.5, 2].map((r) => (
              <option key={r} value={r}>{r}x</option>
            ))}
          </select>
          <div className="volume-row">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19 8a5 5 0 010 8" />
            </svg>
            <input type="range" min="0" max="100" defaultValue="80" onChange={(e) => setVolume(e.target.value / 100)} aria-label="مستوى الصوت" />
          </div>
        </div>
      </div>
    </div>
  );
}
