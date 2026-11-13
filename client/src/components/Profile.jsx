import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Grid, Film, Music } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PostCard from './PostCard';

export default function Profile({ targetUsername, onAuthRequired }) {
  const { user: currentUser } = useAuth();
  const username = targetUsername || currentUser?.username;
  const [profile, setProfile] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('grid'); // grid, reels, music
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    try {
      const res = await axios.get(`/api/users/${username}`);
      setProfile(res.data);
      if (currentUser && res.data.followers) {
        setIsFollowing(res.data.followers.includes(currentUser.id));
      }
    } catch (err) {
      console.error('Failed to fetch profile', err);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUser) {
      onAuthRequired();
      return;
    }
    try {
      const res = await axios.post(`/api/users/${profile.id}/follow`);
      setIsFollowing(res.data.following);
      fetchProfile();
    } catch (err) {
      console.error('Follow toggle failed', err);
    }
  };

  if (!profile) {
    return <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading profile...</div>;
  }

  const isMe = currentUser?.id === profile.id;
  const filteredPosts = profile.posts?.filter(p => {
    if (activeSubTab === 'music') return p.type === 'song';
    if (activeSubTab === 'reels') return p.type === 'video';
    return true;
  }) || [];

  return (
    <div>
      {/* Profile Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        padding: '24px 0 32px',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <img 
          src={profile.avatar} 
          alt={profile.name} 
          className="user-avatar" 
          style={{ width: '96px', height: '96px', border: '3px solid var(--primary)' }} 
        />

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>{profile.name}</h2>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>@{profile.username}</span>

            {!isMe ? (
              <button 
                onClick={handleFollowToggle}
                className="create-btn"
                style={{
                  padding: '6px 16px',
                  fontSize: '13px',
                  backgroundColor: isFollowing ? 'var(--bg-card)' : 'var(--primary)',
                  border: isFollowing ? '1px solid var(--border-color)' : 'none'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '24px', margin: '12px 0', fontSize: '14px' }}>
            <span><strong>{profile.posts?.length || 0}</strong> posts</span>
            <span><strong>{profile.followers?.length || 0}</strong> followers</span>
            <span><strong>{profile.following?.length || 0}</strong> following</span>
          </div>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            {profile.bio || 'Living life on Pixora.'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`nav-item ${activeSubTab === 'grid' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('grid')}
        >
          <Grid size={18} />
          <span>All Posts</span>
        </button>

        <button 
          className={`nav-item ${activeSubTab === 'reels' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('reels')}
        >
          <Film size={18} />
          <span>Videos / Reels</span>
        </button>

        <button 
          className={`nav-item ${activeSubTab === 'music' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('music')}
        >
          <Music size={18} />
          <span>Music Tracks</span>
        </button>
      </div>

      {/* Posts Feed for Profile */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            No {activeSubTab} posts yet.
          </div>
        ) : (
          filteredPosts.map(post => (
            <PostCard 
              key={post.id} 
              post={{ ...post, author: profile }} 
              onAuthRequired={onAuthRequired} 
            />
          ))
        )}
      </div>
    </div>
  );
}
