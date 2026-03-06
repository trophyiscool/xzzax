import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Upload, ListMusic, User } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { path: '/', label: 'Library', icon: Home },
  { path: '/search', label: 'Search', icon: Search },
  { path: '/upload', label: 'Upload', icon: Upload },
  { path: '/playlists', label: 'Playlists', icon: ListMusic },
  { path: '/profile', label: 'Profile', icon: User },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-30 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-heading font-bold text-gradient">SoundWave</h1>
      </div>
      
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link key={item.path} to={item.path}>
              <motion.div
                whileHover={{ x: 4 }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 w-1 h-6 rounded-r-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">© 2026 SoundWave</p>
      </div>
    </aside>
  );
};

export default Sidebar;
