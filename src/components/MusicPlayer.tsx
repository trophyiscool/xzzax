import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { Slider } from '@/components/ui/slider';

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const MusicPlayer = () => {
  const { currentSong, isPlaying, togglePlay, next, previous, volume, setVolume, currentTime, duration, seek } = usePlayer();

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 h-20 z-50 border-t border-border" style={{ background: 'hsl(var(--player-background))' }}>
      <div className="flex items-center h-full px-4 gap-4">
        {/* Song info */}
        <div className="flex items-center gap-3 w-64 min-w-0">
          <div className="w-12 h-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
            {currentSong.cover_url ? (
              <img src={currentSong.cover_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary opacity-60" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{currentSong.title}</p>
            <p className="text-xs text-muted-foreground truncate">{currentSong.artist}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex-1 flex flex-col items-center gap-1 max-w-xl">
          <div className="flex items-center gap-4">
            <button onClick={previous} className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipBack size={18} />
            </button>
            <button
              onClick={togglePlay}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause size={16} className="text-primary-foreground" /> : <Play size={16} className="text-primary-foreground ml-0.5" />}
            </button>
            <button onClick={next} className="text-muted-foreground hover:text-foreground transition-colors">
              <SkipForward size={18} />
            </button>
          </div>
          <div className="flex items-center gap-2 w-full">
            <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={([v]) => seek(v)}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2 w-36">
          <button onClick={() => setVolume(volume === 0 ? 0.7 : 0)} className="text-muted-foreground hover:text-foreground transition-colors">
            {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <Slider
            value={[volume * 100]}
            max={100}
            step={1}
            onValueChange={([v]) => setVolume(v / 100)}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
