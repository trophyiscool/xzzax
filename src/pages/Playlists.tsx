import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import PlaylistCard from '@/components/PlaylistCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Playlist {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  song_count: number;
}

const Playlists = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_songs(count)')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setPlaylists(data.map((p: any) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        cover_url: p.cover_url,
        song_count: p.playlist_songs?.[0]?.count || 0,
      })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchPlaylists(); }, []);

  const createPlaylist = async () => {
    if (!newTitle.trim()) return;
    const { error } = await supabase.from('playlists').insert({
      title: newTitle.trim(),
      description: newDesc.trim() || null,
    });
    if (error) { toast.error(error.message); return; }
    toast.success('Playlist created!');
    setNewTitle('');
    setNewDesc('');
    setOpen(false);
    fetchPlaylists();
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-heading font-bold mb-2">Playlists</h1>
          <p className="text-muted-foreground">Organize your favorite music</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary border-0 text-primary-foreground gap-2">
              <Plus size={18} /> New Playlist
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-heading">Create Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Playlist name" className="bg-muted" />
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Description (optional)" className="bg-muted resize-none" rows={3} />
              <Button onClick={createPlaylist} disabled={!newTitle.trim()} className="w-full gradient-primary border-0 text-primary-foreground">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-square bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg">No playlists yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map(p => (
            <PlaylistCard key={p.id} id={p.id} title={p.title} description={p.description || undefined} coverUrl={p.cover_url || undefined} songCount={p.song_count} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Playlists;
