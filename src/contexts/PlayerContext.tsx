import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  duration: number;
  cover_url?: string;
  file_url: string;
}

interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  queue: Song[];
  queueIndex: number;
}

interface PlayerContextType extends PlayerState {
  play: (song: Song, queue?: Song[]) => void;
  togglePlay: () => void;
  pause: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
}

const PlayerContext = createContext<PlayerContextType | null>(null);

export const usePlayer = () => {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer must be used within PlayerProvider');
  return ctx;
};

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    volume: 0.7,
    currentTime: 0,
    duration: 0,
    queue: [],
    queueIndex: -1,
  });

  useEffect(() => {
    audioRef.current = new Audio();
    const audio = audioRef.current;
    
    audio.addEventListener('timeupdate', () => {
      setState(s => ({ ...s, currentTime: audio.currentTime }));
    });
    audio.addEventListener('loadedmetadata', () => {
      setState(s => ({ ...s, duration: audio.duration }));
    });
    audio.addEventListener('ended', () => {
      setState(s => {
        if (s.queueIndex < s.queue.length - 1) {
          const nextIndex = s.queueIndex + 1;
          const nextSong = s.queue[nextIndex];
          audio.src = nextSong.file_url;
          audio.play();
          return { ...s, currentSong: nextSong, queueIndex: nextIndex, isPlaying: true };
        }
        return { ...s, isPlaying: false };
      });
    });

    return () => { audio.pause(); audio.src = ''; };
  }, []);

  const play = useCallback((song: Song, queue?: Song[]) => {
    const audio = audioRef.current!;
    const newQueue = queue || [song];
    const idx = newQueue.findIndex(s => s.id === song.id);
    audio.src = song.file_url;
    audio.volume = state.volume;
    audio.play();
    setState(s => ({ ...s, currentSong: song, isPlaying: true, queue: newQueue, queueIndex: idx >= 0 ? idx : 0 }));
  }, [state.volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current!;
    if (state.isPlaying) { audio.pause(); } else { audio.play(); }
    setState(s => ({ ...s, isPlaying: !s.isPlaying }));
  }, [state.isPlaying]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
    setState(s => ({ ...s, isPlaying: false }));
  }, []);

  const next = useCallback(() => {
    if (state.queueIndex < state.queue.length - 1) {
      const nextSong = state.queue[state.queueIndex + 1];
      play(nextSong, state.queue);
    }
  }, [state.queueIndex, state.queue, play]);

  const previous = useCallback(() => {
    if (state.queueIndex > 0) {
      const prevSong = state.queue[state.queueIndex - 1];
      play(prevSong, state.queue);
    }
  }, [state.queueIndex, state.queue, play]);

  const setVolume = useCallback((v: number) => {
    if (audioRef.current) audioRef.current.volume = v;
    setState(s => ({ ...s, volume: v }));
  }, []);

  const seek = useCallback((time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
    setState(s => ({ ...s, currentTime: time }));
  }, []);

  return (
    <PlayerContext.Provider value={{ ...state, play, togglePlay, pause, next, previous, setVolume, seek }}>
      {children}
    </PlayerContext.Provider>
  );
};
