import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, ListMusic, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import SongCard from '@/components/SongCard';
import { Song, usePlayer } from '@/contexts/PlayerContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const PlaylistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { play } = usePlayer();
  const [playlist, setPlaylist] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetch = async () => {
      const { data: pl } = await supabase.from('playlists').select('*').eq('id', id).single();
      setPlaylist(pl);

      const { data: ps } = await supabase
        .from('playlist_songs')
        .select('*, songs(*)')
        .eq('playlist_id', id)
        .order('position');

      if (ps) {
        setSongs(ps.map((p: any) => ({
          id: p.songs.id,
          title: p.songs.title,
          artist: p.songs.artist,
          album: p.songs.album,
          duration: p.songs.duration || 0,
          cover_url: p.songs.cover_url,
          file_url: p.songs.file_url,
        })));
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  const openAddDialog = async () => {
    const { data } = await supabase.from('songs').select('*').order('title');
    if (data) {
      setAllSongs(data.map((s: any) => ({
        id: s.id, title: s.title, artist: s.artist, album: s.album,
        duration: s.duration || 0, cover_url: s.cover_url, file_url: s.file_url,
      })));
    }
    setAddOpen(true);
  };

  const addSong = async (song: Song) => {
    const { error } = await supabase.from('playlist_songs').insert({
      playlist_id: id,
      song_id: song.id,
      position: songs.length,
    });
    if (error) {
      if (error.code === '23505') toast.error('Song already in playlist');
      else toast.error(error.message);
      return;
    }
    setSongs(prev => [...prev, song]);
    toast.success(`Added "${song.title}"`);
  };

  const filteredAll = allSongs.filter(s =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8"><div className="h-48 bg-card rounded-xl animate-pulse" /></div>;

  return (
    <div className="p-8">
      <button onClick={() => navigate('/playlists')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6 mb-8">
        <div className="w-48 h-48 rounded-xl bg-muted overflow-hidden flex-shrink-0">
          {playlist?.cover_url ? (
            <img src={playlist.cover_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full gradient-primary opacity-40 flex items-center justify-center">
              <ListMusic size={48} className="text-foreground/30" />
            </div>
          )}
        </div>
        <div className="flex flex-col justify-end">
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Playlist</p>
          <h1 className="text-4xl font-heading font-bold mb-2">{playlist?.title}</h1>
          {playlist?.description && <p className="text-muted-foreground mb-4">{playlist.description}</p>}
          <div className="flex gap-3">
            <Button
              onClick={() => songs.length > 0 && play(songs[0], songs)}
              disabled={songs.length === 0}
              className="gradient-primary border-0 text-primary-foreground gap-2"
            >
              <Play size={16} /> Play All
            </Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2" onClick={openAddDialog}>
                  <Plus size={16} /> Add Songs
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle className="font-heading">Add Songs</DialogTitle>
                </DialogHeader>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search songs..." className="pl-9 bg-muted" />
                </div>
                <div className="overflow-y-auto flex-1 space-y-1 scrollbar-hide">
                  {filteredAll.map(s => (
                    <SongCard key={s.id} song={s} onAddToPlaylist={addSong} />
                  ))}
                  {filteredAll.length === 0 && <p className="text-center text-muted-foreground py-8">No songs found</p>}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </motion.div>

      {songs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No songs in this playlist yet</p>
        </div>
      ) : (
        <div className="space-y-1">
          {songs.map(song => (
            <SongCard key={song.id} song={song} queue={songs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaylistDetail;
