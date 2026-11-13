import React, { useState } from 'react';
import StoryBar from './StoryBar';
import PostCard from './PostCard';
import { Image, Video, Music, Sparkles } from 'lucide-react';

export default function Feed({ posts, onAuthRequired, loading, onRefresh }) {
  const [filter, setFilter] = useState('all'); // all, photo, video, song

  const filteredPosts = posts.filter(post => {
    if (filter === 'all') return true;
    return post.type === filter;
  });

  return (
    <div className="feed-container">
      <StoryBar />

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 0',
        overflowX: 'auto'
      }}>
        <button 
          className={`nav-item ${filter === 'all' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setFilter('all')}
        >
          <Sparkles size={16} />
          <span>For You</span>
        </button>

        <button 
          className={`nav-item ${filter === 'photo' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setFilter('photo')}
        >
          <Image size={16} />
          <span>Photos</span>
        </button>

        <button 
          className={`nav-item ${filter === 'video' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setFilter('video')}
        >
          <Video size={16} />
          <span>Videos</span>
        </button>

        <button 
          className={`nav-item ${filter === 'song' ? 'active' : ''}`}
          style={{ padding: '8px 16px', fontSize: '13px' }}
          onClick={() => setFilter('song')}
        >
          <Music size={16} />
          <span>Music Tracks</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Loading Pixora Feed...
        </div>
      ) : filteredPosts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <h3>No posts found in this category</h3>
          <p style={{ marginTop: '8px' }}>Be the first to share something!</p>
        </div>
      ) : (
        filteredPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            onAuthRequired={onAuthRequired} 
          />
        ))
      )}
    </div>
  );
}
