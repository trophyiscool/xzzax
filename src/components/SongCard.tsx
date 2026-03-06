import { Play, Pause, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayer, Song } from '@/contexts/PlayerContext';

interface SongCardProps {
  song: Song;
  queue?: Song[];
  index?: number;
  onAddToPlaylist?: (song: Song) => void;
}

const SongCard = ({ song, queue, onAddToPlaylist }: SongCardProps) => {
  const { currentSong, isPlaying, play, togglePlay } = usePlayer();
  const isCurrentSong = currentSong?.id === song.id;

  const handlePlay = () => {
    if (isCurrentSong) {
      togglePlay();
    } else {
      play(song, queue);
    }
  };

  const formatDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      whileHover={{ backgroundColor: 'hsl(240 10% 12%)' }}
      className={`flex items-center gap-4 px-4 py-3 rounded-lg group cursor-pointer transition-colors ${
        isCurrentSong ? 'bg-primary/5' : ''
      }`}
      onClick={handlePlay}
    >
      <div className="relative w-10 h-10 rounded-md bg-muted flex-shrink-0 overflow-hidden">
        {song.cover_url ? (
          <img src={song.cover_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full gradient-primary opacity-50" />
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          {isCurrentSong && isPlaying ? <Pause size={16} className="text-primary-foreground" /> : <Play size={16} className="text-primary-foreground ml-0.5" />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isCurrentSong ? 'text-primary' : ''}`}>{song.title}</p>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>

      <span className="text-xs text-muted-foreground">{formatDuration(song.duration)}</span>

      {onAddToPlaylist && (
        <button
          onClick={(e) => { e.stopPropagation(); onAddToPlaylist(song); }}
          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-all"
        >
          <Plus size={16} />
        </button>
      )}
    </motion.div>
  );
};

export default SongCard;
