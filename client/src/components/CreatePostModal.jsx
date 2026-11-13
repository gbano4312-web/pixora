import React, { useState } from 'react';
import { X, Image, Video, Music, Upload, Link } from 'lucide-react';
import axios from 'axios';

export default function CreatePostModal({ onClose, onPostCreated }) {
  const [type, setType] = useState('photo'); // photo, video, song
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !mediaUrl) {
      alert('Please select a file or paste a media URL.');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('type', type);
      formData.append('caption', caption);
      if (file) {
        formData.append('media', file);
      } else {
        formData.append('mediaUrl', mediaUrl);
      }
      if (type === 'song') {
        formData.append('songTitle', songTitle);
        formData.append('songArtist', songArtist);
      }

      await axios.post('/api/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onPostCreated();
      onClose();
    } catch (err) {
      console.error('Failed to create post', err);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create New Post</h3>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Post Type Selector */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`nav-item ${type === 'photo' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setType('photo')}
            >
              <Image size={18} />
              <span>Photo</span>
            </button>

            <button
              type="button"
              className={`nav-item ${type === 'video' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setType('video')}
            >
              <Video size={18} />
              <span>Video</span>
            </button>

            <button
              type="button"
              className={`nav-item ${type === 'song' ? 'active' : ''}`}
              style={{ flex: 1, justifyContent: 'center' }}
              onClick={() => setType('song')}
            >
              <Music size={18} />
              <span>Song</span>
            </button>
          </div>

          {/* File Upload Box */}
          <div style={{
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: '24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            backgroundColor: file ? 'rgba(79, 70, 229, 0.05)' : 'transparent'
          }}>
            <Upload size={28} color="var(--primary)" />
            <div style={{ fontSize: '14px', fontWeight: 500 }}>
              {file ? file.name : `Select ${type.toUpperCase()} file to upload`}
            </div>
            <input 
              type="file" 
              accept={type === 'photo' ? 'image/*' : type === 'video' ? 'video/*' : 'audio/*'}
              onChange={(e) => setFile(e.target.files[0])}
              style={{ opacity: 0, position: 'absolute', width: '100%', height: '100px', cursor: 'pointer' }}
            />
          </div>

          {/* Or Paste URL */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link size={16} color="var(--text-muted)" />
            <input 
              type="url" 
              placeholder="Or paste media URL (e.g. Unsplash / MP4 / MP3 link)"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              style={{ flex: 1 }}
            />
          </div>

          {/* Song Info Fields */}
          {type === 'song' && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                placeholder="Song Title (e.g. Summer Breeze)" 
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                style={{ flex: 1 }}
                required
              />
              <input 
                type="text" 
                placeholder="Artist Name" 
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
                style={{ flex: 1 }}
                required
              />
            </div>
          )}

          {/* Caption */}
          <textarea 
            rows="3" 
            placeholder="Write a caption... (e.g. #music #vibes)"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            style={{ resize: 'none' }}
          />

          <button 
            type="submit" 
            className="create-btn"
            disabled={isSubmitting}
            style={{ width: '100%', marginTop: '6px' }}
          >
            {isSubmitting ? 'Sharing to Pixora...' : 'Share Post'}
          </button>
        </form>
      </div>
    </div>
  );
}
