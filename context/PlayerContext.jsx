'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { buildAudioUrl, moshafHasChapter } from '@/lib/mp3quranApi';
import { storage } from '@/lib/storage';
import { useChapters } from '@/context/ChaptersContext';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const { getChapterById } = useChapters();
  const audioRef = useRef(null);
  const [track, setTrack] = useState(null); // { chapter, reciter, moshaf }
  const [queue, setQueue] = useState([]); // list of chapter ids for auto-advance
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    audioRef.current = new Audio();
    const audio = audioRef.current;
    const settings = storage.getSettings();
    audio.volume = 0.8;
    audio.playbackRate = settings.speed || 1;

    audio.addEventListener('play', () => setIsPlaying(true));
    audio.addEventListener('pause', () => setIsPlaying(false));
    audio.addEventListener('canplay', () => setIsLoading(false));
    audio.addEventListener('waiting', () => setIsLoading(true));
    audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime));
    audio.addEventListener('durationchange', () => setDuration(audio.duration || 0));
    audio.addEventListener('ended', () => handleEnded());

    return () => audio.pause();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleEnded() {
    setTrack((current) => {
      if (!current) return current;
      const settings = storage.getSettings();
      // repeat current surah N times before advancing (used by Hifz mode too)
      if (current.repeatsLeft > 1) {
        const nextRepeat = { ...current, repeatsLeft: current.repeatsLeft - 1 };
        play(current.chapter, current.reciter, current.moshaf, {
          repeatsLeft: nextRepeat.repeatsLeft
        });
        return nextRepeat;
      }
      if (settings.autoplayNextSurah) {
        setQueue((q) => {
          const idx = q.indexOf(current.chapter.id);
          const nextId = q[idx + 1];
          const nextChapter = nextId ? getChapterById(nextId) : null;
          if (nextChapter) {
            play(nextChapter, current.reciter, current.moshaf);
          }
          return q;
        });
      }
      return current;
    });
  }

  const play = useCallback((chapter, reciter, moshaf, opts = {}) => {
    if (!audioRef.current || !chapter || !reciter || !moshaf) return;
    if (!moshafHasChapter(moshaf, chapter.id)) {
      setError('هذه السورة غير متوفرة لهذا القارئ ضمن هذه الرواية');
      return;
    }
    setError(null);
    setIsLoading(true);
    const url = buildAudioUrl(moshaf, chapter.id);
    audioRef.current.src = url;
    audioRef.current.playbackRate = storage.getSettings().speed || 1;
    audioRef.current.play().catch(() => {});
    setTrack({ chapter, reciter, moshaf, repeatsLeft: opts.repeatsLeft || 1 });
    storage.pushRecentAudio({ chapterId: chapter.id, reciterId: reciter.id, moshafId: moshaf.id });
  }, []);

  const togglePlay = useCallback(() => {
    if (!audioRef.current || !audioRef.current.src) return;
    if (audioRef.current.paused) audioRef.current.play();
    else audioRef.current.pause();
  }, []);

  const seek = useCallback((ratio) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  }, []);

  const setVolume = useCallback((v) => {
    if (audioRef.current) audioRef.current.volume = v;
  }, []);

  const setSpeed = useCallback((rate) => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, []);

  const playNext = useCallback(() => {
    setTrack((current) => {
      if (!current) return current;
      setQueue((q) => {
        const idx = q.indexOf(current.chapter.id);
        const nextId = q[idx + 1] ?? Math.min(114, current.chapter.id + 1);
        const nextChapter = getChapterById(nextId);
        if (nextChapter) play(nextChapter, current.reciter, current.moshaf);
        return q;
      });
      return current;
    });
  }, [play, getChapterById]);

  const playPrev = useCallback(() => {
    setTrack((current) => {
      if (!current) return current;
      setQueue((q) => {
        const idx = q.indexOf(current.chapter.id);
        const prevId = q[idx - 1] ?? Math.max(1, current.chapter.id - 1);
        const prevChapter = getChapterById(prevId);
        if (prevChapter) play(prevChapter, current.reciter, current.moshaf);
        return q;
      });
      return current;
    });
  }, [play, getChapterById]);

  return (
    <PlayerContext.Provider
      value={{
        track,
        isPlaying,
        isLoading,
        currentTime,
        duration,
        error,
        queue,
        setQueue,
        play,
        togglePlay,
        seek,
        setVolume,
        setSpeed,
        playNext,
        playPrev
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
}
