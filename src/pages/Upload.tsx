import { useState, useRef } from 'react';
import { Upload as UploadIcon, Music, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Upload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    if (!f.type.startsWith('audio/')) {
      toast.error('Please select an audio file');
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!file || !title.trim() || !artist.trim()) {
      toast.error('Please fill in title and artist');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('music')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('songs')
        .insert({
          title: title.trim(),
          artist: artist.trim(),
          album: album.trim() || null,
          file_url: publicUrl,
          duration: 0,
        });

      if (dbError) throw dbError;

      toast.success('Song uploaded successfully!');
      setFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
    } catch (err: any) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-heading font-bold mb-2">Upload Music</h1>
        <p className="text-muted-foreground mb-8">Share your music with the community</p>

        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); }}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <Music size={24} className="text-primary" />
              <span className="font-medium">{file.name}</span>
              <button onClick={e => { e.stopPropagation(); setFile(null); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <UploadIcon size={40} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Drop an audio file here or click to browse</p>
              <p className="text-xs text-muted-foreground mt-2">MP3, WAV, FLAC, AAC supported</p>
            </>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">Title *</label>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Song title" className="bg-card" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Artist *</label>
            <Input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist name" className="bg-card" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">Album</label>
            <Input value={album} onChange={e => setAlbum(e.target.value)} placeholder="Album name (optional)" className="bg-card" />
          </div>

          <Button
            onClick={handleUpload}
            disabled={uploading || !file || !title.trim() || !artist.trim()}
            className="w-full gradient-primary border-0 text-primary-foreground font-semibold"
          >
            {uploading ? 'Uploading...' : 'Upload Song'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Upload;
