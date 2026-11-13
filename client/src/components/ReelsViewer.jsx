import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ReelsViewer({ posts, onAuthRequired }) {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);

  const videoPosts = posts.filter(p => p.type === 'video');

  if (videoPosts.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
        <h3>No Reels Found</h3>
        <p style={{ marginTop: '8px' }}>Be the first creator to upload a video Reel on Pixora!</p>
      </div>
    );
  }

  return (
    <div className="reels-container">
      {videoPosts.map(reel => (
        <div key={reel.id} className="reel-card">
          <video 
            src={reel.mediaUrl}
            className="reel-video"
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />

          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 10 }}>
            <button 
              onClick={() => setIsMuted(!isMuted)}
              style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px', borderRadius: '50%' }}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          <div className="reel-overlay">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={reel.author.avatar} alt={reel.author.name} className="user-avatar" style={{ width: '36px', height: '36px' }} />
              <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>@{reel.author.username}</span>
            </div>

            <p style={{ fontSize: '14px', color: '#f1f5f9', marginTop: '4px' }}>{reel.caption}</p>

            <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
              <button 
                onClick={() => user ? null : onAuthRequired()}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}
              >
                <Heart size={20} />
                <span>{reel.likes?.length || 0}</span>
              </button>

              <button style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#fff' }}>
                <MessageCircle size={20} />
                <span>{reel.comments?.length || 0}</span>
              </button>

              <button 
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '#' + reel.id);
                  alert('Reel link copied!');
                }}
                style={{ color: '#fff' }}
              >
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
