import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SongCard from '@/components/SongCard';
import { Song } from '@/contexts/PlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const Index = () => {
  const [songs, setSongs] = useState<Song[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setSongs(data.map((s: any) => ({
          id: s.id,
          title: s.title,
          artist: s.artist,
          album: s.album,
          duration: s.duration || 0,
          cover_url: s.cover_url,
          file_url: s.file_url,
        })));
      }
      setLoading(false);
    };
    fetchSongs();
  }, []);

  const filtered = songs.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.artist.toLowerCase().includes(search.toLowerCase()) ||
    (s.album && s.album.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-heading font-bold mb-2">Music Library</h1>
        <p className="text-muted-foreground">Discover and play music from the community</p>
      </motion.div>

      <div className="relative mb-6 max-w-md">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by song, artist, or album..."
          className="pl-10 bg-card border-border"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-lg animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">
            {songs.length === 0 ? 'No songs yet. Be the first to upload!' : 'No songs match your search.'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {filtered.map(song => (
            <SongCard key={song.id} song={song} queue={filtered} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Index;
