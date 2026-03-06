import { useState, useEffect } from 'react';
import { User, Edit2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PlaylistCard from '@/components/PlaylistCard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('Music Lover');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [playlists, setPlaylists] = useState<any[]>([]);

  useEffect(() => {
    // Load profile from localStorage for now (until auth is set up)
    const saved = localStorage.getItem('bloodslp_profile');
    if (saved) {
      const p = JSON.parse(saved);
      setDisplayName(p.displayName || 'Music Lover');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
    }

    const fetchPlaylists = async () => {
      const { data } = await supabase
        .from('playlists')
        .select('*, playlist_songs(count)')
        .order('created_at', { ascending: false });
      if (data) {
        setPlaylists(data.map((p: any) => ({
          id: p.id,
          title: p.title,
          description: p.description,
          cover_url: p.cover_url,
          song_count: p.playlist_songs?.[0]?.count || 0,
        })));
      }
    };
    fetchPlaylists();
  }, []);

  const saveProfile = () => {
    localStorage.setItem('bloodslp_profile', JSON.stringify({ displayName, bio, avatarUrl }));
    setEditing(false);
    toast.success('Profile saved!');
  };

  return (
    <div className="p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-6 mb-10">
          <div className="w-32 h-32 rounded-full bg-muted overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full gradient-primary opacity-40 flex items-center justify-center">
                <User size={40} className="text-foreground/40" />
              </div>
            )}
          </div>
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <Input value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Display name" className="bg-card text-xl font-heading font-bold" />
                <Textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a bio..." className="bg-card resize-none" rows={3} />
                <Input value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} placeholder="Avatar URL" className="bg-card" />
                <Button onClick={saveProfile} className="gradient-primary border-0 text-primary-foreground gap-2">
                  <Save size={16} /> Save
                </Button>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-heading font-bold mb-1">{displayName}</h1>
                <p className="text-muted-foreground mb-4">{bio || 'No bio yet'}</p>
                <Button variant="outline" onClick={() => setEditing(true)} className="gap-2">
                  <Edit2 size={16} /> Edit Profile
                </Button>
              </>
            )}
          </div>
        </div>

        <h2 className="text-2xl font-heading font-semibold mb-4">Your Playlists</h2>
        {playlists.length === 0 ? (
          <p className="text-muted-foreground">No playlists yet</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {playlists.map(p => (
              <PlaylistCard key={p.id} id={p.id} title={p.title} description={p.description || undefined} coverUrl={p.cover_url || undefined} songCount={p.song_count} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
