import React from 'react';
import { Home, Film, Music, PlusSquare, User, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BottomNav({ activeTab, setActiveTab, onOpenCreate, onOpenAuth }) {
  const { user } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <button 
        className={`mobile-nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
        onClick={() => setActiveTab('feed')}
      >
        <Home size={22} />
        <span>Home</span>
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'reels' ? 'active' : ''}`}
        onClick={() => setActiveTab('reels')}
      >
        <Film size={22} />
        <span>Reels</span>
      </button>

      <button 
        className="mobile-nav-btn add-btn"
        onClick={() => user ? onOpenCreate() : onOpenAuth()}
      >
        <PlusSquare size={24} />
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'music' ? 'active' : ''}`}
        onClick={() => setActiveTab('music')}
      >
        <Music size={22} />
        <span>Audio</span>
      </button>

      <button 
        className={`mobile-nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
        onClick={() => user ? setActiveTab('profile') : onOpenAuth()}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="User" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
        ) : (
          <User size={22} />
        )}
        <span>Profile</span>
      </button>
    </nav>
  );
}
