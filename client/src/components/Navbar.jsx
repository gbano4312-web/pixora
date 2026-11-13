import React from 'react';
import { Home, Film, Music, MessageSquare, PlusSquare, User, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenCreate, onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div>
        <div className="brand-logo" onClick={() => setActiveTab('feed')}>
          <div className="brand-icon">
            <Film size={18} />
          </div>
          <span>Pixora</span>
        </div>

        <nav className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'feed' ? 'active' : ''}`}
            onClick={() => setActiveTab('feed')}
          >
            <Home size={20} />
            <span>Feed</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'reels' ? 'active' : ''}`}
            onClick={() => setActiveTab('reels')}
          >
            <Film size={20} />
            <span>Reels</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'music' ? 'active' : ''}`}
            onClick={() => setActiveTab('music')}
          >
            <Music size={20} />
            <span>Songs & Audio</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => user ? setActiveTab('messages') : onOpenAuth()}
          >
            <MessageSquare size={20} />
            <span>Messages</span>
          </button>

          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => user ? setActiveTab('profile') : onOpenAuth()}
          >
            <User size={20} />
            <span>Profile</span>
          </button>

          <button 
            className="create-btn"
            onClick={() => user ? onOpenCreate() : onOpenAuth()}
          >
            <PlusSquare size={18} />
            <span>New Post</span>
          </button>
        </nav>
      </div>

      <div>
        {user ? (
          <div className="user-profile-summary">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <div style={{ flex: 1, minWidth: 0 }} onClick={() => setActiveTab('profile')}>
              <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                @{user.username}
              </div>
            </div>
            <button 
              onClick={logout} 
              title="Logout" 
              style={{ color: 'var(--text-muted)', padding: '6px' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <button 
            className="nav-item" 
            style={{ width: '100%', justifyContent: 'center', backgroundColor: 'var(--bg-card)' }}
            onClick={onOpenAuth}
          >
            <LogIn size={18} />
            <span>Log In / Sign Up</span>
          </button>
        )}
      </div>
    </aside>
  );
}
