import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import axios from 'axios';
import AudioPlayerCard from './AudioPlayerCard';
import { useAuth } from '../context/AuthContext';

export default function PostCard({ post, onAuthRequired }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const isLiked = user ? likes.includes(user.id) : false;

  const handleLike = async () => {
    if (!user) {
      onAuthRequired();
      return;
    }

    try {
      const res = await axios.post(`/api/posts/${post.id}/like`);
      setLikes(res.data.likes);
    } catch (err) {
      console.error('Failed to like', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) {
      onAuthRequired();
      return;
    }
    if (!commentText.trim()) return;

    try {
      const res = await axios.post(`/api/posts/${post.id}/comment`, { text: commentText });
      setComments([...comments, res.data]);
      setCommentText('');
    } catch (err) {
      console.error('Failed to add comment', err);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '#' + post.id);
    alert('Link copied to clipboard!');
  };

  // Helper to format time
  const timeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <article className="post-card">
      <header className="post-header">
        <div className="post-author">
          <img src={post.author.avatar} alt={post.author.name} className="user-avatar" />
          <div>
            <div className="author-name">{post.author.name}</div>
            <div className="post-time">@{post.author.username} • {timeAgo(post.createdAt)}</div>
          </div>
        </div>
      </header>

      {/* Media Rendering */}
      {post.type === 'photo' && post.mediaUrl && (
        <div className="post-media-container">
          <img src={post.mediaUrl} alt="Post content" className="post-image" loading="lazy" />
        </div>
      )}

      {post.type === 'video' && post.mediaUrl && (
        <div className="post-media-container">
          <video 
            src={post.mediaUrl} 
            className="post-video" 
            controls 
            playsInline
            loop 
          />
        </div>
      )}

      {post.type === 'song' && (
        <AudioPlayerCard 
          mediaUrl={post.mediaUrl} 
          title={post.songTitle} 
          artist={post.songArtist} 
        />
      )}

      {/* Actions */}
      <div className="post-actions">
        <div className="action-group">
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likes.length}</span>
          </button>

          <button 
            className="action-btn"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={22} />
            <span>{comments.length}</span>
          </button>

          <button className="action-btn" onClick={handleShare}>
            <Share2 size={20} />
          </button>
        </div>

        <button 
          className="action-btn" 
          onClick={() => setIsSaved(!isSaved)}
          style={{ color: isSaved ? 'var(--primary)' : 'inherit' }}
        >
          <Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="post-caption-box">
          <span className="caption-username">{post.author.username}</span>
          <span>{post.caption}</span>
        </div>
      )}

      {/* Comments section */}
      {showComments && (
        <div className="comments-list">
          {comments.map((c) => (
            <div key={c.id} className="comment-item">
              <span className="comment-user">{c.userName || 'User'}</span>
              <span>{c.text}</span>
            </div>
          ))}

          <form onSubmit={handleAddComment} className="add-comment-form">
            <input 
              type="text" 
              placeholder="Add a comment..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="comment-input"
            />
            <button type="submit" className="comment-submit">Post</button>
          </form>
        </div>
      )}
    </article>
  );
}
