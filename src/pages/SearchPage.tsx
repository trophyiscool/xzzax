import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SongCard from '@/components/SongCard';
import { Song } from '@/contexts/PlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setSearched(true);

    const { data } = await supabase
      .from('songs')
      .select('*')
      .or(`title.ilike.%${q}%,artist.ilike.%${q}%,album.ilike.%${q}%`)
      .limit(50);

    if (data) {
      setResults(data.map((s: any) => ({
        id: s.id, title: s.title, artist: s.artist, album: s.album,
        duration: s.duration || 0, cover_url: s.cover_url, file_url: s.file_url,
      })));
    }
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-heading font-bold mb-6">Search</h1>
        <div className="relative max-w-lg mb-8">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="What do you want to listen to?"
            className="pl-12 py-6 text-lg bg-card border-border rounded-xl"
            autoFocus
          />
        </div>

        {!searched ? (
          <div className="text-center py-20">
            <Search size={48} className="mx-auto mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">Search for songs, artists, or albums</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-center text-muted-foreground py-20">No results found for "{query}"</p>
        ) : (
          <div className="space-y-1">
            {results.map(song => (
              <SongCard key={song.id} song={song} queue={results} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default SearchPage;
