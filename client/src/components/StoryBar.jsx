import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function StoryBar() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load story users', err);
    }
  };

  // If no user is logged in and no users exist, don't show empty bar
  if (!user && users.length === 0) {
    return null;
  }

  return (
    <div className="stories-bar">
      {user && (
        <div className="story-item" onClick={() => alert('Story creation coming soon! Post to your feed or reels.')}>
          <div style={{ position: 'relative' }}>
            <div className="story-ring" style={{ background: 'var(--border-color)' }}>
              <img src={user.avatar} alt={user.name} className="story-avatar" />
            </div>
            <div style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--primary)',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              border: '2px solid var(--bg-main)'
            }}>
              <Plus size={12} strokeWidth={3} />
            </div>
          </div>
          <span className="story-username">Your Story</span>
        </div>
      )}

      {users.filter(u => u.id !== user?.id).map(u => (
        <div key={u.id} className="story-item" onClick={() => alert(`Viewing @${u.username}'s profile!`)}>
          <div className="story-ring">
            <img src={u.avatar} alt={u.username} className="story-avatar" />
          </div>
          <span className="story-username">@{u.username}</span>
        </div>
      ))}
    </div>
  );
}
