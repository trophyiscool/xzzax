-- Songs table
CREATE TABLE public.songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT,
  duration INTEGER DEFAULT 0,
  cover_url TEXT,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Songs are viewable by everyone" ON public.songs FOR SELECT USING (true);
CREATE POLICY "Anyone can insert songs" ON public.songs FOR INSERT WITH CHECK (true);

-- Playlists table
CREATE TABLE public.playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlists are viewable by everyone" ON public.playlists FOR SELECT USING (true);
CREATE POLICY "Anyone can create playlists" ON public.playlists FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update playlists" ON public.playlists FOR UPDATE USING (true);

-- Playlist songs junction table
CREATE TABLE public.playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.playlists(id) ON DELETE CASCADE,
  song_id UUID NOT NULL REFERENCES public.songs(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(playlist_id, song_id)
);

ALTER TABLE public.playlist_songs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Playlist songs viewable by everyone" ON public.playlist_songs FOR SELECT USING (true);
CREATE POLICY "Anyone can add songs to playlists" ON public.playlist_songs FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can remove songs from playlists" ON public.playlist_songs FOR DELETE USING (true);

-- Music storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('music', 'music', true);

CREATE POLICY "Music files are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'music');
CREATE POLICY "Anyone can upload music" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'music');