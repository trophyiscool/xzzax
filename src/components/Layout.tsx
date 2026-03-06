import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MusicPlayer from './MusicPlayer';
import { usePlayer } from '@/contexts/PlayerContext';

const Layout = () => {
  const { currentSong } = usePlayer();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={`ml-64 ${currentSong ? 'pb-20' : ''}`}>
        <Outlet />
      </main>
      <MusicPlayer />
    </div>
  );
};

export default Layout;
