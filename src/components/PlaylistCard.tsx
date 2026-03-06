import { Link } from 'react-router-dom';
import { ListMusic } from 'lucide-react';
import { motion } from 'framer-motion';

interface PlaylistCardProps {
  id: string;
  title: string;
  description?: string;
  coverUrl?: string;
  songCount: number;
}

const PlaylistCard = ({ id, title, description, coverUrl, songCount }: PlaylistCardProps) => {
  return (
    <Link to={`/playlists/${id}`}>
      <motion.div
        whileHover={{ y: -4, scale: 1.02 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="glass-card rounded-xl overflow-hidden group cursor-pointer"
      >
        <div className="aspect-square relative overflow-hidden">
          {coverUrl ? (
            <img src={coverUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full gradient-primary opacity-40 flex items-center justify-center">
              <ListMusic size={48} className="text-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="font-heading font-semibold text-sm truncate">{title}</h3>
            <p className="text-xs text-foreground/60">{songCount} songs</p>
          </div>
        </div>
        {description && (
          <div className="p-3 pt-0">
            <p className="text-xs text-muted-foreground line-clamp-2 mt-2">{description}</p>
          </div>
        )}
      </motion.div>
    </Link>
  );
};

export default PlaylistCard;
