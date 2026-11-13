import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Film, MessageSquare } from 'lucide-react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Feed from './components/Feed';
import ReelsViewer from './components/ReelsViewer';
import DirectMessages from './components/DirectMessages';
import Profile from './components/Profile';
import CreatePostModal from './components/CreatePostModal';
import AuthModal from './components/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed'); // feed, reels, music, messages, profile
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await axios.get('/api/posts');
      setPosts(res.data);
    } catch (err) {
      console.error('Failed to load posts', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile Top Header */}
        <header className="mobile-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '18px' }} onClick={() => setActiveTab('feed')}>
            <div className="brand-icon" style={{ width: '28px', height: '28px' }}>
              <Film size={16} />
            </div>
            <span>Pixora</span>
          </div>
          <button 
            onClick={() => setActiveTab('messages')}
            style={{ color: 'var(--text-primary)' }}
          >
            <MessageSquare size={22} />
          </button>
        </header>

        {/* Main Content Area */}
        <main className="main-content">
          {activeTab === 'feed' && (
            <Feed 
              posts={posts} 
              loading={loading}
              onAuthRequired={() => setShowAuthModal(true)}
              onRefresh={fetchPosts}
            />
          )}

          {activeTab === 'reels' && (
            <ReelsViewer 
              posts={posts} 
              onAuthRequired={() => setShowAuthModal(true)} 
            />
          )}

          {activeTab === 'music' && (
            <Feed 
              posts={posts.filter(p => p.type === 'song')}
              loading={loading}
              onAuthRequired={() => setShowAuthModal(true)}
              onRefresh={fetchPosts}
            />
          )}

          {activeTab === 'messages' && (
            <DirectMessages />
          )}

          {activeTab === 'profile' && (
            <Profile onAuthRequired={() => setShowAuthModal(true)} />
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onOpenCreate={() => setShowCreateModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
      />

      {showCreateModal && (
        <CreatePostModal 
          onClose={() => setShowCreateModal(false)}
          onPostCreated={fetchPosts}
        />
      )}

      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
}
